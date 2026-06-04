import { spawn, ChildProcess } from 'child_process';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { BaseTool } from './BaseTool.js';
import { ToolInput, ToolOutput, ToolContext } from '../types/tool.js';

type LSPAction = 'definition' | 'references' | 'hover' | 'diagnostics' | 'rename' | 'completion' | 'document_symbols';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timer: NodeJS.Timeout;
}

const LSP_SERVERS: Record<string, { command: string; args: string[] }> = {
  '.ts': { command: 'typescript-language-server', args: ['--stdio'] },
  '.tsx': { command: 'typescript-language-server', args: ['--stdio'] },
  '.js': { command: 'typescript-language-server', args: ['--stdio'] },
  '.jsx': { command: 'typescript-language-server', args: ['--stdio'] },
  '.py': { command: 'pyright-langserver', args: ['--stdio'] },
  '.go': { command: 'gopls', args: [] },
  '.rs': { command: 'rust-analyzer', args: [] },
};

class LSPServerInstance {
  private proc: ChildProcess;
  private pending = new Map<number, PendingRequest>();
  private nextId = 1;
  private buffer = '';
  private contentLength = -1;
  private _ready = false;
  private diagnosticsHandler?: (uri: string, diagnostics: any[]) => void;
  private serverTimer?: NodeJS.Timeout;

  get ready() { return this._ready; }

  constructor(private root: string, command: string, args: string[]) {
    this.proc = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    this.proc.stdout?.on('data', this.onData.bind(this));
    this.proc.stderr?.on('data', (d) => process.stderr.write(d));
    this.proc.on('exit', (code) => {
      for (const [id, p] of this.pending) {
        clearTimeout(p.timer);
        p.reject(new Error(`Server exited with code ${code}`));
      }
      this.pending.clear();
    });
  }

  async initialize(): Promise<void> {
    const capabilities = await this.sendRequest('initialize', {
      processId: null,
      capabilities: {
        textDocument: { hover: { contentFormat: ['markdown', 'plaintext'] }, definition: {}, references: {}, rename: {}, completion: {}, documentSymbol: {}, diagnostic: {} },
        workspace: { diagnostic: {} },
      },
      rootUri: 'file://' + this.root.replace(/\\/g, '/'),
      workspaceFolders: [{ uri: 'file://' + this.root.replace(/\\/g, '/'), name: path.basename(this.root) }],
    });
    this.sendNotification('initialized', {});
    this._ready = true;
    return capabilities;
  }

  async sendRequest(method: string, params: any, timeout = 15000): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`LSP request "${method}" timed out after ${timeout}ms`)); }, timeout);
      this.pending.set(id, { resolve, reject, timer });
      this.writeMessage({ jsonrpc: '2.0', id, method, params });
    });
  }

  sendNotification(method: string, params: any): void {
    this.writeMessage({ jsonrpc: '2.0', method, params });
  }

  didOpen(uri: string, languageId: string, text: string): void {
    this.sendNotification('textDocument/didOpen', { textDocument: { uri, languageId, version: 1, text } });
  }

  didChange(uri: string, text: string, version = 2): void {
    this.sendNotification('textDocument/didChange', { textDocument: { uri, version }, contentChanges: [{ text }] });
  }

  private writeMessage(msg: any): void {
    const json = JSON.stringify(msg);
    const header = `Content-Length: ${Buffer.byteLength(json, 'utf-8')}\r\n\r\n`;
    this.proc.stdin?.write(header + json);
  }

  private onData(chunk: Buffer): void {
    this.buffer += chunk.toString();
    while (true) {
      if (this.contentLength < 0) {
        const idx = this.buffer.indexOf('\r\n\r\n');
        if (idx < 0) break;
        const header = this.buffer.slice(0, idx);
        const match = header.match(/Content-Length:\s*(\d+)/i);
        if (!match) { this.buffer = this.buffer.slice(idx + 4); continue; }
        this.contentLength = parseInt(match[1], 10);
        this.buffer = this.buffer.slice(idx + 4);
      }
      if (Buffer.byteLength(this.buffer, 'utf-8') < this.contentLength) break;
      const json = this.buffer.slice(0, this.contentLength);
      this.buffer = this.buffer.slice(this.contentLength);
      this.contentLength = -1;
      try {
        const msg = JSON.parse(json);
        this.handleMessage(msg);
      } catch { /* skip malformed */ }
    }
  }

  private handleMessage(msg: any): void {
    if (msg.id != null && this.pending.has(msg.id)) {
      const p = this.pending.get(msg.id)!;
      clearTimeout(p.timer);
      this.pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message));
      else p.resolve(msg.result);
    }
    if (msg.method === 'textDocument/publishDiagnostics' && this.diagnosticsHandler) {
      this.diagnosticsHandler(msg.params.uri, msg.params.diagnostics);
    }
  }

  onDiagnostics(handler: (uri: string, diagnostics: any[]) => void): void {
    this.diagnosticsHandler = handler;
  }

  async shutdown(): Promise<void> {
    try { await this.sendRequest('shutdown', {}); } catch {}
    this.sendNotification('exit', {});
    clearTimeout(this.serverTimer);
    setTimeout(() => { if (this.proc.exitCode === null) this.proc.kill(); }, 2000);
  }
}

const serverCache = new Map<string, LSPServerInstance>();

async function getOrStartServer(filePath: string, workspace: string): Promise<LSPServerInstance> {
  const ext = path.extname(filePath).toLowerCase();
  const config = LSP_SERVERS[ext];
  if (!config) throw new Error(`No LSP server available for ${ext} files`);

  const key = workspace;
  let server = serverCache.get(key);
  if (server) return server;

  server = new LSPServerInstance(workspace, config.command, config.args);
  serverCache.set(key, server);
  try {
    await server.initialize();
  } catch (err) {
    serverCache.delete(key);
    await server.shutdown();
    throw new Error(`Failed to start ${config.command} for ${ext} files. Install it with appropriate package manager.`);
  }
  return server;
}

function toUri(filePath: string): string {
  return 'file://' + path.resolve(filePath).replace(/\\/g, '/');
}

function formatLocation(loc: any): string {
  if (!loc) return '';
  if (loc.uri) {
    const filePath = loc.uri.replace(/^file:\/\//, '').replace(/\//g, path.sep);
    return `${filePath}:${loc.range.start.line + 1}:${loc.range.start.character + 1}`;
  }
  return JSON.stringify(loc);
}

export class LSPTool extends BaseTool {
  constructor() {
    super({
      name: 'lsp',
      description: 'Code intelligence via Language Server Protocol: definition, references, hover, diagnostics, rename, completion, document_symbols',
      category: 'code',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['definition', 'references', 'hover', 'diagnostics', 'rename', 'completion', 'document_symbols'], description: 'LSP action to perform' },
          file: { type: 'string', description: 'File path relative to workspace' },
          line: { type: 'number', description: 'Line number (0-indexed)' },
          character: { type: 'number', description: 'Character offset (0-indexed)' },
          newName: { type: 'string', description: 'New name for rename action' },
          query: { type: 'string', description: 'Prefix for completion' },
        },
        required: ['action', 'file'],
      },
      requiresApproval: false,
      dangerous: false,
    });
  }

  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    const action = input.action as LSPAction;
    const filePath = input.file as string;
    const line = (input.line as number) ?? 0;
    const character = (input.character as number) ?? 0;

    if (!action) return { success: false, error: 'Missing required field: action' };
    if (!filePath) return { success: false, error: 'Missing required field: file' };

    const resolvedPath = path.resolve(context.workspace || '.', filePath);
    const uri = toUri(resolvedPath);

    try {
      const server = await getOrStartServer(resolvedPath, context.workspace || '.');

      switch (action) {
        case 'definition': {
          const result = await server.sendRequest('textDocument/definition', {
            textDocument: { uri }, position: { line, character },
          });
          const locs = Array.isArray(result) ? result : result ? [result] : [];
          const formatted = locs.map(formatLocation).filter(Boolean).join('\n');
          return { success: true, data: { locations: locs }, stdout: formatted || 'No definition found' };
        }
        case 'references': {
          const result = await server.sendRequest('textDocument/references', {
            textDocument: { uri }, position: { line, character }, context: { includeDeclaration: true },
          });
          const formatted = (result || []).map(formatLocation).filter(Boolean).join('\n');
          return { success: true, data: { references: result || [] }, stdout: formatted || 'No references found' };
        }
        case 'hover': {
          const result = await server.sendRequest('textDocument/hover', {
            textDocument: { uri }, position: { line, character },
          });
          if (!result || !result.contents) return { success: true, stdout: 'No hover information available' };
          const contents = Array.isArray(result.contents) ? result.contents.map((c: any) => typeof c === 'string' ? c : c.value || '').join('\n') : typeof result.contents === 'string' ? result.contents : result.contents.value || '';
          return { success: true, data: result, stdout: contents };
        }
        case 'diagnostics': {
          const text = await readFile(resolvedPath, 'utf-8');
          const langId = path.extname(resolvedPath).slice(1) || 'plaintext';
          server.didOpen(uri, langId, text);
          const result = await new Promise<any[]>((resolve) => {
            const timeout = setTimeout(() => resolve([]), 5000);
            server.onDiagnostics((_u, diags) => {
              if (_u === uri) { clearTimeout(timeout); resolve(diags); }
            });
          });
          const formatted = result.map((d: any) =>
            `  ${d.severity === 1 ? 'Error' : d.severity === 2 ? 'Warning' : 'Info'}:${d.range.start.line + 1}:${d.range.start.character + 1} ${d.message}`
          ).join('\n');
          return { success: true, data: { diagnostics: result }, stdout: formatted || 'No diagnostics' };
        }
        case 'rename': {
          const newName = input.newName as string;
          if (!newName) return { success: false, error: 'Missing required field: newName for rename action' };
          const result = await server.sendRequest('textDocument/rename', {
            textDocument: { uri }, position: { line, character }, newName,
          });
          if (!result || !result.changes) return { success: true, stdout: 'No renames applied' };
          let count = 0;
          for (const [changeUri, edits] of Object.entries(result.changes)) {
            for (const edit of edits as any[]) {
              const changePath = changeUri.replace(/^file:\/\//, '').replace(/\//g, path.sep);
              const content = await readFile(changePath, 'utf-8');
              const lines = content.split('\n');
              const startLine = edit.range.start.line;
              const endLine = edit.range.end.line;
              const startChar = edit.range.start.character;
              const endChar = edit.range.end.character;
              if (startLine === endLine) {
                lines[startLine] = lines[startLine].slice(0, startChar) + edit.newText + lines[startLine].slice(endChar);
              } else {
                const before = lines[startLine].slice(0, startChar);
                const after = lines[endLine].slice(endChar);
                lines.splice(startLine, endLine - startLine + 1, before + edit.newText + after);
              }
              await writeFile(changePath, lines.join('\n'));
              count++;
            }
          }
          return { success: true, stdout: `Renamed ${count} occurrence(s)` };
        }
        case 'completion': {
          const result = await server.sendRequest('textDocument/completion', {
            textDocument: { uri }, position: { line, character }, context: { triggerKind: 1 },
          });
          const items = result?.items || result || [];
          const formatted = items.slice(0, 20).map((i: any) => `  ${i.label}${i.detail ? ' — ' + i.detail : ''}`).join('\n');
          return { success: true, data: { completions: items }, stdout: formatted || 'No completions' };
        }
        case 'document_symbols': {
          const result = await server.sendRequest('textDocument/documentSymbol', { textDocument: { uri } });
          const symbols = result || [];
          const formatSymbol = (s: any, indent = ''): string => {
            let out = `${indent}${s.name} (${s.kind}) — ${s.range.start.line + 1}:${s.range.start.character + 1}`;
            if (s.children) for (const c of s.children) out += '\n' + formatSymbol(c, indent + '  ');
            return out;
          };
          const formatted = symbols.map((s: any) => formatSymbol(s)).join('\n');
          return { success: true, data: { symbols }, stdout: formatted || 'No symbols found' };
        }
        default:
          return { success: false, error: `Unknown LSP action: ${action}` };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }
}

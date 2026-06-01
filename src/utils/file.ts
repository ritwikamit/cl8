import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { Attachment } from '../types/agent.js';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.mdx': 'text/markdown',
  '.py': 'text/x-python',
  '.js': 'text/javascript',
  '.ts': 'text/typescript',
  '.jsx': 'text/jsx',
  '.tsx': 'text/tsx',
  '.json': 'application/json',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml',
  '.csv': 'text/csv',
  '.html': 'text/html',
  '.css': 'text/css',
  '.xml': 'text/xml',
  '.toml': 'text/toml',
  '.ini': 'text/plain',
  '.cfg': 'text/plain',
  '.log': 'text/plain',
  '.env': 'text/plain',
  '.gitignore': 'text/plain',
  '.dockerfile': 'text/plain',
  '.rs': 'text/rust',
  '.go': 'text/x-go',
  '.rb': 'text/x-ruby',
  '.java': 'text/x-java',
  '.c': 'text/x-c',
  '.cpp': 'text/x-c++',
  '.h': 'text/x-c',
  '.hpp': 'text/x-c++',
  '.swift': 'text/x-swift',
  '.kt': 'text/x-kotlin',
  '.scala': 'text/x-scala',
  '.php': 'text/x-php',
  '.pl': 'text/x-perl',
  '.sh': 'text/x-shellscript',
  '.bash': 'text/x-shellscript',
  '.ps1': 'text/x-powershell',
  '.bat': 'text/x-bat',
  '.cmd': 'text/x-bat',
  '.sql': 'text/x-sql',
  '.graphql': 'text/graphql',
  '.gql': 'text/graphql',
  '.pdf': 'application/pdf',
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_TEXT_SIZE = 512 * 1024;

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function isTextMime(mime: string): boolean {
  return mime.startsWith('text/') || mime === 'application/json';
}

export async function readFileAsAttachment(filePath: string): Promise<Attachment> {
  const resolved = path.resolve(filePath);
  const stats = await stat(resolved);

  if (!stats.isFile()) {
    throw new Error(`Not a file: ${resolved}`);
  }

  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(stats.size / 1024 / 1024).toFixed(1)} MB). Max: 20 MB`);
  }

  const mimeType = getMimeType(resolved);
  const name = path.basename(resolved);

  if (isTextMime(mimeType)) {
    if (stats.size > MAX_TEXT_SIZE) {
      throw new Error(`Text file too large (${(stats.size / 1024).toFixed(0)} KB). Max: 512 KB`);
    }
    const content = await readFile(resolved, 'utf-8');
    return { type: 'file', mimeType, data: content, name };
  }

  const buffer = await readFile(resolved);
  const base64 = buffer.toString('base64');
  const type = mimeType.startsWith('image/') ? 'image' : 'file';
  return { type, mimeType, data: base64, name };
}

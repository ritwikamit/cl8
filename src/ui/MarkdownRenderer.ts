import chalk from 'chalk';
import { marked, Tokens } from 'marked';
import type { Token } from 'marked';

const LANGUAGE_COLORS: Record<string, (s: string) => string> = {
  ts: chalk.yellow,
  typescript: chalk.yellow,
  js: chalk.green,
  javascript: chalk.green,
  python: chalk.blue,
  py: chalk.blue,
  rust: chalk.red,
  rs: chalk.red,
  go: chalk.cyan,
  bash: chalk.magenta,
  sh: chalk.magenta,
  powershell: chalk.magenta,
  ps1: chalk.magenta,
  json: chalk.gray,
  yaml: chalk.gray,
  yml: chalk.gray,
  md: chalk.white,
  diff: chalk.red,
  html: chalk.cyan,
  css: chalk.magenta,
  sql: chalk.blueBright,
};

export class MarkdownRenderer {
  private terminalWidth: number;

  constructor() {
    this.terminalWidth = process.stdout.columns || 80;
  }

  render(content: string): string {
    const tokens = marked.lexer(content);
    return this.renderTokens(tokens);
  }

  renderInline(content: string): string {
    const tokens = marked.lexer(content);
    return this.renderTokens(tokens, true);
  }

  private renderTokens(tokens: Token[], _inline = false): string {
    let output = '';

    for (const token of tokens) {
      output += this.renderToken(token, _inline);
    }

    return output;
  }

  private renderToken(token: Token, _inline = false): string {
    switch (token.type) {
      case 'heading':
        return this.renderHeading(token as Tokens.Heading);
      case 'paragraph':
        return this.renderParagraph(token as Tokens.Paragraph);
      case 'code':
        return this.renderCode(token as Tokens.Code);
      case 'list':
        return this.renderList(token as Tokens.List);
      case 'list_item':
        return this.renderListItem(token as Tokens.ListItem);
      case 'strong':
        return chalk.bold(this.renderInlineContent((token as any).tokens || []));
      case 'em':
        return chalk.italic(this.renderInlineContent((token as any).tokens || []));
      case 'codespan':
        return chalk.bgBlack.cyan((token as Tokens.Codespan).text);
      case 'hr':
        return chalk.dim('  ' + '─'.repeat(Math.min(this.terminalWidth - 4, 40))) + '\n\n';
      case 'blockquote':
        return this.renderBlockquote(token as Tokens.Blockquote);
      case 'space':
        return '\n';
      case 'text':
        return (token as Tokens.Text).text;
      case 'link':
        return chalk.blue.underline((token as Tokens.Link).href || '');
      default:
        return '';
    }
  }

  private renderHeading(token: Tokens.Heading): string {
    const text = this.renderInlineContent(token.tokens || []);
    const prefix = '#'.repeat(token.depth) + ' ';

    switch (token.depth) {
      case 1:
        return `\n${chalk.bold.hex('#A855F7')(`${text}`)}\n${chalk.dim('  ' + '─'.repeat(Math.min(this.terminalWidth - 4, 40)))}\n`;
      case 2:
        return `\n${chalk.bold.hex('#818CF8')(`${prefix}${text}`)}\n`;
      case 3:
        return `\n${chalk.hex('#6B7280')(`${prefix}${text}`)}\n`;
      default:
        return `\n${chalk.bold(`${prefix}${text}`)}\n`;
    }
  }

  private renderParagraph(token: Tokens.Paragraph): string {
    const text = this.renderInlineContent(token.tokens || []);
    return text + '\n\n';
  }

  private renderInlineContent(tokens: Token[]): string {
    return tokens.map(t => {
      if (t.type === 'text') return (t as Tokens.Text).text;
      if (t.type === 'strong') return chalk.bold(this.renderInlineContent((t as any).tokens || []));
      if (t.type === 'em') return chalk.italic(this.renderInlineContent((t as any).tokens || []));
      if (t.type === 'codespan') return chalk.bgBlack.cyan((t as Tokens.Codespan).text);
      if (t.type === 'link') return chalk.blue.underline((t as Tokens.Link).text || '');
      if (t.type === 'br') return '\n';
      return '';
    }).join('');
  }

  private renderCode(token: Tokens.Code): string {
    const lang = token.lang || '';
    const colorizer = LANGUAGE_COLORS[lang] || chalk.white;
    const langTag = lang ? chalk.dim(`  ${lang}`) : '';

    const lines = token.text.split('\n');
    const code = lines
      .map(line => `  ${chalk.dim('▎')} ${colorizer(line)}`)
      .join('\n');

    return `${langTag}\n${code}\n\n`;
  }

  private renderList(token: Tokens.List): string {
    let output = '';
    for (const item of token.items) {
      output += this.renderListItem(item);
    }
    return output + '\n';
  }

  private renderListItem(token: Tokens.ListItem): string {
    const text = token.text || this.renderInlineContent(token.tokens || []);
    const prefix = token.task ? (token.checked ? '[x]' : '[ ]') : '•';
    return `  ${chalk.dim(prefix)} ${text}\n`;
  }

  private renderBlockquote(token: Tokens.Blockquote): string {
    const text = this.renderInlineContent(token.tokens || []);
    return chalk.dim(`  ▎ ${text.replace(/\n/g, '\n  ▎ ')}\n\n`);
  }
}

export const markdown = new MarkdownRenderer();

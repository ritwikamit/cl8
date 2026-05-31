import gradient from 'gradient-string';
import chalk from 'chalk';

export interface LogoVariant {
  lines: string[];
  width: number;
  height: number;
}

const LOGO_SMALL: LogoVariant = {
  lines: [
    ' ██████    ██         ██████ ',
    '██         ██        ██    ██',
    '██         ██        ████████',
    '██         ██        ██    ██',
    ' ██████    ████████   ██████ ',
  ],
  width: 28,
  height: 5,
};

const LOGO_MEDIUM: LogoVariant = {
  lines: [
    '  ████████    ██              ████████ ',
    ' ██           ██             ██     ██ ',
    '██            ██             ██      ██',
    '██            ██             ██████████',
    '██            ██             ██      ██',
    ' ██           ██             ██     ██ ',
    '  ████████    ████████████    ████████ ',
  ],
  width: 36,
  height: 7,
};

const LOGO_WIDE: LogoVariant = {
  lines: [
    '  ████████    ██              ████████     ▓▓▓  ░░░░',
    ' ██           ██             ██     ██    ████  ░░░░',
    '██            ██             ██      ██   ████  ░░░░',
    '██            ██             ██████████    ████  ░░░░',
    '██            ██             ██      ██   ████  ░░░░',
    ' ██           ██             ██     ██    ████  ░░░░',
    '  ████████    ████████████    ████████     ▓▓▓  ░░░░',
  ],
  width: 50,
  height: 7,
};

export function selectLogoVariant(columns: number): LogoVariant {
  if (columns < 90) return LOGO_SMALL;
  if (columns < 130) return LOGO_MEDIUM;
  return LOGO_WIDE;
}

const LOGO_GRADIENT = gradient(['#00AAFF', '#9333EA', '#FF6BCB']);
const DECO_GRADIENT = gradient(['#0066CC', '#7C3AED', '#DB2777']);

export function applyGradient(line: string): string {
  if (!line.trim()) return line;
  return LOGO_GRADIENT(line);
}

export function applyDecoGradient(line: string): string {
  if (!line.trim()) return line;
  return DECO_GRADIENT(line);
}

export function renderLogo(
  variant: LogoVariant,
  columns: number,
  withDeco: boolean
): string {
  const padLeft = Math.max(0, Math.floor((columns - variant.width) / 2));
  const prefix = ' '.repeat(padLeft);
  const lines: string[] = [];

  const decoLeft = prefix.slice(0, Math.max(0, prefix.length - 4));
  const decoRight = ' '.repeat(Math.max(0, columns - variant.width - padLeft - 4));

  if (withDeco) {
    const topBar = `  ▄${'▄'.repeat(variant.width - 4)}▄  `;
    lines.push(decoLeft + applyDecoGradient(topBar) + decoRight);
  }

  for (const line of variant.lines) {
    const trimmed = line.trimEnd();
    if (trimmed) {
      lines.push(prefix + applyGradient(trimmed));
    } else {
      lines.push(prefix + line);
    }
  }

  if (withDeco) {
    const botBar = `  ▀${'▀'.repeat(variant.width - 4)}▀  `;
    lines.push(decoLeft + applyDecoGradient(botBar) + decoRight);
  }

  return lines.join('\n');
}

export function buildLogoFrames(
  variant: LogoVariant,
  columns: number,
  steps: number
): string[] {
  const frames: string[] = [];
  const totalWidth = variant.width;
  const padLeft = Math.max(0, Math.floor((columns - totalWidth) / 2));
  const prefix = ' '.repeat(padLeft);

  const stepWidth = Math.ceil(totalWidth / steps);

  for (let s = 1; s <= steps; s++) {
    const reveal = Math.min(s * stepWidth, totalWidth);
    const frameLines: string[] = [];

    for (const line of variant.lines) {
      const visible = line.slice(0, reveal);
      const padded = visible.padEnd(totalWidth, ' ');
      const trimmed = padded.trimEnd();
      frameLines.push(prefix + (trimmed ? applyGradient(trimmed) : padded));
    }

    frames.push(frameLines.join('\n'));
  }

  return frames;
}

import gradient from 'gradient-string';

const LOGO_LINES = [
  ' ██████   ██        ██████ ',
  '██        ██       ██    ██',
  '██        ██       ████████',
  '██        ██       ██    ██',
  ' ██████   ████████  ██████ ',
];

const WIDTH = 26;

const GRADIENT = gradient(['#A855F7', '#D946EF', '#C084FC', '#E879F9']);

export function renderLogo(columns: number): string {
  const pad = Math.max(0, Math.floor((columns - WIDTH) / 2));
  const prefix = ' '.repeat(pad);

  return LOGO_LINES.map(line => prefix + GRADIENT(line.trimEnd())).join('\n');
}

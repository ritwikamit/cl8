#!/usr/bin/env node

import { createCLI } from '../cli/index.js';

async function main(): Promise<void> {
  process.title = 'cl8';

  const program = createCLI();

  if (process.argv.length <= 2) {
    program.parse(['node', 'cl8', 'chat'], { from: 'user' });
  } else {
    await program.parseAsync();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

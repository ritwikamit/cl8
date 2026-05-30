import chalk from 'chalk';
import { Engine } from '../../core/Engine.js';
import { loadConfig } from '../../config/index.js';
import { SessionData } from '../../types/memory.js';

export async function sessionCommand(options: {
  list?: boolean;
  show?: string;
  resume?: string;
}): Promise<void> {
  const config = loadConfig();
  const engine = new Engine(config);
  await engine.initialize();

  if (options.list) {
    const sessions = engine.getSessionManager().listSessions(20);
    if (sessions.length === 0) {
      console.log(chalk.yellow('No sessions found.'));
      return;
    }

    console.log(chalk.cyan('\n  Recent Sessions:\n'));
    for (const s of sessions) {
      const duration = s.endTime
        ? Math.round((s.endTime.getTime() - s.startTime.getTime()) / 1000) + 's'
        : 'active';
      console.log(
        `  ${chalk.bold(s.id.slice(0, 12))}... ` +
        `${chalk.dim(s.provider + '/' + s.model)} ` +
        `${chalk.dim(s.messageCount + ' messages')} ` +
        `${chalk.dim(duration)}`
      );
    }
    console.log('');
  } else if (options.show) {
    const session = engine.getSessionManager().getSession(options.show);
    if (!session) {
      console.log(chalk.yellow(`Session not found: ${options.show}`));
      return;
    }
    console.log(chalk.cyan('\n  Session Details:\n'));
    console.log(`  ID:       ${session.id}`);
    console.log(`  Provider: ${session.provider}`);
    console.log(`  Model:    ${session.model}`);
    console.log(`  Messages: ${session.messageCount}`);
    console.log(`  Tokens:   ${session.tokenUsage.total} (${session.tokenUsage.prompt} prompt + ${session.tokenUsage.completion} completion)`);
    console.log(`  Started:  ${session.startTime.toISOString()}`);
    console.log(`  End:      ${session.endTime?.toISOString() || 'active'}`);
    console.log('');
  } else if (options.resume) {
    const resumed = engine.getSessionManager().setCurrentSession(options.resume);
    if (resumed) {
      console.log(chalk.green(`Resumed session: ${options.resume}`));
    } else {
      console.log(chalk.yellow(`Session not found: ${options.resume}`));
    }
  } else {
    const session = engine.getSessionManager().getCurrentSession();
    if (session) {
      console.log(chalk.cyan(`\n  Current Session: ${session.id}\n`));
      console.log(`  ${chalk.dim('Provider:')} ${session.provider}`);
      console.log(`  ${chalk.dim('Model:')}    ${session.model}`);
      console.log(`  ${chalk.dim('Messages:')} ${session.messageCount}`);
      console.log(`  ${chalk.dim('Tokens:')}   ${session.tokenUsage.total}`);
      console.log('');
    }
  }

  await engine.shutdown();
}

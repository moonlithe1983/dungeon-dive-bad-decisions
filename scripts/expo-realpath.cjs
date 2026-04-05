const fs = require('fs');
const net = require('net');
const { spawn } = require('child_process');

function getRealCwd() {
  if (typeof fs.realpathSync.native === 'function') {
    return fs.realpathSync.native(process.cwd());
  }

  return fs.realpathSync(process.cwd());
}

function getRequestedPort(args) {
  const portFlagIndex = args.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portFlagIndex === -1) {
    return 8081;
  }

  const nextValue = Number.parseInt(args[portFlagIndex + 1], 10);
  return Number.isFinite(nextValue) ? nextValue : 8081;
}

function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port });

    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.once('error', () => {
      resolve(false);
    });
  });
}

async function main() {
  const realCwd = getRealCwd();
  const expoCliPath = require.resolve('expo/bin/cli', { paths: [realCwd] });
  const expoArgs = process.argv.slice(2);

  if (realCwd !== process.cwd()) {
    process.chdir(realCwd);
  }

  if (expoArgs[0] === 'run:android' && !expoArgs.includes('--no-bundler')) {
    const requestedPort = getRequestedPort(expoArgs);
    if (await isPortInUse(requestedPort)) {
      expoArgs.push('--no-bundler');
      console.log(`Reusing Expo dev server on port ${requestedPort} to avoid Android launch prompts.`);
    }
  }

  const child = spawn(process.execPath, [expoCliPath, ...expoArgs], {
    cwd: realCwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      INIT_CWD: realCwd,
    },
  });

  child.on('error', (error) => {
    console.error(`Failed to launch Expo from ${realCwd}:`, error);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

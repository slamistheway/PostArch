const { spawn, spawnSync } = require('node:child_process');
const { join } = require('node:path');
const http = require('node:http');

const root = join(__dirname, '..');
const children = new Set();
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.pid) continue;
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
        stdio: 'ignore',
        windowsHide: true,
      });
    } else {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch (error) {
        if (error.code !== 'ESRCH') console.error(error.message);
      }
    }
  }
  process.exit(code);
}

function launch(args, directory, stdio) {
  const child = spawn(process.execPath, [process.env.npm_execpath, ...args], {
    cwd: join(root, directory),
    stdio,
    detached: process.platform !== 'win32',
    windowsHide: true,
  });
  children.add(child);
  child.on('error', (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    // Clean up the whole process tree, including watch-mode descendants.
    stop(code ?? (signal ? 1 : 0));
  });
  return child;
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

function waitForApi(timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const check = () => {
      if (stopping) return;
      const request = http.get('http://localhost:3001', (response) => {
        response.resume();
        resolve();
      });
      request.setTimeout(2000, () => request.destroy());
      request.on('error', () => {
        if (Date.now() >= deadline) reject(new Error('Timed out waiting for the API on port 3001.'));
        else setTimeout(check, 500);
      });
    };
    check();
  });
}

async function start() {
  const api = launch(['run', 'start:dev'], 'api', ['ignore', 'pipe', 'pipe']);
  api.stdout.pipe(process.stdout);
  api.stderr.pipe(process.stderr);

  console.log('Waiting for the API on port 3001...');
  await waitForApi();

  // Inherit the terminal directly so Expo can show its QR code and read keys.
  launch(['start'], 'postarch-mobile', 'inherit');
}

start().catch((error) => {
  console.error(error.message);
  stop(1);
});

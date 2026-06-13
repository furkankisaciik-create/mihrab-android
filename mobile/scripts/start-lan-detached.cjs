const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const projectRoot = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const workspaceRoot = path.resolve(projectRoot, '..');
const nodePath = path.join(workspaceRoot, 'node-v24.16.0-win-x64', 'node.exe');
const expoCliPath = path.join(projectRoot, 'node_modules', 'expo', 'bin', 'cli');
const tempDirectory = process.env.TEMP || projectRoot;
const stdoutPath = path.join(tempDirectory, 'mihrab-expo-detached.stdout.log');
const stderrPath = path.join(tempDirectory, 'mihrab-expo-detached.stderr.log');
const stdout = fs.openSync(stdoutPath, 'a');
const stderr = fs.openSync(stderrPath, 'a');
const windowsDirectory = process.env.SystemRoot || 'C:\\Windows';

const child = spawn(
  nodePath,
  [expoCliPath, 'start', '--web', '--lan', '--port', '8081'],
  {
    cwd: projectRoot,
    detached: true,
    windowsHide: true,
    stdio: ['ignore', stdout, stderr],
    env: {
      SystemRoot: windowsDirectory,
      ComSpec: process.env.ComSpec,
      USERPROFILE: process.env.USERPROFILE,
      LOCALAPPDATA: process.env.LOCALAPPDATA,
      APPDATA: process.env.APPDATA,
      TEMP: process.env.TEMP,
      TMP: process.env.TMP,
      PATH: `${path.dirname(nodePath)};${path.join(windowsDirectory, 'System32')}`,
      CI: '1',
      EXPO_NO_TELEMETRY: '1',
      EXPO_UNSTABLE_HEADLESS: '1',
      EXPO_UNSTABLE_BONJOUR: '0',
      EXPO_NO_WEB_SETUP: '0',
      NODE_OPTIONS: '--use-system-ca --max-old-space-size=768',
      __UNSAFE_EXPO_HOME_DIRECTORY: path.join(projectRoot, '.expo-local'),
    },
  }
);

child.unref();

console.log(`PID=${child.pid}`);
console.log(`STDOUT=${stdoutPath}`);
console.log(`STDERR=${stderrPath}`);

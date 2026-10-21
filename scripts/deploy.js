import path from 'path';
import { fileURLToPath } from 'url';
import SftpClient from 'ssh2-sftp-client';
import { execSync } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const CONFIG = {
  host: process.env.DREAMHOST_HOST || 'iad1-shared-b7-01.Dreamhost.com',
  port: parseInt(process.env.DREAMHOST_PORT || '22', 10),
  username: process.env.DREAMHOST_USER || 'dh_x4cege',
  password: process.env.DREAMHOST_PASSWORD || 'dynasloth32',
  remoteDir: process.env.DREAMHOST_REMOTE_DIR || '/home/dh_x4cege/agent0.aredpanic.com',
};

async function deploy() {
  console.log('====================================================');
  console.log('  OUROBOROS PROTOCOL // DREAMHOST DEPLOYMENT KERNEL ');
  console.log('====================================================');
  console.log(`Target Host: ${CONFIG.host}:${CONFIG.port}`);
  console.log(`User:        ${CONFIG.username}`);
  console.log(`Remote Path: ${CONFIG.remoteDir}`);
  console.log(`Domain:      http://agent0.aredpanic.com\n`);

  // Step 1: Build the project
  console.log('[1/4] Running production build...');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  execSync(`${npmCmd} run build`, { cwd: projectRoot, stdio: 'inherit' });

  if (!fs.existsSync(distDir)) {
    throw new Error(`Build directory does not exist: ${distDir}`);
  }

  // Step 2: Connect via SFTP
  console.log('\n[2/4] Connecting to DreamHost SFTP server...');
  const sftp = new SftpClient();
  await sftp.connect({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    password: CONFIG.password,
    readyTimeout: 30000,
  });
  console.log('      SFTP Connection established successfully.');

  // Step 3: Ensure remote directory exists
  console.log(`\n[3/4] Verifying remote destination directory ${CONFIG.remoteDir}...`);
  const exists = await sftp.exists(CONFIG.remoteDir);
  if (!exists) {
    console.log(`      Creating remote directory: ${CONFIG.remoteDir}`);
    await sftp.mkdir(CONFIG.remoteDir, true);
  }

  // Step 4: Upload all files recursively
  console.log(`\n[4/4] Uploading build bundle to ${CONFIG.remoteDir}...`);
  sftp.on('upload', (info) => {
    console.log(`  -> Uploaded: ${info.source}`);
  });

  const uploadResult = await sftp.uploadDir(distDir, CONFIG.remoteDir, {
    useFastput: true,
  });
  console.log(`\nUpload complete: ${uploadResult}`);

  await sftp.end();

  console.log('====================================================');
  console.log('  DEPLOYMENT SUCCESSFUL!                            ');
  console.log('  Live URL: http://agent0.aredpanic.com             ');
  console.log('====================================================');
}

deploy().catch((err) => {
  console.error('\n[DEPLOY ERROR]', err);
  process.exit(1);
});

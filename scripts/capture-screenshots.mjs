import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const PORT = 8989;
const CHROME_DEBUG_PORT = 9222;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CHROME_DEBUG_PORT}/json/version`);
      if (res.ok) {
        const data = await res.json();
        return data.webSocketDebuggerUrl;
      }
    } catch (e) {
      await sleep(250);
    }
  }
  throw new Error('Chrome remote debugging did not respond');
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (msg) => {
        const res = JSON.parse(msg.data);
        if (res.id && this.pending.has(res.id)) {
          const { resolve, reject } = this.pending.get(res.id);
          this.pending.delete(res.id);
          if (res.error) reject(res.error);
          else resolve(res.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  console.log('Starting Google Chrome in headless mode with remote debugging...');
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${CHROME_DEBUG_PORT}`,
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);

  try {
    const wsUrl = await getWsUrl();
    console.log('Connected to Chrome via CDP:', wsUrl);

    const targetRes = await fetch(`http://127.0.0.1:${CHROME_DEBUG_PORT}/json/new?http://127.0.0.1:${PORT}/`, {
      method: 'PUT',
    });
    const targetData = await targetRes.json();
    const pageWsUrl = targetData.webSocketDebuggerUrl;

    const client = new CDPClient(pageWsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    // 1. Editor 3D Desktop
    console.log('Capturing editor-3d-redesign-desktop.jpg ...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
    await sleep(2000);
    const shot1 = await client.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 92,
    });
    await writeFile(
      resolve('docs/screenshots/editor-3d-redesign-desktop.jpg'),
      Buffer.from(shot1.data, 'base64')
    );
    console.log('Saved editor-3d-redesign-desktop.jpg');

    // 2. Editor 2D Folha Desdobrada
    console.log('Capturing editor-2d-folha-grade.jpg ...');
    await client.send('Runtime.evaluate', {
      expression: `document.getElementById('btnMode2D')?.click();`,
    });
    await sleep(800);
    const shot2d = await client.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 92,
    });
    await writeFile(
      resolve('docs/screenshots/editor-2d-folha-grade.jpg'),
      Buffer.from(shot2d.data, 'base64')
    );
    console.log('Saved editor-2d-folha-grade.jpg');

    // 3. Modal Nova Skin (focused crop around the modal)
    console.log('Capturing editor-nova-skin-modal.jpg ...');
    await client.send('Runtime.evaluate', {
      expression: `
        document.getElementById('btnMode3D')?.click();
        document.getElementById('sideBtnNewSkin')?.click();
      `,
    });
    await sleep(600);
    const boxEval = await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector('#modalNewSkin .modal-card');
          if (!card) return null;
          const r = card.getBoundingClientRect();
          const pad = 40;
          return {
            x: Math.round(Math.max(0, r.x - pad)),
            y: Math.round(Math.max(0, r.y - pad)),
            width: Math.round(r.width + pad * 2),
            height: Math.round(r.height + pad * 2),
            scale: 1
          };
        })()
      `,
      returnByValue: true,
    });

    const clipBox = boxEval.result?.value;
    const shot2 = await client.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 92,
      clip: clipBox || undefined,
    });
    await writeFile(
      resolve('docs/screenshots/editor-nova-skin-modal.jpg'),
      Buffer.from(shot2.data, 'base64')
    );
    console.log('Saved editor-nova-skin-modal.jpg');

    // 4. Mobile Drawer
    console.log('Capturing editor-mobile-drawer.jpg ...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 420,
      height: 840,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
    await sleep(1500);
    await client.send('Runtime.evaluate', {
      expression: `document.getElementById('btnHamburger')?.click();`,
    });
    await sleep(600);
    const shot3 = await client.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 92,
    });
    await writeFile(
      resolve('docs/screenshots/editor-mobile-drawer.jpg'),
      Buffer.from(shot3.data, 'base64')
    );
    console.log('Saved editor-mobile-drawer.jpg');

    // 5. Conversor Skin
    console.log('Capturing conversor-skin.png ...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
    await sleep(1500);
    await client.send('Runtime.evaluate', {
      expression: `document.getElementById('tabBtnConverter')?.click();`,
    });
    await sleep(600);
    const shot4 = await client.send('Page.captureScreenshot', {
      format: 'png',
    });
    await writeFile(
      resolve('docs/screenshots/conversor-skin.png'),
      Buffer.from(shot4.data, 'base64')
    );
    console.log('Saved conversor-skin.png');

    client.close();
    console.log('All screenshots captured successfully!');
  } finally {
    chrome.kill('SIGKILL');
  }
}

main().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});

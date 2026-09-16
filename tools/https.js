// node tools/https.js  (o: npm run https)
// Publica la app en un HTTPS real con Cloudflare Tunnel. Sin cuentas ni registros.
// - Reutiliza el servidor local si ya está en marcha (puerto 3000).
// - Imprime la URL pública, la guarda en URL-HTTPS.txt y genera QR-APP.png.
// - Mantiene todo vivo hasta Ctrl+C. La URL cambia en cada arranque.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;
const isWin = process.platform === 'win32';
const CFARED = path.join(ROOT, 'tools', isWin ? 'cloudflared.exe' : 'cloudflared');

function puertoAbierto() {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port: PORT, path: '/api/datos', timeout: 3000 }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

function arrancarServidor() {
  console.log('[https] Arrancando servidor local en puerto ' + PORT + '...');
  const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  srv.stdout.on('data', (d) => process.stdout.write('[server] ' + d));
  srv.stderr.on('data', (d) => process.stderr.write('[server] ' + d));
  srv.on('exit', (c) => { console.error('[https] El servidor se cerró (código ' + c + '). Saliendo.'); process.exit(1); });
  return srv;
}

function descargarQR(url) {
  return new Promise((resolve) => {
    try {
      const api = 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=' + encodeURIComponent(url);
      const out = path.join(ROOT, 'QR-APP.png');
      https.get(api, { timeout: 15000 }, (res) => {
        if (res.statusCode !== 200) { res.resume(); return resolve(false); }
        const f = fs.createWriteStream(out);
        res.pipe(f);
        f.on('finish', () => { f.close(); resolve(true); });
        f.on('error', () => resolve(false));
      }).on('error', () => resolve(false));
    } catch (e) { resolve(false); }
  });
}

(async () => {
  if (!fs.existsSync(CFARED)) {
    console.error('[https] No encuentro ' + CFARED);
    process.exit(1);
  }
  let srv = null;
  if (await puertoAbierto()) {
    console.log('[https] Servidor local ya en marcha, lo reutilizo.');
  } else {
    srv = arrancarServidor();
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (await puertoAbierto()) break;
    }
    if (!(await puertoAbierto())) { console.error('[https] El servidor no responde.'); process.exit(1); }
  }

  console.log('[https] Abriendo túnel HTTPS (puede tardar ~15 segundos)...');
  const tun = spawn(CFARED, ['tunnel', '--protocol', 'http2', '--url', 'http://localhost:' + PORT], { stdio: ['ignore', 'pipe', 'pipe'] });
  let anunciada = false;

  const buscarUrl = (chunk) => {
    if (anunciada) return;
    const m = String(chunk).match(/https:\/\/[a-zA-Z0-9.-]+\.trycloudflare\.com/);
    if (!m) return;
    anunciada = true;
    const url = m[0];
    fs.writeFileSync(path.join(ROOT, 'URL-HTTPS.txt'), url + '\n');
    console.log('');
    console.log('==============================================================');
    console.log('  TU APP EN HTTPS:  ' + url);
    console.log('==============================================================');
    console.log('  Ábrela en Windows y en el iPhone para instalarla.');
    console.log('  URL guardada en URL-HTTPS.txt');
    descargarQR(url).then((ok) => {
      if (ok) console.log('  QR guardado en QR-APP.png (escanéalo con el iPhone).');
      else console.log('  (Sin QR: sin conexión para generarlo; escribe la URL a mano.)');
      console.log('  Déjame abierto. Para cerrar: Ctrl+C.');
    });
  };
  tun.stdout.on('data', buscarUrl);
  tun.stderr.on('data', buscarUrl);
  tun.on('exit', (c) => { console.error('[https] Túnel cerrado (código ' + c + ').'); process.exit(srv ? 0 : 1); });

  process.on('SIGINT', () => { try { tun.kill(); } catch (e) {} try { if (srv) srv.kill(); } catch (e) {} process.exit(0); });
})();

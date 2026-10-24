import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { readFileSync } from 'fs';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');

// Simple static file server
function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let file = join(dist, req.url === '/' ? 'index.html' : req.url);
      try {
        const content = readFileSync(file);
        let mimeType = 'application/octet-stream';
        if (file.endsWith('.html')) mimeType = 'text/html';
        else if (file.endsWith('.js')) mimeType = 'application/javascript';
        else if (file.endsWith('.css')) mimeType = 'text/css';
        else if (file.endsWith('.json')) mimeType = 'application/json';
        else if (file.endsWith('.glb')) mimeType = 'model/gltf-binary';
        else if (file.endsWith('.webp')) mimeType = 'image/webp';
        else if (file.endsWith('.png')) mimeType = 'image/png';
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(content);
      } catch (e) {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, url: `http://localhost:${port}` });
    });
  });
}

async function testAxieVisibility() {
  const { server, url } = await startServer();
  console.log(`Server started at ${url}`);
  
  const browser = await chromium.launch();
  const page = await browser.newPage({ 
    viewport: { width: 1400, height: 900 }
  });
  
  // Collect console messages
  const logs = [];
  page.on('console', msg => {
    logs.push(msg.text());
    console.log('Browser log:', msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    console.log('Page loaded');
    
    // Wait for scene to initialize
    await page.waitForTimeout(5000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'axie-visibility-test.png',
      fullPage: false
    });
    console.log('Screenshot saved to axie-visibility-test.png');
    
    const hasAxieWarning = logs.some(log => log.includes('Axie model not found'));
    const hasAxieLoaded = logs.some(log => log.includes('Axie'));
    
    console.log('\nTest results:');
    console.log('- Axie model loaded:', !hasAxieWarning);
    console.log('- Console logs collected:', logs.length);
    if (hasAxieWarning) {
      console.log('- Axie warning found (graceful fallback)');
    }
    
  } finally {
    await browser.close();
    server.close();
  }
}

testAxieVisibility().catch(console.error);

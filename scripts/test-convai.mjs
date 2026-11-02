import { chromium } from 'playwright';

const url = process.env.CONVAI_URL || 'http://127.0.0.1:5173/';
const origin = new URL(url).origin;
const mode = process.env.CONVAI_MODE || 'text';
const statusPattern = /talk to interrupt|listening|connecting|connected|speaking|正在聆听|正在连接|正在说话|聆听中|连接中/i;
const transcriptPattern = /talk to interrupt|send a message|start a call|portfolio guide|powered by|connecting|listening/i;

const browser = await chromium.launch({
  headless: true,
  args: [
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
  ],
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: process.env.CONVAI_VIDEO_DIR
    ? { dir: process.env.CONVAI_VIDEO_DIR, size: { width: 1280, height: 800 } }
    : undefined,
});
await context.grantPermissions(['microphone'], { origin });
const page = await context.newPage();

const consoleErrors = [];
const failedRequests = [];
const elevenRequests = [];
const sockets = [];

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => consoleErrors.push(String(error)));
page.on('requestfailed', (request) => {
  const requestUrl = request.url();
  if (/elevenlabs|convai-widget/i.test(requestUrl)) {
    failedRequests.push(`${request.failure()?.errorText || 'failed'} ${requestUrl}`);
  }
});
page.on('response', (response) => {
  const responseUrl = response.url();
  if (/elevenlabs/i.test(responseUrl)) elevenRequests.push(`${response.status()} ${responseUrl}`);
});
page.on('websocket', (socket) => {
  if (/elevenlabs/i.test(socket.url())) sockets.push(socket.url());
});

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const start = page.getByRole('button', { name: 'Start a call', exact: true });
  await start.waitFor({ timeout: 30000 });
  const conversationSocket = page.waitForEvent('websocket', {
    predicate: (socket) => socket.url().includes('/v1/convai/conversation'),
    timeout: 20000,
  });
  await start.click();

  const agree = page.getByRole('button', { name: /^(agree|accept|同意)$/i });
  if (await agree.count()) await agree.first().click({ timeout: 5000 }).catch(() => {});

  await page.getByRole('button', { name: 'End', exact: true }).waitFor({ timeout: 15000 });
  await conversationSocket;
  if (mode === 'text') {
    await page.getByText(/Talk to interrupt|Listening|正在聆听/).first().waitFor({ timeout: 15000 });
  }

  const widgetText = await page.evaluate(() => {
    const root = document.querySelector('elevenlabs-convai')?.shadowRoot;
    if (!root) return '';
    return [...root.querySelectorAll('button, p, span, div, a')]
      .filter((element) => element.tagName !== 'STYLE')
      .map((element) => {
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return '';
        if (element.getClientRects().length === 0) return '';
        return [...element.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent.trim())
          .filter(Boolean)
          .join(' ');
      })
      .filter(Boolean)
      .join('\n');
  });
  const blockingErrors = consoleErrors.filter((entry) => !/favicon|Download the React DevTools/i.test(entry));
  const apiOk = elevenRequests.some((entry) => entry.startsWith('200 ') && entry.includes('/convai/'));
  const socketOk = sockets.some((entry) => entry.includes('/v1/convai/conversation'));
  const inConversation = mode === 'orb'
    ? socketOk
    : statusPattern.test(widgetText) || /portfolio guide/i.test(widgetText);
  const noTranscript = mode !== 'orb' || !transcriptPattern.test(widgetText);
  const report = {
    url,
    mode,
    visibleText: widgetText.split('\n').map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 12),
    elevenRequests,
    sockets,
    failedRequests,
    consoleErrors: blockingErrors,
    apiOk,
    socketOk,
    inConversation,
    noTranscript,
    ok: apiOk && socketOk && inConversation && noTranscript && blockingErrors.length === 0 && failedRequests.length === 0,
  };
  console.log(JSON.stringify(report, null, 2));
  if (process.env.CONVAI_SCREENSHOT) await page.screenshot({ path: process.env.CONVAI_SCREENSHOT });
  await page.getByRole('button', { name: 'End', exact: true }).click().catch(() => {});
  await context.close();
  await browser.close();
  process.exit(report.ok ? 0 : 1);
} catch (error) {
  console.error(error);
  await context.close().catch(() => {});
  await browser.close().catch(() => {});
  process.exit(1);
}

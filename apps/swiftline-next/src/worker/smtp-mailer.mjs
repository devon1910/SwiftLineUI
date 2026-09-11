import nodemailer from 'nodemailer';

export const DEFAULT_SMTP_CONNECTION_TIMEOUT_MS = 15_000;
export const DEFAULT_SMTP_SEND_TIMEOUT_MS = 60_000;
const MAX_SMTP_TIMEOUT_MS = 24 * 60 * 60 * 1000;

function required(environment, name) {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`${name} is required for the SMTP mailer`);
  return value;
}

function timeout(environment, name, fallback) {
  const raw = environment[name];
  if (raw === undefined || raw === null || String(raw).trim() === '') return fallback;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_SMTP_TIMEOUT_MS) {
    throw new Error(`${name} must be an integer between 1 and ${MAX_SMTP_TIMEOUT_MS} milliseconds`);
  }

  return parsed;
}

function createTimeoutError(timeoutMs) {
  const error = new Error(`SMTP send timed out after ${timeoutMs} milliseconds`);
  error.name = 'TimeoutError';
  error.code = 'ETIMEDOUT';
  error.timeoutMs = timeoutMs;
  return error;
}

function createAbortError(reason) {
  if (reason instanceof Error) return reason;
  const error = new Error(reason ? String(reason) : 'The SMTP send was aborted');
  error.name = 'AbortError';
  error.code = 'ABORT_ERR';
  return error;
}

function closeTransport(transporter) {
  try {
    transporter.close?.();
  } catch {
    // The original timeout/cancellation error is more useful to the worker.
  }
}

async function sendWithTimeout(transporter, message, { timeoutMs, signal } = {}) {
  if (signal?.aborted) throw createAbortError(signal.reason);

  let timer;
  let abortHandler;
  const sendPromise = Promise.resolve().then(() => transporter.sendMail(message));
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      closeTransport(transporter);
      reject(createTimeoutError(timeoutMs));
    }, timeoutMs);
  });
  const abortPromise = signal
    ? new Promise((_, reject) => {
      abortHandler = () => {
        closeTransport(transporter);
        reject(createAbortError(signal.reason));
      };
      signal.addEventListener('abort', abortHandler, { once: true });
    })
    : null;

  try {
    return await Promise.race([sendPromise, timeoutPromise, ...(abortPromise ? [abortPromise] : [])]);
  } finally {
    clearTimeout(timer);
    if (abortHandler) signal.removeEventListener('abort', abortHandler);
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderEmail(email) {
  const username = escapeHtml(email.recipientUsername || 'there');
  const link = escapeHtml(email.link || '');
  const estimatedWait = escapeHtml(email.estimatedWait || '');
  const detail = estimatedWait
    ? `<p>Your current estimated wait is <strong>${estimatedWait}</strong>.</p>`
    : '';
  const action = link
    ? `<p><a href="${link}">Open SwiftLine</a></p>`
    : '';

  return {
    text: [
      `Hello ${email.recipientUsername || 'there'},`,
      email.message || email.subject || 'You have an update from SwiftLine.',
      estimatedWait ? `Estimated wait: ${email.estimatedWait}` : '',
      email.link || '',
    ].filter(Boolean).join('\n\n'),
    html: `<p>Hello ${username},</p><p>${escapeHtml(email.message || email.subject || 'You have an update from SwiftLine.')}</p>${detail}${action}`,
  };
}

export function createMailer({ environment = process.env, nodemailerModule = nodemailer } = {}) {
  const port = Number(environment.SMTP_PORT ?? 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be an integer between 1 and 65535');
  }

  const connectionTimeoutMs = timeout(
    environment,
    'SMTP_CONNECTION_TIMEOUT_MS',
    DEFAULT_SMTP_CONNECTION_TIMEOUT_MS,
  );
  const sendTimeoutMs = timeout(
    environment,
    'SMTP_SEND_TIMEOUT_MS',
    DEFAULT_SMTP_SEND_TIMEOUT_MS,
  );
  const username = environment.SMTP_USERNAME?.trim();
  const password = environment.SMTP_PASSWORD;
  const transporter = nodemailerModule.createTransport({
    host: required(environment, 'SMTP_HOST'),
    port,
    secure: String(environment.SMTP_SECURE).toLowerCase() === 'true',
    auth: username ? { user: username, pass: password ?? '' } : undefined,
    connectionTimeout: connectionTimeoutMs,
    greetingTimeout: connectionTimeoutMs,
    socketTimeout: sendTimeoutMs,
  });
  const from = required(environment, 'SMTP_FROM_EMAIL');

  return {
    async send(email, signal) {
      if (signal?.aborted) throw signal.reason ?? new DOMException('Aborted', 'AbortError');
      const content = renderEmail(email);
      await sendWithTimeout(transporter, {
        from,
        to: email.recipientEmail,
        subject: email.subject,
        ...content,
      }, { timeoutMs: sendTimeoutMs, signal });
    },
  };
}

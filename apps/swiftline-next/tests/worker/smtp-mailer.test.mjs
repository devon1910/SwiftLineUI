import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createMailer,
  DEFAULT_SMTP_CONNECTION_TIMEOUT_MS,
  DEFAULT_SMTP_SEND_TIMEOUT_MS,
} from '../../src/worker/smtp-mailer.mjs';

function environment(overrides = {}) {
  return {
    SMTP_HOST: 'smtp.example.test',
    SMTP_PORT: '2525',
    SMTP_SECURE: 'false',
    SMTP_FROM_EMAIL: 'noreply@example.test',
    ...overrides,
  };
}

function createTransportHarness(sendMail) {
  let options;
  let closed = false;
  const nodemailerModule = {
    createTransport(input) {
      options = input;
      return {
        sendMail,
        close() {
          closed = true;
        },
      };
    },
  };

  return {
    nodemailerModule,
    get options() {
      return options;
    },
    get closed() {
      return closed;
    },
  };
}

const email = {
  recipientEmail: 'person@example.test',
  recipientUsername: 'Pat',
  subject: 'Queue update',
  message: 'Your place is ready.',
  link: 'https://swiftline.example.test/queue',
};

test('built-in adapter applies bounded default connection and send timeouts', async () => {
  const harness = createTransportHarness(async () => ({ accepted: [email.recipientEmail] }));
  const mailer = createMailer({
    environment: environment(),
    nodemailerModule: harness.nodemailerModule,
  });

  await mailer.send(email);

  assert.equal(harness.options.connectionTimeout, DEFAULT_SMTP_CONNECTION_TIMEOUT_MS);
  assert.equal(harness.options.greetingTimeout, DEFAULT_SMTP_CONNECTION_TIMEOUT_MS);
  assert.equal(harness.options.socketTimeout, DEFAULT_SMTP_SEND_TIMEOUT_MS);
});

test('built-in adapter accepts explicit timeouts and sends the rendered message', async () => {
  let sentMessage;
  const harness = createTransportHarness(async (message) => {
    sentMessage = message;
  });
  const mailer = createMailer({
    environment: environment({
      SMTP_CONNECTION_TIMEOUT_MS: '1234',
      SMTP_SEND_TIMEOUT_MS: '5678',
    }),
    nodemailerModule: harness.nodemailerModule,
  });

  await mailer.send(email);

  assert.equal(harness.options.connectionTimeout, 1234);
  assert.equal(harness.options.greetingTimeout, 1234);
  assert.equal(harness.options.socketTimeout, 5678);
  assert.equal(sentMessage.from, 'noreply@example.test');
  assert.equal(sentMessage.to, email.recipientEmail);
  assert.match(sentMessage.text, /Your place is ready\./);
  assert.match(sentMessage.html, /Open SwiftLine/);
});

test('send timeout closes the transport and rejects with a retryable timeout error', async () => {
  const harness = createTransportHarness(() => new Promise(() => {}));
  const mailer = createMailer({
    environment: environment({ SMTP_SEND_TIMEOUT_MS: '20' }),
    nodemailerModule: harness.nodemailerModule,
  });

  await assert.rejects(mailer.send(email), (error) => {
    assert.equal(error.name, 'TimeoutError');
    assert.equal(error.code, 'ETIMEDOUT');
    assert.equal(error.timeoutMs, 20);
    return true;
  });
  assert.equal(harness.closed, true);
});

test('invalid timeout values fail closed during mailer construction', () => {
  for (const [name, value] of [
    ['SMTP_CONNECTION_TIMEOUT_MS', '0'],
    ['SMTP_SEND_TIMEOUT_MS', 'not-a-number'],
  ]) {
    assert.throws(
      () => createMailer({
        environment: environment({ [name]: value }),
        nodemailerModule: { createTransport: () => ({ sendMail() {} }) },
      }),
      new RegExp(`${name} must be an integer`),
    );
  }
});

test('shutdown cancellation closes the active transport without changing adapter overrides', async () => {
  const harness = createTransportHarness(() => new Promise(() => {}));
  const mailer = createMailer({
    environment: environment({ SMTP_SEND_TIMEOUT_MS: '5000' }),
    nodemailerModule: harness.nodemailerModule,
  });
  const controller = new AbortController();
  const pending = mailer.send(email, controller.signal);
  controller.abort(new Error('shutdown requested'));

  await assert.rejects(pending, /shutdown requested/);
  assert.equal(harness.closed, true);
});

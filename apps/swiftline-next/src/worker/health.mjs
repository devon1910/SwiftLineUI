import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export const DEFAULT_HEALTH_FILE = '/tmp/swiftline-email-worker-health.json';

function nowIso(clock) {
  return clock().toISOString();
}

function defaultWriter() {
  return {
    async write(path, contents) {
      await mkdir(dirname(path), { recursive: true });
      const temporaryPath = `${path}.${process.pid}.tmp`;
      await writeFile(temporaryPath, contents, 'utf8');
      await rename(temporaryPath, path);
    },
  };
}

/**
 * Health is a file rather than an HTTP route so the worker remains a real
 * long-running process. Docker can inspect the file without waking Next.js.
 */
export class WorkerHealth {
  constructor({
    workerId,
    filePath = DEFAULT_HEALTH_FILE,
    staleAfterMs = 90_000,
    clock = () => new Date(),
    writer = defaultWriter(),
    logger,
  } = {}) {
    this.workerId = workerId ?? `worker-${process.pid}`;
    this.filePath = filePath;
    this.staleAfterMs = staleAfterMs;
    this.clock = clock;
    this.writer = writer;
    this.logger = logger;
    this.writeChain = Promise.resolve();
    this.state = 'starting';
    this.role = 'starting';
    this.activeLeases = 0;
    this.claimedCount = 0;
    this.lastPollAt = null;
    this.lastErrorAt = null;
    this.updatedAt = nowIso(this.clock);
  }

  snapshot() {
    return {
      service: 'swiftline-email-worker',
      workerId: this.workerId,
      state: this.state,
      role: this.role,
      healthy: this.isHealthy(),
      activeLeases: this.activeLeases,
      claimedCount: this.claimedCount,
      lastPollAt: this.lastPollAt,
      lastErrorAt: this.lastErrorAt,
      updatedAt: this.updatedAt,
    };
  }

  isHealthy() {
    const fresh = this.clock().getTime() - new Date(this.updatedAt).getTime() <= this.staleAfterMs;
    return fresh && (this.state === 'running' || this.state === 'standby');
  }

  setState(state, role = this.role) {
    this.state = state;
    this.role = role;
    this.touch();
  }

  markStandby() {
    this.setState('standby', 'standby');
  }

  markLeader() {
    this.setState('running', 'leader');
  }

  markPoll(claimedCount) {
    this.claimedCount += Math.max(0, Number(claimedCount) || 0);
    this.lastPollAt = nowIso(this.clock);
    this.touch();
  }

  beginLease() {
    this.activeLeases += 1;
    this.touch();
  }

  endLease() {
    this.activeLeases = Math.max(0, this.activeLeases - 1);
    this.touch();
  }

  markError() {
    this.state = 'degraded';
    this.lastErrorAt = nowIso(this.clock);
    this.touch();
  }

  stop() {
    this.setState('stopped', 'stopped');
  }

  touch() {
    this.updatedAt = nowIso(this.clock);
    this.persist();
  }

  persist() {
    const contents = `${JSON.stringify(this.snapshot())}\n`;
    this.writeChain = this.writeChain
      .then(() => this.writer.write(this.filePath, contents))
      .catch((error) => {
        this.logger?.warn('health_signal_write_failed', { error });
      });
    return this.writeChain;
  }

  async flush() {
    await this.writeChain;
  }
}

export async function readHealthSignal(
  filePath = DEFAULT_HEALTH_FILE,
  { maxAgeMs = 90_000, clock = () => new Date() } = {},
) {
  try {
    const parsed = JSON.parse(await readFile(filePath, 'utf8'));
    const ageMs = clock().getTime() - new Date(parsed.updatedAt).getTime();
    const healthyState = parsed.state === 'running' || parsed.state === 'standby';
    return {
      ...parsed,
      healthy: Boolean(parsed.healthy) && healthyState && ageMs >= 0 && ageMs <= maxAgeMs,
      ageMs,
    };
  } catch {
    return { healthy: false, state: 'missing' };
  }
}


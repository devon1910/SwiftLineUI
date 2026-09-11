function serializeError(error) {
  if (!(error instanceof Error)) return error == null ? undefined : { message: String(error) };

  return {
    name: error.name,
    message: error.message,
    ...(error.stack ? { stack: error.stack } : {}),
  };
}

/** Emit one-line JSON records that work with Docker and common log collectors. */
export function createStructuredLogger({
  service = 'swiftline-email-worker',
  sink = console,
  clock = () => new Date(),
} = {}) {
  const write = (level, event, fields = {}) => {
    const { error, ...safeFields } = fields;
    const record = {
      timestamp: clock().toISOString(),
      level,
      service,
      event,
      ...safeFields,
      ...(error ? { error: serializeError(error) } : {}),
    };

    const target = typeof sink?.[level] === 'function'
      ? sink[level]
      : typeof sink?.log === 'function'
        ? sink.log
        : null;

    if (target) target.call(sink, JSON.stringify(record));
  };

  return {
    debug: (event, fields) => write('debug', event, fields),
    info: (event, fields) => write('info', event, fields),
    warn: (event, fields) => write('warn', event, fields),
    error: (event, fields) => write('error', event, fields),
  };
}


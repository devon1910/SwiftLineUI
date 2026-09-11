export default function HomePage() {
  return (
    <main className="service-shell">
      <section className="service-card" aria-labelledby="service-title">
        <p className="service-kicker">SwiftLine service</p>
        <h1 id="service-title">The new service foundation is running.</h1>
        <p className="service-description">
          This Node.js App Router service is ready for the API and worker layers to be
          migrated incrementally.
        </p>
        <nav className="service-links" aria-label="Service diagnostics">
          <a href="/api/health">Liveness</a>
          <a href="/api/health/ready">Readiness</a>
        </nav>
      </section>
    </main>
  );
}

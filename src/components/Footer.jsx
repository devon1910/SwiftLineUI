export const Footer = () => {
  return (
    <footer className="swiftline-footer">
      <div className="swiftline-footer__inner">
        <div className="swiftline-footer__brand">
          <img
            className="swiftline-footer__brand-mark"
            src="/android-chrome-192x192.png"
            alt=""
            aria-hidden="true"
          />
          <div>
            <strong>SwiftLine</strong>
            <p>Clearer queues. Calmer days.</p>
          </div>
        </div>

        <p className="swiftline-footer__meta">
          &copy; {new Date().getFullYear()} SwiftLine &middot; Built for calmer waiting
        </p>
      </div>
    </footer>
  );
};

export default Footer;

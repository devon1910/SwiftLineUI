import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="swiftline-footer">
      <div className="swiftline-footer__inner">
        <div className="swiftline-footer__brand">
          <span className="swiftline-footer__brand-mark" aria-hidden="true">S</span>
          <div>
            <strong>SwiftLine</strong>
            <p>Clearer queues. Calmer days.</p>
          </div>
        </div>

        <nav className="swiftline-footer__nav" aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/search">Search events</Link>
          <Link to="/myEvents">My events</Link>
          <Link to="/auth">Account</Link>
        </nav>

        <p className="swiftline-footer__meta">
          &copy; {new Date().getFullYear()} SwiftLine
        </p>
      </div>
    </footer>
  );
};

export default Footer;

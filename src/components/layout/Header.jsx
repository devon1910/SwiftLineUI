import { createElement, useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { NavLink, Link } from "react-router-dom";

const logoUrl =
  "https://res.cloudinary.com/dddabj5ub/image/upload/v1741908218/swifline_logo_cpsacv.webp";

const headerLinks = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, end: true },
  { label: "Search events", path: "/search", icon: Search },
  { label: "My events", path: "/myEvents", icon: CalendarDays },
  { label: "My queue", path: "/myQueue", icon: ListChecks },
];

const applyTheme = (isDark) => {
  document.body.classList.toggle("dark-mode", isDark);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    applyTheme(darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  return (
    <header className="standalone-header">
      <div className="standalone-header__inner">
        <Link to="/" className="shell-brand" aria-label="SwiftLine dashboard">
          <img className="shell-brand__logo" src={logoUrl} alt="" />
          <span className="shell-brand__wordmark">SwiftLine</span>
          <span className="shell-brand__descriptor">queue operations</span>
        </Link>

        <nav className="standalone-header__nav" aria-label="Header navigation">
          {headerLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className="standalone-header__link"
              onClick={() => setIsMenuOpen(false)}
            >
              {createElement(item.icon, { size: 15, "aria-hidden": true })}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="standalone-header__actions">
          <button
            type="button"
            className="standalone-header__button"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="standalone-header__button"
            onClick={() => setDarkMode((isDark) => !isDark)}
            aria-label={darkMode ? "Use light theme" : "Use dark theme"}
            title={darkMode ? "Use light theme" : "Use dark theme"}
          >
            {darkMode ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="standalone-header__button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="standalone-header-mobile"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav id="standalone-header-mobile" className="standalone-header__mobile" aria-label="Mobile navigation">
          {headerLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setIsMenuOpen(false)}
            >
              {createElement(item.icon, { size: 16, "aria-hidden": true })}
              {item.label}
            </NavLink>
          ))}
          <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
            Account
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;


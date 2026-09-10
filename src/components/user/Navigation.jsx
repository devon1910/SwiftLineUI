import { createElement, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  LayoutDashboard,
  ListChecks,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LogOut as logOut } from "../../services/swiftlineService";

const logoUrl =
  "https://res.cloudinary.com/dddabj5ub/image/upload/v1741908218/swifline_logo_cpsacv.webp";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, end: true },
  { label: "Search events", path: "/search", icon: Search },
  { label: "My events", path: "/myEvents", icon: CalendarDays },
  { label: "My queue", path: "/myQueue", icon: ListChecks },
];

const hasStoredAuth = () => {
  const value = localStorage.getItem("user");
  return Boolean(value && value !== "undefined" && value !== "null");
};

const Navigation = ({ darkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = hasStoredAuth();
  const userName = localStorage.getItem("userName") || "Guest user";

  const closeMenus = () => {
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  const handleAuthAction = async () => {
    if (!isAuthenticated) {
      closeMenus();
      navigate("/auth");
      return;
    }

    if (!window.confirm("Are you sure you want to log out?")) {
      return;
    }

    try {
      await logOut();
      ["user", "refreshToken", "userEmail", "userId", "userName"].forEach((key) =>
        localStorage.removeItem(key),
      );
      closeMenus();
      navigate("/auth");
    } catch (error) {
      toast.error(
        error?.response?.data?.data?.message ||
          "Unable to log out right now. Please try again.",
      );
    }
  };

  return (
    <nav className="shell-nav" aria-label="Primary navigation">
      <div className="shell-nav__inner">
        <NavLink to="/" end className="shell-brand" onClick={closeMenus}>
          <img className="shell-brand__logo" src={logoUrl} alt="" />
          <span className="shell-brand__wordmark">SwiftLine</span>
          <span className="shell-brand__descriptor">queue operations</span>
        </NavLink>

        <div className="shell-nav__links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className="shell-nav__link"
              onClick={closeMenus}
            >
              {createElement(item.icon, { size: 15, "aria-hidden": true })}
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="shell-nav__tools">
          <button
            type="button"
            className="shell-nav__icon-button"
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Use light theme" : "Use dark theme"}
            title={darkMode ? "Use light theme" : "Use dark theme"}
          >
            {darkMode ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>

          <div className="shell-nav__profile-wrap">
            <button
              type="button"
              className="shell-nav__profile"
              onClick={() => setIsProfileOpen((open) => !open)}
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
              aria-controls="swiftline-profile-menu"
            >
              <CircleUserRound size={17} aria-hidden="true" />
              <span className="hidden sm:inline">{isAuthenticated ? userName : "Guest"}</span>
              <ChevronDown
                size={14}
                aria-hidden="true"
                className={isProfileOpen ? "rotate-180" : ""}
              />
            </button>

            {isProfileOpen && (
              <div
                id="swiftline-profile-menu"
                className="shell-nav__profile-menu"
                role="menu"
                aria-label="Account menu"
              >
                <p>{isAuthenticated ? "Account" : "Welcome"}</p>
                <button type="button" role="menuitem" onClick={handleAuthAction}>
                  {isAuthenticated ? "Log out" : "Log in"}
                </button>
              </div>
            )}
          </div>

          <div className="shell-nav__mobile-toggle">
            <button
              type="button"
              className="shell-nav__menu-button"
              onClick={() => setIsOpen((open) => !open)}
              aria-expanded={isOpen}
              aria-controls="swiftline-mobile-navigation"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div id="swiftline-mobile-navigation" className="shell-nav__mobile-panel">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={closeMenus}
            >
              {createElement(item.icon, { size: 17, "aria-hidden": true })}
              {item.label}
            </NavLink>
          ))}
          <div className="shell-nav__mobile-divider" aria-hidden="true" />
          <button type="button" onClick={handleAuthAction}>
            <CircleUserRound size={17} aria-hidden="true" />
            {isAuthenticated ? "Log out" : "Log in"}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

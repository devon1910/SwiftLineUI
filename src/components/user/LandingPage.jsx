import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import Navigation from "./Navigation";
import Footer from "../Footer";

const routeContext = (pathname) => {
  if (pathname.startsWith("/search")) {
    return { label: "Discover", message: "Find the right line for today." };
  }

  if (pathname.startsWith("/myEvents")) {
    return { label: "Your events", message: "Keep every event moving." };
  }

  if (pathname.startsWith("/myQueue")) {
    return { label: "Your queue", message: "Your place, clearly communicated." };
  }

  if (pathname.includes("/manage")) {
    return { label: "Queue operations", message: "A calm view of the line." };
  }

  if (pathname.includes("/edit") || pathname.startsWith("/newEvent")) {
    return { label: "Event setup", message: "Shape the flow before doors open." };
  }

  if (pathname.startsWith("/events/")) {
    return { label: "Event details", message: "Everything attendees need to know." };
  }

  return { label: "Workspace", message: "The simple way to keep a line moving." };
};

function LandingPage({ mode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState = location.state?.email;
  const userNameFromState = location.state?.userName;
  const userName = userNameFromState || localStorage.getItem("userName") || "";
  const email = emailFromState || localStorage.getItem("userEmail") || "";
  const userId = location.state?.userId || localStorage.getItem("userId") || "";
  const isHome = mode === "marketing";
  const currentContext = routeContext(location.pathname);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");
    const refreshToken = urlParams.get("refreshToken");
    const username = urlParams.get("username");
    const queryUserId = urlParams.get("userId");

    if (accessToken) {
      localStorage.setItem("user", JSON.stringify(accessToken));
      localStorage.setItem("refreshToken", JSON.stringify(refreshToken));
      localStorage.setItem("userName", username || "");
      localStorage.setItem("userId", queryUserId || "");
      navigate("/", { replace: true });
    }

    const savedTheme = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark-mode", savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme);
    document.documentElement.style.colorScheme = savedTheme ? "dark" : "light";
    setDarkMode(savedTheme);
    setLoaded(true);
  }, [navigate]);

  const toggleDarkMode = () => {
    setDarkMode((currentMode) => {
      const nextMode = !currentMode;
      document.body.classList.toggle("dark-mode", nextMode);
      document.documentElement.classList.toggle("dark", nextMode);
      document.documentElement.style.colorScheme = nextMode ? "dark" : "light";
      localStorage.setItem("darkMode", String(nextMode));
      return nextMode;
    });
  };

  return (
    <div className="app-shell">
      <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className={`app-main${isHome ? " app-main--home" : ""}`}>
        <div className="app-main__inner">
          {isHome ? (
            <section className="shell-home" aria-labelledby="swiftline-home-title">
              <div className="shell-hero">
                <div className="shell-hero__layout">
                  <div className="shell-hero__copy">
                    <p className="shell-eyebrow">
                      <span className="shell-eyebrow__dot" aria-hidden="true" />
                      Queue operations, made human
                    </p>
                    <h1 id="swiftline-home-title">
                      Move people through <em>their day.</em>
                    </h1>
                    <p className="shell-hero__lede">
                      SwiftLine gives organizers a clear view of every queue and gives
                      attendees the confidence to know what happens next.
                    </p>
                    <div className="shell-hero__actions">
                      <button
                        type="button"
                        className="shell-button shell-button--primary"
                        onClick={() => navigate("/search")}
                      >
                        Find an event
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="shell-button shell-button--quiet"
                        onClick={() => navigate("/newEvent")}
                      >
                        Create an event
                        <CalendarClock size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <p className="shell-hero__greeting" aria-live="polite">
                      {loaded ? "Good to see you, " : "Welcome, "}
                      <strong>{userName || "Guest"}</strong>
                    </p>
                  </div>

                  <aside className="shell-hero__panel" aria-label="SwiftLine queue preview">
                    <div className="shell-panel__header">
                      <div>
                        <p className="shell-panel__eyebrow">A clearer line</p>
                        <h2 className="shell-panel__title">Today's flow</h2>
                      </div>
                      <span className="shell-status">
                        <span className="shell-status__dot" aria-hidden="true" />
                        Ready
                      </span>
                    </div>

                    <div className="shell-queue-list">
                      <div className="shell-queue-row">
                        <span className="shell-queue-row__index">01</span>
                        <div>
                          <p className="shell-queue-row__name">Campus health desk</p>
                          <p className="shell-queue-row__meta">14 people waiting</p>
                        </div>
                        <span className="shell-queue-row__time">18 min</span>
                      </div>
                      <div className="shell-queue-row">
                        <span className="shell-queue-row__index">02</span>
                        <div>
                          <p className="shell-queue-row__name">Community legal clinic</p>
                          <p className="shell-queue-row__meta">6 people waiting</p>
                        </div>
                        <span className="shell-queue-row__time">9 min</span>
                      </div>
                      <div className="shell-queue-row">
                        <span className="shell-queue-row__index">03</span>
                        <div>
                          <p className="shell-queue-row__name">Studio check-in</p>
                          <p className="shell-queue-row__meta">Next up is being served</p>
                        </div>
                        <span className="shell-queue-row__time">Open</span>
                      </div>
                    </div>

                    <div className="shell-hero__panel-footer">
                      <p>
                        <strong>One shared signal</strong>
                        Everyone knows where they stand.
                      </p>
                      <CheckCircle2 size={22} aria-hidden="true" />
                    </div>
                  </aside>
                </div>
              </div>
            </section>
          ) : (
            <div className="shell-route-context" aria-label={`${currentContext.label} context`}>
              <p className="shell-route-context__eyebrow">{currentContext.label}</p>
              <p className="shell-route-context__greeting">
                {currentContext.message} {userName && <strong>{userName}</strong>}
              </p>
            </div>
          )}

          <Outlet context={{ email, userId, userName }} />
        </div>
      </main>
      {isHome && <Footer />}
    </div>
  );
}

export default LandingPage;

export const MarketingShell = () => <LandingPage mode="marketing" />;
export const AppShell = () => <LandingPage mode="app" />;

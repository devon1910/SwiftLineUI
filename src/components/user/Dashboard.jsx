import { ArrowUpRight, CalendarPlus, CheckCircle2, ListChecks, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(`/${path}`);
  };

  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <div className="dashboard__heading">
        <div>
          <p className="dashboard__eyebrow">Your workspace</p>
          <h2 id="dashboard-title">Keep every line moving.</h2>
          <p>
            Start with the task in front of you. SwiftLine keeps the queue visible,
            predictable, and easy to act on.
          </p>
        </div>
        <div className="dashboard__signal">
          <CheckCircle2 size={15} aria-hidden="true" />
          Real-time queue updates
        </div>
      </div>

      <div className="dashboard__action-grid">
        <button
          type="button"
          className="dashboard__action dashboard__action--accent"
          onClick={() => handleNavigation("myEvents")}
        >
          <span className="dashboard__action-top">
            <span className="dashboard__action-number">01 / ORGANIZE</span>
            <span className="dashboard__action-icon">
              <CalendarPlus size={20} aria-hidden="true" />
            </span>
          </span>
          <h3>Run an event without the guesswork.</h3>
          <p>
            Create, share, and monitor your events from one focused control room.
          </p>
          <span className="dashboard__action-bottom">
            Go to My Events
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </button>

        <button
          type="button"
          className="dashboard__action"
          onClick={() => handleNavigation("search")}
        >
          <span className="dashboard__action-top">
            <span className="dashboard__action-number">02 / ATTEND</span>
            <span className="dashboard__action-icon">
              <ListChecks size={20} aria-hidden="true" />
            </span>
          </span>
          <h3>Find your place in the flow.</h3>
          <p>
            Discover active queues, join in a few taps, and spend less time waiting
            in the dark.
          </p>
          <span className="dashboard__action-bottom">
            Search events
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </button>
      </div>

      <div className="dashboard__brief">
        <div className="dashboard__brief-header">
          <h3>A better queue has three signals</h3>
          <p>Simple for organizers. Reassuring for attendees.</p>
        </div>
        <ol className="dashboard__steps">
          <li className="dashboard__step">
            <span className="dashboard__step-number">1</span>
            <div>
              <strong>Set the rhythm</strong>
              <span>Define the event and its capacity before people arrive.</span>
            </div>
          </li>
          <li className="dashboard__step">
            <span className="dashboard__step-number">2</span>
            <div>
              <strong>Share the line</strong>
              <span>Give people a simple way to find and join the right queue.</span>
            </div>
          </li>
          <li className="dashboard__step">
            <span className="dashboard__step-number">3</span>
            <div>
              <strong>Keep moving</strong>
              <span>Use live position updates to make each next step clear.</span>
            </div>
          </li>
        </ol>
      </div>

      <button
        type="button"
        className="dashboard__fab"
        onClick={() => handleNavigation("newEvent")}
        aria-label="Create a new event"
        title="Create a new event"
      >
        <UsersRound size={16} aria-hidden="true" />
        <span>Create event</span>
      </button>
    </section>
  );
};

export default Dashboard;

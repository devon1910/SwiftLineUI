import { useCallback, useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
<<<<<<< HEAD
import DidYouKnowSlider from "./DidYouKnowSlider.jsx";
import {
  connection,
  ensureConnection,
  useSignalRConnection,
  useSignalRWithLoading,
} from "../../services/api/SignalRConn.js";
import { GetUserLineInfo } from "../../services/api/swiftlineService";

import { FiArrowUp, FiPause, FiRefreshCw, FiUserCheck } from "react-icons/fi";
import { FiLogOut, FiX } from "react-icons/fi"; // Added FiX for close button
import { showToast } from "../../services/utils/ToastHelper.jsx";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Bot, Clock, FastForward, Info, MapPin, User } from "lucide-react";
import { useFeedback } from "../../services/utils/useFeedback.js";
import GlobalSpinner from "../common/GlobalSpinner.jsx";
import firstPositionSound from "../../sounds/tv-talk-show-intro.mp3"; // Renamed for clarity
import nextPositionSound from "../../sounds/audience-cheering-clapping.mp3";
import LeaveQueueModal from "./LeaveQueueModal.jsx";
import { useTheme } from "../../services/utils/useTheme"; // Import useTheme
import WordChain from "./WordChain.jsx";

export const MyQueue = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [myQueue, setMyQueue] = useState({});
  const [queueActivity, setQueueActivity] = useState(null);
  const [activeTab, setActiveTab] = useState("wordchain");
  const showConfetti = myQueue.position === 1;

  // Track window dimensions for the Confetti component.
=======
import { FiArrowUp, FiCheckCircle, FiClock, FiLogOut, FiPause, FiRefreshCw, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";
import DidYouKnowSlider from "../DidYouKnowSlider";
import {
  connection,
  ensureSignalRConnected,
  useSignalRWithLoading,
} from "../../services/SignalRConn.js";
import { GetUserLineInfo } from "../../services/swiftlineService";
import { showToast } from "../../services/ToastHelper";

const EMPTY_QUEUE = {
  position: -1,
  positionRank: "",
  eventTitle: "",
  timeTillYourTurn: 0,
  averageWait: 0,
  isNotPaused: true,
};

const MyQueue = () => {
  const [myQueue, setMyQueue] = useState(null);
  const [queueActivity, setQueueActivity] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState("");
>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
<<<<<<< HEAD

  // State to control the display of the up arrow indicators.
  const [showPositionArrow, setShowPositionArrow] = useState(false);
  const [showWaitTimeArrow, setShowWaitTimeArrow] = useState(false);
  const [showLeaveQueueMsg, setShowLeaveQueueMsg] = useState("");

  // useRef to store previous values for animations.
  const prevPositionRef = useRef(null);
  const prevTimeRef = useRef(null);

  const { invokeWithLoading } = useSignalRWithLoading();
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const showFeedbackForm = localStorage.getItem("showFeedbackForm"); // Consider making this a state managed by a hook

  const { triggerFeedback } = useFeedback();
  const conn = useSignalRConnection();
  const positionElementRef = useRef(null);
  const userToken =
    localStorage.getItem("user") === "undefined"
      ? null
      : localStorage.getItem("user");

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const leaveQueueReason = useRef(""); // Use useRef for mutable value

  const { darkMode } = useTheme(); // Use the theme hook
  const { userName } = useOutletContext();
  // Audio references

  //const firstPositionSoundRef = useRef(null);
  const nextPositionSoundRef = useRef(null);

  // Initialize audio on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      //firstPositionSoundRef.current = new Audio(firstPositionSound);
      nextPositionSoundRef.current = new Audio(nextPositionSound);
      //firstPositionSoundRef.current.volume = 1;
      nextPositionSoundRef.current.volume = 1;
    }
  }, []);

  // Initial data fetch and SignalR setup
  useEffect(() => {
    getCurrentPosition(); // Fetch initial data

    if (!conn) return;

    let isMounted = true;
    const setupSignalR = async () => {
      await ensureConnection();
      if (!isMounted) return;

      setIsConnected(conn.state === "Connected");

      const onReceivePositionUpdate = (lineInfo, leaveQueueMessage) => {
        setMyQueue(lineInfo);
        setShowLeaveQueueMsg(leaveQueueMessage);
        if (lineInfo.position === -1 && showFeedbackForm === "true") {
          triggerFeedback(2);
          localStorage.removeItem("showFeedbackForm");
        }
      };

      const onReceiveQueueStatusUpdate = (isQueueActive) => {
        setQueueActivity(isQueueActive);
        if (!isQueueActive) {
          showToast.error("Queue is paused. Please check back later.");
        } else {
          showToast.success("Queue is active. You're back in line!");
        }
      };

      const handleConnectionStateChange = () => {
        setIsConnected(conn.state === "Connected");
      };

      conn.on("ReceivePositionUpdate", onReceivePositionUpdate);
      conn.on("ReceiveQueueStatusUpdate", onReceiveQueueStatusUpdate);
      conn.onclose(handleConnectionStateChange);
      conn.onreconnected(handleConnectionStateChange);
      conn.onreconnecting(handleConnectionStateChange);

      // Cleanup function
      return () => {
        conn.off("ReceivePositionUpdate", onReceivePositionUpdate);
        conn.off("ReceiveQueueStatusUpdate", onReceiveQueueStatusUpdate);
        // Note: For 'onclose', 'onreconnected', 'onreconnecting',
        // direct 'off' methods by name might not always be effective
        // depending on SignalR.js implementation.
      };
    };

    const cleanupPromise = setupSignalR();
    return () => {
      isMounted = false;
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [conn, showFeedbackForm, triggerFeedback]);

  // Handle window resize (for Confetti)
=======
  const [showPositionArrow, setShowPositionArrow] = useState(false);
  const [showWaitTimeArrow, setShowWaitTimeArrow] = useState(false);
  const previousPositionRef = useRef(null);
  const previousTimeRef = useRef(null);
  const { invokeWithLoading } = useSignalRWithLoading();

  const getCurrentPosition = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await GetUserLineInfo();
      const lineInfo = response?.data?.data ?? EMPTY_QUEUE;
      setMyQueue(lineInfo);
      setQueueActivity(lineInfo.isNotPaused ?? true);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        window.location.href = "/";
        return;
      }

      setError("We couldn't load your queue right now. Please try again.");
      console.error("Failed to load queue position", requestError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  useEffect(() => {
    ensureSignalRConnected().catch((connectionError) => {
      console.warn("Realtime queue updates are temporarily unavailable.", connectionError);
    });
  }, []);

  useEffect(() => {
    if (!connection) return undefined;

    const handlePositionUpdate = (lineInfo) => {
      if (!lineInfo) return;
      setMyQueue(lineInfo);
      setQueueActivity(lineInfo.isNotPaused ?? true);
      setError("");
    };

    connection.on("ReceivePositionUpdate", handlePositionUpdate);
    return () => connection.off("ReceivePositionUpdate", handlePositionUpdate);
  }, []);

  useEffect(() => {
    if (!connection) return undefined;

    const handleQueueStatusUpdate = (isQueueActive) => {
      setQueueActivity(Boolean(isQueueActive));
    };

    connection.on("ReceiveQueueStatusUpdate", handleQueueStatusUpdate);
    return () =>
      connection.off("ReceiveQueueStatusUpdate", handleQueueStatusUpdate);
  }, []);

>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)
  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

<<<<<<< HEAD
  // Reconnect and refresh data on tab resume
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        await ensureConnection();
        getCurrentPosition();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Fallback polling every 60s if disconnected
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (!isConnected && document.visibilityState === "visible") {
        getCurrentPosition();
      }
    }, 60000);
    return () => clearInterval(pollInterval);
  }, [isConnected]);

  // Logic for position and time change animations/sounds
  useEffect(() => {
    if (myQueue.position === undefined || myQueue.position === null) return;

    // Handle position change
    if (
      prevPositionRef.current !== null &&
      myQueue.position < prevPositionRef.current
    ) {
      nextPositionSoundRef.current?.play().catch((error) => {
        console.error("Next Position Audio playback failed:", error);
      });
      setShowPositionArrow(true);
      setTimeout(() => setShowPositionArrow(false), 3000);
    }

    // Handle time change
    if (
      prevTimeRef.current !== null &&
      myQueue.timeTillYourTurn < prevTimeRef.current
    ) {
      setShowWaitTimeArrow(true);
      setTimeout(() => setShowWaitTimeArrow(false), 3000);
    }

    // Special handling for reaching first position
    if (myQueue.position === 1 && prevPositionRef.current !== 1) {
      // const playFirstPositionSound = () => {
      //   firstPositionSoundRef.current?.play().catch((error) => {
      //     console.error("First Position Audio playback failed:", error);
      //   });
      // };
      // playFirstPositionSound();
      // const intervalId = setInterval(playFirstPositionSound, 3000);
      // setTimeout(() => {
      //   clearInterval(intervalId);
      // }, 15000);

      if (positionElementRef.current) {
        positionElementRef.current.classList.add("first-place-celebration");
        setTimeout(() => {
          positionElementRef.current.classList.remove(
            "first-place-celebration"
          );
        }, 7000);
      }
    }

    // Handle leave queue message display duration
    if (showLeaveQueueMsg) {
      const timer = setTimeout(() => setShowLeaveQueueMsg(""), 30000);
      return () => clearTimeout(timer);
    }

    // Update refs for the next render
    prevPositionRef.current = myQueue.position;
    prevTimeRef.current = myQueue.timeTillYourTurn;
  }, [myQueue.position, myQueue.timeTillYourTurn, showLeaveQueueMsg]);

  // Function to fetch current queue position
  const getCurrentPosition = () => {
    setIsLoading(true);

    if (!userToken) {
      setIsLoading(false);
      return;
    }

    GetUserLineInfo()
      .then((response) => {
        setMyQueue(response.data.data);
        setQueueActivity(response.data.data.isNotPaused);
        if (response.data.data.position === -1 && showFeedbackForm === "true") {
          triggerFeedback(2);
          localStorage.removeItem("showFeedbackForm");
        }
      })
      .catch((error) => {
        console.error("Error fetching queue info:", error);
        if (error.response && error.response.status === 401) {
          navigate("/");
          showToast.error("Your session has expired. Please log in again.");
        } else {
          showToast.error("Failed to retrieve queue information.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await getCurrentPosition();
    } catch (err) {
      showToast.error("Failed to refresh. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Leave queue handler
  const handleLeaveQueue = async () => {
    try {
      setIsReconnecting(true);
      await ensureConnection();
      const position = myQueue.position;
      await invokeWithLoading(
        connection,
        "ExitQueue",
        JSON.parse(localStorage.getItem("userId")),
        0,
        "-1",
        position,
        leaveQueueReason.current
      );

      showToast.success("Successfully exited the queue.");
      triggerFeedback(2);
      localStorage.removeItem("showFeedbackForm");
      navigate("/search");
    } catch (err) {
      console.error("Leave Queue error:", err);
      showToast.error("Failed to leave queue. Please try again.");
    } finally {
      setIsReconnecting(false);
      setShowLeaveModal(false);
    }
  };

  if (isLoading) {
    return <GlobalSpinner />;
  }

  return (
    <div
      className={`max-w-2xl mx-auto p-4 font-sans transition-colors duration-300
      ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}
    `}
    >
      {showLeaveModal && (
        <LeaveQueueModal
          darkMode={darkMode}
          onConfirm={(reason) => {
            leaveQueueReason.current = reason;
            handleLeaveQueue();
          }}
          onCancel={() => setShowLeaveModal(false)}
        />
      )}

      {/* SignalR Status Bar + Manual Refresh */}
      {myQueue.position !== -1 && (
        <div className="flex items-center justify-end text-xs mb-4 gap-3">
          <span
            className={`flex items-center gap-1.5 font-medium transition-colors duration-300
              ${isConnected ? "text-green-500" : "text-red-500"}
            `}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            {isConnected ? "Live" : "Offline"}
          </span>
          {!isConnected && (
            <button
              onClick={handleManualRefresh}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200
                ${
                  darkMode
                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    : "bg-sage-100 text-sage-800 hover:bg-sage-200"
                }
              `}
              disabled={isRefreshing}
            >
              <FiRefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          )}
        </div>
      )}

      {isReconnecting && <GlobalSpinner />}

      {/* Not in Queue Message */}
      {(myQueue.position === -1 || userToken === null) && (
        <div
          className={`border-l-4 p-6 rounded-lg mt-8 shadow-md transition-colors duration-300
          ${
            darkMode
              ? "bg-gray-800 border-sage-700 text-gray-200"
              : "bg-sage-50 border-sage-300 text-sage-700"
          }
        `}
        >
          <p className="font-medium">You're currently not in any queue.</p>
          <button
            onClick={() => navigate("/search")}
            className={`mt-4 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
              ${
                darkMode
                  ? "bg-sage-600 text-white hover:bg-sage-700"
                  : "bg-sage-500 text-white hover:bg-sage-600"
              }
            `}
          >
            Find a Queue
          </button>
        </div>
      )}

      {myQueue.position > 0 && (
        <div
          className={`border-2 rounded-xl shadow-lg overflow-hidden relative transition-colors duration-300
          ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-gray-100"
              : "border-sage-400 bg-white text-gray-900"
          }
        `}
        >
          {/* Header */}
          <div className="bg-sage-500 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 text-white">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xs font-semibold break-words">
                {myQueue.eventTitle}
              </h3>
              {myQueue.allowAutomaticSkips ? (
                <div className="flex items-center gap-1 text-xs sm:text-sm bg-white/20 rounded-full px-2 py-1 flex-shrink-0">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Automatic</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs sm:text-sm bg-white/20 rounded-full px-2 py-1 flex-shrink-0">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Manual</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors text-white self-end sm:self-auto w-auto"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Leave</span>
=======
  useEffect(() => {
    const position = Number(myQueue?.position);
    if (!Number.isFinite(position)) return undefined;

    const previousPosition = previousPositionRef.current;
    previousPositionRef.current = position;

    if (previousPosition === null || position >= previousPosition) return undefined;

    setShowPositionArrow(true);
    const timeout = window.setTimeout(() => setShowPositionArrow(false), 25000);
    return () => window.clearTimeout(timeout);
  }, [myQueue?.position]);

  useEffect(() => {
    const waitTime = Number(myQueue?.timeTillYourTurn);
    if (!Number.isFinite(waitTime)) return undefined;

    const previousTime = previousTimeRef.current;
    previousTimeRef.current = waitTime;

    if (previousTime === null || waitTime >= previousTime) return undefined;

    setShowWaitTimeArrow(true);
    const timeout = window.setTimeout(() => setShowWaitTimeArrow(false), 25000);
    return () => window.clearTimeout(timeout);
  }, [myQueue?.timeTillYourTurn]);

  const handleLeaveQueue = async () => {
    if (isLeaving || !window.confirm("Are you sure you want to leave the queue?")) {
      return;
    }

    setIsLeaving(true);

    try {
      if (connection.state !== "Connected") {
        toast.info("Connection lost. Attempting to reconnect...");
        await ensureSignalRConnected();
        toast.success("Reconnected successfully.");
      }

      const lineMemberId = myQueue?.lineMemberId;
      await invokeWithLoading(connection, "ExitQueue", "", lineMemberId, "");
      showToast.success("Exited Queue.");
      await getCurrentPosition();
    } catch (requestError) {
      console.error("Error exiting queue", requestError);
      toast.error("Error in exiting queue. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  };

  const displayQueue = myQueue ?? EMPTY_QUEUE;
  const hasQueue = Number(displayQueue.position) >= 1;
  const waitTime = Number(displayQueue.timeTillYourTurn);
  const waitLabel = Number.isFinite(waitTime)
    ? `${Math.max(0, waitTime)} minute${Math.max(0, waitTime) === 1 ? "" : "s"}`
    : "Calculating…";
  const positionLabel = displayQueue.positionRank || "—";
  const showConfetti = hasQueue && waitTime === 0;
  const isNext = Number(displayQueue.position) === 1;

  if (isLoading && !myQueue) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-sage-50 px-4 py-8 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl" role="status" aria-busy="true">
          <div className="animate-pulse space-y-5">
            <div className="h-4 w-28 rounded bg-sage-100 dark:bg-gray-700" />
            <div className="h-10 w-64 rounded bg-gray-100 dark:bg-gray-700" />
            <div className="h-72 rounded-2xl border border-sage-100 bg-white dark:border-gray-700 dark:bg-gray-800" />
          </div>
          <span className="sr-only">Loading your queue</span>
        </div>
      </main>
    );
  }

  if (error && !myQueue) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-sage-50 px-4 py-8 dark:bg-gray-900 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-gray-800" role="alert">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Your queue is unavailable
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-300">
            {error}
          </p>
          <button
            type="button"
            onClick={getCurrentPosition}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:scale-100 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
          >
            <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-sage-50 px-4 py-8 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-sage-600 dark:text-sage-300">
            Your place in line
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                My queue
              </h1>
              <p className="mt-3 text-base leading-7 text-gray-600 dark:text-gray-300">
                Keep an eye on your position while you get on with your day.
              </p>
            </div>
            {isLoading && (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-sage-700 dark:text-sage-300" role="status">
                <FiRefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                Updating
              </span>
            )}
          </div>
        </header>

        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={getCurrentPosition}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold transition-colors hover:scale-100 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-800 dark:hover:bg-red-900/40"
            >
              <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
              Retry
>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)
            </button>
          </div>
        )}

<<<<<<< HEAD
          {/* Served Earlier Message */}
          {showLeaveQueueMsg && (
            <div
              className={`animate-slide-in border-l-4 p-4 mb-6 rounded-lg flex items-center gap-3 shadow-md transition-colors duration-300
              ${
                darkMode
                  ? "bg-blue-900/30 border-blue-400 text-blue-300"
                  : "bg-blue-100 border-blue-500 text-blue-700"
              }
            `}
            >
              <div>
                <h4 className="font-semibold mb-1">Served earlier!🕺🏽</h4>
                <p className="text-sm">{showLeaveQueueMsg}</p>
              </div>
            </div>
          )}

          {/* Queue Paused Message */}
          {!queueActivity && (
            <div
              className={`animate-slide-in border-l-4 p-4 mb-6 rounded-lg flex items-center gap-3 shadow-md transition-colors duration-300
              ${
                darkMode
                  ? "bg-amber-900/30 border-amber-400 text-amber-200"
                  : "bg-amber-100 border-amber-500 text-amber-700"
              }
            `}
            >
              <div className="animate-pulse flex-shrink-0">
                <FiPause className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Queue Paused</h4>
                <p className="text-sm">
                  This queue is currently paused by the organizer. Your position
                  will be maintained when the queue resumes. Check back later!
=======
        {!hasQueue ? (
          <section className="rounded-2xl border border-sage-200 bg-white px-6 py-14 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 dark:bg-sage-900/30 dark:text-sage-300">
              <FiUsers className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-gray-900 dark:text-gray-100">
              You are not in a queue
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-300">
              Join an event from Search Events and your live position will show up here.
            </p>
          </section>
        ) : (
          <section
            className="relative overflow-hidden rounded-2xl border border-sage-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            aria-labelledby="active-queue-title"
          >
            {showConfetti && (
              <Confetti
                width={windowDimension.width}
                height={windowDimension.height}
                recycle={false}
                numberOfPieces={500}
                gravity={0.2}
              />
            )}

            <header className="flex flex-col gap-4 border-b border-sage-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:border-gray-700">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage-600 dark:text-sage-300">
                  Active queue
>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)
                </p>
                <h2 id="active-queue-title" className="mt-1 break-words text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {displayQueue.eventTitle || "Current event"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleLeaveQueue}
                disabled={isLeaving}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-3.5 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:scale-100 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                <FiLogOut className="h-4 w-4" aria-hidden="true" />
                {isLeaving ? "Leaving…" : "Leave queue"}
              </button>
            </header>

<<<<<<< HEAD
          {/* Confetti overlay */}
          {showConfetti && (
            <Confetti
              width={windowDimension.width}
              height={windowDimension.height}
              recycle={false}
              numberOfPieces={1200}
              gravity={0.2}
              tweenDuration={10000}
              colors={[
                "#86efac",
                "#34d399",
                "#10b981",
                "#059669",
                "#14b8a6",
                "#0d9488",
              ]}
            />
          )}

          <div className="p-6 md:p-8">
            <div className="space-y-8">
              {/* Your Position */}
              <div
                ref={positionElementRef}
                className={`flex items-center gap-4 pb-4 border-b ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                } transition-colors duration-300`}
              >
                <MapPin className="text-emerald-500 h-7 w-7 flex-shrink-0" />
                <div className="flex flex-col">
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Your Position
                  </span>
                  <div className="flex items-center">
                    <span className="text-4xl font-extrabold relative">
                      {myQueue.positionRank}
                      {myQueue.position === 1 && (
                        <span className="absolute -top-2 -right-4 text-yellow-400 animate-pulse text-2xl">
                          👑
                        </span>
                      )}
                    </span>
                    {showPositionArrow && (
                      <FiArrowUp className="text-emerald-500 h-6 w-6 ml-3 animate-bounce" />
                    )}
                  </div>
                </div>
              </div>

              {/* AI Prediction: Wait Time */}
              <div
                className={`flex items-start gap-4 pb-4 border-b ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                } transition-colors duration-300`}
              >
                <div
                  className={`relative h-14 w-14 flex items-center justify-center rounded-xl flex-shrink-0
                  ${
                    darkMode
                      ? "bg-blue-950/50"
                      : "bg-gradient-to-br from-blue-50 to-indigo-100"
                  }
                `}
                >
                  {queueActivity && (
                    <div
                      className={`absolute top-0 left-0 w-full h-full border-2 rounded-xl animate-pulse
                      ${darkMode ? "border-blue-700/40" : "border-blue-400/40"}
                    `}
                    />
                  )}
                  <Bot
                    className={`h-8 w-8 relative z-10 ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>

                <div className="flex flex-col flex-1">
                  {/* AI Badge Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      AI Prediction
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${
                        darkMode
                          ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-blue-100"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                      }
                    `}
                    >
                      Beta
                    </span>
                  </div>

                  {/* Main AI Estimate - Large and Prominent */}
                  <div className="text-4xl font-extrabold mb-1 flex items-center flex-1">
                    {myQueue.timeTillYourTurnAI > 2 &&
                      `${myQueue.timeTillYourTurnAI - 2} - `}
                    {myQueue.timeTillYourTurnAI < 0
                      ? 0
                      : myQueue.timeTillYourTurnAI}
                    <span
                      className={`text-xl ml-1 mt-2 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      min{myQueue.timeTillYourTurnAI > 1 ? "s" : ""}
                    </span>
                    {showWaitTimeArrow && (
                      <FiArrowUp className="text-blue-500 h-6 w-6 ml-3 animate-bounce" />
                    )}
                  </div>

                  {/* Subtitle */}
                  <div
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } mb-3`}
                  >
                    Estimated wait time
                  </div>

                  {/* Regular Estimate - Smaller, Secondary */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock
                      className={`h-4 w-4 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Standard estimate: {myQueue.timeTillYourTurn} min
                      {myQueue.timeTillYourTurn > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Footer Note */}
                  <div className="flex items-start gap-2 mt-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0
                      ${darkMode ? "bg-blue-600" : "bg-blue-400"}
                    `}
                    ></div>
                    <p
                      className={`text-xs leading-relaxed ${
                        darkMode ? "text-gray-400" : "text-gray-400"
                      }`}
                    >
                      AI predictions learn from real-time patterns and improve
                      with each event
                    </p>
                  </div>
                </div>
              </div>

              {/* Staff Count */}
              <div className="flex items-center gap-4">
                <FiUserCheck className="text-amber-500 h-7 w-7 flex-shrink-0" />
                <div className="flex flex-col">
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Staff Serving
                  </span>
                  <span className="text-xl font-bold">
                    {myQueue.staffServing} staff member
                    {myQueue.staffServing !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              {myQueue.position !== 1 ? (
                <div className="mt-5">
                  {/* Tab Navigation */}
                  <div className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
                    <button
                      onClick={() => setActiveTab("wordchain")}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                        activeTab === "wordchain"
                          ? darkMode
                            ? "border-blue-400 text-blue-400"
                            : "border-blue-500 text-blue-600"
                          : darkMode
                          ? "border-transparent text-gray-400 hover:text-gray-200"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Word Chain Game
                    </button>
                    <button
                      onClick={() => setActiveTab("trivia")}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                        activeTab === "trivia"
                          ? darkMode
                            ? "border-blue-400 text-blue-400"
                            : "border-blue-500 text-blue-600"
                          : darkMode
                          ? "border-transparent text-gray-400 hover:text-gray-200"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Did You Know?
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="tab-content">
                    {activeTab === "wordchain" ? (
                      <WordChain
                        prevHighScore={myQueue.highestScore}
                        userName={userName}
                      />
                    ) : (
                      <DidYouKnowSlider />
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`p-4 rounded-lg text-sm border mt-5 transition-colors duration-300
                      ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-gray-200"
                          : "bg-gray-100 border-gray-200 text-gray-700"
                      }
                    `}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <Info
                        className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <p className="font-semibold mb-1">
                        You're next in line! 🎉
                      </p>
                    </div>

                    {myQueue.allowAutomaticSkips ? (
                      <p>
                        The system will automatically move you out of the queue
                        in{" "}
                        <span className="font-bold">
                          {myQueue.averageWait} minutes
                        </span>
                        . If you get served sooner, please help others by
                        <b> leaving</b> the queue.
                      </p>
                    ) : (
                      <p>
                        This Event is setup for manual skips. The Organizer will
                        move you out of the queue when you are done.
                      </p>
                    )}

                    <p className="mt-2">
                      Thanks for using theswiftline{" "}
                      <FastForward className="inline-block align-middle ml-1 w-5 h-5 text-sage-500" />
                    </p>
                  </div>
=======
            {!queueActivity && (
              <div className="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200 sm:mx-7" role="status">
                <FiPause className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold">Queue paused</h3>
                  <p className="mt-1 text-sm leading-6">
                    Your place is saved. We will keep tracking it while the organizer pauses service.
                  </p>
>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)
                </div>
              </div>
            )}

            <div className="p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-sage-200 bg-sage-50 p-5 dark:border-sage-900/50 dark:bg-sage-900/20">
                  <div className="flex items-center gap-2 text-sm font-semibold text-sage-700 dark:text-sage-200">
                    <FiUsers className="h-4 w-4" aria-hidden="true" />
                    Your position
                  </div>
                  <div className="mt-4 flex items-center gap-3" aria-live="polite">
                    <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                      {positionLabel}
                    </span>
                    {showPositionArrow && (
                      <FiArrowUp className="h-6 w-6 text-sage-600 motion-safe:animate-bounce dark:text-sage-300" aria-label="Your position improved" />
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    People ahead of you in the queue
                  </p>
                </div>

                <div className="rounded-2xl border border-sage-200 bg-sage-50 p-5 dark:border-sage-900/50 dark:bg-sage-900/20">
                  <div className="flex items-center gap-2 text-sm font-semibold text-sage-700 dark:text-sage-200">
                    <FiClock className="h-4 w-4" aria-hidden="true" />
                    Estimated wait
                  </div>
                  <div className="mt-4 flex items-center gap-3" aria-live="polite">
                    <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                      {waitLabel}
                    </span>
                    {showWaitTimeArrow && (
                      <FiArrowUp className="h-6 w-6 text-sage-600 motion-safe:animate-bounce dark:text-sage-300" aria-label="Your wait time improved" />
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Based on the current service pace
                  </p>
                </div>
              </div>

              {isNext ? (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-sage-300 bg-sage-600 p-5 text-white" role="status" aria-live="polite">
                  <FiCheckCircle className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold">You are next</h3>
                    <p className="mt-1 text-sm leading-6 text-sage-50">
                      Keep your phone nearby. The organizer should be ready for you soon.
                    </p>
                  </div>
                </div>
              ) : (
                <DidYouKnowSlider />
              )}

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 pt-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
                <span>
                  Average service: <strong className="text-gray-900 dark:text-gray-100">{displayQueue.averageWait || "—"} min</strong>
                </span>
                <span>
                  Staff serving: <strong className="text-gray-900 dark:text-gray-100">{displayQueue.staffServing || "—"}</strong>
                </span>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default MyQueue;

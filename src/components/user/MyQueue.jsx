import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import DidYouKnowSlider from "./DidYouKnowSlider.jsx";
import {
  connection,
  ensureConnection,
  useSignalRConnection,
  useSignalRWithLoading,
} from "../../services/api/SignalRConn.js";
import { GetUserLineInfo } from "../../services/api/swiftlineService";

import {
  FiArrowUp,
  FiPause,
  FiRefreshCw,
  FiUserCheck,
} from "react-icons/fi";
import { FiLogOut, FiX } from "react-icons/fi"; // Added FiX for close button
import { showToast } from "../../services/utils/ToastHelper.jsx";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Clock,
  FastForward,
  Info,
  MapPin,
} from "lucide-react";
import { useFeedback } from "../../services/utils/useFeedback.js";
import GlobalSpinner from "../common/GlobalSpinner.jsx";
import firstPositionSound from "../../sounds/tv-talk-show-intro.mp3"; // Renamed for clarity
import nextPositionSound from "../../sounds/audience-cheering-clapping.mp3";
import LeaveQueueModal from "./LeaveQueueModal.jsx";
import { useTheme } from "../../services/utils/useTheme"; // Import useTheme

export const MyQueue = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [myQueue, setMyQueue] = useState({});
  const [queueActivity, setQueueActivity] = useState(null);
  const showConfetti = myQueue.position === 1;

  // Track window dimensions for the Confetti component.
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
  const userToken = localStorage.getItem("user") === "undefined" ? null : localStorage.getItem("user");

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const leaveQueueReason = useRef(""); // Use useRef for mutable value

  const { darkMode } = useTheme(); // Use the theme hook

  // Audio references
  const firstPositionSoundRef = useRef(null);
  const nextPositionSoundRef = useRef(null);

  // Initialize audio on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      firstPositionSoundRef.current = new Audio(firstPositionSound);
      nextPositionSoundRef.current = new Audio(nextPositionSound);
      firstPositionSoundRef.current.volume = 1;
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
        console.log("leaveQueueMessage: ",leaveQueueMessage)
        console.log("lineInfo: ",lineInfo)
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

  // Reconnect and refresh data on tab resume
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        await ensureConnection();
        getCurrentPosition();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    if (prevPositionRef.current !== null && myQueue.position < prevPositionRef.current) {
      nextPositionSoundRef.current?.play().catch((error) => {
        console.error("Next Position Audio playback failed:", error);
      });
      setShowPositionArrow(true);
      setTimeout(() => setShowPositionArrow(false), 3000);
    }

    // Handle time change
    if (prevTimeRef.current !== null && myQueue.timeTillYourTurn < prevTimeRef.current) {
      setShowWaitTimeArrow(true);
      setTimeout(() => setShowWaitTimeArrow(false), 3000);
    }

    // Special handling for reaching first position
    if (myQueue.position === 1 && prevPositionRef.current !== 1) {
      const playFirstPositionSound = () => {
        firstPositionSoundRef.current?.play().catch((error) => {
          console.error("First Position Audio playback failed:", error);
        });
      };
      playFirstPositionSound();
      const intervalId = setInterval(playFirstPositionSound, 3000);
      setTimeout(() => {
        clearInterval(intervalId);
      }, 15000);

      if (positionElementRef.current) {
        positionElementRef.current.classList.add("first-place-celebration");
        setTimeout(() => {
          positionElementRef.current.classList.remove("first-place-celebration");
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
    <div className={`max-w-2xl mx-auto p-4 font-sans transition-colors duration-300
      ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}
    `}>
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
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            {isConnected ? "Live" : "Offline"}
          </span>
          {!isConnected && (
            <button
              onClick={handleManualRefresh}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200
                ${darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-sage-100 text-sage-800 hover:bg-sage-200"}
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
        <div className={`border-l-4 p-6 rounded-lg mt-8 shadow-md transition-colors duration-300
          ${darkMode ? "bg-gray-800 border-sage-700 text-gray-200" : "bg-sage-50 border-sage-300 text-sage-700"}
        `}>
          <p className="font-medium">You're currently not in any queue.</p>
          <button
            onClick={() => navigate("/search")}
            className={`mt-4 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
              ${darkMode ? "bg-sage-600 text-white hover:bg-sage-700" : "bg-sage-500 text-white hover:bg-sage-600"}
            `}
          >
            Find a Queue
          </button>
        </div>
      )}

      {myQueue.position > 0 && (
        <div className={`border-2 rounded-xl shadow-lg overflow-hidden relative transition-colors duration-300
          ${darkMode ? "border-gray-700 bg-gray-800 text-gray-100" : "border-sage-400 bg-white text-gray-900"}
        `}>
          {/* Header */}
          <div className="bg-sage-500 px-6 py-4 flex justify-between items-center text-white">
            <h3 className="text-xl font-semibold">{myQueue.eventTitle}</h3>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors text-white"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Leave</span>
            </button>
          </div>

          {/* Served Earlier Message */}
          {showLeaveQueueMsg && (
            <div className={`animate-slide-in border-l-4 p-4 mb-6 rounded-lg flex items-center gap-3 shadow-md transition-colors duration-300
              ${darkMode ? "bg-blue-900/30 border-blue-400 text-blue-300" : "bg-blue-100 border-blue-500 text-blue-700"}
            `}>
              <div>
                <h4 className="font-semibold mb-1">Served earlier!🕺🏽</h4>
                <p className="text-sm">{showLeaveQueueMsg}</p>
              </div>
            </div>
          )}

          {/* Queue Paused Message */}
          {!queueActivity && (
            <div className={`animate-slide-in border-l-4 p-4 mb-6 rounded-lg flex items-center gap-3 shadow-md transition-colors duration-300
              ${darkMode ? "bg-amber-900/30 border-amber-400 text-amber-200" : "bg-amber-100 border-amber-500 text-amber-700"}
            `}>
              <div className="animate-pulse flex-shrink-0">
                <FiPause className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Queue Paused</h4>
                <p className="text-sm">
                  This queue is currently paused by the organizer. Your position
                  will be maintained when the queue resumes. Check back later!
                </p>
              </div>
            </div>
          )}

          {/* Confetti overlay */}
          {showConfetti && (
            <Confetti
              width={windowDimension.width}
              height={windowDimension.height}
              recycle={false}
              numberOfPieces={1200}
              gravity={0.2}
              tweenDuration={10000}
              colors={['#86efac', '#34d399', '#10b981', '#059669', '#14b8a6', '#0d9488']}
            />
          )}

          <div className="p-6 md:p-8">
            <div className="space-y-8">
              {/* Your Position */}
              <div
                ref={positionElementRef}
                className={`flex items-center gap-4 pb-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} transition-colors duration-300`}
              >
                <MapPin className="text-emerald-500 h-7 w-7 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Your Position</span>
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
              <div className={`flex items-start gap-4 pb-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} transition-colors duration-300`}>
                <div className={`relative h-14 w-14 flex items-center justify-center rounded-xl flex-shrink-0
                  ${darkMode ? "bg-blue-950/50" : "bg-gradient-to-br from-blue-50 to-indigo-100"}
                `}>
                  {queueActivity && (
                    <div className={`absolute top-0 left-0 w-full h-full border-2 rounded-xl animate-pulse
                      ${darkMode ? "border-blue-700/40" : "border-blue-400/40"}
                    `} />
                  )}
                  <Bot className={`h-8 w-8 relative z-10 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                </div>

                <div className="flex flex-col flex-1">
                  {/* AI Badge Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                      AI Prediction
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${darkMode ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-blue-100" : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"}
                    `}>
                      Beta
                    </span>
                  </div>

                  {/* Main AI Estimate - Large and Prominent */}
                  <div className="text-4xl font-extrabold mb-1 flex items-center flex-1">
                    {myQueue.timeTillYourTurnAI > 2 &&
                      `${myQueue.timeTillYourTurnAI - 2} - `}
                    {myQueue.timeTillYourTurnAI}
                    <span className={`text-xl ml-1 mt-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      min{myQueue.timeTillYourTurnAI > 1 ? "s" : ""}
                    </span>
                    {showWaitTimeArrow && (
                      <FiArrowUp className="text-blue-500 h-6 w-6 ml-3 animate-bounce" />
                    )}
                  </div>

                  {/* Subtitle */}
                  <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} mb-3`}>
                    Estimated wait time
                  </div>

                  {/* Regular Estimate - Smaller, Secondary */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    <span className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Standard estimate: {myQueue.timeTillYourTurn} min
                      {myQueue.timeTillYourTurn > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Footer Note */}
                  <div className="flex items-start gap-2 mt-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0
                      ${darkMode ? "bg-blue-600" : "bg-blue-400"}
                    `}></div>
                    <p className={`text-xs leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-400"}`}>
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
                  <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Staff Serving</span>
                  <span className="text-xl font-bold">
                    {myQueue.staffServing} staff member
                    {myQueue.staffServing !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {myQueue.position !== 1 ? (
                <DidYouKnowSlider darkMode={darkMode} />
              ) : (
                <>
                  {/* Subtle reminder about queue progression */}
                  <div className={`p-4 rounded-lg text-sm border mt-5 transition-colors duration-300
                    ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-gray-100 border-gray-200 text-gray-700"}
                  `}>
                    <div className="flex items-start gap-3">
                      <Info className={`h-4 w-4 mt-0.5 flex-shrink-0 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                      <div>
                        <p className="font-semibold mb-1">
                          You're next in line! 🎉
                        </p>
                        <p>
                          The system will automatically move you out of the
                          queue in{" "}
                          <span className="font-bold">
                            {myQueue.averageWait} minutes
                          </span>
                          . If you get served sooner, please help others by
                          <b> leaving</b> the queue.
                        </p>
                        <p className="mt-2">
                          Thanks for using SwiftLine{" "}
                          <FastForward className="inline-block align-middle ml-1 w-5 h-5 text-sage-500" />
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQueue;
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
  FiClock,
  FiInfo,
  FiPause,
  FiRefreshCw,
  FiUserCheck,
  FiX,
} from "react-icons/fi";
import { FiLogOut } from "react-icons/fi";
import { showToast } from "../../services/utils/ToastHelper.jsx";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Bot,
  BotIcon,
  Clock,
  FastForward,
  Info,
  LocateIcon,
  MapPin,
} from "lucide-react";
import { useFeedback } from "../../services/utils/useFeedback.js";
import GlobalSpinner from "../common/GlobalSpinner.jsx";
import sound from "../../sounds/tv-talk-show-intro.mp3";
import nextPositionSound from "../../sounds/audience-cheering-clapping.mp3";
import LeaveQueueModal from "./LeaveQueueModal.jsx";

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
  // useRef to store previous values.
  const prevPositionRef = useRef(myQueue.position);
  const prevTimeRef = useRef(myQueue.timeTillYourTurn);
  const isFirstPositionUpdate = useRef(true);
  const isFirstTimeUpdate = useRef(true);

  const { invokeWithLoading } = useSignalRWithLoading();
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const showFeedbackForm = localStorage.getItem("showFeedbackForm");

  const { triggerFeedback } = useFeedback();
  const conn = useSignalRConnection();
  const positionElementRef = useRef(null);
  const userToken =
    localStorage.getItem("user") === "undefined"
      ? null
      : localStorage.getItem("user");

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    getCurrentPosition();
    if (!conn) return; // Ensure conn is available before proceeding
    // Ensure getCurrentPosition is only called once on mount

    let isMounted = true;
    const setup = async () => {
      await ensureConnection(); // now you know conn.start() has run
      if (!isMounted) return;

      setIsConnected(conn.state === "Connected");
      const onPosChange = (lineInfo, leaveQueueMessage) => {
        setMyQueue(lineInfo);
        setShowLeaveQueueMsg(leaveQueueMessage);
        if (lineInfo.position === -1 && showFeedbackForm === "true") {
          triggerFeedback(2);
          localStorage.removeItem("showFeedbackForm");
        }
      };
      const onLineStatusChange = (isQueueActive) => {
        setQueueActivity(isQueueActive);
        if (!isQueueActive) {
          showToast.error("Queue is paused. Please check back later.");
        } else {
          showToast.success("Queue is active. You're back in line!");
        }
      };

      const handleConnectionChange = () => {
        setIsConnected(conn.state === "Connected");
      };

      conn.on("ReceivePositionUpdate", onPosChange);
      conn.on("ReceiveQueueStatusUpdate", onLineStatusChange);
      conn.onclose(handleConnectionChange);
      conn.onreconnected(handleConnectionChange);
      conn.onreconnecting(handleConnectionChange);

      // cleanup registrations
      return () => {
        conn.off("ReceivePositionUpdate", onPosChange);
        conn.off("ReceiveQueueStatusUpdate", onLineStatusChange);
        conn.off("onclose", handleConnectionChange);
        conn.off("onreconnected", handleConnectionChange);
        conn.off("onreconnecting", handleConnectionChange);
      };
    };

    const cleanupPromise = setup();
    return () => {
      isMounted = false;
      // if you want to wait on cleanupPromise to unregister, you can:
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [conn, showFeedbackForm]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      getCurrentPosition(); // Your server call to get queue info
    } catch (err) {
      showToast.error("Failed to refresh. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };
  // Handle window resize (separate from SignalR concerns)
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

  // Reconnect on tab resume
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        await ensureConnection();
        await getCurrentPosition();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  //Fallback polling every 60s if disconnected
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (!isConnected && document.visibilityState === "visible") {
        getCurrentPosition();
      }
    }, 60000);
    return () => clearInterval(pollInterval);
  }, [isConnected]);

  // Compare position changes for arrow indicators
  useEffect(() => {
    if (isFirstPositionUpdate.current) {
      isFirstPositionUpdate.current = false; // skip first update
    } else if (
      prevPositionRef.current !== null &&
      myQueue.position < prevPositionRef.current
    ) {
      //play next position sound
      const playSound = () => {
        nextPositionSoundRef.current?.play().catch((error) => {
          console.error("Next Position Audio playback failed:", error);
        });
      };
      playSound();
      setShowPositionArrow(true);

      //show leave queue message if any
      if (showLeaveQueueMsg !== "") {
        setTimeout(() => setShowLeaveQueueMsg(""), 30000);
      }

      setTimeout(() => setShowPositionArrow(false), 30000);
    }

    if (isFirstTimeUpdate.current) {
      isFirstTimeUpdate.current = false; // skip first update
    } else if (
      prevTimeRef.current !== null &&
      myQueue.timeTillYourTurn < prevTimeRef.current
    ) {
      setShowWaitTimeArrow(true);
      setTimeout(() => setShowWaitTimeArrow(false), 30000);
    }

    //for first position
    if (myQueue.position === 1) {
      //play 1st position sound
      const playSound = () => {
        firstPositionSoundRef.current?.play().catch((error) => {
          console.error("First Position Audio playback failed:", error);
        });
      };
      playSound();
      const intervalId = setInterval(playSound, 2000); // Play every 3 seconds
      setTimeout(() => {
        clearInterval(intervalId); // Stop after 30 seconds
      }, 15000);

      //apply special animation
      if (positionElementRef.current) {
        positionElementRef.current.classList.add("first-place-celebration");
        setTimeout(() => {
          positionElementRef.current.classList.remove(
            "first-place-celebration"
          );
        }, 7000);
      }
    }

    prevTimeRef.current = myQueue.timeTillYourTurn;
    prevPositionRef.current = myQueue.position;
  }, [myQueue.position, myQueue.timeTillYourTurn]);

  const firstPositionSoundRef = useRef(null);
  const nextPositionSoundRef = useRef(null);
  // Initialize audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      firstPositionSoundRef.current = new Audio(sound);
      nextPositionSoundRef.current = new Audio(nextPositionSound);
      firstPositionSoundRef.current.volume = 1;
      nextPositionSoundRef.current.volume = 1;
    }
  }, []);

  // // Play sound when reaching first position
  // useEffect(() => {
  //   if (
  //     prevPositionRef.current !== null &&
  //     myQueue.position < prevPositionRef.current
  //   ) {
  //     setShowPositionArrow(true);
  //     setTimeout(() => setShowPositionArrow(false), 30000);
  //   }

  // }, [myQueue.position, myQueue.positionRank]);

  function getCurrentPosition() {
    setIsLoading(true); // Moved setIsLoading here to ensure proper loading state

    if (!userToken) {
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
        if (error.response && error.response.status === 401) {
          window.location.href = "/";
        }
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false); // Ensure loading state is updated after the call
      });
  }

  let leaveQueueReason=""
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
        leaveQueueReason
      );

      showToast.success("Exited queue.");
      triggerFeedback(2);
      localStorage.removeItem("showFeedbackForm");
      navigate("/search");
    } catch (err) {
      console.error("Leave Queue error:", err);
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans">
      {showLeaveModal && (
        <LeaveQueueModal
          onConfirm={(reason) => {
            console.log("Left queue because:", reason);
            leaveQueueReason = reason;       
            setShowLeaveModal(false);
            handleLeaveQueue(); // Call the leave queue function
            // Add your leave queue logic here
          }}
          onCancel={() => setShowLeaveModal(false)}
        />
      )}
      {/* SignalR Status Bar + Manual Refresh */}
      {myQueue.position !== -1 && (
        <div className="flex items-center justify-end text-xs text-gray-600 mb-2 gap-2">
          <span
            className={`flex items-center gap-1 ${
              isConnected ? "text-green-600" : "text-red-500"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {isConnected ? "Live" : "Offline"}
          </span>
          {!isConnected && (
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-1 bg-sage-100 hover:bg-sage-200 px-2 py-1 rounded text-sage-800"
              disabled={isRefreshing}
            >
              <FiRefreshCw
                className={`w-4 h-4 ${isRefreshing && "animate-spin"}`}
              />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          )}
        </div>
      )}

      {isReconnecting && <GlobalSpinner />}
      {(myQueue.position === -1 || userToken === null) && (
        <div className="bg-sage-50 border-l-4 border-sage-300 text-sage-700 p-6 rounded-lg mt-8">
          <p className="font-medium">You're currently not in any queue.</p>
        </div>
      )}
      {myQueue.position > 0 && (
        <div className="border-2 border-sage-400 rounded-xl shadow-lg overflow-hidden relative">
          <div className="bg-sage-500 px-6 py-4 border-b-2 border-sage-600 flex justify-between items-center">
            <h3 className="text-xl font-semibold ">{myQueue.eventTitle}</h3>
            <button
              onClick={setShowLeaveModal(true)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors"
            >
              <FiLogOut className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Leave</span>
            </button>
          </div>
          {showLeaveQueueMsg !== "" && (
            <div class="animate-slide-in bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-500 p-4 mb-6 rounded-lg flex items-center gap-3 shadow-md grid grid-col">
              <h4 className="font-semibold mb-1">Served earlier🕺🏽!</h4>
              <p className="text-sm">{showLeaveQueueMsg}</p>
            </div>
          )}
          {!queueActivity && (
            <div className="animate-slide-in bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500 dark:border-amber-400 text-amber-700 dark:text-amber-200 p-4 mb-6 rounded-lg flex items-center gap-3 shadow-md">
              <div className="animate-pulse">
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

          {showConfetti && (
            <Confetti
              width={windowDimension.width}
              height={windowDimension.height}
              recycle={false}
              numberOfPieces={1200}
              gravity={0.2}
            />
          )}

          <div className="p-6 md:p-8">
            <div className="space-y-6 mb-6">
              <div
                ref={positionElementRef}
                className="flex items-center gap-3 pb-3 border-b relative"
              >
                <MapPin className="text-emerald-600 h-6 w-6" />
                <div className="flex flex-col">
                  <span className="text-gray-600 text-sm">Your Position</span>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold relative">
                      {myQueue.positionRank}
                      {myQueue.positionRank === "1st" && (
                        <span className="absolute -top-2 -right-3 text-yellow-500 animate-ping">
                          👑
                        </span>
                      )}
                    </span>
                    {showPositionArrow && (
                      <FiArrowUp className="text-emerald-500 h-5 w-5 ml-2 animate-bounce" />
                    )}
                  </div>
                </div>
              </div>

              {/* Secondary Information: Wait Time - Second most important */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="relative h-12 w-12 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
                  {queueActivity && (
                    <div className="absolute top-0 left-0 w-full h-full border-2 border-blue-400/40 rounded-xl animate-pulse" />
                  )}
                  <Bot className="text-blue-600 h-7 w-7 relative z-10" />
                </div>

                <div className="flex flex-col flex-1">
                  {/* AI Badge Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-600 text-sm font-medium">
                      AI Prediction
                    </span>
                    <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-0.5 rounded-full font-medium">
                      Beta
                    </span>
                  </div>

                  {/* Main AI Estimate - Large and Prominent */}
                  <div className="text-3xl font-bold mb-1 flex items-center flex-1">
                    {myQueue.timeTillYourTurnAI > 2 &&
                      `${myQueue.timeTillYourTurnAI - 2} - `}
                    {myQueue.timeTillYourTurnAI}
                    <span className="text-lg text-gray-600 ml-1 mt-2">
                      min{myQueue.timeTillYourTurnAI > 1 ? "s" : ""}
                    </span>
                    {showWaitTimeArrow && (
                      <FiArrowUp className="text-blue-500 h-5 w-5 ml-2 animate-bounce" />
                    )}
                  </div>

                  {/* Subtitle */}
                  <div className="text-sm text-gray-600 mb-3">
                    Estimated wait time
                  </div>

                  {/* Regular Estimate - Smaller, Secondary */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">
                      Standard estimate: {myQueue.timeTillYourTurn} min
                      {myQueue.timeTillYourTurn > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Footer Note */}
                  <div className="flex items-start gap-2 mt-3">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      AI predictions learn from real-time patterns and improve
                      with each event
                    </p>
                  </div>
                </div>
              </div>

              {/* Tertiary Information: Staff Count - Informational but less actionable */}
              <div className="flex items-center gap-3">
                <FiUserCheck className="text-amber-500 h-6 w-6" />
                <div className="flex flex-col">
                  <span className="text-gray-600 text-sm">Staff Serving</span>
                  <span className="text-lg font-medium">
                    {myQueue.staffServing} staff member
                    {myQueue.staffServing !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {myQueue.position !== 1 ? (
                <DidYouKnowSlider />
              ) : (
                <>
                  {/* Subtle reminder about queue progression */}
                  <div className=" p-2 rounded text-xs  border border-white/20 mt-5">
                    <div className="flex items-start gap-2">
                      <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>
                          You're next in line!🎉<br></br>
                        </p>
                        <p>
                          The system will automatically move you out of the
                          queue in{" "}
                          <span className="font-semibold">
                            {myQueue.averageWait} minutes
                          </span>
                          . If you get served sooner, please help others by
                          <b> leaving</b> the queue.<br></br>
                          Thanks for using SwiftLine{" "}
                          <FastForward className="fast-forward-icon w-5 h-5" />
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

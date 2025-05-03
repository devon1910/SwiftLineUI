import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import DidYouKnowSlider from "./DidYouKnowSlider.jsx";
import {
  connection,
  ensureConnection,
  useSignalRWithLoading,
} from "../../services/api/SignalRConn.js";
import { GetUserLineInfo } from "../../services/api/swiftlineService";

import { FiArrowUp, FiClock, FiPause, FiUserCheck, FiX } from "react-icons/fi";
import { FiLogOut } from "react-icons/fi";
import { showToast } from "../../services/utils/ToastHelper.jsx";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { FastForward, LocateIcon, MapPin } from "lucide-react";
import { useFeedback } from "../../services/utils/useFeedback.js";
import GlobalSpinner from "../common/GlobalSpinner.jsx";
import sound from "../../sounds/tv-talk-show-intro.mp3";

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
  // useRef to store previous values.
  const prevPositionRef = useRef(myQueue.position);
  const prevTimeRef = useRef(myQueue.timeTillYourTurn);

  const { invokeWithLoading } = useSignalRWithLoading();

  const showFeedbackForm = localStorage.getItem("showFeedbackForm");

  const { triggerFeedback } = useFeedback();
  const conn = useSignalRWithLoading();

  useEffect(() => {
    getCurrentPosition();
    if (!conn) return;  // Ensure conn is available before proceeding
    // Ensure getCurrentPosition is only called once on mount
  
    let isMounted = true;
    const setup = async () => {
      await ensureConnection();                // now you know conn.start() has run
      if (!isMounted) return;

      const onPosChange = (lineInfo) => {
        setMyQueue(lineInfo);
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

      conn.on("ReceivePositionUpdate", onPosChange);
      conn.on("ReceiveQueueStatusUpdate", onLineStatusChange);

      // cleanup registrations
      return () => {
        conn.off("ReceivePositionUpdate", onPosChange);
        conn.off("ReceiveQueueStatusUpdate", onLineStatusChange);
      };
    };
    
    const cleanupPromise = setup();
    return () => {
      isMounted = false;
      // if you want to wait on cleanupPromise to unregister, you can:
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, [conn, showFeedbackForm, getCurrentPosition, triggerFeedback]);

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

  // Compare position changes for arrow indicators
  useEffect(() => {
    if (
      prevPositionRef.current !== null &&
      myQueue.position < prevPositionRef.current
    ) {
      setShowPositionArrow(true);
      setTimeout(() => setShowPositionArrow(false), 25000);
    }
    prevPositionRef.current = myQueue.position;
  }, [myQueue.position]);

  // Compare time changes for arrow indicators
  useEffect(() => {
    if (
      prevTimeRef.current !== null &&
      myQueue.timeTillYourTurn < prevTimeRef.current
    ) {
      setShowWaitTimeArrow(true);
      setTimeout(() => setShowWaitTimeArrow(false), 25000);
    }
    prevTimeRef.current = myQueue.timeTillYourTurn;
  }, [myQueue.timeTillYourTurn]);

  const celebrationSoundRef = useRef(null);
  // Initialize audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      celebrationSoundRef.current = new Audio(
        sound
      );
      celebrationSoundRef.current.volume = 1;
    }
  }, []);

  // Play sound when reaching first position
  useEffect(() => {
    if (
      prevPositionRef.current !== null &&
      myQueue.position < prevPositionRef.current
    ) {
      setShowPositionArrow(true);
      setTimeout(() => setShowPositionArrow(false), 25000);
    }

    // Play sound repeatedly for 15 seconds
    if (myQueue.position === 1) {
      const playSound = () => {
        celebrationSoundRef.current?.play().catch((error) => {
          console.error("Audio playback failed:", error);
        });
      };

      playSound();
      const intervalId = setInterval(playSound, 2000); // Play every 3 seconds
      setTimeout(() => {
        clearInterval(intervalId); // Stop after 30 seconds
      }, 30000);
    }
    prevPositionRef.current = myQueue.position;
  }, [myQueue.position]);

  const userToken =
    localStorage.getItem("user") === "undefined"
      ? null
      : localStorage.getItem("user");
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

  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleLeaveQueue = async () => {
    if (!window.confirm("Are you sure you want to leave the queue?")) {
      return;
    }

    try {
      setIsReconnecting(true);
      await ensureConnection();
      const lineMemberId = myQueue.lineMemberId;
      await invokeWithLoading(connection, "ExitQueue", "", lineMemberId, "-1");

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
    <div
      className={`max-w-2xl mx-auto p-4 font-sans ${
        isReconnecting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {isReconnecting && <GlobalSpinner />}
      {(myQueue.position === -1 || userToken===null) && (
        <div className="bg-sage-50 border-l-4 border-sage-300 text-sage-700 p-6 rounded-lg mt-8">
          <p className="font-medium">You're currently not in any queue.</p>
        </div>
      )}
      {myQueue.position > 0 && (
        <div className="border-2 border-sage-400 rounded-xl shadow-lg overflow-hidden relative">
          <div className="bg-sage-500 px-6 py-4 border-b-2 border-sage-600 flex justify-between items-center">
            <h3 className="text-xl font-semibold ">{myQueue.eventTitle}</h3>
            <button
              onClick={handleLeaveQueue}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors"
            >
              <FiLogOut className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Leave</span>
            </button>
          </div>

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
              <div className="flex items-center gap-3 pb-3 border-b">
                <MapPin className="text-emerald-600 h-6 w-6" />
                <div className="flex flex-col">
                  <span className="text-gray-600 text-sm">Your Position</span>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold">
                      {myQueue.positionRank}
                    </span>
                    {showPositionArrow && (
                      <FiArrowUp className="text-emerald-500 h-5 w-5 ml-2 animate-bounce" />
                    )}
                  </div>
                </div>
              </div>

              {/* Secondary Information: Wait Time - Second most important */}
              {/* Updated Wait Time section with animation */}
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="relative h-8 w-8 flex items-center justify-center">
                  {queueActivity && (
                    <div className="absolute top-0 left-0 w-full h-full border-2 border-amber-500/30 rounded-full animate-spin border-t-transparent" />
                  )}
                  <FiClock className="text-amber-500 h-6 w-6 relative z-10" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 text-sm">Estimated Wait</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">
                      {myQueue.timeTillYourTurn} minute
                      {myQueue.timeTillYourTurn > 1 ? "s" : ""}
                    </span>
                    {showWaitTimeArrow && (
                      <FiArrowUp className="text-amber-500 h-5 w-5 ml-2 animate-bounce" />
                    )}
                  </div>
                </div>
              </div>

              {/* Tertiary Information: Staff Count - Informational but less actionable */}
              <div className="flex items-center gap-3">
                <FiUserCheck className="text-blue-500 h-6 w-6" />
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
                <div className="bg-sage-500 p-4 rounded-lg flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <p>You're next in line! Thanks for using SwiftLine <FastForward className="fast-forward-icon"/></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQueue;

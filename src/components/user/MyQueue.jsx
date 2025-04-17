import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import DidYouKnowSlider from "./DidYouKnowSlider.jsx";
import {
  connection,
  useSignalRWithLoading,
} from "../../services/api/SignalRConn.js";
import { GetUserLineInfo } from "../../services/api/SwiftlineService";
import LoadingSpinner from "../common/LoadingSpinner.jsx";
import { FiArrowUp, FiPause, FiUserCheck, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { FiLogOut } from "react-icons/fi";
import { showToast } from "../../services/utils/ToastHelper.jsx";
import { useNavigate } from "react-router-dom";
import { LocateIcon, MapPin } from "lucide-react";

export const MyQueue = () => {
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const [myQueue, setMyQueue] = useState({});

  const [queueActivity, setQueueActivity] = useState(null);

  const { invokeWithLoading } = useSignalRWithLoading();

  useEffect(() => {
    getCurrentPosition();
    setIsLoading(false);
  }, []);

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

  useEffect(() => {
    // Make sure connection is defined/initialized before using it
    if (connection) {
      console.log("Setting up SignalR listener for queue updates");

      // Register for position updates
      connection.on("ReceivePositionUpdate", (lineInfo) => {
        setMyQueue(lineInfo);
      });
      // Clean up when component unmounts
      return () => {
        console.log("Cleaning up SignalR listener");
        connection.off("ReceivePositionUpdate");
      };
    }
  }, []); // Empty dependency array means it runs once on mount

  useEffect(() => {
    // Make sure connection is defined/initialized before using it
    if (connection) {
      console.log("Setting up SignalR listener for queue updates");

      // Register for position updates
      connection.on("ReceiveQueueStatusUpdate", (isQueueActive) => {
        setQueueActivity(isQueueActive);
        console.log("Queue status updated:", isQueueActive);
        if (!isQueueActive) {
          showToast.error("Queue is paused. Please check back later.");
        } else {
          showToast.success("Queue is active. You're in line!");
        }
      });
      // Clean up when component unmounts
      return () => {
        console.log("Cleaning up SignalR listener");
        connection.off("ReceiveQueueStatusUpdate");
      };
    }
  }, []);

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
  function getCurrentPosition() {
    GetUserLineInfo()
      .then((response) => {
        setMyQueue(response.data.data);
        setQueueActivity(response.data.data.isNotPaused);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = "/";
        }
        console.log(error);
      });
  }

  const handleLeaveQueue = async () => {
    if (window.confirm("Are you sure you want to leave the queue?")) {
      if (connection.state !== "Connected") {
        toast.info("Connection lost. Attempting to reconnect...");
        try {
          await connection.start();
          showToast.success("Reconnected successfully.");
        } catch (reconnectError) {
          console.error("Reconnection failed:", reconnectError);
          showToast.error("Unable to reconnect. Please check your network.");
          return;
        }
      }
      const lineMemberId = myQueue.lineMemberId;
      // Invoke SignalR method to join the queue
      await invokeWithLoading(connection, "ExitQueue", "", lineMemberId, "")
        .then(() => {
          showToast.success("Exited Queue.");
          navigate("/");
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans">
      {myQueue.position === -1 && (
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
              numberOfPieces={800}
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
              <div className="flex items-center gap-3 pb-3 border-b">
                <FiPause className="text-amber-500 h-6 w-6" />
                <div className="flex flex-col">
                  <span className="text-gray-600 text-sm">Estimated Wait</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">
                      {myQueue.timeTillYourTurn} minute
                      {myQueue.timeTillYourTurn !== 1 ? "s" : ""}
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
                  <p>You're next in line! Thanks for using SwiftLine ⚡</p>
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

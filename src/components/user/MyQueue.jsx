import { useCallback, useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { FiArrowUp, FiCheckCircle, FiClock, FiLogOut, FiPause, FiRefreshCw, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";
import DidYouKnowSlider from "../DidYouKnowSlider";
import {
  connection,
  ensureSignalRConnected,
  useSignalRWithLoading,
} from "../../services/SignalRConn.js";
import { GetUserLineInfo } from "../../services/swiftlineService";
import { showToast } from "../../services/utils/ToastHelper";

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
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
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
            </button>
          </div>
        )}

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

            {!queueActivity && (
              <div className="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200 sm:mx-7" role="status">
                <FiPause className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold">Queue paused</h3>
                  <p className="mt-1 text-sm leading-6">
                    Your place is saved. We will keep tracking it while the organizer pauses service.
                  </p>
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

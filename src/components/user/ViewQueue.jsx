import React, { useEffect, useState } from "react";
import { eventQueueInfo } from "../../services/swiftlineService";
import { useLocation, useNavigate } from "react-router-dom";
import { format} from "date-fns-tz"

import { FiPause, FiPlay, FiRefreshCw, FiSkipForward } from "react-icons/fi";
import { toast } from "react-toastify";
import { connection, useSignalRWithLoading } from "../../services/SignalRConn";

const ViewQueue = () => {
  const [queue, setQueues] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const location = useLocation();
  const event = location.state?.event;
  const navigate = useNavigate();
  const { invokeWithLoading } = useSignalRWithLoading();

  useEffect(() => {
    getEventQueues();
  }, []);

  const getEventQueues = () => {
    eventQueueInfo(event.id)
      .then((response) => {
        setQueues(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching queue:", error);
      });
  };

  const ToggleQueueActivity = async () => {
    //check if user is logged In
    const userId=localStorage.getItem('userId')

    if (!userId) {
      toast.error("Please login or signup to join a queue.");
      navigate("/login");
      return;
    }
    if (connection.state !== "Connected") {
      toast.info("Connection lost. Attempting to reconnect...");
      try {
        await connection.start();
        toast.success("Reconnected successfully.");
      } catch (reconnectError) {
        console.error("Reconnection failed:", reconnectError);
        toast.error("Unable to reconnect. Please check your network.");
        return;
      }
    }

    // Invoke SignalR method to join the queue
    invokeWithLoading(connection,"ToggleQueueActivity", isPaused, userId, event.id) 
      .then(() => {
        toast.success("Queue Activity updated.");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error in updating queue. Please try again.");
      });
  };

  const togglePause = () => {
    const confirm = window.confirm(
      "Are you sure you want to " +
        (isPaused ? "resume" : "pause") +
        " the queue?" +
        (isPaused
          ? " resuming this queue assumes that the person who was first has already been served."
          : "")
    );
  
    if (confirm) {
      // Implement pause logic here
      ToggleQueueActivity();
      setIsPaused(!isPaused);
    }
  };

  const onSkip = async (lineMemberId) => {
      if (window.confirm("Are you sure you want to serve this line member before the end of their estimated wait time?")) {
        if (connection.state !== "Connected") {
          toast.info("Connection lost. Attempting to reconnect...");
          try {
            await connection.start();
            toast.success("Reconnected successfully.");
          } catch (reconnectError) {
            console.error("Reconnection failed:", reconnectError);
            toast.error("Unable to reconnect. Please check your network.");
            return;
          }
        }
        // Invoke SignalR method to join the queue
        await invokeWithLoading(connection,"ExitQueue", "", lineMemberId, "")
          .then(() => {
            toast.success("Served Line Member.");
            getEventQueues();
          })
          .catch((err) => {
            console.error(err);
            toast.error("Error in exiting queue. Please try again.");
          });
      }
    };
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="rounded-xl shadow-lg border border-sage-100  overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-sage-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-sage-800 dark:text-gray-100">
              {event.title}
            </h2>
            <div className="flex gap-2">
            {queue.length > 0 && (
              <>
              <button
                onClick={togglePause}
                className={`gap-2 ${
                  isPaused
                    ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                    : "bg-sage-100 dark:bg-gray-700 text-sage-700 dark:text-gray-200"
                }`}
              >
                {isPaused ? (
                  <>
                    <FiPlay className="w-5 h-5" />
                    Resume Queue
                  </>
                ) : (
                  <>
                    <FiPause className="w-5 h-5" />
                    Pause Queue
                  </>
                )}
              </button>
              <button
                onClick={getEventQueues}
                variant="ghost"
                className="bg-sage-100 dark:bg-gray-700 text-sage-700 dark:text-gray-200 gap-2"
              >
                <FiRefreshCw className="w-5 h-5" />
                Refresh
              </button>
              </>
            )}
            </div>
          </div>
          <p className="text-sage-600 dark:text-sage-400">
            {event.description}
          </p>
        </div>

        {/* Queue Content */}
        <div className="p-6">
          {queue.length === 0 ? (
            <div className="text-center py-8 text-sage-500 dark:text-sage-400">
              No users in the queue
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sage-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sage-700 dark:text-gray-300 font-semibold">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left text-sage-700 dark:text-gray-300 font-semibold">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sage-700 dark:text-gray-300 font-semibold">
                      Join Time
                    </th>
                    <th className="px-4 py-3 text-left text-sage-700 dark:text-gray-300 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100 dark:divide-gray-700">
                  {queue.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-sage-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sage-600 dark:text-sage-300 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        {user.lineMember.swiftLineUser.email}
                      </td>
                      <td className="px-4 py-3 text-sage-600 dark:text-sage-400">
                        {format(new Date(user.createdAt), "hh:mm a")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          size="sm"
                          onClick={() => onSkip(user.lineMember.id)}
                          disabled={isPaused}
                          className={`gap-2 ${
                            isPaused
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                              : "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/30"
                          }`}
                        >
                          <FiSkipForward className="w-4 h-4" />
                          Serve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewQueue;

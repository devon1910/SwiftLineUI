import React, { useEffect, useState } from "react";
import { getQueueHistory } from "../../services/api/swiftlineService";
import {  useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns-tz";
import { 
  FiPause, 
  FiPlay, 
  FiRefreshCw, 
  FiSkipForward, 
  FiClock, 
  FiUsers, 
  FiCheckCircle
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  connection,
  useSignalRWithLoading,
} from "../../services/api/SignalRConn";
import PaginationControls from "../common/PaginationControl";
import { showToast } from "../../services/utils/ToastHelper";
import { useTheme } from "../../services/utils/useTheme";

const ViewQueue = () => {
  const [queue, setQueues] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState("current"); // "current" or "history"
  const location = useLocation();
  const event = location.state?.event;
  const { darkMode, getThemeClass } = useTheme();
  
  // Use getThemeClass helper for styling based on theme
  const containerClass = getThemeClass('bg-gray-800', 'bg-gray-100');
  const navigate = useNavigate();
  const { invokeWithLoading } = useSignalRWithLoading();

  // Pagination for current queue
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lineMembersPerPage = 10;
  const savedTheme = localStorage.getItem("darkMode") || "false";
  const MetricsContainerTheme = savedTheme === "true" ? 'bg-gray-800' : 'bg-gray-100';
  // State for history queue
  const [queueHistory, setQueueHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [totalServed, setTotalServed] = useState(0);
  const [avgWaitTime, setAvgWaitTime] = useState(0);

  useEffect(() => {
    if (activeTab === "current") {
      getEventQueues();
    } else {
      fetchQueueHistory();
    }
  }, [currentPage, historyPage, activeTab]);

  const getEventQueues = () => {
    getQueueHistory(currentPage, lineMembersPerPage, event.id,false)
      .then((response) => {
        setQueues(response.data.data.lines);
        setIsPaused(response.data.data.isEventPaused);
        setTotalPages(response.data.data.pageCount);
      })
      .catch((error) => {
        console.error("Error fetching queue:", error);
        showToast.error("Failed to load current queue members");
      });
  };

  const fetchQueueHistory = () => {
    setHistoryLoading(true);
    // Using the existing fetchEvents API with parameter 'false' to get past members
    getQueueHistory(historyPage, lineMembersPerPage, event.id,true)
      .then((response) => {
        setQueueHistory(response.data.data.lines);
        setHistoryTotalPages(response.data.data.pageCount);
        setTotalServed(response.data.data.totalServed);
        setAvgWaitTime(response.data.data.averageWaitTime);
        setHistoryLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching queue history:", error);
        showToast.error("Failed to load queue history");
        setHistoryLoading(false);
      });
  };

  const ToggleQueueActivity = async () => {
    //check if user is logged In
    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast.error("Please login or signup to join a queue.");
      navigate("/auth");
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
    invokeWithLoading(
      connection,
      "ToggleQueueActivity",
      isPaused,
      userId,
      event.id
    )
      .then(() => {
        showToast.success("Queue Activity updated.");
      })
      .catch((err) => {
        console.error(err);
        showToast.error("Error in updating queue. Please try again.");
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
    if (
      window.confirm(
        "Are you sure you want to serve this line member before the end of their estimated wait time?"
      )
    ) {
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
      await invokeWithLoading(connection, "ExitQueue", "", lineMemberId, "")
        .then(() => {
          toast.success("Served Line Member.");
          getEventQueues();
          // Refresh history data if we're switching to that tab
          if (activeTab === "history") {
            fetchQueueHistory();
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Error in exiting queue. Please try again.");
        });
    }
  };

  const handleCurrentPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleHistoryPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= historyTotalPages) {
      setHistoryPage(newPage);
    }
  };

  const refreshCurrentView = () => {
    if (activeTab === "current") {
      getEventQueues();
    } else {
      fetchQueueHistory();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="rounded-xl shadow-lg border border-sage-100 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-sage-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-sage-800 dark:text-gray-100 mb-2">
                {event.title}
              </h2>
              <p className="text-sage-600 dark:text-sage-400 mb-4">
                {event.description}
              </p>
            </div>
            
            <div className="flex gap-2">
              {activeTab === "current" && queue.length > 0 && (
                <button
                  onClick={togglePause}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isPaused
                      ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200"
                      : "bg-sage-100 dark:bg-gray-700 text-sage-700 dark:text-gray-200 hover:bg-sage-200"
                  }`}
                >
                  {isPaused ? (
                    <>
                      <FiPlay className="w-5 h-5 mr-2" />
                      Resume Queue
                    </>
                  ) : (
                    <>
                      <FiPause className="w-5 h-5 mr-2" />
                      Pause Queue
                    </>
                  )}
                </button>
              )}
              <button
                onClick={refreshCurrentView}
                className="flex items-center px-4 py-2 bg-sage-100 dark:bg-gray-700 text-sage-700 dark:text-gray-200 hover:bg-sage-200 rounded-md text-sm font-medium transition-colors"
              >
                <FiRefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={` p-4 rounded-lg ${containerClass}`}>
              <div className="flex items-center">
                <FiUsers className="text-sage-600 dark:text-sage-400 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm">Current Queue</p>
                  <p className="text-lg font-semibold text-sage-700 dark:text-sage-300">
                    {queue.length} members
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg  ${containerClass}`}>
              <div className="flex items-center">
                <FiCheckCircle className="text-sage-600 dark:text-sage-400 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm text-sage-500 dark:text-sage-400">Total Served</p>
                  <p className="text-lg font-semibold text-sage-700 dark:text-sage-300">
                    {totalServed} members
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg  ${containerClass}`}>
              <div className="flex items-center">
                <FiClock className="text-sage-600 dark:text-sage-400 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm text-sage-500 dark:text-sage-400">Avg. Wait Time</p>
                  <p className="text-lg font-semibold text-sage-700 dark:text-sage-300">
                    {avgWaitTime} minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-sage-200 dark:border-gray-700">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab("current")}
                className={`py-2 px-3 text-sm font-medium ${
                  activeTab === "current" 
                    ? "border-b-2 border-sage-600 text-sage-700 dark:text-sage-300 dark:border-sage-400" 
                    : "text-sage-500 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300"
                }`}
              >
                Current Queue
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2 px-3 text-sm font-medium ${
                  activeTab === "history" 
                    ? "border-b-2 border-sage-600 text-sage-700 dark:text-sage-300 dark:border-sage-400" 
                    : "text-sage-500 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300"
                }`}
              >
                Queue History
              </button>
            </nav>
          </div>
        </div>

        {/* Queue Content */}
        <div className="p-6">
          {activeTab === "current" ? (
            // Current Queue Tab
            queue.length === 0 ? (
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
                          {(currentPage - 1) * lineMembersPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          {user.lineMember.swiftLineUser.userName} 
                        </td>
                        <td className="px-4 py-3 text-sage-600 dark:text-sage-400">
                          {format(new Date(user.createdAt), "dd/MM/yyyy hh:mm:ss a")}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onSkip(user.lineMember.id)}
                            disabled={isPaused}
                            className={`flex items-center px-3 py-1 rounded text-sm font-medium ${
                              isPaused
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/30"
                            }`}
                          >
                            <FiSkipForward className="w-4 h-4 mr-1" />
                            Serve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-6">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handleCurrentPageChange}
                  />
                </div>
              </div>
            )
          ) : (
            // History Tab
            historyLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sage-600"></div>
                <p className="mt-2 text-sage-600 dark:text-sage-400">Loading history...</p>
              </div>
            ) : queueHistory.length === 0 ? (
              <div className="text-center py-8 text-sage-500 dark:text-sage-400">
                No queue history available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sage-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sage-700 dark:text-gray-300 font-semibold">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-sage-700 dark:text-gray-300 font-semibold">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-sage-700 dark:text-gray-300 font-semibold">
                        Joined At
                      </th>
                      <th className="px-4 py-3 text-left text-sage-700 dark:text-gray-300 font-semibold">
                        Served At
                      </th>
                      <th className="px-4 py-3 text-left text-sage-700 dark:text-gray-300 font-semibold">
                        Wait Time
                      </th>
                      <th className="px-4 py-3 text-left text-sage-700 dark:text-gray-300 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-100 dark:divide-gray-700">
                    {queueHistory.map((member, index) => (
                      <tr
                        key={member.id}
                        className="hover:bg-sage-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sage-600 dark:text-sage-300 font-medium">
                          {(historyPage - 1) * lineMembersPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          {member.lineMember.swiftLineUser.userName} 
                        </td>
                        <td className="px-4 py-3 text-sage-600 dark:text-sage-400">
                          {format(new Date(member?.createdAt), "dd/MM/yyyy hh:mm:ss a")}
                        </td>
                        <td className="px-4 py-3 text-sage-600 dark:text-sage-400">
                          {member?.dateCompletedBeingAttendedTo 
                            ? format(new Date(member?.dateCompletedBeingAttendedTo), "dd/MM/yyyy hh:mm:ss a") 
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sage-600 dark:text-sage-400">
                          {member?.timeWaited 
                            ? `${member?.timeWaited} min` 
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.status === "Served" 
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : member.status === "Skipped"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                              : member.status === "Left"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                          }`}>
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-6">
                  <PaginationControls
                    currentPage={historyPage}
                    totalPages={historyTotalPages}
                    onPageChange={handleHistoryPageChange}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewQueue;
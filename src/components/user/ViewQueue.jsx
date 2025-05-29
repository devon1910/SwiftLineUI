import { useEffect, useState } from "react";
import { getQueueHistory } from "../../services/api/swiftlineService";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns-tz";
import {
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiSkipForward,
  FiClock,
  FiUsers,
  FiCheckCircle,
  FiUserX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  connection,
  useSignalRWithLoading,
} from "../../services/api/SignalRConn";
import PaginationControls from "../common/PaginationControl";
import { showToast } from "../../services/utils/ToastHelper";
import { useTheme } from "../../services/utils/useTheme";




import { Chart as ChartJS } from "chart.js/auto";

// Import Chart components (assuming these are already dark mode compatible internally or will be updated)
import LineChart from "./LineChart";
import DropOffChart from "./DropOffChart";
// import PieChart from "./PieChart"; // Not used in the provided code, can be removed if not needed
import BarChart from "./BarChart";
// import StackedBarChart from "./StackedBarChart"; // Not used
import PerformanceMatrix from "./PerformanceMatrix"; // Not used

const ViewQueue = () => {
  const [queue, setQueues] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState("current"); // "current" or "history"
  const location = useLocation();
  const event = location.state?.event;
  const { darkMode, getThemeClass } = useTheme(); // Destructure darkMode

  const navigate = useNavigate();
  const { invokeWithLoading } = useSignalRWithLoading();

  // Pagination for current queue
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lineMembersPerPage = 10;

  // State for history queue
  const [queueHistory, setQueueHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [totalServed, setTotalServed] = useState(0); // Changed to const
  const [dropOffRate, setDropOffRate] = useState(0); // Changed to const
  const [attendanceData, setAttendanceData] = useState([]); // Changed to const
  const [peakArrivalPeriodData, setPeakArrivalPeriodData] = useState([]); // Changed to const
  const [dropOffReasons, setDropOffReasons] = useState([]);
  const [dropOffRateTrend, setDropOffRateTrend] = useState([]);
  const [avgWaitTime, setAvgWaitTime] = useState(0);

  useEffect(() => {
    getEventQueues();
  }, [currentPage, historyPage, event.id]); // Added event.id to dependency array

  const getEventQueues = () => {
    console.log("currentPage:", currentPage);
    console.log("historyPage:", historyPage);

    getQueueHistory(currentPage, historyPage, lineMembersPerPage, event.id)
      .then((response) => {
        setQueues(response.data.data.linesMembersInQueue);
        setTotalPages(response.data.data.pageCountInQueue);
        setQueueHistory(response.data.data.pastLineMembers);
        setHistoryTotalPages(response.data.data.pageCountPastMembers);
        setIsPaused(response.data.data.isEventPaused);
        if (currentPage === 1 && historyPage === 1) {
          setTotalServed(response.data.data.totalServed);
          setAvgWaitTime(response.data.data.averageWaitTime);
          setDropOffRate(response.data.data.dropOffRate);
          setAttendanceData(response.data.data.attendanceData);
          setDropOffRateTrend(response.data.data.dropOffRateTrend);
          setDropOffReasons(response.data.data.dropOffReasons);
          setPeakArrivalPeriodData(response.data.data.peakArrivalPeriodData);
        }
      })
      .catch((error) => {
        console.error("Error fetching queue:", error);
        showToast.error("Failed to load queue members. Please try again.");
      });
  };

  const ToggleQueueActivity = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast.error("Please login or sign up to manage queues.");
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

    invokeWithLoading(
      connection,
      "ToggleQueueActivity",
      isPaused,
      userId,
      event.id
    )
      .then(() => {
        showToast.success("Queue activity updated.");
        // Re-fetch queue data to reflect the new state
        getEventQueues();
      })
      .catch((err) => {
        console.error(err);
        showToast.error("Error updating queue. Please try again.");
      });
  };

  const togglePause = () => {
    const action = isPaused ? "resume" : "pause";
    const confirmationMessage = `Are you sure you want to ${action} the queue? ${
      isPaused ? "Resuming this queue assumes that the person who was first has already been served." : ""
    }`;

    if (window.confirm(confirmationMessage)) {
      ToggleQueueActivity();
      setIsPaused(!isPaused); // Optimistic update, will be confirmed by getEventQueues
    }
  };

  const onServe = async (lineMemberId) => { // Renamed from onSkip to onServe for clarity
    if (
      window.confirm(
        "Are you sure you want to serve this line member?"
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
      // Invoke SignalR method to exit the queue
      await invokeWithLoading(connection, "ExitQueue", "", lineMemberId, "", -1, "")
        .then(() => {
          toast.success("Line member served.");
          getEventQueues(); // Refresh data after serving
        })
        .catch((err) => {
          console.error(err);
          toast.error("Error serving line member. Please try again.");
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
    getEventQueues();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-sage-100'} rounded-xl shadow-lg overflow-hidden transition-colors duration-300`}>
        {/* Header Section */}
        <div className={`${darkMode ? 'border-gray-700' : 'border-sage-100'} p-6 border-b`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className={`${darkMode ? 'text-gray-100' : 'text-sage-800'} text-2xl font-bold mb-2`}>
                {event.title}
              </h2>
              <p className={`${darkMode ? 'text-sage-400' : 'text-sage-600'} mb-4`}>
                {event.description}
              </p>
            </div>

            <div className="flex gap-2">
              {activeTab === "current" && queue.length > 0 && (
                <button
                  onClick={togglePause}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isPaused
                      ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/30"
                      : "bg-sage-100 dark:bg-gray-700 text-sage-700 dark:text-gray-200 hover:bg-sage-200 dark:hover:bg-gray-600"
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
                className={`${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-sage-100 text-sage-700 hover:bg-sage-200'} flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                <FiRefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'} p-4 rounded-lg shadow-sm transition-colors duration-300`}>
              <div className="flex items-center">
                <FiUsers className="text-sage-600 dark:text-sage-400 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Queue</p>
                  <p className="text-lg font-semibold text-sage-700 dark:text-sage-300">
                    {queue.length} members
                  </p>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'} p-4 rounded-lg shadow-sm transition-colors duration-300`}>
              <div className="flex items-center">
                <FiCheckCircle className="text-sage-600 dark:text-sage-400 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Served
                  </p>
                  <p className="text-lg font-semibold text-sage-700 dark:text-sage-300">
                    {totalServed} members
                  </p>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'} p-4 rounded-lg shadow-sm transition-colors duration-300`}>
              <div className="flex items-center">
                <FiClock className="text-sage-600 dark:text-sage-400 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Avg. Wait Time
                  </p>
                  <p className="text-lg font-semibold text-sage-700 dark:text-sage-300">
                    {avgWaitTime} minutes
                  </p>
                </div>
              </div>
            </div>
            <div className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'} p-4 rounded-lg shadow-sm transition-colors duration-300`}>
              <div className="flex items-center">
                <FiUserX className="text-sage-600 dark:text-sage-400 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Drop-off Rate
                  </p>
                  <p className="text-lg font-semibold text-sage-700 dark:text-sage-300">
                    {dropOffRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`${darkMode ? 'border-gray-700' : 'border-sage-200'} border-b mt-3`}>
            <div className="flex space-x-4"> {/* Using flex and space-x for tabs */}
              <button
                onClick={() => setActiveTab("current")}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200
                  ${activeTab === "current"
                    ? "border-sage-500 text-sage-700 dark:text-sage-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-sage-600 dark:hover:text-sage-300"
                  }
                `}
              >
                Current Queue
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200
                  ${activeTab === "history"
                    ? "border-sage-500 text-sage-700 dark:text-sage-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-sage-600 dark:hover:text-sage-300"
                  }
                `}
              >
                Queue History
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200
                  ${activeTab === "analytics"
                    ? "border-sage-500 text-sage-700 dark:text-sage-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-sage-600 dark:hover:text-sage-300"
                  }
                `}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Queue Content */}
        <div className="p-6">
          {activeTab === "current" ? (
            // Current Queue Tab
            queue.length === 0 ? (
              <div className={`${darkMode ? 'text-gray-400' : 'text-sage-500'} text-center py-8`}>
                No users in the queue
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className={`${darkMode ? 'bg-gray-800' : 'bg-sage-50'}`}>
                    <tr>
                      <th className={`${darkMode ? 'text-gray-300' : 'text-sage-700'} px-4 py-3 text-left font-semibold text-sm`}>
                        Position
                      </th>
                      <th className={`${darkMode ? 'text-gray-300' : 'text-sage-700'} px-4 py-3 text-left font-semibold text-sm`}>
                        User
                      </th>
                      <th className={`${darkMode ? 'text-gray-300' : 'text-sage-700'} px-4 py-3 text-left font-semibold text-sm`}>
                        Join Time
                      </th>
                      <th className={`${darkMode ? 'text-gray-300' : 'text-sage-700'} px-4 py-3 text-left font-semibold text-sm`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-sage-100'} divide-y`}>
                    {queue.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-sage-50'} transition-colors`}
                      >
                        <td className={`${darkMode ? 'text-sage-300' : 'text-sage-600'} px-4 py-3 font-medium`}>
                          {(currentPage - 1) * lineMembersPerPage + index + 1}
                        </td>
                        <td className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} px-4 py-3`}>
                          {user.swiftLineUser.userName}
                        </td>
                        <td className={`${darkMode ? 'text-sage-400' : 'text-sage-600'} px-4 py-3 text-sm`}>
                          {format(
                            new Date(user.createdAt),
                            "dd/MM/yyyy hh:mm:ss a"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onServe(user.id)}
                            disabled={isPaused}
                            className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
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
                    darkMode={darkMode} 
                  />
                </div>
              </div>
            )
          ) : activeTab === "history" ? (
            queueHistory.length === 0 ? (
              <div className={`${darkMode ? 'text-gray-400' : 'text-sage-500'} text-center py-8`}>
                No queue history available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className={`${darkMode ? 'bg-gray-800' : 'bg-sage-50'}`}>
                    <tr>
                      <th className={`${darkMode ? 'text-gray-300' : 'text-sage-700'} px-4 py-3 text-left font-semibold text-sm`}>
                        #
                      </th>
                      <th className={`${darkMode ? 'text-gray-300' : 'text-sage-700'} px-4 py-3 text-left font-semibold text-sm`}>
                        User
                      </th>
                      <th className={`${darkMode ? 'text-gray-300' : 'text-sage-700'} px-4 py-3 text-left font-semibold text-sm`}>
                        Joined At
                      </th>
                      <th className={`${darkMode ? 'text-gray-300' : 'text-sage-700'} px-4 py-3 text-left font-semibold text-sm`}>
                        Served At
                      </th>
                      <th className={`${darkMode ? 'text-gray-300' : 'text-sage-700'} px-4 py-3 text-left font-semibold text-sm`}>
                        Wait Time
                      </th>
                      <th className={`${darkMode ? 'text-gray-300' : 'text-sage-700'} px-4 py-3 text-left font-semibold text-sm`}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-sage-100'} divide-y`}>
                    {queueHistory.map((member, index) => (
                      <tr
                        key={member.id}
                        className={`${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-sage-50'} transition-colors`}
                      >
                        <td className={`${darkMode ? 'text-sage-300' : 'text-sage-600'} px-4 py-3 font-medium`}>
                          {(historyPage - 1) * lineMembersPerPage + index + 1}
                        </td>
                        <td className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} px-4 py-3`}>
                          {member.swiftLineUser.userName}
                        </td>
                        <td className={`${darkMode ? 'text-sage-400' : 'text-sage-600'} px-4 py-3 text-sm`}>
                          {format(
                            new Date(member?.createdAt),
                            "dd/MM/yyyy hh:mm:ss a"
                          )}
                        </td>
                        <td className={`${darkMode ? 'text-sage-400' : 'text-sage-600'} px-4 py-3 text-sm`}>
                          {member?.dateCompletedBeingAttendedTo
                            ? format(
                                new Date(member?.dateCompletedBeingAttendedTo),
                                "dd/MM/yyyy hh:mm:ss a"
                              )
                            : "-"}
                        </td>
                        <td className={`${darkMode ? 'text-sage-400' : 'text-sage-600'} px-4 py-3 text-sm`}>
                          {member?.timeWaited
                            ? `${member?.timeWaited} min`
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.status === "served"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : member.status === "served by Admin"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                                : member.status === "left"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                            }`}
                          >
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
                    darkMode={darkMode} 
                  />
                </div>
              </div>
            )
          ) : (
            // Analytics Tab
            <div className={`${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <h3 className="text-xl font-bold mb-4">Queue Analytics</h3>
              {attendanceData.length > 0 && (
                 <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-sm mb-6`}>
                    <LineChart isForDropOff={false} attendanceData={attendanceData} darkMode={darkMode} />
                 </div>
              )}
               {dropOffRateTrend.length > 0 || dropOffReasons.length > 0 ? (
                 <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-sm mb-6`}>
                   <DropOffChart
                     dropOffRateTrend={dropOffRateTrend}
                     dropOffReasons={dropOffReasons}
                     darkMode={darkMode}
                   />
                 </div>
               ) : (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-4`}>No drop-off data available yet.</p>
               )}
              {peakArrivalPeriodData.length > 0 && (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-sm mb-6`}>
                  <BarChart peakArrivalPeriodData={peakArrivalPeriodData} darkMode={darkMode} />
                </div>
              )}
               {(attendanceData.length === 0 && dropOffRateTrend.length === 0 && dropOffReasons.length === 0 && peakArrivalPeriodData.length === 0) && (
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>
                  No analytics data available yet for this queue.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewQueue;
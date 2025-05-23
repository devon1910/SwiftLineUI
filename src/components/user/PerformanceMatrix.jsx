import React from 'react'

const PerformanceMatrix = () => {
  return (
    <div className=" p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4 text-sage-800 dark:text-gray-100">
      Performance Metrics
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-sage-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left">Metric</th>
            <th className="px-4 py-3 text-left">This Event</th>
            <th className="px-4 py-3 text-left">
              Avg. Across Events
            </th>
            <th className="px-4 py-3 text-left">Best Event</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-3">Avg. Service Time</td>
            <td className="px-4 py-3">
              {"currentEventMetrics.avgServiceTime"} min
            </td>
            <td className="px-4 py-3">
              {"avgMetrics.avgServiceTime"} min
            </td>
            <td className="px-4 py-3">
              {"bestMetrics.avgServiceTime"} min
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3">Drop-off Rate</td>
            <td className="px-4 py-3">
              {"currentEventMetrics.dropOffRate"}%
            </td>
            <td className="px-4 py-3">
              {"avgMetrics.dropOffRate"}%
            </td>
            <td className="px-4 py-3">
              {"bestMetrics.dropOffRate"}%
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3">Peak Hour</td>
            <td className="px-4 py-3">
              {"currentEventMetrics.peakHour"}
            </td>
            <td className="px-4 py-3">{"avgMetrics.peakHour"}</td>
            <td className="px-4 py-3">{"bestMetrics.peakHour"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  )
}

export default PerformanceMatrix
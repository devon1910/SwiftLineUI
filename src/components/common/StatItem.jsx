import { FiClock, FiUsers, FiCalendar, FiUserCheck, FiPause } from "react-icons/fi";

const StatItem = ({ label, value }) => {
    let icon = null;
     switch (label) {
      case "Average Wait":
        icon = (
          <FiPause className="text-amber-500 h-4 w-4 mr-1" />
        );
        break;
      case "Users In Queue":
        icon = (
          <FiUsers className="w-4 h-4 text-sage-500 dark:text-sage-400 mr-1" />
        );
        break;
      case "Staff Serving":
        icon = (
          <FiUserCheck className="w-4 h-4 text-blue-500 dark:text-sage-400 mr-1" />
        );
        break;
      case "Starts":
        icon = (
          <FiCalendar className="w-4 h-4 text-sage-500 dark:text-sage-400 mr-1" />
        );
        break;
      case "Ends":
        icon = (
          <FiCalendar className="w-4 h-4 text-sage-500 dark:text-sage-400 mr-1" />
        );
        break;
      default:
        icon = null;
    }

    return (
      <div className="flex flex-col">
        <div className="flex items-center mb-1">
          {icon}
          <span className="text-xs text-sage-500 dark:text-sage-400 font-medium">
            {label}
          </span>
        </div>
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          {value}
        </span>
      </div>
    );
  };

  export default StatItem;
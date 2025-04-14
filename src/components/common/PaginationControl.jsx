import { FiChevronLeft,FiChevronRight } from "react-icons/fi";


// Updated PaginationControls component
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
  
    return (
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md hover:bg-sage-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
  
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
  
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md hover:bg-sage-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
  
        <div className="flex gap-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index + 1}
              onClick={() => onPageChange(index + 1)}
              className={`h-2 w-8 rounded-full transition-all ${
                currentPage === index + 1
                  ? 'bg-sage-500'
                  : 'bg-sage-200 dark:bg-gray-600'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  };

  export default PaginationControls
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const PaginationControls = ({ currentPage, totalPages, onPageChange, darkMode }) => { // Accept darkMode prop
    if (totalPages < 1) return null;

    return (
        <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md transition-colors
                        ${darkMode ? 'text-gray-300 hover:bg-gray-700 disabled:text-gray-600' : 'text-gray-600 hover:bg-sage-100 disabled:text-gray-400'}
                        disabled:opacity-50
                    `}
                    aria-label="Previous page"
                >
                    <FiChevronLeft className="w-5 h-5" />
                </button>

                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md transition-colors
                        ${darkMode ? 'text-gray-300 hover:bg-gray-700 disabled:text-gray-600' : 'text-gray-600 hover:bg-sage-100 disabled:text-gray-400'}
                        disabled:opacity-50
                    `}
                    aria-label="Next page"
                >
                    <FiChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => onPageChange(index + 1)}
                        className={`h-2 w-8 rounded-full transition-all
                            ${currentPage === index + 1
                                ? 'bg-sage-500' // Active page dot
                                : `${darkMode ? 'bg-gray-600' : 'bg-sage-200'}` // Inactive page dot
                            }
                        `}
                        aria-label={`Go to page ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default PaginationControls;
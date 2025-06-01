import { useState, useEffect, useRef } from "react";
import { useFeedback } from "../../services/utils/useFeedback";
import { showToast } from "../../services/utils/ToastHelper";
import { createFeedback } from "../../services/api/swiftlineService";
import { useTheme } from '../../services/utils/useTheme'; // Import useTheme
import { FaStar } from 'react-icons/fa'; // Import star icon

const FeedbackForm = () => {
  const { showFeedback, feedbackQueueId, handleClose } = useFeedback();
  const { darkMode } = useTheme(); // Get dark mode state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitButtonRef = useRef(null);

  // Reset form when reopening
  useEffect(() => {
    if (showFeedback) {
      setRating(0);
      setComment("");
      setSelectedTags([]);
    }
  }, [showFeedback]);

  const feedbackTags = [
    "Wait time inaccurate",
    "Notifications delayed",
    "QR code issues",
    "Staff helpfulness",
    "Easy to use",
  ];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only continue if the submit button triggered the submit
    if (e.nativeEvent.submitter !== submitButtonRef.current) return;
    setIsSubmitting(true);

    try {
      const feedbackData = {
        rating: rating,
        comment: comment,
        tags: selectedTags,
      };

      const response = await createFeedback(feedbackData); // Use await for API call

      if (response.data?.data) { // Use optional chaining for safer access
        showToast.success("Thank you for your feedback!");
      } else {
        showToast.error(response.data?.message || "An error occurred."); // Provide a fallback message
      }
      handleClose();
    } catch (error) {
      console.error("Error submitting feedback:", error); // Use console.error
      showToast.error("Failed to submit feedback. Please try again."); // User-friendly error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showFeedback) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4 backdrop-blur-sm">
      <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-xl max-w-md w-full animate-fade-in shadow-lg transition-colors duration-300`}>
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">Your Feedback</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>
                theswiftLine is built for you, me, everyone that detests waiting
                in pointless queues. We value your feedback, so please let us
                know your thoughts.
                <br />
                {feedbackQueueId
                  ? "How was your queue experience?"
                  : "General feedback"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition-colors duration-200`}
              aria-label="Close feedback form"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button" // Important for buttons inside a form not to submit
                className={`text-3xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500
                  ${rating >= star
                    ? 'text-yellow-400' // Selected star color
                    : `${darkMode ? 'text-gray-600 hover:text-yellow-300' : 'text-gray-300 hover:text-yellow-400'}` // Unselected star color
                  }
                `}
                onClick={() => setRating(star)}
                aria-label={`${star} star rating`}
              >
                <FaStar />
              </button>
            ))}
          </div>

          {/* Tags */}
          <div className="mb-6">
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-3`}>What stood out?</p>
            <div className="flex flex-wrap gap-2">
              {feedbackTags.map((tag) => (
                <button
                  key={tag}
                  type="button" // Important for buttons inside a form not to submit
                  className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 border
                    ${selectedTags.includes(tag)
                      ? 'bg-sage-300 text-sage-800 border-sage-500' // Selected tag
                      : `${darkMode
                        ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-gray-300'}`
                    }
                  `}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={selectedTags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label htmlFor="comment" className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} block text-sm font-medium mb-2`}>
              Additional comments (optional)
            </label>
            <textarea
              id="comment"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-y
                ${darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                }
              `}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What could we improve?"
              aria-label="Additional comments"
            />
          </div>

          {/* Submit */}
          <button
            ref={submitButtonRef}
            type="submit"
            disabled={isSubmitting || rating === 0}
            className={`w-full py-2.5 rounded-lg font-medium transition-colors duration-200 shadow-md
              ${rating === 0 || isSubmitting
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' // Disabled state
                : 'bg-sage-600 hover:bg-sage-700 text-white' // Enabled state
              }
            `}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" // Slightly larger spinner
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
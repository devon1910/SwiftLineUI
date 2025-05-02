import { useState, useEffect } from "react";
import { useFeedback } from "../../services/utils/useFeedback";
import { showToast } from "../../services/utils/ToastHelper";
import { useRef } from "react";
import { createFeedback } from "../../services/api/swiftlineService";

const FeedbackForm = () => {
  const { showFeedback, feedbackQueueId, handleClose } = useFeedback();
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

      createFeedback(feedbackData).then((response) => {
        if (response.data.data) {
          showToast.success("Thank you for your feedback!");
        } else {
          showToast.error(response.data.message);
        }
      });
      handleClose();
    } catch (error) {
      console.log("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showFeedback) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 grid place-items-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full animate-fade-in">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">Your Feedback</h3>
              <p className="text-gray-500 text-sm">
                SwiftLine is built for you and me—those of us who hate waiting
                in pointless queues. We value your feedback, so please let us
                know your thoughts.<br></br>{" "}
                {feedbackQueueId
                  ? "How was your queue experience?"
                  : "General feedback"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star-button ${
                  rating >= star ? "star-selected" : "star-unselected"
                }`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>

          {/* Tags */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">What stood out?</p>
            <div className="flex flex-wrap gap-2">
              {feedbackTags.map((tag) => (
                <button
                  key={tag}
                  className={`tag-button ${
                    selectedTags.includes(tag)
                      ? "tag-selected"
                      : "tag-unselected"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Additional comments (optional)
            </label>
            <textarea
              id="comment"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What could we improve?"
            />
          </div>

          {/* Submit */}
          <button
            ref={submitButtonRef}
            type="submit"
            disabled={isSubmitting || rating === 0}
            className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
              rating === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-sage-600 hover:bg-sage-700 text-white"
            }`}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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

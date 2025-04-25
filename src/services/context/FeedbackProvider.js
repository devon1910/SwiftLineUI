// contexts/FeedbackContext.js
import { createContext, useState, useContext } from 'react';

const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackQueueId, setFeedbackQueueId] = useState(null);

  const triggerFeedback = (queueId) => {
    setFeedbackQueueId(queueId);
    setShowFeedback(true);
  };

  const handleClose = () => setShowFeedback(false);

  return (
    <FeedbackContext.Provider
      value={{ showFeedback, feedbackQueueId, triggerFeedback, handleClose }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => useContext(FeedbackContext);
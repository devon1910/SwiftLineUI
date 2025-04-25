// contexts/FeedbackContext.js
import { useState } from 'react';
import FeedbackContext from './FeedbackContext';


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


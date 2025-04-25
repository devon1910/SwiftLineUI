import { useContext } from 'react';
import { FeedbackProvider } from '../context/FeedbackProvider';
import FeedbackContext from '../context/FeedbackContext';

export const useFeedback = () => useContext(FeedbackContext);
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../../services/utils/useTheme'; // Assuming this path is correct

// Define the full set of 25 questions
const allQuestions = [
  {
    question: 'What is the average time a person spends waiting in lines each year?',
    options: ['5 hours', '15 hours', '25 hours', '60 hours'],
    correctAnswer: 2, // 25 hours
  },
  {
    question: 'Which country is famous for its highly organized and efficient queuing culture?',
    options: ['Italy', 'Japan', 'Brazil', 'Canada'],
    correctAnswer: 1, // Japan
  },
  {
    question: 'What psychological effect makes waiting in line feel longer than it actually is?',
    options: ['The Zeigarnik Effect', 'The Peak-End Rule', 'The Prospect Theory', 'The Empty Time Effect'],
    correctAnswer: 3, // The Empty Time Effect
  },
  {
    question: 'In queueing theory, what does "FIFO" stand for?',
    options: ['First-In, First-Out', 'Fast-In, Fast-Out', 'Frequent-Input, Frequent-Output', 'Fixed-Interval, Fixed-Order'],
    correctAnswer: 0, // First-In, First-Out
  },
  {
    question: 'Which of these is NOT a common strategy to make waiting feel shorter?',
    options: ['Providing entertainment', 'Hiding the length of the queue', 'Making the wait transparent', 'Having a comfortable waiting area'],
    correctAnswer: 1, // Hiding the length of the queue (transparency is better)
  },
  {
    question: 'What is a common reason for people to abandon a queue?',
    options: ['Too many staff members', 'Accurate wait time predictions', 'Uncertainty about wait time', 'Engaging distractions'],
    correctAnswer: 2, // Uncertainty about wait time
  },
  {
    question: 'Which industry was one of the first to widely adopt queue management systems?',
    options: ['Retail', 'Healthcare', 'Banking', 'Education'],
    correctAnswer: 2, // Banking
  },
  {
    question: 'What is the "Disney Effect" in queue management?',
    options: ['Making queues move faster', 'Making waiting fun and engaging', 'Using virtual reality in queues', 'Eliminating all queues'],
    correctAnswer: 1, // Making waiting fun and engaging
  },
  {
    question: 'True or False: Single-line queues are generally perceived as fairer than multiple-line queues.',
    options: ['True', 'False'],
    correctAnswer: 0, // True
  },
  {
    question: 'What is the primary goal of a good queue management system like theSwiftLine?',
    options: ['To make queues longer', 'To eliminate all waiting', 'To reduce perceived wait time and improve efficiency', 'To only serve VIPs'],
    correctAnswer: 2, // To reduce perceived wait time and improve efficiency
  },
  {
    question: 'Which historical invention significantly impacted the concept of queuing?',
    options: ['The printing press', 'The telephone', 'The assembly line', 'The steam engine'],
    correctAnswer: 2, // The assembly line
  },
  {
    question: 'What is the term for the phenomenon where people join the shortest line, even if it moves slower?',
    options: ['Short Line Bias', 'Herd Mentality', 'Line Jumping', 'Queue Hopping'],
    correctAnswer: 0, // Short Line Bias
  },
  {
    question: 'Which of these factors is NOT typically used to predict wait times in advanced systems?',
    options: ['Number of staff serving', 'Average service time', 'Current queue position', 'The weather outside'],
    correctAnswer: 3, // The weather outside (unless it affects staff/flow)
  },
  {
    question: 'What is a "serpentine queue"?',
    options: ['A very fast queue', 'A single, winding line that serves multiple points', 'A queue for snakes', 'A queue that never ends'],
    correctAnswer: 1, // A single, winding line that serves multiple points
  },
  {
    question: 'True or False: Distractions like music or videos can make waiting feel shorter.',
    options: ['True', 'False'],
    correctAnswer: 0, // True
  },
  {
    question: 'What is the main benefit of virtual queuing for users?',
    options: ['They get served faster', 'They don\'t have to be physically present while waiting', 'They get free coffee', 'They can skip the line entirely'],
    correctAnswer: 1, // They don't have to be physically present while waiting
  },
  {
    question: 'What does theSwiftLine use to provide real-time queue updates?',
    options: ['SMS messages', 'Carrier pigeons', 'WebSockets (SignalR)', 'Smoke signals'],
    correctAnswer: 2, // WebSockets (SignalR)
  },
  {
    question: 'Which type of technology does theSwiftLine use for its wait time predictions?',
    options: ['Blockchain', 'Quantum Computing', 'Machine Learning', 'Virtual Reality'],
    correctAnswer: 2, // Machine Learning (ML.NET)
  },
  {
    question: 'For which users are push notifications reserved in theSwiftLine?',
    options: ['All users', 'Anonymous users', 'Logged-in users', 'Event organizers only'],
    correctAnswer: 2, // Logged-in users
  },
  {
    question: 'What is a "PWA" (Progressive Web App) like theSwiftLine?',
    options: ['A paid web application', 'A web app that looks and feels like a native app', 'A very slow web app', 'A private web archive'],
    correctAnswer: 1, // A web app that looks and feels like a native app
  },
  {
    question: 'True or False: theSwiftLine offers a dashboard for event organizers to view queue metrics.',
    options: ['True', 'False'],
    correctAnswer: 0, // True
  },
  {
    question: 'What can event organizers do if there\'s a delay in the queue using theSwiftLine?',
    options: ['Go home', 'Pause the queue and notify users', 'Start a new queue', 'Ignore the delay'],
    correctAnswer: 1, // Pause the queue and notify users
  },
  {
    question: 'What is a benefit of theSwiftLine being a PWA for users with limited internet?',
    options: ['It works without any internet connection', 'It offers some offline capabilities', 'It downloads the entire internet', 'It speeds up their internet'],
    correctAnswer: 1, // It offers some offline capabilities
  },
  {
    question: 'What is the main purpose of Cloudflare Turnstile in theSwiftLine?',
    options: ['To speed up the internet', 'To provide weather updates', 'To mitigate bot attacks during login/signup', 'To manage cloud storage'],
    correctAnswer: 2, // To mitigate bot attacks during login/signup
  },
  {
    question: 'If someone leaves a queue early on theSwiftLine, what happens to others in the queue?',
    options: ['Nothing changes', 'Their positions and estimated times update in real-time', 'They have to rejoin', 'The queue is automatically cancelled'],
    correctAnswer: 1, // Their positions and estimated times update in real-time
  },
];

const QuizComponent = () => {
  const { darkMode } = useTheme(); // Destructure darkMode from useTheme hook

  // State to manage the quiz flow
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds timer
  const timerRef = useRef(null); // Ref to hold the timer interval ID

  // Theme-dependent classes
  const bgColorClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColorClass = darkMode ? 'text-gray-100' : 'text-black';
  const secondaryTextColorClass = darkMode ? 'text-gray-300' : 'text-gray-700';
  const borderColorClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const optionBgClass = darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200';
  const optionBorderClass = darkMode ? 'border-gray-600' : 'border-gray-300';
  const correctBgClass = 'bg-green-600'; // Darker green for dark mode, but still green
  const correctBorderClass = 'border-green-700';
  const correctTextClass = 'text-white';
  const incorrectBgClass = 'bg-red-600'; // Darker red for dark mode, but still red
  const incorrectBorderClass = 'border-red-700';
  const incorrectTextClass = 'text-white';
  const selectedBeforeAnswerBgClass = darkMode ? 'bg-sage-green-dark' : 'bg-sage-green-light';
  const selectedBeforeAnswerBorderClass = darkMode ? 'border-sage-green' : 'border-sage-green';
  const selectedBeforeAnswerTextClass = darkMode ? 'text-white' : 'text-black';


  // Function to start a new quiz
  const startQuiz = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Shuffle all questions and pick 10 random ones
    const shuffledQuestions = [...allQuestions].sort(() => 0.5 - Math.random());
    setCurrentQuestions(shuffledQuestions.slice(0, 10)); // Select 10 random questions
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(10); // Reset timer
    setQuizStarted(true);
  };

  // Effect for the question timer
  useEffect(() => {
    if (!quizStarted || showResults) {
      // Don't start timer if quiz hasn't started or results are showing
      return;
    }

    // Reset timer for new question
    setTimeLeft(10);
    setIsAnswered(false);
    setSelectedOption(null); // Ensure no option is pre-selected

    // Start new interval
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          // Auto-advance if time runs out and no answer was selected
          // This will effectively mark the question as incorrect if not answered
          handleNextQuestion();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup function: clear interval when component unmounts or question changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex, quizStarted, showResults]); // Re-run effect when question index changes

  // Handle user's option selection
  const handleOptionClick = (optionIndex) => {
    // Prevent changing answer after it's been selected or if timer has run out
    if (isAnswered || timeLeft === 0) return;

    // Clear the timer immediately when an answer is selected
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    // Check if the selected option is correct and update score
    if (optionIndex === currentQuestions[currentQuestionIndex].correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }

    // Automatically move to the next question after a short delay
    setTimeout(() => {
      handleNextQuestion();
    }, 1500); // 1.5 second delay to show feedback
  };

  // Handle moving to the next question or showing results
  const handleNextQuestion = () => {
    // Ensure timer is cleared before moving on
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setTimeLeft(10); // Reset timer for the new question immediately
      setSelectedOption(null); // Reset selected option
      setIsAnswered(false); // Reset answered status
    } else {
      setShowResults(true); // All questions answered, show results
    }
  };

  // Memoized function to get the remark based on the final score
  const getRemark = useMemo(() => {
    const totalQuestions = currentQuestions.length;
    if (totalQuestions === 0) return ''; // Handle case before quiz starts

    // Assuming 10 questions are always selected
    switch (score) {
      case 10:
        return "You're amazing! A true theswiftliner expert! 🏆";
      case 9:
        return "Very good! Almost perfect! 🫡";
      case 8:
        return "Great job! You know your stuff. 👏";
      case 7:
        return "Good effort! Keep learning. 🤗";
      case 6:
        return "Not bad! A decent score. 👍";
      default:
        return "Keep trying! There's more to learn about waiting efficiently. 🙂";
    }
  }, [score, currentQuestions.length]);

  return (
    <div className={`min-h-screen ${bgColorClass} flex items-center justify-center p-4 font-sans transition-colors duration-300`}>
      <div className={`${cardBgClass} rounded-lg shadow-xl p-8 w-full max-w-md border ${borderColorClass}`}>
        {!quizStarted ? (
          // Start Screen
          <div className="text-center">
            <h2 className={`text-3xl font-bold ${textColorClass} mb-4`}>theSwiftLine Quiz!</h2>
            <p className={`${secondaryTextColorClass} mb-6`}>Test your knowledge about waiting in line and fun facts!</p>
            <button
              onClick={startQuiz}
              className="w-full bg-sage-green  py-3 px-6 rounded-lg font-semibold text-lg hover:bg-sage-green-dark transition-colors duration-300 shadow-md"
            >
              Start Quiz
            </button>
          </div>
        ) : showResults ? (
          // Results Screen
          <div className="text-center">
            <h2 className={`text-3xl font-bold ${textColorClass} mb-4`}>Quiz Complete!</h2>
            <p className={`${secondaryTextColorClass} text-xl mb-2`}>Your Score: {score} / {currentQuestions.length}</p>
            <p className={`text-2xl font-semibold ${textColorClass} mb-6`}>{getRemark}</p>
            <button
              onClick={startQuiz}
              className="w-full bg-sage-green py-3 px-6 rounded-lg font-semibold text-lg hover:bg-sage-green-dark transition-colors duration-300 shadow-md"
            >
              Play Again
            </button>
          </div>
        ) : (
          // Quiz Screen
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${textColorClass}`}>
                Question {currentQuestionIndex + 1} of {currentQuestions.length}
              </h3>
              <div className={`text-xl font-bold ${textColorClass}`}>
                Time: {timeLeft}s
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
              <div
                className="bg-sage-green h-2.5 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 10) * 100}%` }}
              ></div>
            </div>

            <p className={`${textColorClass} text-xl mb-6`}>{currentQuestions[currentQuestionIndex].question}</p>
            <div className="space-y-4">
              {currentQuestions[currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  className={`w-full text-left py-3 px-4 rounded-lg border-2 transition-colors duration-200
                    ${isAnswered
                      ? (index === currentQuestions[currentQuestionIndex].correctAnswer
                        ? `${correctBgClass} ${correctBorderClass} ${correctTextClass}` // Correct answer
                        : (index === selectedOption
                          ? `${incorrectBgClass} ${incorrectBorderClass} ${incorrectTextClass}` // Incorrect selected
                          : `${optionBgClass} ${optionBorderClass} ${textColorClass} opacity-70`)) // Unselected, but not the correct one
                      : (selectedOption === index
                        ? `${selectedBeforeAnswerBgClass} ${selectedBeforeAnswerBorderClass} ${selectedBeforeAnswerTextClass}` // Selected before answer check
                        : `${optionBgClass} ${optionBorderClass} ${textColorClass}`) // Not selected, hoverable
                    }
                    ${isAnswered && (index !== currentQuestions[currentQuestionIndex].correctAnswer && index !== selectedOption) ? 'opacity-70' : ''}
                  `}
                  disabled={isAnswered || timeLeft === 0} // Disable buttons once an answer is selected or time runs out
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;

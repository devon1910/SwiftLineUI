import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi'; // For the accordion icons
import { useTheme } from '../../services/utils/useTheme'; // Assuming you have this hook for dark mode

const faqData = [
  {
    question: 'What is Swiftline and how does it work?',
    answer: 'Swiftline is a modern queue management solution designed to streamline waiting lines for various events, businesses, and services. Users can join virtual queues from their devices, receive real-time updates on their position, and get notifications when it\'s their turn. Event organizers or service providers can manage queues efficiently, pause/resume queues, serve members, and gain insights through analytics.',
  },
  {
    question: 'How do I create a new queue for my event?',
    answer: 'To create a new queue, you need to sign in or create an account on Swiftline. Once logged in, navigate to your dashboard and look for an option like "Create New Event" or "Manage Queues." Follow the prompts to set up your event details, queue name, and any specific instructions for participants.',
  },
  {
    question: 'Can I join a queue without creating an account?',
    answer: 'Yes, typically you can join a queue as a guest. However, creating an account allows you to receive personalized notifications, manage your queue positions across multiple events, and access other premium features like reminder emails.',
  },
  {
    question: 'What happens if I miss my turn in the queue?',
    answer: 'If you miss your turn, the event organizer or service provider may have a policy in place. Some might allow you to rejoin at the end of the queue, while others may require you to start a new queue. It\'s best to pay attention to your notifications to avoid missing your slot.',
  },
  {
    question: 'How does Swiftline handle unexpected delays or pauses in a queue?',
    answer: 'Swiftline provides tools for event organizers to pause or resume queues as needed. If a queue is paused, you will receive a notification, and your position will be held until the queue resumes. This ensures fairness and keeps participants informed during unforeseen circumstances.',
  },
  {
    question: 'Is my personal information secure on Swiftline?',
    answer: 'Yes, Swiftline prioritizes the security and privacy of your data. We use industry-standard encryption and security protocols to protect your personal information and queue data. Please refer to our Privacy Policy for more details.',
  },
  {
    question: 'Can Swiftline be customized for specific business needs?',
    answer: 'Swiftline is designed to be flexible. While the core features cater to a wide range of needs, we are continually developing new functionalities and integrations. For specific business customization inquiries, please contact our support team.',
  },
  {
    question: 'How can I provide feedback or report an issue?',
    answer: 'We appreciate your feedback! You can usually find a "Give Feedback" button in the footer or navigation of the Swiftline website. Alternatively, you can contact our support team directly via email or through the contact form on our website.',
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { darkMode } = useTheme();

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sectionBgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const headingClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textColorClass = darkMode ? 'text-gray-300' : 'text-gray-700';
  const accordionBgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const accordionHoverClass = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const answerBgClass = darkMode ? 'bg-gray-700' : 'bg-gray-50';

  return (
    <div className={`min-h-screen ${sectionBgClass} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className={`${headingClass} text-4xl font-extrabold text-center mb-12`}>
          Frequently Asked Questions
        </h1>

        <div className="space-y-6">
          {faqData.map((item, index) => (
            <div
              key={index}
              className={`${accordionBgClass} rounded-lg shadow-md overflow-hidden border transition-all duration-300`}
            >
              <button
                className={`flex justify-between items-center w-full p-6 text-left focus:outline-none ${textColorClass} ${accordionHoverClass} transition-colors duration-200`}
                onClick={() => toggleAccordion(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-semibold text-lg">{item.question}</span>
                {openIndex === index ? (
                  <FiMinus className="w-6 h-6 flex-shrink-0" />
                ) : (
                  <FiPlus className="w-6 h-6 flex-shrink-0" />
                )}
              </button>
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className={`${answerBgClass} p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`${textColorClass} leading-relaxed`}>{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
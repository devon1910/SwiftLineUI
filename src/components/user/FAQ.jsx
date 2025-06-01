import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi'; // For the accordion icons
import { useTheme } from '../../services/utils/useTheme'; // Assuming you have this hook for dark mode

const faqData = [
  {
    question: 'What is theswiftline and how does it work?',
    answer:
      'theswiftline is a cutting-edge PWA (Progressive Web App) designed to revolutionize queue management for any event involving people and queues. It allows users to join virtual queues from anywhere, multitask, and efficiently use their time. Event organizers get powerful tools to manage queues, view real-time metrics, and optimize their operations.',
  },
  {
    question: 'How do I create a new queue for my event?',
    answer:
      'To create an event and manage its queue, you must be logged in as an event organizer. Simply navigate to your dashboard, select "Create New Event," and follow the prompts. You can specify event start and end times, average service time, and even choose whether users can join anonymously or if they need to sign up.',
  },
  {
    question: 'Can I join a queue without creating an account?',
    answer:
      'Yes, you can often join a queue anonymously, depending on how the event organizer has configured the event. However, signing up and logging in offers a richer experience, including personalized push notifications, email reminders, and the ability to track your queue position across multiple events.',
  },
  {
    question: 'How does theswiftline ensure the security of my account?',
    answer:
      'theswiftline prioritizes your security. Our login feature supports both email/password and "Continue with Google" options. We’ve also implemented an extra layer of security using Cloudflare Turnstile to mitigate bot attacks. Upon signing up, a verification link is sent to your email to verify it before account creation.',
  },
  {
    question: 'How do I install theswiftline on my device as a PWA?',
    answer: (
      <>
        theswiftline is a Progressive Web App (PWA), meaning you can install it directly from your web browser to get an app-like experience without visiting an app store. This gives you quick access and allows for push notifications.
        <br /><br />
        <strong>General Installation Steps (varies slightly by browser/device):</strong>
        <ol className="list-decimal list-inside ml-4">
          <li>
            <strong>Open theswiftline:</strong> Navigate to www.theswiftline.com in your browser (e.g., Chrome, Safari, Edge).
          </li>
          <li>
            <strong>Look for "Install" or "Add to Home Screen":</strong>
            <ul className="list-disc list-inside ml-4">
              <li>
                <strong>Chrome (Android/Desktop):</strong> You might see an "Install app" icon in the address bar or a prompt. On mobile, open the browser menu (three dots) and select "Add to Home Screen" or "Install app."
              </li>
              <li>
                <strong>Safari (iOS/iPadOS):</strong> Tap the "Share" icon (a square with an upward arrow) in the browser toolbar. Then, scroll down and select "Add to Home Screen."
              </li>
              <li>
                <strong>Edge (Desktop/Android):</strong> Look for an "App available" icon in the address bar or open the browser menu (three dots) and select "Apps" &gt; "Install theswiftline."
              </li>
            </ul>
          </li>
        </ol>
        Once installed, theswiftline will appear on your home screen or app launcher like a native application.
      </>
    ),
  },
  {
    question: 'How do I ensure I receive push notifications from theswiftline?',
    answer: (
      <>
        Push notifications are a key feature for logged-in users on theswiftline, ensuring you get real-time updates when your turn is approaching. To receive them, please ensure the following:
        <br /><br />
        <ol className="list-decimal list-inside ml-4">
          <li>
            <strong>You are Logged In:</strong> Push notifications are reserved for logged-in users only.
          </li>
          <li>
            <strong>Browser/Site Permissions:</strong> When prompted by your browser, make sure you "Allow" notifications from www.theswiftline.com.
          </li>
          <li>
            <strong>Device Notification Settings:</strong>
            <ul className="list-disc list-inside ml-4">
              <li>
                <strong>General:</strong> Check your device&apos;s system settings (e.g., "Settings" &gt; "Notifications") to ensure notifications are enabled for your browser or the installed theswiftline PWA.
              </li>
              <li>
                <strong>Do Not Disturb (DND) / Focus Modes:</strong> Ensure your device is not in "Do Not Disturb," "Focus Mode," or similar modes that might suppress notifications.
              </li>
              <li>
                <strong>Specific iOS (iPhone/iPad) Considerations (for newer iOS versions):</strong>
                <br />
                If you are having trouble receiving PWA notifications on iOS, you may need to enable a specific feature flag:
                <ol className="list-decimal list-inside ml-4">
                  <li>Go to your iPhone/iPad <strong>Settings</strong>.</li>
                  <li>Scroll down and select <strong>Safari</strong> or <strong>Chrome</strong>.</li>
                  <li>Tap on <strong>Advanced</strong>.</li>
                  <li>Tap on <strong>Feature Flags</strong>.</li>
                  <li>Scroll down and toggle <strong>"Notifications"</strong> to the <strong>On</strong> position.</li>
                </ol>
                After enabling this, you should be able to receive PWA push notifications once you&apos;ve added theswiftline to your Home Screen and allowed notification permissions.
                For Android devices, the steps are very similar.
              </li>
            </ul>
          </li>
        </ol>
      </>
    ),
  },
  {
    question: 'How does theswiftline provide real-time queue updates?',
    answer:
      "Our 'View Queue' page leverages SignalR for seamless WebSocket integration. This means you'll see your position and estimated wait time update in real-time. If someone leaves the queue earlier than expected, everyone else in the queue gets an immediate update to their position and estimated time, ensuring a smooth and dynamic experience.",
  },
  {
    question: 'How is the estimated wait time calculated?',
    answer:
      'theswiftline uses a machine learning model to predict the estimated wait time for each user. This prediction currently considers factors such as the number of staff serving, the average time to serve each person, and your current position in the queue. We are continuously working to incorporate more factors for even more accurate predictions in the future.',
  },
  {
    question: 'What features are available for event organizers on their dashboard?',
    answer:
      'Event organizers get a comprehensive dashboard. You can see all queue members in real-time, pause or resume the queue if there are delays, and even skip line members. The dashboard also provides valuable metrics like the total number of users served, average wait time, drop-off rates, and peak hours for each event, as well as an aggregated view of all your events.',
  },
  {
    question: 'What happens if I miss my turn in the queue?',
    answer:
      'If you miss your turn, the event organizer may have a specific policy in place. theswiftline allows organizers to manage these situations, which might include letting you rejoin at the end of the queue or requiring you to start a new queue. It’s always best to keep an eye on your notifications to avoid missing your spot.',
  },
  {
    question: 'How can I provide feedback or report an issue?',
    answer:
      'We welcome your feedback! You can usually find a "Give Feedback" option on the theswiftline website, or you can contact our support team directly via email or through the contact form available on our website.',
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { darkMode } = useTheme();

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sectionBgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const headingClass = darkMode ? 'text-white' : 'text-gray-700';
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

import React from 'react';
import { useTheme } from '../../services/utils/useTheme'; // Assuming you have this hook
import { Link } from 'react-router-dom';

const AboutUsPage = () => {
  const { darkMode } = useTheme();

  const sectionBgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const containerBgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const headingClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const paragraphClass = darkMode ? 'text-gray-300' : 'text-gray-700';
  const highlightClass = darkMode ? 'text-sage-400' : 'text-sage-600';

  return (
    <div className={`min-h-screen ${sectionBgClass} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className={`${headingClass} text-4xl font-extrabold text-center mb-12`}>
          About theswiftline
        </h1>
        <div className={`${containerBgClass} rounded-lg shadow-xl p-8 md:p-10 transition-colors duration-300`}>
          <p className={`${paragraphClass} text-lg mb-6 leading-relaxed`}>
            Welcome to <strong className={highlightClass}>theswiftline</strong>, your premier solution for modern queue management. In today's fast-paced world, waiting in long, inefficient lines is a thing of the past. We built theswiftline to transform the queueing experience, making it seamless, stress-free, and smart for everyone.
          </p>

          <h2 className={`${headingClass} text-2xl font-bold mb-4`}>Our Mission</h2>
          <p className={`${paragraphClass} mb-6 leading-relaxed`}>
            Our mission is simple: to eliminate the frustration of waiting. We empower businesses, event organizers, and service providers to manage their queues with unparalleled efficiency, providing a superior experience for their customers and attendees. For users, theswiftline means more time for what matters, less time wasted in lines.
          </p>

          <h2 className={`${headingClass} text-2xl font-bold mb-4`}>What We Do</h2>
          <p className={`${paragraphClass} mb-6 leading-relaxed`}>
            theSwiftline offers a comprehensive suite of tools for virtual queueing, real-time updates, and insightful analytics. From local businesses to large-scale events, our platform adapts to your needs, helping you:
          </p>
          <ul className={`list-disc list-inside space-y-2 mb-6 ${paragraphClass}`}>
            <li>
              <strong className={highlightClass}>Reduce Wait Times:</strong> Optimize customer flow and minimize physical lines.
            </li>
            <li>
              <strong className={highlightClass}>Enhance Customer Experience:</strong> Provide transparency and convenience with live queue updates and notifications.
            </li>
            <li>
              <strong className={highlightClass}>Gain Valuable Insights:</strong> Utilize data on queue performance, peak times, and drop-off rates to make informed decisions.
            </li>
            <li>
              <strong className={highlightClass}>Boost Operational Efficiency:</strong> Streamline staff workflows and allocate resources more effectively.
            </li>
          </ul>

          <h2 className={`${headingClass} text-2xl font-bold mb-4`}>Our Vision</h2>
          <p className={`${paragraphClass} leading-relaxed`}>
            We envision a world where waiting is no longer a burden. theswiftline is continuously evolving, incorporating cutting-edge technology to create even more intuitive and powerful solutions for queue management. Join us in building a future where efficiency and customer satisfaction go hand in hand.
          </p>

          <div className="mt-10 text-center">
            <p className={`${paragraphClass} text-lg font-semibold`}>
              Questions? Visit our <Link to="/faq" className={`${highlightClass} hover:underline`}>FAQs</Link> or <Link to="/contact" className={`${highlightClass} hover:underline`}>Contact Us</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
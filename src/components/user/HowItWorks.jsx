import React from 'react';
import { useTheme } from '../../services/utils/useTheme'; // Assuming you have this hook
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiSmartphone, FiClock, FiSettings, FiBarChart2 } from 'react-icons/fi'; // Feather icons for visuals
import { CheckCircle } from 'lucide-react'; // Lucide icon for completion

const HowItWorks = () => {
    const { darkMode } = useTheme();

    const sectionBgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
    const containerBgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const headingClass = darkMode ? '!text-gray-100' : '!text-gray-900';
    const paragraphClass = darkMode ? '!text-gray-300' : '!text-gray-700';
    const highlightClass = darkMode ? '!text-sage-400' : '!text-sage-600';
    const iconColorClass = darkMode ? 'text-sage-400' : 'text-sage-600'; // For consistent icon color

    const stepCardClass = `
        ${containerBgClass} 
        rounded-lg shadow-md p-6 
        transition-colors duration-300 
        flex flex-col items-center text-center
    `;

    const iconWrapperClass = `
        p-3 rounded-full mb-4 
        ${darkMode ? 'bg-sage-700 text-white' : 'bg-sage-100 text-sage-700'}
    `;

    return (
        <div className={`min-h-screen ${sectionBgClass} transition-colors duration-300`}>
            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className={`${headingClass} text-4xl font-extrabold text-center mb-12`}>
                    How <strong className={highlightClass}>theswiftline</strong> Works
                </h1>

                <div className={`${containerBgClass} rounded-lg shadow-xl p-8 md:p-10 transition-colors duration-300 mb-12`}>
                    <p className={`${paragraphClass} text-lg mb-6 leading-relaxed`}>
                        <strong className={highlightClass}>theswiftline</strong> simplifies queue management for everyone. Whether you're an individual looking to save time or an organization aiming for peak efficiency, our platform makes waiting a thing of the past. Discover how easy it is to join a queue or manage your events with us.
                    </p>

                    <h2 className={`${headingClass} text-3xl font-bold mb-8 text-center`}>For Queue Participants</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Participant Step 1 */}
                        <div className={stepCardClass}>
                            <div className={iconWrapperClass}>
                                <FiSmartphone className="w-8 h-8" />
                            </div>
                            <h3 className={`${headingClass} text-xl font-semibold mb-2`}>1. Join from Anywhere</h3>
                            <p className={`${paragraphClass} text-base`}>
                                Scan a QR code at the event location or find the event online. You can join queues anonymously or log in for personalized features.
                            </p>
                        </div>
                        {/* Participant Step 2 */}
                        <div className={stepCardClass}>
                            <div className={iconWrapperClass}>
                                <FiClock className="w-8 h-8" />
                            </div>
                            <h3 className={`${headingClass} text-xl font-semibold mb-2`}>2. Get Real-time Updates</h3>
                            <p className={`${paragraphClass} text-base`}>
                                See your position and estimated wait time update live. Our ML-powered system provides accurate predictions.
                            </p>
                        </div>
                        {/* Participant Step 3 */}
                        <div className={stepCardClass}>
                            <div className={iconWrapperClass}>
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className={`${headingClass} text-xl font-semibold mb-2`}>3. Reclaim Your Time</h3>
                            <p className={`${paragraphClass} text-base`}>
                                Multitask, play a game, or browse facts while you wait. We'll notify you via email and push notifications when your turn is near.
                            </p>
                        </div>
                    </div>

                    <h2 className={`${headingClass} text-3xl font-bold mb-8 text-center`}>For Event Organizers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Organizer Step 1 */}
                        <div className={stepCardClass}>
                            <div className={iconWrapperClass}>
                                <FiCalendar className="w-8 h-8" />
                            </div>
                            <h3 className={`${headingClass} text-xl font-semibold mb-2`}>1. Create Your Event</h3>
                            <p className={`${paragraphClass} text-base`}>
                                Set up events with start/end times, average service duration, and choose between anonymous or authenticated queues.
                            </p>
                        </div>
                        {/* Organizer Step 2 */}
                        <div className={stepCardClass}>
                            <div className={iconWrapperClass}>
                                <FiSettings className="w-8 h-8" />
                            </div>
                            <h3 className={`${headingClass} text-xl font-semibold mb-2`}>2. Manage Queues Live</h3>
                            <p className={`${paragraphClass} text-base`}>
                                Your dashboard gives you real-time control: view members, pause/resume queues, skip lines, and serve the next person with ease.
                            </p>
                        </div>
                        {/* Organizer Step 3 */}
                        <div className={stepCardClass}>
                            <div className={iconWrapperClass}>
                                <FiBarChart2 className="w-8 h-8" />
                            </div>
                            <h3 className={`${headingClass} text-xl font-semibold mb-2`}>3. Gain Key Insights</h3>
                            <p className={`${paragraphClass} text-base`}>
                                Access powerful analytics on served users, average wait times, drop-off rates, and peak hours to optimize future events.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className={`${paragraphClass} text-lg font-semibold`}>
                        Ready to experience the future of queue management?
                        <br />
                        <Link to="/" className={`${highlightClass} hover:underline ml-2`} style={{ color: 'inherit' }}>Get Started Today</Link> or <Link to="/search" className={`${highlightClass} hover:underline`} style={{ color: 'inherit' }}>Find an Event</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
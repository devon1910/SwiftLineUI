import React, { useState, useEffect } from 'react';
import { Card, Carousel } from 'react-bootstrap';

const DidYouKnowSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [randomReasons, setRandomReasons] = useState([]);
  
  const swiftlineReasons = [
    "You can plan your day 10 times better when you use Swiftline to join queues.",
    "Swiftline Event Organizers report up to a 70% reduction in wait times.",
    "By joining queues online, you can save an average of 15 minutes per visit.",
    "Swiftline improves your scheduling efficiency by 8 times compared to traditional queues.",
    "Experience up to 50% less waiting with Swiftline's smart queue management.",
    "Users have up to 3x more free time when they use Swiftline.",
    "Swiftline's digital queueing system can boost your daily productivity by 20%.",
    "Say goodbye to long waits—Swiftline can cut your queue time in half.",
    "Plan your day with precision: Swiftline users are 4x more punctual.",
    "Using Swiftline can make your day 10 times more efficient with smart time management."
  ];

  useEffect(() => {
    const shuffled = [...swiftlineReasons].sort(() => 0.5 - Math.random());
    setRandomReasons(shuffled);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % randomReasons.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [randomReasons]);

  return (
    <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-sage-100 p-3 border-b border-sage-200">
        <h5 className="font-semibold">Did you know?</h5>
      </div>
      
      <div className="relative h-24 md:h-32 overflow-hidden">
        {randomReasons.map((reason, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center justify-center p-4 md:p-6 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundColor: `var(--bg-color-${index % 4})`,
              background: `
                linear-gradient(
                  15deg,
                  ${index % 4 === 0 ? '#8A9A8B' : '#7A8A7B'},
                  ${index % 4 === 1 ? '#6B7D6B' : '#5A6A5B'}
                )
              `
            }}
          >
            <p className="text-center text-sm md:text-base text-white leading-tight md:leading-normal">
              {reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DidYouKnowSlider


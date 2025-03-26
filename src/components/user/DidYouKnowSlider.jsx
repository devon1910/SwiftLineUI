import React, { useState, useEffect } from 'react';

const DidYouKnowSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [randomReasons, setRandomReasons] = useState([]);
  
  const swiftlineReasons = [
  "The average American spends approximately 37 billion hours waiting in lines each year, equivalent to about 113 hours per person annually.",
  "Studies show that people waste up to 20% of their working hours waiting in various queues - from coffee shops to government offices.",
  "In a typical lifetime, a person spends around 6 months waiting in lines, which could instead be used for learning a new skill, spending time with family, or pursuing personal projects.",
  "A survey revealed that 75% of consumers consider waiting in line the most frustrating part of customer service experiences.",
  "The economic cost of waiting is estimated at $37.7 billion per year in the United States alone, accounting for lost productivity and opportunity costs.",
  "People waiting in physical lines experience increased stress levels, with cortisol (stress hormone) rising by up to 15% for every 10 minutes of waiting.",
  "Millennials and Gen Z are particularly averse to waiting, with 69% saying they would abandon a service or business if the waiting time is too long.",
  "In healthcare, patients waiting for appointments lose an estimated 3.5 billion minutes annually, which could be redirected to personal or professional activities.",
  "The entertainment industry loses billions due to long queues, with theme parks reporting that queue management directly impacts customer satisfaction and repeat visits.",
  "A study by MIT found that virtual queuing can increase overall customer satisfaction by up to 35% compared to traditional physical line waiting.",
  "On average, people check their phones 58 times a day - much of this time occurs while waiting in lines, highlighting the unproductive nature of traditional queuing.",
  "The psychological impact of waiting can be so significant that it's estimated to reduce perceived service quality by up to 50% in some industries.",
  "Restaurant customers who use virtual queuing are 85% more likely to return, demonstrating the value of time-saving queue management technologies.",
  "In corporate settings, employees waste approximately 3 hours per week waiting in various internal queues - time that could be spent on productive work.",
  "The rise of on-demand services and virtual queuing reflects a growing global understanding that time is the most valuable non-renewable resource."
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
    <div className="mt-4  rounded-lg shadow-md overflow-hidden">
      <div className="p-3 border-b border-sage-200">
        <h5 className="font-semibold">Did you know?</h5>
      </div>
      
      <div className="relative h-24 md:h-32 overflow-hidden">
        {randomReasons.map((reason, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center justify-center p-4 md:p-6 transition-opacity duration-2000 ${
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


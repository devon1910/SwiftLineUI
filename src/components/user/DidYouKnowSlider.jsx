import { useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
  FiPause,
  FiPlay,
} from "react-icons/fi";

const SWIFTLINE_REASONS = [
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
  "The rise of on-demand services and virtual queuing reflects a growing global understanding that time is the most valuable non-renewable resource.",
];

const shuffleReasons = (reasons) => [...reasons].sort(() => 0.5 - Math.random());

const DidYouKnowSlider = () => {
  const [reasons] = useState(() => shuffleReasons(SWIFTLINE_REASONS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || reasons.length < 2) return undefined;

    const interval = setInterval(() => {
      setCurrentIndex((previousIndex) => (previousIndex + 1) % reasons.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isPaused, reasons.length]);

  const selectReason = (nextIndex) => {
    setCurrentIndex((nextIndex + reasons.length) % reasons.length);
  };

  const currentReason = reasons[currentIndex];

  return (
    <section
      className="mt-5 overflow-hidden rounded-2xl border border-sage-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
      aria-label="Queue facts"
      aria-roledescription="carousel"
    >
      <div className="flex items-center justify-between gap-3 border-b border-sage-100 px-4 py-3 dark:border-gray-700 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-50 text-sage-600 dark:bg-sage-900/30 dark:text-sage-300">
            <FiInfo className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Did you know?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              A little context while you wait
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsPaused((paused) => !paused)}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:scale-100 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-sage-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          aria-label={isPaused ? "Resume rotating queue facts" : "Pause rotating queue facts"}
          title={isPaused ? "Resume rotation" : "Pause rotation"}
        >
          {isPaused ? (
            <FiPlay className="h-4 w-4" aria-hidden="true" />
          ) : (
            <FiPause className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="px-4 py-5 sm:px-5" aria-live="polite" aria-atomic="true">
        <p className="min-h-[7rem] text-sm leading-7 text-gray-700 dark:text-gray-200 sm:min-h-[6rem]">
          {currentReason}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-700 sm:px-5">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Fact {currentIndex + 1} of {reasons.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => selectReason(currentIndex - 1)}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:scale-100 hover:bg-sage-50 hover:text-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 dark:text-gray-400 dark:hover:bg-sage-900/30 dark:hover:text-sage-200"
            aria-label="Show previous queue fact"
          >
            <FiChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => selectReason(currentIndex + 1)}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:scale-100 hover:bg-sage-50 hover:text-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 dark:text-gray-400 dark:hover:bg-sage-900/30 dark:hover:text-sage-200"
            aria-label="Show next queue fact"
          >
            <FiChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default DidYouKnowSlider;

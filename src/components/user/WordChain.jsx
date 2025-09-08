import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Clock,
  Zap,
  Brain,
  Star,
  CheckCircle,
  XCircle,
  Medal,
  Crown,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  GetWordLengthLeaderboard,
  UpdateUserScore,
} from "../../services/api/swiftlineService";

const WordChain = ({ prevHighScore, userName }) => {
  const [gameState, setGameState] = useState("menu");
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [previousGameScore, setPreviousScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [highScore, setHighScore] = useState(prevHighScore);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [usedWords, setUsedWords] = useState(new Set());
  const [chain, setChain] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [powerUps, setPowerUps] = useState({
    hints: 2,
    timeBoost: 1,
    skipWord: 1,
  });
  const [showHint, setShowHint] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [scoreImprovement, setScoreImprovement] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Mock leaderboard data - replace with your API call
  const [leaderboard, setLeaderboard] = useState([]);

  const gameTimerRef = useRef(null);
  const inputRef = useRef(null);

  // Word lists by difficulty
  const easyWords = [
    "cat",
    "dog",
    "sun",
    "car",
    "book",
    "tree",
    "house",
    "water",
    "happy",
    "music",
    "phone",
    "smile",
    "green",
    "light",
    "heart",
    "dream",
    "beach",
    "dance",
    "sweet",
    "magic",
    "take",
    "play",
    "sleep",
    "run",
    "walk",
    "jump",
    "swim",
    "great",
  ];

  const mediumWords = [
    "elephant",
    "computer",
    "rainbow",
    "chocolate",
    "adventure",
    "butterfly",
    "mountain",
    "treasure",
    "keyboard",
    "fantastic",
    "universe",
    "mystery",
    "garden",
    "crystal",
    "thunder",
    "journey",
    "diamond",
    "freedom",
    "harmony",
    "discovery",
    "sunset",
    "sunrise",
    "summer",
    "winter",
    "autumn",
    "blanket",
    "tornado",
    "glacier",
    "graveyard",
  ];

  const hardWords = [
    "extraordinary",
    "phenomenon",
    "architecture",
    "psychology",
    "magnificent",
    "collaboration",
    "independent",
    "enthusiasm",
    "sophisticated",
    "imagination",
    "revolutionary",
    "philosophical",
    "technology",
    "opportunity",
    "entertainment",
    "organization",
    "communication",
    "infrastructure",
    "transformation",
    "responsibility",
    "integrity",
    "consciousness",
    "biodiversity",
    "simultaneous",
  ];

  const getWordList = () => {
    if (level <= 3) return easyWords;
    if (level <= 6) return [...easyWords, ...mediumWords];
    return [...easyWords, ...mediumWords, ...hardWords];
  };

  const getRandomWord = useCallback(() => {
    const wordList = getWordList();
    const availableWords = wordList.filter(
      (word) => !usedWords.has(word.toLowerCase())
    );

    if (availableWords.length === 0) {
      // Reset used words if we've used them all
      setUsedWords(new Set());
      return wordList[Math.floor(Math.random() * wordList.length)];
    }

    return availableWords[Math.floor(Math.random() * availableWords.length)];
  }, [level, usedWords]);

  const startGame = () => {
    // Store previous score before starting new game
    setPreviousScore(score);
    setGameState("playing");
    setScore(0);
    setTimeLeft(60);
    setStreak(0);
    setLevel(1);
    setChain([]);
    setUsedWords(new Set());
    setCombo(0);
    setPowerUps({ hints: 2, timeBoost: 1, skipWord: 1 });
    const firstWord = getRandomWord();
    setCurrentWord(firstWord);
    setUserInput("");
    setFeedback("");
    setShowHint(false);
    setShowScoreAnimation(false);
    setScoreImprovement(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const pauseGame = () => {
    setGameState(gameState === "paused" ? "playing" : "paused");
    if (gameState === "paused") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const resetGame = () => {
    setGameState("menu");
    setShowLeaderboard(false);
  };

  const isValidChain = (word1, word2) => {
    const lastLetter = word1.toLowerCase().slice(-1);
    const firstLetter = word2.toLowerCase().charAt(0);
    return lastLetter === firstLetter;
  };

  async function isValidEnglishWord(word) {
    try {
      setFeedback("Checking word...");
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
      );
      return response.status == 200;
    } catch (error) {
      console.error("Error checking word validity:", error);
      return false;
    }
  }

  const GetLeaderboard = () => {
    if (!showLeaderboard) {
      GetWordLengthLeaderboard().then((response) => {
        setLeaderboard(response.data.data);
        setShowLeaderboard(true);
      });
    } else {
      setShowLeaderboard(false);
    }
  };

  const getHint = () => {
    if (powerUps.hints > 0) {
      setPowerUps((prev) => ({ ...prev, hints: prev.hints - 1 }));
      const lastLetter = currentWord.slice(-1).toLowerCase();
      setShowHint(true);
      setFeedback(
        `Hint: Next word should start with "${lastLetter.toUpperCase()}"`
      );
      setTimeout(() => setShowHint(false), 3000);
    }
  };

  const useTimeBoost = () => {
    if (powerUps.timeBoost > 0) {
      setPowerUps((prev) => ({ ...prev, timeBoost: prev.timeBoost - 1 }));
      setTimeLeft((prev) => prev + 15);
      setFeedback("⏰ +15 seconds added!");
      setTimeout(() => setFeedback(""), 2000);
    }
  };

  const skipWord = () => {
    if (powerUps.skipWord > 0) {
      setPowerUps((prev) => ({ ...prev, skipWord: prev.skipWord - 1 }));
      const newWord = getRandomWord();
      setCurrentWord(newWord);
      setUsedWords((prev) => new Set([...prev, currentWord.toLowerCase()]));
      setFeedback("⏭️ Word skipped!");
      setTimeout(() => setFeedback(""), 2000);
      inputRef.current?.focus();
    }
  };

  const submitWord = async () => {
    const word = userInput.trim().toLowerCase();

    if (!word) return;

    if (usedWords.has(word)) {
      setFeedback("❌ Word already used!");
      setStreak(0);
      setCombo(0);
      setTimeout(() => setFeedback(""), 2000);
      setUserInput("");
      return;
    }

    if (!isValidChain(currentWord, word)) {
      setFeedback(
        `❌ Word must start with "${currentWord.slice(-1).toUpperCase()}"!`
      );
      setStreak(0);
      setCombo(0);
      setTimeout(() => setFeedback(""), 2000);
      setUserInput("");
      return;
    }
    var result = await isValidEnglishWord(word);
    if (!result) {
      setFeedback("❌ Not a valid English word!");
      setStreak(0);
      setCombo(0);
      setTimeout(() => setFeedback(""), 3000);
      setUserInput("");
      return;
    }

    // Valid word!
    let points = word.length * 10;

    // Bonus points for longer words
    if (word.length >= 7) points += 50;
    if (word.length >= 10) points += 100;

    // Combo multiplier
    setCombo((prev) => prev + 1);
    if (combo >= 3) points = Math.floor(points * (1 + combo * 0.2));

    setScore((prev) => prev + points);
    setStreak((prev) => prev + 1);
    setUsedWords((prev) => new Set([...prev, word, currentWord.toLowerCase()]));
    setChain((prev) =>
      [...prev, { from: currentWord, to: word, points }].slice(-5)
    );

    setFeedback(
      `✅ +${points} points! ${combo >= 3 ? `${combo}x combo!` : ""}`
    );
    setTimeout(() => setFeedback(""), 2000);

    // Next word
    setCurrentWord(word);
    setUserInput("");

    // Level up check
    if (streak > 0 && streak % 10 === 0) {
      setLevel((prev) => prev + 1);
      setTimeLeft((prev) => prev + 20);
      setFeedback("🎉 Level up! +20 seconds!");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      submitWord();
    }
  };

  // Show score comparison animation
  const showScoreComparison = () => {
    const improvement = score - previousGameScore;
    setScoreImprovement(improvement);
    setShowScoreAnimation(true);

    setTimeout(() => {
      setShowScoreAnimation(false);
    }, 8000);
  };

  // Game timer
  useEffect(() => {
    if (gameState !== "playing") return;

    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("gameOver");
          if (score > highScore && !userName.startsWith("Anonymous")) {
            setHighScore(score);

            const updateReq = { score, level };
            UpdateUserScore(updateReq).then(() => {
              setFeedback("🏆 New High Score!");
            });
          }
          // Trigger score comparison animation
          setTimeout(showScoreComparison, 5000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [gameState, score, highScore]);

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return <Star className="w-4 h-4 text-gray-400" />;
  };

  const getScoreComparisonContent = () => {
    if (scoreImprovement === null) return null;

    if (scoreImprovement > 0) {
      return {
        icon: <TrendingUp className="w-8 h-8 text-green-500" />,
        text: "Personal Best!",
        subtext: `+${scoreImprovement} points improvement`,
        bgColor: "bg-green-50",
        textColor: "text-black",
        borderColor: "border-green-200",
      };
    } else if (scoreImprovement < 0) {
      return {
        icon: <TrendingDown className="w-8 h-8 text-orange-500" />,
        text: "Keep Trying!",
        subtext: `${scoreImprovement} points from your best`,
        bgColor: "bg-orange-50",
        textColor: "text-black",
        borderColor: "border-orange-200",
      };
    } else {
      return {
        icon: <Minus className="w-8 h-8 text-blue-500" />,
        text: "Same Score!",
        subtext: "Consistent performance",
        bgColor: "bg-blue-50",
        textColor: "text-black",
        borderColor: "border-blue-200",
      };
    }
  };

  return (
    <div className="max-w-md mx-auto rounded-xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
            Word Chain
          </h1>
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2">
            <button
              onClick={() => GetLeaderboard()}
              className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              {showLeaderboard ? "Game" : "Leaderboard"}
            </button>
            <div className="text-xs sm:text-sm opacity-90 whitespace-nowrap">
              theswiftLine Games
            </div>
          </div>
        </div>
      </div>
      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="p-4 bg-gradient-to-b from-yellow-50 to-white">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-black">Top Players</h2>
          </div>

          <div className="space-y-2">
            {leaderboard.map((player, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  index < 3
                    ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex-shrink-0 w-8 text-center">
                    {index < 3 ? (
                      getRankIcon(player.rank)
                    ) : (
                      <span className="text-sm font-semibold text-gray-500">
                        {player.rank}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-800 truncate">
                      {player.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      Level {player.level}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-green-600">
                    {player.highestScore.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowLeaderboard(false)}
            className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
          >
            Back to Game
          </button>
        </div>
      )}

      {/* Game Content (only show when not viewing leaderboard) */}
      {!showLeaderboard && (
        <>
          {/* Game Stats */}
          {gameState !== "menu" && (
            <div className="border-b border-gray-200 p-3">
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600">
                    <Trophy className="w-3 h-3" />
                    <span className="font-bold">{score}</span>
                  </div>
                  <div className="text-gray-500">Score</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-gray-600" />
                    <span className="font-bold">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="text-gray-500">Time</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-bold">L{level}</div>
                  <div className="text-gray-500">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-bold">{streak}</div>
                  <div className="text-gray-500">Streak</div>
                </div>
              </div>

              {combo >= 3 && (
                <div className="mt-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold text-center">
                  🔥 {combo}x Combo!
                </div>
              )}
            </div>
          )}

          {/* Menu Screen */}
          {gameState === "menu" && (
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Word Chain
                </h2>
                <p className="text-sm leading-relaxed mb-4">
                  Create word chains! Each word must start with the last letter
                  of the previous word. Quick thinking gets bonus points!
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <h3 className="font-semibold mb-2 text-black">
                    How to Play:
                  </h3>
                  <div className="text-xs text-green-700 space-y-1">
                    <div>• Type words that start with the last letter</div>
                    <div>• Longer words = more points</div>
                    <div>• Build combos for multipliers</div>
                    <div>• Use power-ups strategically</div>
                  </div>
                </div>
              </div>

              {highScore > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">
                      Your Current High Score: {highScore}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Start Playing
              </button>
            </div>
          )}

          {/* Game Area */}
          {(gameState === "playing" || gameState === "paused") && (
            <div className="relative">
              <div className="p-4 bg-gradient-to-b from-green-50 to-white min-h-80">
                {/* Current Word */}
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-600 mb-2">
                    Current Word:
                  </div>
                  <div className="text-3xl font-bold text-gray-800 bg-white rounded-lg p-4 shadow-sm border-2 border-green-200 break-words">
                    {currentWord.toUpperCase()}
                  </div>
                  <div className="text-sm text-green-600 mt-2">
                    Next word starts with:{" "}
                    <span className="font-bold text-lg">
                      {currentWord.slice(-1).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Input Area */}
                <div className="mb-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your word here..."
                    className="w-full p-3 text-lg text-black border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    disabled={gameState === "paused"}
                  />
                  <button
                    onClick={submitWord}
                    disabled={!userInput.trim() || gameState === "paused"}
                    className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Word
                  </button>
                </div>

                {/* Feedback */}
                {feedback && (
                  <div
                    className={`text-center p-2 rounded-lg mb-4 ${
                      feedback.includes("❌")
                        ? "bg-red-100 text-red-700"
                        : feedback.includes("✅")
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {feedback}
                  </div>
                )}

                {/* Recent Chain */}
                {chain.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      Recent Chain:
                    </div>
                    <div className="space-y-1">
                      {chain.slice(-3).map((link, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm bg-white p-2 rounded border"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="font-medium text-black break-words">
                              {link.from}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium text-black break-words">
                              {link.to}
                            </span>
                          </div>
                          <span className="text-green-600 font-bold self-start sm:self-center">
                            +{link.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Power-ups */}
                <div className="border-t pt-3 text-black">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    Power-ups:
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-3">
                    <button
                      onClick={getHint}
                      disabled={powerUps.hints === 0}
                      className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        powerUps.hints > 0
                          ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                          : "bg-gray-100 text-gray-400 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm sm:text-base">💡</span>
                        <span>
                          Hint{" "}
                          <div className="text-xs inline">
                            ({powerUps.hints})
                          </div>
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={useTimeBoost}
                      disabled={powerUps.timeBoost === 0}
                      className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        powerUps.timeBoost > 0
                          ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                          : "bg-gray-100 text-gray-400 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm sm:text-base">⏰</span>
                        <span>
                          +Time{" "}
                          <div className="text-xs inline">
                            ({powerUps.timeBoost})
                          </div>
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={skipWord}
                      disabled={powerUps.skipWord === 0}
                      className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        powerUps.skipWord > 0
                          ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                          : "bg-gray-100 text-gray-400 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm sm:text-base">⏭️</span>
                        <span>
                          Skip{" "}
                          <div className="text-xs inline">
                            ({powerUps.skipWord})
                          </div>
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Pause Overlay */}
              {gameState === "paused" && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-4 sm:p-6 text-center w-full max-w-sm mx-auto">
                    <Pause className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">
                      Game Paused
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 sm:mb-4">
                      Your progress is safe!
                    </p>
                    <button
                      onClick={pauseGame}
                      className="bg-green-600 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                    >
                      Resume
                    </button>
                  </div>
                </div>
              )}

              {/* Game Controls */}
              <div className="bg-white border-t border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                <button
                  onClick={pauseGame}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
                >
                  {gameState === "paused" ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                  {gameState === "paused" ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={resetGame}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === "gameOver" && (
            <div className="p-6 text-center relative">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Brain Power!
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  You've exercised your vocabulary skills!
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                <div className="text-3xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-gray-600 mb-2">Final Score</div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-gray-700">
                      Level Reached
                    </div>
                    <div className="text-green-600 font-bold">
                      Level {level}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">
                      Best Streak
                    </div>
                    <div className="text-green-600 font-bold">{streak}</div>
                  </div>
                </div>

                {score > highScore && (
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    🎉 New High Score!
                  </div>
                )}
              </div>

              {/* Score Comparison Animation */}
              {showScoreAnimation && scoreImprovement !== null && (
                <div
                  className={`absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10 transition-all duration-500 ${
                    showScoreAnimation ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div
                    className={`text-center p-6 rounded-xl border-2 ${
                      getScoreComparisonContent()?.bgColor
                    } ${
                      getScoreComparisonContent()?.borderColor
                    } transform transition-all duration-700 ${
                      showScoreAnimation
                        ? "scale-100 rotate-0"
                        : "scale-75 rotate-12"
                    }`}
                  >
                    <div
                      className={`mb-4 transform transition-all duration-1000 ${
                        showScoreAnimation
                          ? "scale-100 rotate-0"
                          : "scale-0 rotate-180"
                      }`}
                    >
                      {getScoreComparisonContent()?.icon}
                    </div>
                    <h3
                      className={`text-xl font-bold mb-2 ${
                        getScoreComparisonContent()?.textColor
                      }`}
                    >
                      {getScoreComparisonContent()?.text}
                    </h3>
                    <p
                      className={`text-sm ${
                        getScoreComparisonContent()?.textColor
                      } opacity-80`}
                    >
                      {getScoreComparisonContent()?.subtext}
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Previous Best:</span>
                        <span className="font-semibold">
                          {previousGameScore > prevHighScore
                            ? previousGameScore
                            : prevHighScore}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>This Game:</span>
                        <span className="font-semibold">{score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  onClick={resetGame}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Menu
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 p-3 text-center">
        <p className="text-xs text-gray-500">
          Exercise your brain while you wait • theswiftLine Games
        </p>
      </div>
    </div>
  );
};

export default WordChain;

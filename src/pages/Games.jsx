import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Games.css";

const WORD_BANK = {
  easy: [
    { word: "APPLE", category: "Food" },
    { word: "TIGER", category: "Animals" },
    { word: "HOUSE", category: "Everyday" },
    { word: "WATER", category: "Nature" },
    { word: "MUSIC", category: "Entertainment" },
    { word: "GREEN", category: "Colors" },
    { word: "PENCIL", category: "Learning" },
    { word: "GARDEN", category: "Nature" },
    { word: "CAMERA", category: "Technology" },
    { word: "PLANET", category: "Science" },
    { word: "FLOWER", category: "Nature" },
    { word: "SCHOOL", category: "Places" },
    { word: "FRIEND", category: "People" },
    { word: "BREAD", category: "Food" },
    { word: "SUNNY", category: "Nature" },
    { word: "BIRD", category: "Animals" },
    { word: "CHAIR", category: "Everyday" },
    { word: "PHONE", category: "Technology" },
    { word: "OCEAN", category: "Nature" },
    { word: "MANGO", category: "Food" },
    { word: "RIVER", category: "Nature" },
    { word: "CLOUD", category: "Nature" },
    { word: "BOOK", category: "Learning" },
    { word: "TRAIN", category: "Travel" },
    { word: "HOUSE", category: "Everyday" },
    { word: "HORSE", category: "Animals" },
    { word: "BEACH", category: "Places" },
    { word: "SMILE", category: "Life" },
    { word: "TABLE", category: "Everyday" },
    { word: "SUMMER", category: "Seasons" },
  ],

  moderate: [
    { word: "ADVENTURE", category: "Life" },
    { word: "LANGUAGE", category: "Learning" },
    { word: "MOUNTAIN", category: "Nature" },
    { word: "COMPUTER", category: "Technology" },
    { word: "RAINBOW", category: "Nature" },
    { word: "ELEPHANT", category: "Animals" },
    { word: "LIBRARY", category: "Places" },
    { word: "CHOCOLATE", category: "Food" },
    { word: "DISCOVERY", category: "Learning" },
    { word: "FRIENDSHIP", category: "Life" },
    { word: "SUNSHINE", category: "Nature" },
    { word: "TELEPHONE", category: "Technology" },
    { word: "BUTTERFLY", category: "Animals" },
    { word: "HOSPITAL", category: "Places" },
    { word: "KNOWLEDGE", category: "Learning" },
    { word: "JOURNEY", category: "Travel" },
    { word: "CREATIVE", category: "Life" },
    { word: "UNIVERSE", category: "Science" },
    { word: "BICYCLE", category: "Travel" },
    { word: "HOLIDAY", category: "Life" },
    { word: "KITCHEN", category: "Everyday" },
    { word: "DIAMOND", category: "Objects" },
    { word: "ROCKET", category: "Science" },
    { word: "FOREST", category: "Nature" },
    { word: "TEACHER", category: "People" },
    { word: "MEDITATION", category: "Life" },
    { word: "COMMUNITY", category: "People" },
    { word: "CULTURE", category: "Society" },
    { word: "HISTORY", category: "Learning" },
    { word: "WEATHER", category: "Nature" },
  ],

  hard: [
    { word: "RESPONSIBILITY", category: "Life" },
    { word: "ENVIRONMENT", category: "Nature" },
    { word: "COMMUNICATION", category: "Life" },
    { word: "IMAGINATION", category: "Creativity" },
    { word: "EXPLORATION", category: "Discovery" },
    { word: "TECHNOLOGY", category: "Technology" },
    { word: "EXPERIENCE", category: "Life" },
    { word: "INNOVATION", category: "Technology" },
    { word: "OPPORTUNITY", category: "Life" },
    { word: "EDUCATION", category: "Learning" },
    { word: "ACHIEVEMENT", category: "Life" },
    { word: "INTELLIGENCE", category: "Learning" },
    { word: "CREATIVITY", category: "Creativity" },
    { word: "KNOWLEDGE", category: "Learning" },
    { word: "ADVENTUROUS", category: "Life" },
    { word: "CONVERSATION", category: "Communication" },
    { word: "EXTRAORDINARY", category: "Life" },
    { word: "TRANSFORMATION", category: "Change" },
    { word: "DEVELOPMENT", category: "Learning" },
    { word: "DISCIPLINE", category: "Life" },
    { word: "PERSEVERANCE", category: "Life" },
    { word: "INSPIRATION", category: "Life" },
    { word: "CURIOSITY", category: "Learning" },
    { word: "ARCHITECTURE", category: "Technology" },
    { word: "CELEBRATION", category: "Life" },
    { word: "RESPONSIVE", category: "Technology" },
    { word: "SCIENTIFIC", category: "Science" },
    { word: "SIGNIFICANT", category: "General" },
    { word: "UNDERSTANDING", category: "Learning" },
    { word: "PROFESSIONAL", category: "Career" },
  ],
};

const GAME_LENGTH = 10;

const TIME_LIMITS = {
  easy: 30,
  moderate: 25,
  hard: 20,
};

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function scrambleWord(word) {
  let shuffled = word.split("");

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  const result = shuffled.join("");

  if (result === word && word.length > 1) {
    return scrambleWord(word);
  }

  return result;
}

function createGameWords(difficulty) {
  return shuffleArray(
    WORD_BANK[difficulty]
  ).slice(0, GAME_LENGTH);
}

export default function Games() {
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState(null);

  const [gameWords, setGameWords] = useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answer, setAnswer] = useState("");

  const [score, setScore] = useState(0);

  const [correctAnswers, setCorrectAnswers] =
    useState(0);

  const [wrongAnswers, setWrongAnswers] =
    useState(0);

  const [streak, setStreak] = useState(0);

  const [bestStreak, setBestStreak] =
    useState(0);

  const [timeLeft, setTimeLeft] =
    useState(30);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const [gameFinished, setGameFinished] =
    useState(false);

  const [answered, setAnswered] =
    useState(false);

  const currentWord =
    gameWords[currentIndex];

  const scrambledWord = useMemo(() => {
    if (!currentWord) return "";

    return scrambleWord(currentWord.word);
  }, [currentWord]);

  const startGame = (selectedDifficulty) => {
    const words =
      createGameWords(selectedDifficulty);

    setDifficulty(selectedDifficulty);

    setGameWords(words);

    setCurrentIndex(0);

    setAnswer("");

    setScore(0);

    setCorrectAnswers(0);

    setWrongAnswers(0);

    setStreak(0);

    setBestStreak(0);

    setTimeLeft(
      TIME_LIMITS[selectedDifficulty]
    );

    setMessage("");

    setMessageType("");

    setAnswered(false);

    setGameFinished(false);
  };

  const finishGame = () => {
    setGameFinished(true);
  };

  const nextQuestion = () => {
    if (
      currentIndex + 1 >=
      GAME_LENGTH
    ) {
      finishGame();
      return;
    }

    setCurrentIndex(
      (previous) => previous + 1
    );

    setAnswer("");

    setMessage("");

    setMessageType("");

    setAnswered(false);

    setTimeLeft(
      TIME_LIMITS[difficulty]
    );
  };

  const checkAnswer = () => {
    if (
      !answer.trim() ||
      !currentWord ||
      answered
    ) {
      return;
    }

    setAnswered(true);

    const userAnswer =
      answer.trim().toUpperCase();

    if (
      userAnswer ===
      currentWord.word
    ) {
      const newStreak =
        streak + 1;

      const timeBonus =
        Math.max(0, timeLeft);

      const difficultyBonus =
        difficulty === "hard"
          ? 20
          : difficulty === "moderate"
          ? 10
          : 0;

      const points =
        10 +
        timeBonus +
        difficultyBonus;

      setScore(
        (previous) =>
          previous + points
      );

      setCorrectAnswers(
        (previous) =>
          previous + 1
      );

      setStreak(newStreak);

      if (
        newStreak >
        bestStreak
      ) {
        setBestStreak(
          newStreak
        );
      }

      setMessage(
        `Correct! +${points} points`
      );

      setMessageType("correct");

    } else {
      setWrongAnswers(
        (previous) =>
          previous + 1
      );

      setStreak(0);

      setMessage(
        `Incorrect. Correct answer: ${currentWord.word}`
      );

      setMessageType("wrong");
    }
  };

  useEffect(() => {
    if (
      !difficulty ||
      gameFinished ||
      answered
    ) {
      return;
    }

    if (timeLeft <= 0) {
      const timeout = setTimeout(() => {
        setAnswered(true);

        setWrongAnswers(
          (previous) =>
            previous + 1
        );

        setStreak(0);

        setMessage(
          `Time's up! Answer: ${currentWord?.word}`
        );

        setMessageType("wrong");
      }, 0);

      return () => clearTimeout(timeout);
    }

    const timer =
      setInterval(() => {
        setTimeLeft(
          (previous) =>
            previous - 1
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    timeLeft,
    difficulty,
    gameFinished,
    answered,
    currentWord,
  ]);

  if (!difficulty) {
    return (
      <div className="games-page">

        <header className="games-header">

          <button
            className="back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <div className="games-logo">

            <div className="games-logo-box">
              L
            </div>

            <div>
              <h2>LearnSphere</h2>
              <span>Brain Games</span>
            </div>

          </div>

        </header>

        <main className="difficulty-page">

          <p className="game-label">
            DAILY BRAIN CHALLENGE
          </p>

          <h1>Word Scramble</h1>

          <p className="difficulty-description">
            Choose your difficulty and
            challenge your vocabulary,
            thinking speed and memory.
          </p>

          <div className="difficulty-cards">

            <button
              className="difficulty-card easy"
              onClick={() =>
                startGame("easy")
              }
            >
              <span className="difficulty-icon">
                
              </span>

              <strong>Easy</strong>

              <small>
                30 seconds per word
              </small>

              <span>
                Simple everyday words
              </span>
            </button>


            <button
              className="difficulty-card moderate"
              onClick={() =>
                startGame("moderate")
              }
            >
              <span className="difficulty-icon">
               
              </span>

              <strong>Moderate</strong>

              <small>
                25 seconds per word
              </small>

              <span>
                Challenging vocabulary
              </span>
            </button>


            <button
              className="difficulty-card hard"
              onClick={() =>
                startGame("hard")
              }
            >
              <span className="difficulty-icon">
                
              </span>

              <strong>Hard</strong>

              <small>
                20 seconds per word
              </small>

              <span>
                Advanced vocabulary
              </span>
            </button>

          </div>

        </main>

      </div>
    );
  }

  if (gameFinished) {
    const percentage =
      Math.round(
        (correctAnswers /
          GAME_LENGTH) *
          100
      );

    return (
      <div className="games-page">

        <header className="games-header">

          <button
            className="back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <div className="games-logo">

            <div className="games-logo-box">
              L
            </div>

            <div>
              <h2>LearnSphere</h2>
              <span>Brain Games</span>
            </div>

          </div>

        </header>

        <main className="result-page">

          <div className="result-icon">
            🏆
          </div>

          <p className="game-label">
            CHALLENGE COMPLETE
          </p>

          <h1>Excellent Work!</h1>

          <p className="result-description">
            You completed the{" "}
            <strong>
              {difficulty}
            </strong>{" "}
            Word Scramble challenge.
          </p>

          <div className="result-score">
            <span>FINAL SCORE</span>

            <strong>
              {score}
            </strong>

            <small>
              points
            </small>
          </div>

          <div className="result-grid">

            <div>
              <strong>
                {correctAnswers}
              </strong>

              <span>
                Correct
              </span>
            </div>

            <div>
              <strong>
                {wrongAnswers}
              </strong>

              <span>
                Wrong
              </span>
            </div>

            <div>
              <strong>
                {percentage}%
              </strong>

              <span>
                Accuracy
              </span>
            </div>

            <div>
              <strong>
                {bestStreak}
              </strong>

              <span>
                Best Streak
              </span>
            </div>

          </div>

          <div className="result-actions">

            <button
              className="primary-game-button"
              onClick={() =>
                startGame(difficulty)
              }
            >
              Play Again
            </button>

            <button
              className="secondary-game-button"
              onClick={() =>
                setDifficulty(null)
              }
            >
              Change Difficulty
            </button>

            <button
              className="secondary-game-button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Dashboard
            </button>

          </div>

        </main>

      </div>
    );
  }

  return (
    <div className="games-page">

      <header className="games-header">

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>

        <div className="games-logo">

          <div className="games-logo-box">
            L
          </div>

          <div>
            <h2>LearnSphere</h2>
            <span>Word Scramble</span>
          </div>

        </div>

      </header>

      <main className="game-main">

        <div className="game-heading">

          <p className="game-label">
            {difficulty.toUpperCase()} MODE
          </p>

          <h1>
            Unscramble the Word
          </h1>

          <span>
            Rearrange the letters
            before the timer runs out.
          </span>

        </div>


        <div className="game-stats">

          <div>
            <span>QUESTION</span>

            <strong>
              {currentIndex + 1}/
              {GAME_LENGTH}
            </strong>
          </div>

          <div>
            <span>SCORE</span>

            <strong>
              {score}
            </strong>
          </div>

          <div>
            <span>STREAK</span>

            <strong>
              🔥 {streak}
            </strong>
          </div>

          <div>
            <span>TIME</span>

            <strong>
              ⏱ {timeLeft}s
            </strong>
          </div>

        </div>


        <section className="scramble-card">

          <div className="category">
            {currentWord?.category}
          </div>

          <p className="instruction">
            What word do these letters
            make?
          </p>

          <div className="scrambled-word">

            {scrambledWord
              .split("")
              .map(
                (
                  letter,
                  index
                ) => (
                  <span
                    key={index}
                  >
                    {letter}
                  </span>
                )
              )}

          </div>


          <div className="answer-area">

            <input
              type="text"
              value={answer}
              disabled={answered}
              onChange={(event) =>
                setAnswer(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  checkAnswer();
                }
              }}
              placeholder="Type your answer..."
              autoComplete="off"
            />

            <button
              onClick={checkAnswer}
              disabled={answered}
            >
              Check Answer
            </button>

          </div>


          {message && (
            <div
              className={`game-message ${messageType}`}
            >
              {message}
            </div>
          )}


          {answered && (
            <button
              className="next-button"
              onClick={nextQuestion}
            >
              {currentIndex + 1 >=
              GAME_LENGTH
                ? "View Result"
                : "Next Word →"}
            </button>
          )}

        </section>


        <div className="game-footer">

          <span>
            10 words per challenge
          </span>

          <span>
            New words every game
          </span>

        </div>

      </main>

    </div>
  );
}
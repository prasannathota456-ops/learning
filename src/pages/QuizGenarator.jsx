import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./QuizGenarator.css";
import { generateQuiz as requestQuiz } from "../services/api";

function getCorrectIndex(question) {
  if (!Array.isArray(question.options)) return -1;

  const correctAnswer = String(
    question.correctAnswer ?? ""
  ).trim().toLowerCase();

  if (correctAnswer) {
    const index = question.options.findIndex(
      (option) =>
        String(option).trim().toLowerCase() === correctAnswer
    );

    if (index !== -1) return index;
  }

  const answer = question.answer;

  if (
    answer !== undefined &&
    answer !== null &&
    answer !== "" &&
    Number.isInteger(Number(answer)) &&
    Number(answer) >= 0 &&
    Number(answer) < question.options.length
  ) {
    return Number(answer);
  }

  return -1;
}

function shuffleOptions(question) {
  const options = question.options;

  if (!Array.isArray(options) || options.length < 2) {
    return question;
  }

  const correctIndex = getCorrectIndex(question);

  if (correctIndex === -1) {
    return question;
  }

  const correctAnswer = options[correctIndex];
  const shuffled = [...options];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return {
    ...question,
    options: shuffled,
    correctAnswer,
  };
}

export default function QuizGenarator() {
  const navigate = useNavigate();
  const location = useLocation();

  const topic = location.state?.topic || "";
  const lesson = location.state?.lesson || null;
  const language = location.state?.language || "en-US";

  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // GENERATE QUIZ
  const generateQuiz = useCallback(async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    setQuiz(null);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setCorrectCount(0);

    try {
      const { response, data } = await requestQuiz({
          topic: topic.trim(),
          language: language,
      });

      if (!response.ok) {
        throw new Error(
          data.error || "Quiz generation failed."
        );
      }

      if (
        !Array.isArray(data.questions) ||
        data.questions.length === 0
      ) {
        throw new Error("No questions received from server.");
      }

      const validQuestions = data.questions.every(
        (question) =>
          typeof question.question === "string" &&
          Array.isArray(question.options) &&
          question.options.length >= 2
      );

      if (!validQuestions) {
        throw new Error("The quiz contains invalid questions.");
      }

      // Randomize option positions for each question.
      const shuffledQuestions = data.questions.map(
        shuffleOptions
      );

      setQuiz({
        ...data,
        questions: shuffledQuestions,
      });
    } catch (err) {
      console.error("Quiz Error:", err);
      setError(err.message || "Unable to generate quiz.");
    } finally {
      setLoading(false);
    }
  }, [topic, language]);

  // LOAD QUIZ
  useEffect(() => {
    if (!topic) return;

    const timer = window.setTimeout(() => {
      void generateQuiz();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [topic, generateQuiz]);

  // SELECT ANSWER
  const selectAnswer = (questionIndex, optionIndex) => {
    if (submitted) return;

    if (selectedAnswers[questionIndex] !== undefined) {
      return;
    }

    setSelectedAnswers((previous) => ({
      ...previous,
      [questionIndex]: optionIndex,
    }));
  };

  // SAVE RESULT
  const saveQuizResult = (finalScore) => {
    try {
      const history = JSON.parse(
        localStorage.getItem("learningHistory") || "[]"
      );

      if (!Array.isArray(history)) return;

      const cleanTopic = topic.trim().toLowerCase();

      const index = history.findIndex(
        (item) =>
          String(item.topic || item.name || "")
            .trim()
            .toLowerCase() === cleanTopic
      );

      if (index === -1) {
        console.log("Topic not found in learning history.");
        return;
      }

      const updatedHistory = [...history];

      updatedHistory[index] = {
        ...updatedHistory[index],
        topic,
        name: topic,
        lesson: updatedHistory[index].lesson || lesson,
        progress: 100,
        quizScore: finalScore,
        status: "Completed",
        quizCompletedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(
        "learningHistory",
        JSON.stringify(updatedHistory)
      );

      console.log("Quiz result saved successfully.");
    } catch (err) {
      console.error("Save result error:", err);
    }
  };

  // SUBMIT QUIZ AND CALCULATE OVERALL SCORE
  const submitQuiz = () => {
    if (!quiz) return;

    const unanswered = quiz.questions.some(
      (_, index) => selectedAnswers[index] === undefined
    );

    if (unanswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    let correct = 0;

    quiz.questions.forEach((question, index) => {
      const correctIndex = getCorrectIndex(question);

      if (
        correctIndex !== -1 &&
        selectedAnswers[index] === correctIndex
      ) {
        correct++;
      }
    });

    const total = quiz.questions.length;
    const finalScore = Math.round((correct / total) * 100);

    setCorrectCount(correct);
    setScore(finalScore);
    setSubmitted(true);

    // ADDED: Save the latest quiz result for Learning Rewards
    try {
      localStorage.setItem(
        "latestQuizResult",
        JSON.stringify({
          topic: topic,
          score: finalScore,
          completedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error("Latest quiz result save error:", err);
    }

    // Original history-saving function remains unchanged
    saveQuizResult(finalScore);
  };

  // RETAKE QUIZ
  const retakeQuiz = () => {
    void generateQuiz();
  };

  // NO TOPIC
  if (!topic) {
    return (
      <div className="quiz-page">
        <div className="quiz-error">
          <h2>No topic selected</h2>
          <p>Please select a topic from your dashboard.</p>
          <button onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
        </div>
      </div>
    );
  }

  // LOADING
  if (loading) {
    return (
      <div className="quiz-page">
        <div className="quiz-loading">
          <div className="quiz-loader"></div>
          <h2>Preparing your quiz</h2>
          <p>
            Creating questions for <strong>{topic}</strong>
          </p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="quiz-page">
        <div className="quiz-error">
          <div className="error-icon">!</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>

          <div className="error-actions">
            <button onClick={() => void generateQuiz()}>
              Try Again
            </button>
            <button onClick={() => navigate("/dashboard")}>
              ← Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FINAL RESULT PAGE
  if (submitted) {
    const passed = score >= 60;
    const total = quiz.questions.length;

    return (
      <div className="quiz-page">
        <div className="quiz-result">
          <div
            className={`result-icon ${passed ? "success" : "retry"}`}
          >
            {passed ? "✓" : "↻"}
          </div>

          <p className="result-label">QUIZ COMPLETED</p>

          <h1>
            {passed ? "Excellent Work!" : "Keep Practicing!"}
          </h1>

          <p className="result-topic">{topic}</p>

          <div className="result-score">
            <strong>{score}%</strong>
            <span>Overall Score</span>
          </div>

          <div className="result-message">
            <p>
              Correct Answers: <strong>{correctCount}</strong> / {total}
            </p>

            <p>
              Wrong Answers: <strong>{total - correctCount}</strong>
            </p>

            {score === 100 && (
              <p>Perfect score! You mastered this topic.</p>
            )}

            {score >= 60 && score < 100 && (
              <p>
                Great job! Review your incorrect answers to improve.
              </p>
            )}

            {score < 60 && (
              <p>
                Keep learning and try again to improve your score.
              </p>
            )}
          </div>

          <div className="result-actions">
            <button
              className="retake-button"
              onClick={retakeQuiz}
            >
              Retake Test
            </button>

            <button
              className="learning-button"
              onClick={() =>
                navigate("/dashboard", {
                  state: {
                    resumeTopic: topic,
                    resumeLesson: lesson,
                  },
                })
              }
            >
              Review Learning
            </button>

            <button
              className="dashboard-button"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ PAGE
  return (
    <div className="quiz-page">
      <main className="quiz-container">
        <header className="quiz-header">
          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>

          <div className="quiz-heading">
            <p>KNOWLEDGE CHECK</p>
            <h1>{topic}</h1>
            <span>{quiz?.questions?.length || 0} Questions</span>
          </div>
        </header>

        <section className="questions-container">
          {quiz?.questions?.map((question, questionIndex) => {
            const selectedIndex = selectedAnswers[questionIndex];
            const hasAnswered = selectedIndex !== undefined;
            const correctIndex = getCorrectIndex(question);

            const selectedIsCorrect =
              hasAnswered &&
              correctIndex !== -1 &&
              selectedIndex === correctIndex;

            return (
              <article
                className="question-card"
                key={questionIndex}
              >
                <div className="question-number">
                  QUESTION {questionIndex + 1}
                </div>

                <h2>{question.question}</h2>

                <div className="options">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selectedIndex === optionIndex;

                    const isCorrect =
                      hasAnswered &&
                      correctIndex !== -1 &&
                      optionIndex === correctIndex;

                    const isWrong =
                      hasAnswered &&
                      isSelected &&
                      correctIndex !== -1 &&
                      optionIndex !== correctIndex;

                    let optionClass = "";

                    if (isCorrect) {
                      optionClass = "correct";
                    } else if (isWrong) {
                      optionClass = "wrong";
                    }

                    return (
                      <div
                        className="option-wrapper"
                        key={optionIndex}
                      >
                        <button
                          type="button"
                          disabled={hasAnswered}
                          className={`option ${optionClass}`}
                          onClick={() =>
                            selectAnswer(questionIndex, optionIndex)
                          }
                        >
                          <span className="option-letter">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>

                          <span className="option-text">{option}</span>

                          {isCorrect && (
                            <span className="answer-icon correct-icon">
                              ✓
                            </span>
                          )}

                          {isWrong && (
                            <span className="answer-icon wrong-icon">
                              ✕
                            </span>
                          )}
                        </button>

                        {isWrong && (
                          <div className="wrong-feedback">
                            <div className="feedback-title">
                              ✕ Wrong answer
                            </div>

                            <div className="correct-answer-text">
                              <span>Correct Answer: </span>
                              <strong>
                                {question.options[correctIndex]}
                              </strong>
                            </div>

                            {question.explanation && (
                              <p className="answer-explanation">
                                {question.explanation}
                              </p>
                            )}
                          </div>
                        )}

                        {isSelected && selectedIsCorrect && (
                          <div className="correct-feedback">
                            <div>✓ Correct answer!</div>
                            <span>Well done. Keep going!</span>

                            {question.explanation && (
                              <p className="answer-explanation">
                                {question.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {hasAnswered && (
                  <div
                    className={`question-status ${
                      selectedIsCorrect
                        ? "status-correct"
                        : "status-wrong"
                    }`}
                  >
                    {selectedIsCorrect
                      ? "Answer locked ✓"
                      : "Answer locked • Correct answer shown above"}
                  </div>
                )}

                {hasAnswered && correctIndex === -1 && (
                  <p className="answer-explanation">
                    Correct answer could not be identified. Please regenerate
                    this quiz.
                  </p>
                )}
              </article>
            );
          })}
        </section>

        <div className="quiz-submit-area">
          <p>Answer all questions to finish the quiz.</p>

          <button
            className="submit-quiz-button"
            onClick={submitQuiz}
          >
            Submit Quiz →
          </button>
        </div>
      </main>
    </div>
  );
}
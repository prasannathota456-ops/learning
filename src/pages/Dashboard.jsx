import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Logout from "./Logout";
import { generateLesson } from "../services/api";

import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";
import avatar5 from "../assets/avatars/avatar5.png";
import avatar6 from "../assets/avatars/avatar6.png";
import avatar7 from "../assets/avatars/avatar7.png";
import avatar8 from "../assets/avatars/avatar8.png";
import avatar9 from "../assets/avatars/avatar9.png";
import avatar10 from "../assets/avatars/avatar10.png";
import avatar11 from "../assets/avatars/avatar11.png";
import avatar12 from "../assets/avatars/avatar12.png";
import avatar13 from "../assets/avatars/avatar13.png";
import avatar14 from "../assets/avatars/avatar14.png";
import avatar15 from "../assets/avatars/avatar15.png";
import avatar16 from "../assets/avatars/avatar16.png";

const avatars = [
  avatar1, avatar2, avatar3, avatar4,
  avatar5, avatar6, avatar7, avatar8,
  avatar9, avatar10, avatar11, avatar12,
  avatar13, avatar14, avatar15, avatar16,
];

const languages = [
  { label: "English", value: "en-US" },
  { label: "తెలుగు", value: "te-IN" },
  { label: "हिन्दी", value: "hi-IN" },
];

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const recordLearningActivity = () => {
  const today = getDateKey();

  try {
    const savedDates = JSON.parse(
      localStorage.getItem("learningStreakDates") || "[]"
    );

    const dates = Array.isArray(savedDates) ? savedDates : [];

    if (!dates.includes(today)) {
      dates.push(today);

      localStorage.setItem(
        "learningStreakDates",
        JSON.stringify(dates)
      );
    }
  } catch (error) {
    console.error("Streak Save Error:", error);
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const resumeTopic = location.state?.resumeTopic || "";
  const resumeLesson = location.state?.resumeLesson || null;

  const [topic, setTopic] = useState(resumeTopic);
  const [lesson, setLesson] = useState(resumeLesson);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [language, setLanguage] = useState("en-US");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const recognitionRef = useRef(null);

  const savedUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("loggedInUser") || "{}"
      );
    } catch {
      return {};
    }
  })();

  const userName = savedUser.name || "Learner";

  const savedAvatar = Number(
    localStorage.getItem("selectedAvatar") || 1
  );

  const userAvatar = avatars[savedAvatar - 1] || avatar1;

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;

        try {
          recognitionRef.current.stop();
        } catch {
          // Recognition may already be stopped.
        }
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const saveLearningHistory = (currentTopic, currentLesson) => {
    try {
      const parsed = JSON.parse(
        localStorage.getItem("learningHistory") || "[]"
      );

      const oldHistory = Array.isArray(parsed) ? parsed : [];
      const cleanTopic = currentTopic.trim();

      const existingIndex = oldHistory.findIndex(
        (item) =>
          String(item.topic || item.name || "").toLowerCase() ===
          cleanTopic.toLowerCase()
      );

      let updatedHistory;

      if (existingIndex !== -1) {
        updatedHistory = [...oldHistory];

        const oldItem = oldHistory[existingIndex];

        const isCompleted =
          Number(oldItem.progress || 0) >= 100 ||
          oldItem.status === "Completed";

        updatedHistory[existingIndex] = {
          ...oldItem,
          id: oldItem.id || Date.now(),
            mongoId: currentLesson?._id || oldItem.mongoId || null,
          topic: cleanTopic,
          name: cleanTopic,
          lesson: currentLesson,
          progress: isCompleted ? 100 : 50,
          quizScore: oldItem.quizScore ?? null,
          status: isCompleted ? "Completed" : "In Progress",
          lastUpdated: new Date().toISOString(),
        };
      } else {
        updatedHistory = [
          {
            id: Date.now(),
              mongoId: currentLesson?._id || null,
            topic: cleanTopic,
            name: cleanTopic,
            lesson: currentLesson,
            progress: 50,
            quizScore: null,
            status: "In Progress",
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          },
          ...oldHistory,
        ];
      }

      localStorage.setItem(
        "learningHistory",
        JSON.stringify(updatedHistory)
      );
    } catch (err) {
      console.error("History Save Error:", err);
    }
  };

  const startVoiceTyping = () => {
    setVoiceError("");

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        "Voice typing is not supported in this browser. Please try Google Chrome."
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;

      try {
        recognitionRef.current.stop();
      } catch {
        // Previous recognition may already be stopped.
      }
    }

    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const recognized = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += recognized;
        } else {
          interimText += recognized;
        }
      }

      const recognizedText = finalText || interimText;

      if (recognizedText) {
        setTopic((previous) => {
          const base = previous.trim();

          return base
            ? `${base} ${recognizedText}`
            : recognizedText;
        });
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setVoiceError(
          "Microphone permission denied. Allow microphone access in your browser settings."
        );
      } else if (
        event.error !== "no-speech" &&
        event.error !== "aborted"
      ) {
        setVoiceError(`Voice typing error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceError(
        "Unable to start the microphone. Please try again."
      );
    }
  };

  const stopVoiceTyping = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped.
      }
    }

    setIsListening(false);
  };

  const stopLessonSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsPaused(false);
  };

  const learnTopic = async (event) => {
    event.preventDefault();

    if (!topic.trim()) {
      setError("Please enter or speak a topic first.");
      return;
    }

    if (isListening) {
      stopVoiceTyping();
    }

    setLoading(true);
    setError("");
    setLesson(null);
    stopLessonSpeech();

    try {
      const { response, data } = await generateLesson({
          topic: topic.trim(),
          language,
      });

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to generate lesson."
        );
      }

      setLesson(data);
      recordLearningActivity();
      saveLearningHistory(topic, data);
    } catch (err) {
      console.error("Learning Error:", err);

      setError(
        err.message || "Unable to connect to the AI backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const getLessonText = () => {
    if (!lesson) return "";

    const parts = [
      lesson.title || topic,
      lesson.explanation,
      lesson.howItWorks,
      lesson.example,
      ...(Array.isArray(lesson.importantPoints)
        ? lesson.importantPoints
        : []),
      lesson.summary,
    ];

    return parts
      .filter(
        (part) => typeof part === "string" && part.trim()
      )
      .join(". ");
  };

  const speakLesson = () => {
    if (!("speechSynthesis" in window)) {
      setVoiceError(
        "Text-to-speech is not supported in this browser."
      );
      return;
    }

    const text = getLessonText();

    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setVoiceError("");
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);

      setVoiceError(
        "Could not play this voice. Your device may not have a voice for this language."
      );
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseLessonSpeech = () => {
    if (!("speechSynthesis" in window)) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const startQuiz = () => {
    if (!lesson) {
      setError("Please generate the lesson first.");
      return;
    }

    navigate("/quiz", {
      state: {
        topic: topic.trim(),
        lesson,
        language,
      },
    });
  };

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-box">L</div>

          <div>
            <h2>LearnSphere</h2>
            <p>AI Learning</p>
          </div>
        </div>

        <div className="profile">
          <img src={userAvatar} alt="Profile" />
          <h3>{userName}</h3>
          <p>Student</p>
        </div>

        <nav className="sidebar-nav">
          <div
            className="nav active"
            onClick={() => navigate("/dashboard")}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </div>

          <div
            className="nav"
            onClick={() => navigate("/progress")}
          >
            <span>📈</span>
            <span>Progress</span>
          </div>

          <div
            className="nav"
            onClick={() => navigate("/my-learning")}
          >
            <span>📚</span>
            <span>My Learning</span>
          </div>

          <div
            className="nav"
            onClick={() => navigate("/achievements")}
          >
            <span>🏆</span>
            <span>Achievements</span>
          </div>

          <div
            className="nav"
            onClick={() => navigate("/games")}
          >
            <span>🎮</span>
            <span>Games</span>
          </div>

          <div
            className="nav"
            onClick={() => navigate("/learning-rewards")}
          >
            <span>🎡</span>
            <span>Learning Rewards</span>
          </div>

          {/* LOGOUT */}
          <Logout />
        </nav>

        <div className="sidebar-footer">
          <span>✨</span>
          <p>Keep learning. Keep growing.</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        <section className="page-header">
          <div>
            <p className="welcome-small">
              PERSONAL LEARNING SPACE
            </p>

            <h1>
              Welcome, <span>{userName}</span>
            </h1>

            <p className="header-subtitle">
              Your next discovery starts here.
            </p>
          </div>

          <div className="header-avatar">
            <img src={userAvatar} alt="Your avatar" />
          </div>
        </section>

        {/* HERO */}
        <section className="hero">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />

          <div className="hero-content">
            <p className="hero-label">
              ✦ YOUR PERSONAL AI TUTOR
            </p>

            <h2>
              What do you want
              <br />
              <span>to learn today?</span>
            </h2>

            <p className="hero-text">
              Discover new topics, understand concepts, and learn at
              your own pace with your personal AI tutor.
            </p>

            <div className="hero-benefits">
              <span>✦ Easy explanations</span>
              <span>✦ Practical examples</span>
              <span>✦ Interactive quizzes</span>
            </div>
          </div>

          <div className="hero-decoration" aria-hidden="true">
            ✧
          </div>
        </section>

        {/* LANGUAGE AND TOPIC FORM */}
        <section className="learning-input-panel">
          <div className="input-panel-heading">
            <div className="input-panel-icon">✦</div>

            <div>
              <h2>Start a new lesson</h2>
              <p>
                Type your topic or tell your AI tutor what to teach you.
              </p>
            </div>
          </div>

          <label
            className="language-label"
            htmlFor="lesson-language"
          >
            🌐 Learning language
          </label>

          <select
            id="lesson-language"
            className="language-select"
            value={language}
            onChange={(event) => {
              setLanguage(event.target.value);
              setVoiceError("");
            }}
          >
            {languages.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <form className="topic-form" onSubmit={learnTopic}>
            <input
              type="text"
              placeholder="Enter a topic..."
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              aria-label="Topic you want to learn"
            />

            <button
              type="button"
              className={`mic-button ${
                isListening ? "mic-active" : ""
              }`}
              onClick={
                isListening ? stopVoiceTyping : startVoiceTyping
              }
              aria-label={
                isListening
                  ? "Stop voice typing"
                  : "Start voice typing"
              }
            >
              {isListening ? "⏹ Stop" : "🎙️ Speak"}
            </button>

            <button
              type="submit"
              className="generate-button"
              disabled={loading}
            >
              {loading ? "Generating..." : "✨ Generate Lesson"}
            </button>
          </form>

          <p className="voice-hint">
            {isListening
              ? "🔴 Listening... Speak now. Your words will appear in the topic field."
              : "🎙️ Tap Speak, say your topic, then edit the text or generate your lesson."}
          </p>

          {voiceError && (
            <div className="voice-error" role="status">
              {voiceError}
            </div>
          )}
        </section>

        {error && (
          <div className="error-box" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <section className="loading-box">
            <div className="loader" />
            <h3>Your AI tutor is preparing your lesson...</h3>
            <p>
              Creating a lesson about <strong>{topic}</strong>
            </p>
          </section>
        )}

        {/* GENERATED LESSON */}
        {lesson && !loading && (
          <section className="lesson-section">
            <div className="lesson-top">
              <div>
                <p className="lesson-label">
                  ✦ YOUR PERSONALIZED LESSON
                </p>

                <h2>{lesson.title || topic}</h2>

                <p className="lesson-subtitle">
                  Learn the concept step by step.
                </p>
              </div>

              <span className="ai-badge">✦ AI GENERATED</span>
            </div>

            {/* SPEECH CONTROLS */}
            <div className="speech-toolbar">
              <div className="speech-toolbar-info">
                <span className="speech-icon">🔊</span>

                <div>
                  <strong>Listen to your lesson</strong>
                  <p>Listen, pause, resume, or stop the audio.</p>
                </div>
              </div>

              <div className="speech-actions">
                {!isSpeaking ? (
                  <button
                    type="button"
                    className="listen-button"
                    onClick={speakLesson}
                  >
                    ▶ Listen
                  </button>
                ) : (
                  <button
                    type="button"
                    className="listen-button"
                    onClick={pauseLessonSpeech}
                  >
                    {isPaused ? "▶ Resume" : "⏸ Pause"}
                  </button>
                )}

                <button
                  type="button"
                  className="stop-audio-button"
                  onClick={stopLessonSpeech}
                  disabled={!isSpeaking}
                >
                  ■ Stop
                </button>
              </div>
            </div>

            {lesson.explanation && (
              <article className="lesson-card lesson-card-purple">
                <div className="lesson-card-icon">📖</div>

                <div>
                  <span className="lesson-card-eyebrow">
                    UNDERSTAND
                  </span>
                  <h3>Explanation</h3>
                  <p>{lesson.explanation}</p>
                </div>
              </article>
            )}

            {lesson.howItWorks && (
              <article className="lesson-card lesson-card-blue">
                <div className="lesson-card-icon">⚙️</div>

                <div>
                  <span className="lesson-card-eyebrow">
                    STEP BY STEP
                  </span>
                  <h3>How it works</h3>
                  <p>{lesson.howItWorks}</p>
                </div>
              </article>
            )}

            {lesson.example && (
              <article className="lesson-card lesson-card-orange">
                <div className="lesson-card-icon">💡</div>

                <div>
                  <span className="lesson-card-eyebrow">
                    APPLY IT
                  </span>
                  <h3>Real-world example</h3>
                  <p>{lesson.example}</p>
                </div>
              </article>
            )}

            {Array.isArray(lesson.importantPoints) &&
              lesson.importantPoints.length > 0 && (
                <article className="lesson-card lesson-card-green">
                  <div className="lesson-card-icon">✓</div>

                  <div>
                    <span className="lesson-card-eyebrow">
                      REMEMBER THESE
                    </span>
                    <h3>Important points</h3>

                    <ul className="important-points-list">
                      {lesson.importantPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              )}

            {lesson.summary && (
              <article className="lesson-card lesson-card-pink">
                <div className="lesson-card-icon">⭐</div>

                <div>
                  <span className="lesson-card-eyebrow">
                    KEY TAKEAWAY
                  </span>
                  <h3>Lesson summary</h3>
                  <p>{lesson.summary}</p>
                </div>
              </article>
            )}

            {/* QUIZ */}
            <div className="quiz-box">
              <div className="quiz-box-icon">🎯</div>

              <div className="quiz-box-content">
                <p className="quiz-label">
                  YOUR NEXT CHALLENGE
                </p>

                <h2>Ready to test yourself?</h2>

                <p>
                  Check your understanding of <strong>{topic}</strong>{" "}
                  with an interactive quiz.
                </p>
              </div>

              <button
                type="button"
                className="quiz-button"
                onClick={startQuiz}
              >
                Start Quiz →
              </button>
            </div>
          </section>
        )}

        {!lesson && !loading && (
          <section className="empty-lesson">
            <div className="empty-lesson-icon">✧</div>
            <h3>Your next learning adventure awaits</h3>
            <p>
              Choose a language, enter a topic or use your microphone,
              and generate your first lesson.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
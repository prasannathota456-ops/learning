
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Achievements.css";

const HISTORY_KEY = "learningHistory";
const STREAK_KEY = "learningStreakDates";
const CERTIFICATES_KEY = "learningAchievementCertificates";

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const shiftDate = (dateKey, amount) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return getDateKey(date);
};

const readArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const getStreak = (dates) => {
  const dateSet = new Set(dates);
  let current = getDateKey();

  if (!dateSet.has(current)) {
    current = shiftDate(current, -1);
    if (!dateSet.has(current)) return 0;
  }

  let count = 0;

  while (dateSet.has(current)) {
    count++;
    current = shiftDate(current, -1);
  }

  return count;
};

const getLongestStreak = (dates) => {
  const sorted = [...new Set(dates)].sort();
  let longest = 0;
  let count = 0;
  let previous = null;

  sorted.forEach((date) => {
    count = previous && shiftDate(previous, 1) === date ? count + 1 : 1;
    longest = Math.max(longest, count);
    previous = date;
  });

  return longest;
};

const isCompleted = (item) =>
  Number(item?.progress) >= 100 || item?.status === "Completed";

const getSubject = (item) =>
  item?.subject || item?.category || item?.course || "";

const getStudentName = () => {
  try {
    const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    return user.name || "Student";
  } catch {
    return "Student";
  }
};

const getCertificateId = (achievementId, date) => {
  const day = date.replaceAll("-", "");
  return `LS-${achievementId.toUpperCase()}-${day}`;
};

export default function Achievements() {
  const navigate = useNavigate();

  const [history, setHistory] = useState(() => readArray(HISTORY_KEY));
  const [streakDates, setStreakDates] = useState(() => readArray(STREAK_KEY));
  const [certificates, setCertificates] = useState(() =>
    readArray(CERTIFICATES_KEY)
  );
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    const refresh = () => {
      setHistory(readArray(HISTORY_KEY));
      setStreakDates(readArray(STREAK_KEY));
      setCertificates(readArray(CERTIFICATES_KEY));
    };

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const studentName = getStudentName();

  const completedLessons = history.filter(isCompleted).length;

  const quizScores = useMemo(
    () =>
      history
        .map((item) => Number(item?.quizScore))
        .filter(
          (score) =>
            Number.isFinite(score) && score >= 0 && score <= 100
        ),
    [history]
  );

  const highScoreQuizzes = quizScores.filter((score) => score >= 80).length;
  const excellentQuizzes = quizScores.filter((score) => score >= 90).length;

  const activeDates = useMemo(() => {
    const dates = new Set(
      streakDates.filter(
        (date) =>
          typeof date === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(date)
      )
    );

    history.forEach((item) => {
      [item?.date, item?.lastStudied].forEach((date) => {
        if (
          typeof date === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(date)
        ) {
          dates.add(date);
        }
      });
    });

    return [...dates].sort();
  }, [history, streakDates]);

  const currentStreak = getStreak(activeDates);
  const longestStreak = getLongestStreak(activeDates);

  const subjectCount = new Set(
    history
      .map(getSubject)
      .filter(Boolean)
      .map((subject) => subject.toLowerCase())
  ).size;

  const achievementDefinitions = useMemo(() => [
    {
      id: "first-step",
      title: "First Step",
      description: "Generate your first learning lesson.",
      icon: "📘",
      progress: Math.min(history.length, 1),
      target: 1,
      unit: "lesson",
      unlocked: history.length >= 1,
    },
    {
      id: "lesson-master",
      title: "Lesson Master",
      description: "Complete 10 lessons successfully.",
      icon: "🎓",
      progress: Math.min(completedLessons, 10),
      target: 10,
      unit: "lessons",
      unlocked: completedLessons >= 10,
    },
    {
      id: "streak-star",
      title: "Consistency Champion",
      description: "Build a 7-day learning streak.",
      icon: "🔥",
      progress: Math.min(longestStreak, 7),
      target: 7,
      unit: "days",
      unlocked: longestStreak >= 7,
    },
    {
      id: "quiz-champion",
      title: "Quiz Champion",
      description: "Score 80% or above in 5 quizzes.",
      icon: "🎯",
      progress: Math.min(highScoreQuizzes, 5),
      target: 5,
      unit: "quizzes",
      unlocked: highScoreQuizzes >= 5,
    },
    {
      id: "academic-excellence",
      title: "Academic Excellence",
      description: "Score 90% or above in 3 quizzes.",
      icon: "🏆",
      progress: Math.min(excellentQuizzes, 3),
      target: 3,
      unit: "quizzes",
      unlocked: excellentQuizzes >= 3,
    },
    {
      id: "knowledge-explorer",
      title: "Knowledge Explorer",
      description: "Explore 5 different subjects.",
      icon: "🧭",
      progress: Math.min(subjectCount, 5),
      target: 5,
      unit: "subjects",
      unlocked: subjectCount >= 5,
    },
    {
      id: "learning-legend",
      title: "Learning Legend",
      description: "Complete 25 lessons.",
      icon: "⭐",
      progress: Math.min(completedLessons, 25),
      target: 25,
      unit: "lessons",
      unlocked: completedLessons >= 25,
    },
    {
      id: "dedicated-learner",
      title: "Dedicated Learner",
      description: "Reach a 14-day learning streak.",
      icon: "💎",
      progress: Math.min(longestStreak, 14),
      target: 14,
      unit: "days",
      unlocked: longestStreak >= 14,
    },
  ], [
    completedLessons,
    history.length,
    highScoreQuizzes,
    excellentQuizzes,
    longestStreak,
    subjectCount,
  ]);

  const availableCertificates = useMemo(() => {
    const saved = [...readArray(CERTIFICATES_KEY), ...certificates];
    const savedById = new Map(
      saved.map((item) => [item.achievementId, item])
    );

    achievementDefinitions.forEach((achievement) => {
      if (achievement.unlocked && !savedById.has(achievement.id)) {
        const date = getDateKey();

        savedById.set(achievement.id, {
          achievementId: achievement.id,
          title: achievement.title,
          studentName,
          date,
          certificateId: getCertificateId(achievement.id, date),
        });
      }
    });

    return [...savedById.values()];
  }, [achievementDefinitions, certificates, studentName]);

  useEffect(() => {
    localStorage.setItem(
      CERTIFICATES_KEY,
      JSON.stringify(availableCertificates)
    );
  }, [availableCertificates]);

  const unlockedCount = achievementDefinitions.filter(
    (item) => item.unlocked
  ).length;

  const getSavedCertificate = (achievementId) =>
    availableCertificates.find(
      (item) => item.achievementId === achievementId
    );

  const openCertificate = (achievement) => {
    const saved = getSavedCertificate(achievement.id);

    if (achievement.unlocked && saved) {
      setSelectedCertificate(saved);
    }
  };

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="ach-page">
      <header className="ach-header">
        <button
          className="ach-back"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <div className="ach-brand">
          <div className="ach-logo">L</div>
          <div>
            <strong>LearnSphere</strong>
            <span>STUDENT ACHIEVEMENTS</span>
          </div>
        </div>

        <div className="ach-header-tag">🏆 MILESTONES</div>
      </header>

      <main className="ach-main">
        <section className="ach-hero">
          <div>
            <span className="ach-eyebrow">YOUR LEARNING JOURNEY</span>
            <h1>
              Your <span>Achievements</span>
            </h1>
            <p>
              Celebrate your progress, unlock milestones, and earn certificates
              for your accomplishments.
            </p>
          </div>
          <div className="ach-hero-icon">🏆</div>
        </section>

        <section className="ach-stats">
          <article className="ach-stat">
            <span className="ach-stat-icon gold">🏅</span>
            <div>
              <span>Badges unlocked</span>
              <strong>{unlockedCount}/{achievementDefinitions.length}</strong>
            </div>
          </article>

          <article className="ach-stat">
            <span className="ach-stat-icon blue">📚</span>
            <div>
              <span>Lessons completed</span>
              <strong>{completedLessons}</strong>
            </div>
          </article>

          <article className="ach-stat">
            <span className="ach-stat-icon orange">🔥</span>
            <div>
              <span>Current streak</span>
              <strong>{currentStreak} days</strong>
            </div>
          </article>

          <article className="ach-stat">
            <span className="ach-stat-icon green">🎯</span>
            <div>
              <span>Quizzes recorded</span>
              <strong>{quizScores.length}</strong>
            </div>
          </article>
        </section>

        <section className="ach-overview">
          <div className="ach-overview-top">
            <div>
              <span className="ach-eyebrow">YOUR COLLECTION</span>
              <h2>Achievement progress</h2>
            </div>
            <strong>
              {Math.round(
                (unlockedCount / achievementDefinitions.length) * 100
              )}%
            </strong>
          </div>

          <div className="ach-progress-track">
            <div
              style={{
                width: `${(unlockedCount / achievementDefinitions.length) * 100}%`,
              }}
            />
          </div>

          <p>
            {unlockedCount} of {achievementDefinitions.length} achievements
            unlocked. Keep learning to earn more certificates.
          </p>
        </section>

        <section className="ach-streak">
          <div className="ach-streak-icon">🔥</div>
          <div className="ach-streak-copy">
            <span className="ach-eyebrow">CONSISTENCY RECORD</span>
            <h2>Keep your learning streak alive</h2>
            <p>
              Current streak: {currentStreak} days. Best streak: {longestStreak} days.
            </p>
          </div>
          <button onClick={() => navigate("/progress")}>
            View Progress →
          </button>
        </section>

        <section className="ach-section-heading">
          <div>
            <span className="ach-eyebrow">BADGE COLLECTION</span>
            <h2>Your achievements</h2>
            <p>Unlocked achievements include a printable certificate.</p>
          </div>
          <span className="ach-total">{unlockedCount} UNLOCKED</span>
        </section>

        <section className="ach-grid">
          {achievementDefinitions.map((item) => {
            const percent = Math.round((item.progress / item.target) * 100);
            const savedCertificate = getSavedCertificate(item.id);

            return (
              <article
                className={`ach-card ${item.unlocked ? "is-unlocked" : "is-locked"}`}
                key={item.id}
              >
                <div className="ach-card-top">
                  <div className={`ach-badge-icon ${item.unlocked ? "earned" : ""}`}>
                    {item.unlocked ? item.icon : "🔒"}
                  </div>
                  <span className={`ach-status ${item.unlocked ? "unlocked" : "locked"}`}>
                    {item.unlocked ? "✓ UNLOCKED" : "LOCKED"}
                  </span>
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="ach-card-progress-label">
                  <span>Progress</span>
                  <strong>{item.progress}/{item.target} {item.unit}</strong>
                </div>

                <div className="ach-card-track">
                  <div style={{ width: `${percent}%` }} />
                </div>

                <div className="ach-card-footer">
                  <span>{item.unlocked ? "Milestone achieved" : "Keep going"}</span>
                  <span>{percent}%</span>
                </div>

                {item.unlocked && savedCertificate ? (
                  <button
                    className="ach-certificate-button"
                    onClick={() => openCertificate(item)}
                  >
                    <span>🏅</span> View Certificate
                  </button>
                ) : (
                  <div className="ach-locked-note">
                    🔒 Unlock this achievement to earn a certificate
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {history.length === 0 && (
          <section className="ach-empty">
            <div>📖</div>
            <h2>Your journey starts here</h2>
            <p>
              Generate your first lesson from the Dashboard to begin earning
              achievements.
            </p>
            <button onClick={() => navigate("/dashboard")}>
              Start learning →
            </button>
          </section>
        )}

        <footer className="ach-footer">
          <span>LEARNSPHERE</span>
          <span>Small steps today. Great achievements tomorrow.</span>
        </footer>
      </main>

      {selectedCertificate && (
        <div
          className="ach-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCertificate(null);
            }
          }}
        >
          <div className="ach-modal-content">
            <div className="ach-modal-actions no-print">
              <button
                className="ach-modal-close"
                onClick={() => setSelectedCertificate(null)}
              >
                ✕ Close
              </button>
              <button
                className="ach-print-button"
                onClick={printCertificate}
              >
                ⬇ Print / Save as PDF
              </button>
            </div>

            <div className="ach-certificate">
              <div className="ach-certificate-inner">
                <div className="ach-certificate-logo">L</div>
                <p className="ach-certificate-brand">LEARNSPHERE</p>
                <p className="ach-certificate-overline">CERTIFICATE OF ACHIEVEMENT</p>
                <div className="ach-certificate-line" />
                <h1>Certificate</h1>
                <h2>of Achievement</h2>
                <p className="ach-certificate-presented">This certificate is proudly presented to</p>
                <h3>{selectedCertificate.studentName}</h3>
                <p className="ach-certificate-description">
                  In recognition of successfully achieving the learning milestone
                </p>
                <h2 className="ach-certificate-title">{selectedCertificate.title}</h2>
                <p className="ach-certificate-description">
                  For dedication, consistency, and commitment to learning.
                </p>

                <div className="ach-certificate-bottom">
                  <div>
                    <span className="ach-signature">LearnSphere</span>
                    <div className="ach-sign-line" />
                    <small>Learning Platform</small>
                  </div>
                  <div className="ach-certificate-seal">★</div>
                  <div>
                    <strong>
                      {new Date(
                        `${selectedCertificate.date}T12:00:00`
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </strong>
                    <div className="ach-sign-line" />
                    <small>Date awarded</small>
                  </div>
                </div>

                <p className="ach-certificate-id">
                  Certificate ID: {selectedCertificate.certificateId}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

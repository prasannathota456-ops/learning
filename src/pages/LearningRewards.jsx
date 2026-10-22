import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LearningRewards.css";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "⌂", path: "/dashboard" },
  { label: "Progress", icon: "▥", path: "/progress" },
  { label: "My Learning", icon: "▤", path: "/my-learning" },
  { label: "Achievements", icon: "♜", path: "/achievements" },
  { label: "Games", icon: "🎮", path: "/games" },
  { label: "Learning Rewards", icon: "♛", path: "/learning-rewards" },
];

// Read learning history safely
function readHistory() {
  try {
    const data = JSON.parse(
      localStorage.getItem("learningHistory") || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Read the latest quiz attempt.
// Do not average scores from different quizzes.
function readLatestQuizResult() {
  try {
    const result = JSON.parse(
      localStorage.getItem("latestQuizResult") || "null"
    );

    if (
      !result ||
      result.score === null ||
      result.score === undefined ||
      result.score === "" ||
      !Number.isFinite(Number(result.score))
    ) {
      return null;
    }

    const score = Number(result.score);

    if (score < 0 || score > 100) {
      return null;
    }

    return {
      ...result,
      score: Math.round(score),
    };
  } catch {
    return null;
  }
}

// Get lesson count and latest quiz score
function readStats() {
  const history = readHistory();
  const latestQuiz = readLatestQuizResult();

  const completed = history.filter(
    (item) =>
      Number(item.progress || 0) >= 100 ||
      String(item.status || "").toLowerCase() === "completed"
  );

  return {
    completedCount: completed.length,
    latestScore: latestQuiz ? latestQuiz.score : null,
    latestTopic: latestQuiz?.topic || "",
    completedAt: latestQuiz?.completedAt || null,
    quizCount: history.filter(
      (item) =>
        item.quizScore !== null &&
        item.quizScore !== undefined &&
        item.quizScore !== "" &&
        Number.isFinite(Number(item.quizScore)) &&
        Number(item.quizScore) >= 0 &&
        Number(item.quizScore) <= 100
    ).length,
  };
}

// Determine badge from the latest quiz score
function createReward(stats) {
  const score = stats.latestScore;

  if (score === null) {
    return {
      name: "Quiz Not Completed",
      icon: "📘",
      color: "locked",
      message: "Complete a quiz to unlock your learning badge.",
    };
  }

  if (score >= 80) {
    return {
      name: "Gold Medal",
      icon: "🥇",
      color: "gold",
      message:
        "Outstanding performance! Keep shining and reaching new milestones.",
    };
  }

  if (score >= 60) {
    return {
      name: "Silver Medal",
      icon: "🥈",
      color: "silver",
      message:
        "Great work! Keep practising and aim for your next milestone.",
    };
  }

  if (score >= 40) {
    return {
      name: "Bronze Medal",
      icon: "🥉",
      color: "bronze",
      message: "Well done! Keep learning and growing.",
    };
  }

  return {
    name: "Keep Learning",
    icon: "⭐",
    color: "locked",
    message:
      "Keep practising and take another step towards your goal.",
  };
}

// Read logged-in user's name
function getName() {
  try {
    const user = JSON.parse(
      localStorage.getItem("loggedInUser") || "{}"
    );

    return user.name || "Learner";
  } catch {
    return "Learner";
  }
}

export default function LearningRewards() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(readStats);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const reward = useMemo(() => createReward(stats), [stats]);

  const refreshStats = useCallback(() => {
    setStats(readStats());
  }, []);

  // Refresh when the user returns to this page
  useEffect(() => {
    window.addEventListener("focus", refreshStats);
    window.addEventListener("pageshow", refreshStats);

    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === "latestQuizResult" ||
        event.key === "learningHistory"
      ) {
        refreshStats();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", refreshStats);
      window.removeEventListener("pageshow", refreshStats);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshStats]);

  // Spin the wheel, then reveal the badge earned from the latest score
  const spinWheel = () => {
    if (spinning) return;

    const latestStats = readStats();

    setStats(latestStats);
    setShowReward(false);
    setSpinning(true);

    // The wheel animation is decorative.
    // The actual reward is determined by the quiz score.
    const extraRotation = 1800 + Math.random() * 360;

    setRotation((current) => current + extraRotation);

    window.setTimeout(() => {
      setStats(readStats());
      setSpinning(false);
      setShowReward(true);
    }, 4200);
  };

  return (
    <div className="lr-page">
      {/* Sidebar */}
      <aside className="lr-sidebar">
        <div className="lr-brand">
          <div className="lr-brand-mark">L</div>

          <div>
            <h2>LearnSphere</h2>
            <p>AI Learning</p>
          </div>
        </div>

        <div className="lr-profile">
          <div className="lr-avatar">🎓</div>

          <div>
            <h3>{getName()}</h3>
            <p>Student</p>
          </div>
        </div>

        <nav className="lr-nav">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.path}
              className={`lr-nav-item ${
                item.path === "/learning-rewards" ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="lr-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="lr-sidebar-note">
          <span>✦</span>
          <p>
            Keep learning.
            <br />
            Keep growing.
          </p>
        </div>
      </aside>

      {/* Main page */}
      <main className="lr-main">
        <header className="lr-header">
          <div>
            <span className="lr-eyebrow">
              YOUR LEARNING ACHIEVEMENTS
            </span>

            <h1>
              Learning <span>Rewards</span>
            </h1>

            <p>
              Celebrate your progress and unlock a badge for your effort.
            </p>
          </div>

          <div className="lr-top-stats">
            <div className="lr-top-stat">
              <span className="lr-stat-icon green">▤</span>

              <div>
                <p>Completed lessons</p>
                <strong>{stats.completedCount}</strong>
              </div>
            </div>

            <div className="lr-top-stat">
              <span className="lr-stat-icon purple">▥</span>

              <div>
                <p>Latest quiz score</p>

                <strong>
                  {stats.latestScore === null
                    ? "—"
                    : `${stats.latestScore}%`}
                </strong>
              </div>
            </div>
          </div>
        </header>

        <section className="lr-content">
          {/* Reward wheel */}
          <div className="lr-wheel-card">
            <div className="lr-card-heading">
              <span className="lr-live-dot" />
              <span>YOUR REWARD WHEEL</span>
            </div>

            <div className="lr-wheel-stage">
              <div className="lr-pointer">▼</div>

              <div className="lr-wheel-glow">
                <div
                  className="lr-wheel"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning
                      ? "transform 4.2s cubic-bezier(0.12, 0.72, 0.12, 1)"
                      : "none",
                  }}
                >
                  <div className="lr-wheel-label lr-label-gold">
                    <span>🥇</span>
                    <strong>GOLD</strong>
                  </div>

                  <div className="lr-wheel-label lr-label-silver">
                    <span>🥈</span>
                    <strong>SILVER</strong>
                  </div>

                  <div className="lr-wheel-label lr-label-bronze">
                    <span>🥉</span>
                    <strong>BRONZE</strong>
                  </div>

                  <div className="lr-wheel-label lr-label-keep">
                    <span>★</span>
                    <strong>KEEP GOING</strong>
                  </div>

                  <div className="lr-wheel-center">LS</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="lr-spin-button"
              onClick={spinWheel}
              disabled={spinning}
            >
              <span
                className={
                  spinning
                    ? "lr-spin-icon rotating"
                    : "lr-spin-icon"
                }
              >
                ↻
              </span>

              {spinning ? "SPINNING..." : "SPIN THE WHEEL"}
            </button>

            <p className="lr-wheel-footnote">
              Spin to reveal the badge earned from your latest quiz score.
            </p>
          </div>

          {/* Result section */}
          <div className="lr-result-column">
            {!showReward ? (
              <div className="lr-result-placeholder">
                <div className="lr-placeholder-icon">🏆</div>

                <span className="lr-eyebrow">
                  YOUR NEXT MILESTONE
                </span>

                <h2>
                  {spinning
                    ? "Your reward is on its way!"
                    : "Your achievement awaits."}
                </h2>

                <p>
                  {spinning
                    ? "The wheel is spinning. Get ready to reveal your badge."
                    : "Spin the wheel to reveal the badge based on your latest quiz result."}
                </p>

                <div className="lr-placeholder-divider" />

                <div className="lr-mini-stats">
                  <div>
                    <span>LATEST QUIZ SCORE</span>

                    <strong>
                      {stats.latestScore === null
                        ? "—"
                        : `${stats.latestScore}%`}
                    </strong>
                  </div>

                  <div>
                    <span>LESSONS DONE</span>
                    <strong>{stats.completedCount}</strong>
                  </div>
                </div>

                <div className="lr-badge-preview">
                  <span>🥉</span>
                  <span>🥈</span>
                  <span>🥇</span>
                  <span>⭐</span>
                </div>

                <p className="lr-small-note">
                  Keep learning. Every step counts.
                </p>
              </div>
            ) : (
              <div
                className={`lr-result-card result-${reward.color}`}
                aria-live="polite"
              >
                <div className="lr-confetti" aria-hidden="true">
                  <span>✦</span>
                  <span>◆</span>
                  <span>✦</span>
                  <span>◆</span>
                  <span>✧</span>
                  <span>◆</span>
                  <span>✦</span>
                  <span>◆</span>
                  <span>✧</span>
                </div>

                <div className="lr-trophy-wrap">
                  <div className="lr-trophy-ring">
                    {reward.icon}
                  </div>

                  <span className="lr-laurel">❧</span>
                  <span className="lr-laurel right">❧</span>
                </div>

                <span className="lr-eyebrow">
                  LEARNING ACHIEVEMENT UNLOCKED
                </span>

                <h2 className="lr-congrats">
                  {stats.latestScore === null
                    ? "Keep Learning!"
                    : "Congratulations!"}
                </h2>

                <p className="lr-earned-label">YOU EARNED</p>

                <h3 className="lr-reward-name">{reward.name}</h3>

                <p className="lr-reward-message">
                  {reward.message}
                </p>

                {stats.latestTopic && (
                  <p className="lr-topic-name">
                    Quiz: <strong>{stats.latestTopic}</strong>
                  </p>
                )}

                <div className="lr-result-stats">
                  <div>
                    <span className="lr-result-stat-icon">▥</span>

                    <div>
                      <p>Latest quiz score</p>

                      <strong>
                        {stats.latestScore === null
                          ? "—"
                          : `${stats.latestScore}%`}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span className="lr-result-stat-icon green">▤</span>

                    <div>
                      <p>Completed lessons</p>
                      <strong>{stats.completedCount}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="lr-view-button"
                  onClick={() => navigate("/achievements")}
                >
                  View Achievements <span>→</span>
                </button>

                <button
                  type="button"
                  className="lr-spin-again"
                  onClick={() => setShowReward(false)}
                >
                  Return to reward wheel
                </button>
              </div>
            )}

            {/* Badge guide */}
            <div className="lr-medal-guide">
              <h3>Badge milestones</h3>

              <div className="lr-guide-row">
                <span>
                  <i>🥉</i> Bronze
                </span>
                <strong>40–59%</strong>
              </div>

              <div className="lr-guide-row">
                <span>
                  <i>🥈</i> Silver
                </span>
                <strong>60–79%</strong>
              </div>

              <div className="lr-guide-row">
                <span>
                  <i>🥇</i> Gold
                </span>
                <strong>80–100%</strong>
              </div>

              <div className="lr-guide-row">
                <span>
                  <i>⭐</i> Keep going
                </span>
                <strong>Below 40%</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
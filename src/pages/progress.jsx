import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./progress.css";

const HISTORY_KEY = "learningHistory";
const STREAK_KEY = "learningStreakDates";
const GOAL_KEY = "learningWeeklyGoal";

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const readArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const shiftDate = (dateKey, amount) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  date.setDate(date.getDate() + amount);

  return getDateKey(date);
};

const isCompleted = (item) =>
  Number(item.progress) >= 100 || item.status === "Completed";

const getTopic = (item) =>
  item.topic || item.name || "Untitled Topic";

const getCurrentStreak = (dates) => {
  const dateSet = new Set(dates);
  const today = getDateKey();
  const yesterday = shiftDate(today, -1);

  let current = dateSet.has(today)
    ? today
    : dateSet.has(yesterday)
    ? yesterday
    : null;

  if (!current) return 0;

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
    if (previous && shiftDate(previous, 1) === date) {
      count++;
    } else {
      count = 1;
    }

    longest = Math.max(longest, count);
    previous = date;
  });

  return longest;
};

export default function Progress() {
  const navigate = useNavigate();

  const [history, setHistory] = useState(() =>
    readArray(HISTORY_KEY)
  );

  const [streakDates, setStreakDates] = useState(() =>
    readArray(STREAK_KEY)
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const saved = Number(localStorage.getItem(GOAL_KEY));
    return saved >= 1 && saved <= 6 ? saved : 5;
  });

  const [today, setToday] = useState(() => new Date());

  // Update the date when the page is revisited or the window regains focus.
  useEffect(() => {
    const refresh = () => {
      setToday(new Date());
      setHistory(readArray(HISTORY_KEY));
      setStreakDates(readArray(STREAK_KEY));
    };

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Record learning activity only if it is already present in history.
  // Opening this page does not create a new streak day.
  const activeDates = useMemo(() => {
    const recordedDates = new Set(streakDates);

    history.forEach((item) => {
      if (item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        recordedDates.add(item.date);
      }

      if (
        item.lastStudied &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.lastStudied)
      ) {
        recordedDates.add(item.lastStudied);
      }
    });

    return [...recordedDates].sort();
  }, [history, streakDates]);

  const completedTopics = history.filter(isCompleted).length;
  const inProgressTopics = history.length - completedTopics;

  const averageQuizScore = useMemo(() => {
    const scores = history
      .filter(
        (item) =>
          item.quizScore !== null &&
          item.quizScore !== undefined &&
          item.quizScore !== "" &&
          Number.isFinite(Number(item.quizScore))
      )
      .map((item) => Number(item.quizScore));

    return scores.length
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) /
            scores.length
        )
      : null;
  }, [history]);

  const overallProgress = history.length
    ? Math.round(
        history.reduce(
          (sum, item) =>
            sum +
            Math.min(100, Math.max(0, Number(item.progress) || 0)),
          0
        ) / history.length
      )
    : 0;

  const currentStreak = getCurrentStreak(activeDates);
  const longestStreak = getLongestStreak(activeDates);

  const weekDays = useMemo(() => {
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + mondayOffset
    );

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const key = getDateKey(date);

      return {
        key,
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        number: date.getDate(),
        active: activeDates.includes(key),
        today: key === getDateKey(today),
        future: key > getDateKey(today),
      };
    });
  }, [today, activeDates]);

  const activeDaysThisWeek = weekDays.filter(
    (day) => day.active
  ).length;

  const monthDays = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday-first calendar.
    const blanks = (firstDay.getDay() + 6) % 7;

    return [
      ...Array.from({ length: blanks }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => {
        const date = new Date(year, month, index + 1);
        const key = getDateKey(date);

        return {
          key,
          number: index + 1,
          active: activeDates.includes(key),
          today: key === getDateKey(today),
          future: key > getDateKey(today),
        };
      }),
    ];
  }, [today, activeDates]);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = getTopic(item)
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const completed = isCompleted(item);

    const matchesFilter =
      filter === "All" ||
      (filter === "Completed" && completed) ||
      (filter === "In Progress" && !completed);

    return matchesSearch && matchesFilter;
  });

  const achievements = [
    {
      title: "First Step",
      description: "Record your first learning day",
      unlocked: activeDates.length >= 1,
      icon: "✦",
    },
    {
      title: "3-Day Streak",
      description: "Learn for 3 consecutive days",
      unlocked: longestStreak >= 3,
      icon: "🔥",
    },
    {
      title: "Week Warrior",
      description: "Learn for 5 consecutive days",
      unlocked: longestStreak >= 5,
      icon: "🏆",
    },
    {
      title: "Knowledge Builder",
      description: "Complete 5 topics",
      unlocked: completedTopics >= 5,
      icon: "◆",
    },
  ];

  const openTopic = (item) => {
    navigate("/dashboard", {
      state: {
        resumeTopic: getTopic(item),
        resumeLesson: item.lesson || null,
      },
    });
  };

  const saveWeeklyGoal = (value) => {
    const goal = Number(value);

    setWeeklyGoal(goal);
    localStorage.setItem(GOAL_KEY, String(goal));
  };

  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedMonth = today.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="lp-page">
      <header className="lp-header">
        <button
          className="lp-back"
          onClick={() => navigate("/dashboard")}
        >
          <span>←</span> Dashboard
        </button>

        <div className="lp-brand">
          <div className="lp-logo">L</div>
          <div>
            <strong>LearnSphere</strong>
            <span>LEARNING ANALYTICS</span>
          </div>
        </div>

        <div className="lp-header-label">
          <span /> PERSONAL DASHBOARD
        </div>
      </header>

      <main className="lp-main">
        <section className="lp-intro">
          <div>
            <div className="lp-eyebrow">
              YOUR PROGRESS AT A GLANCE
            </div>

            <h1>
              Learning <span>Progress</span>
            </h1>

            <p>
              Track your consistency, review your achievements,
              and keep moving forward.
            </p>

            <div style={{ marginTop: 16, color: "#a8b3c7" }}>
              📅 Today: <strong>{formattedDate}</strong>
            </div>
          </div>

          <div className="lp-overall-card">
            <div className="lp-overall-heading">
              <span>OVERALL COMPLETION</span>
              <span className="lp-overall-symbol">↗</span>
            </div>

            <div className="lp-overall-value">
              {overallProgress}<small>%</small>
            </div>

            <div className="lp-track">
              <div style={{ width: `${overallProgress}%` }} />
            </div>

            <div className="lp-overall-foot">
              <span>{completedTopics} completed</span>
              <span>{history.length} total topics</span>
            </div>
          </div>
        </section>

        <section className="lp-stats">
          <article className="lp-stat-card">
            <div className="lp-stat-icon lp-blue">▤</div>
            <div>
              <span>Topics explored</span>
              <strong>{history.length}</strong>
              <small>Saved in your library</small>
            </div>
          </article>

          <article className="lp-stat-card">
            <div className="lp-stat-icon lp-green">✓</div>
            <div>
              <span>Completed topics</span>
              <strong>{completedTopics}</strong>
              <small>{inProgressTopics} still in progress</small>
            </div>
          </article>

          <article className="lp-stat-card">
            <div className="lp-stat-icon lp-purple">◎</div>
            <div>
              <span>Average quiz score</span>
              <strong>
                {averageQuizScore === null
                  ? "—"
                  : `${averageQuizScore}%`}
              </strong>
              <small>
                {averageQuizScore === null
                  ? "Attempt a quiz to see your score"
                  : "Across recorded quiz scores"}
              </small>
            </div>
          </article>
        </section>

        <section className="lp-streak-layout">
          <article className="lp-panel lp-streak-panel">
            <div className="lp-panel-heading">
              <div>
                <span className="lp-kicker">STAY CONSISTENT</span>
                <h2>Your learning streak</h2>
              </div>
              <div className="lp-flame">🔥</div>
            </div>

            <div className="lp-streak-number">
              <strong>{currentStreak}</strong>
              <div>
                <span>
                  {currentStreak === 1 ? "day streak" : "day streak"}
                </span>
                <small>Consecutive learning days</small>
              </div>
            </div>

            <div className="lp-week-title">
              <span>WEEKLY SNAPSHOT</span>
              <span>{activeDaysThisWeek}/6 active days</span>
            </div>

            <div className="lp-week-strip">
              {weekDays.map((day) => (
                <div
                  key={day.key}
                  className={[
                    "lp-week-day",
                    day.active ? "is-active" : "",
                    day.today ? "is-today" : "",
                    day.future ? "is-future" : "",
                  ].join(" ")}
                  title={`${day.label}, ${day.key}`}
                >
                  <span className="lp-day-label">
                    {day.label}
                  </span>
                  <span className="lp-day-number">
                    {day.number}
                  </span>
                  <span className="lp-day-check">
                    {day.active ? "✓" : "·"}
                  </span>
                </div>
              ))}
            </div>

            <p className="lp-streak-note">
              Complete learning activity to record a day.
              Visiting this page alone does not increase your streak.
            </p>
          </article>

          <article className="lp-panel lp-record-panel">
            <span className="lp-kicker">YOUR CONSISTENCY</span>
            <h2>Keep your momentum</h2>

            <div className="lp-record-row">
              <div className="lp-record-icon">↗</div>
              <div>
                <span>Longest streak</span>
                <small>Your best consecutive run</small>
              </div>
              <strong>
                {longestStreak} <small>days</small>
              </strong>
            </div>

            <div className="lp-record-row">
              <div className="lp-record-icon">▦</div>
              <div>
                <span>This week</span>
                <small>Active days, Monday–Saturday</small>
              </div>
              <strong>
                {activeDaysThisWeek}<small>/6</small>
              </strong>
            </div>

            <div className="lp-record-row">
              <div className="lp-record-icon">🎯</div>
              <div>
                <span>Weekly goal</span>
                <small>Target learning days</small>
              </div>
              <select
                value={weeklyGoal}
                onChange={(event) =>
                  saveWeeklyGoal(event.target.value)
                }
                aria-label="Weekly learning goal"
                style={{
                  background: "#111827",
                  color: "#fff",
                  border: "1px solid #344155",
                  borderRadius: 8,
                  padding: "7px 10px",
                }}
              >
                {[3, 4, 5, 6].map((goal) => (
                  <option key={goal} value={goal}>
                    {goal} days
                  </option>
                ))}
              </select>
            </div>

            <div className="lp-track">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    (activeDaysThisWeek / weeklyGoal) * 100
                  )}%`,
                }}
              />
            </div>

            <p className="lp-streak-note">
              {activeDaysThisWeek >= weeklyGoal
                ? "Weekly goal achieved. Excellent work!"
                : `${Math.max(
                    0,
                    weeklyGoal - activeDaysThisWeek
                  )} more active day(s) to reach your goal.`}
            </p>

            <div className="lp-motivation">
              <span className="lp-motivation-dot" />
              <p>
                {currentStreak === 0
                  ? "Start today. Small steps build strong habits."
                  : currentStreak < 3
                  ? "Nice start. Keep learning consistently."
                  : "Great consistency. Keep moving forward."}
              </p>
            </div>
          </article>
        </section>

        <section className="lp-panel" style={{ marginTop: 24 }}>
          <div className="lp-history-heading">
            <div>
              <span className="lp-kicker">MONTHLY OVERVIEW</span>
              <h2>{formattedMonth}</h2>
              <p>Your recorded learning days at a glance.</p>
            </div>
            <span className="lp-history-count">
              {activeDates.filter((date) =>
                date.startsWith(
                  `${today.getFullYear()}-${String(
                    today.getMonth() + 1
                  ).padStart(2, "0")}`
                )
              ).length}{" "}
              ACTIVE DAYS
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: 8,
              marginTop: 20,
            }}
          >
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
              (day) => (
                <div
                  key={day}
                  style={{
                    textAlign: "center",
                    color: "#9aa8bc",
                    fontSize: 11,
                    padding: 6,
                  }}
                >
                  {day}
                </div>
              )
            )}

            {monthDays.map((day, index) =>
              day ? (
                <div
                  key={day.key}
                  title={day.key}
                  style={{
                    minHeight: 44,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    borderRadius: 10,
                    background: day.active
                      ? "rgba(16,185,129,0.18)"
                      : "rgba(148,163,184,0.06)",
                    border: day.today
                      ? "1px solid #60a5fa"
                      : "1px solid rgba(148,163,184,0.12)",
                    color: day.future ? "#566276" : "#e2e8f0",
                  }}
                >
                  <span>{day.number}</span>
                  <span
                    style={{
                      fontSize: 10,
                      color: day.active ? "#34d399" : "transparent",
                    }}
                  >
                    ✓
                  </span>
                </div>
              ) : (
                <div key={`blank-${index}`} />
              )
            )}
          </div>
        </section>

        <section className="lp-panel" style={{ marginTop: 24 }}>
          <div className="lp-history-heading">
            <div>
              <span className="lp-kicker">MILESTONES</span>
              <h2>Your achievements</h2>
              <p>Keep learning to unlock new milestones.</p>
            </div>
          </div>

          <div className="lp-history-grid" style={{ marginTop: 20 }}>
            {achievements.map((achievement) => (
              <article
                className="lp-history-card"
                key={achievement.title}
                style={{
                  opacity: achievement.unlocked ? 1 : 0.65,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>
                  {achievement.icon}
                </div>
                <h3>{achievement.title}</h3>
                <p style={{ color: "#9aa8bc", fontSize: 13 }}>
                  {achievement.description}
                </p>
                <span
                  className={`lp-status ${
                    achievement.unlocked ? "complete" : "ongoing"
                  }`}
                >
                  <span />
                  {achievement.unlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-history-section">
          <div className="lp-history-heading">
            <div>
              <span className="lp-kicker">YOUR LEARNING JOURNEY</span>
              <h2>Learning history</h2>
              <p>Revisit topics and see your saved progress.</p>
            </div>
            <span className="lp-history-count">
              {filteredHistory.length} TOPICS
            </span>
          </div>

          <div className="lp-history-toolbar">
            <label className="lp-search">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search learning history..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>

            <div className="lp-filters">
              {["All", "In Progress", "Completed"].map((option) => (
                <button
                  key={option}
                  className={filter === option ? "active" : ""}
                  onClick={() => setFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="lp-empty">
              <div>LS</div>
              <h3>
                {history.length === 0
                  ? "Your history starts here"
                  : "No matching topics"}
              </h3>
              <p>
                {history.length === 0
                  ? "Your saved learning progress will appear here when recorded."
                  : "Try another search or choose a different filter."}
              </p>

              {history.length === 0 && (
                <button onClick={() => navigate("/dashboard")}>
                  Start learning →
                </button>
              )}
            </div>
          ) : (
            <div className="lp-history-grid">
              {filteredHistory.map((item, index) => {
                const topic = getTopic(item);
                const progress = Math.min(
                  100,
                  Math.max(0, Number(item.progress) || 0)
                );
                const completed = isCompleted(item);
                const quizScore = item.quizScore;

                return (
                  <article
                    className="lp-history-card"
                    key={item.id || `${topic}-${index}`}
                  >
                    <div className="lp-history-card-top">
                      <span className="lp-history-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span
                        className={`lp-status ${
                          completed ? "complete" : "ongoing"
                        }`}
                      >
                        <span />
                        {completed ? "COMPLETED" : "IN PROGRESS"}
                      </span>
                    </div>

                    <h3 title={topic}>{topic}</h3>

                    <div className="lp-history-progress-label">
                      <span>Course progress</span>
                      <strong>{progress}%</strong>
                    </div>

                    <div className="lp-track lp-history-track">
                      <div
                        className={completed ? "complete-fill" : ""}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="lp-history-meta">
                      <span>Quiz score</span>
                      <strong>
                        {quizScore !== null &&
                        quizScore !== undefined &&
                        quizScore !== ""
                          ? `${quizScore}%`
                          : "Not attempted"}
                      </strong>
                    </div>

                    <button
                      className="lp-review-button"
                      onClick={() => openTopic(item)}
                    >
                      {completed
                        ? "Review topic"
                        : "Continue learning"}
                      <span>↗</span>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="lp-footer">
          <span>LEARNSPHERE</span>
          <span>Consistency today. Progress tomorrow.</span>
        </footer>
      </main>
    </div>
  );
}
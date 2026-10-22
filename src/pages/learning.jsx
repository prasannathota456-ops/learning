
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyLearning.css";

export default function MyLearning() {
  const navigate = useNavigate();

  const loadHistory = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("learningHistory") || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.error("Learning history error:", error);
      return [];
    }
  };

  const [history, setHistory] = useState(loadHistory);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // LOAD HISTORY
  useEffect(() => {
    const refreshHistory = () => {
      setHistory(loadHistory());
    };

    window.addEventListener("storage", refreshHistory);
    window.addEventListener("focus", refreshHistory);

    return () => {
      window.removeEventListener("storage", refreshHistory);
      window.removeEventListener("focus", refreshHistory);
    };
  }, []);

  // DELETE TOPIC
  const deleteTopic = (originalIndex) => {
    const topic = history[originalIndex];

    if (!topic) {
      alert("Topic not found. Please refresh the page.");
      return;
    }

    const topicName =
      topic.topic || topic.name || "Untitled Topic";

    const confirmed = window.confirm(
      `Are you sure you want to delete "${topicName}"?`
    );

    if (!confirmed) return;

    try {
      // Read the latest history from localStorage
      const latestHistory = loadHistory();

      // Identify the selected record using its original position
      if (originalIndex < 0 || originalIndex >= latestHistory.length) {
        alert("History changed. Please refresh and try again.");
        setHistory(latestHistory);
        return;
      }

      // Remove only the selected topic
      const updatedHistory = latestHistory.filter(
        (_, index) => index !== originalIndex
      );

      // Save updated history
      localStorage.setItem(
        "learningHistory",
        JSON.stringify(updatedHistory)
      );

      // Update the page immediately
      setHistory(updatedHistory);

      alert("Topic deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Unable to delete topic. Please try again.");
    }
  };

  // SEARCH + FILTER
  const filteredTopics = history
    .map((item, originalIndex) => ({
      ...item,
      originalIndex,
    }))
    .filter((item) => {
      const topicName = String(
        item.topic || item.name || ""
      );

      const matchesSearch = topicName
        .toLowerCase()
        .includes(search.toLowerCase());

      const progress = Number(item.progress) || 0;

      let matchesFilter = true;

      if (filter === "Completed") {
        matchesFilter =
          progress >= 100 || item.status === "Completed";
      }

      if (filter === "In Progress") {
        matchesFilter =
          progress < 100 && item.status !== "Completed";
      }

      return matchesSearch && matchesFilter;
    });

  // CONTINUE LEARNING
  const continueLearning = (item) => {
    navigate("/dashboard", {
      state: {
        resumeTopic:
          item.topic || item.name || "Learning",
        resumeLesson: item.lesson || null,
      },
    });
  };

  // TOPIC ICON
  const getTopicIcon = (topic) => {
    const value = topic.toLowerCase();

    if (value.includes("python")) return "🐍";
    if (value.includes("java")) return "☕";
    if (value.includes("sql")) return "🗄️";
    if (value.includes("javascript")) return "JS";
    if (value.includes("data")) return "📊";
    if (value.includes("html")) return "🌐";
    if (value.includes("css")) return "🎨";

    return "📚";
  };

  return (
    <div className="my-learning-page">
      {/* HEADER */}
      <header className="my-learning-header">
        <button
          className="back-dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <div className="my-learning-brand">
          <div className="brand-logo">L</div>

          <div>
            <h2>LearnSphere</h2>
            <span>My Learning</span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="my-learning-main">
        <section className="my-learning-title">
          <p>YOUR LEARNING LIBRARY</p>
          <h1>My Learning</h1>
          <span>
            All your learning topics are saved here automatically.
          </span>
        </section>

        {/* SEARCH + FILTER */}
        <section className="learning-toolbar">
          <div className="search-box">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search your topics..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="filter-buttons">
            {["All", "In Progress", "Completed"].map(
              (option) => (
                <button
                  key={option}
                  className={
                    filter === option ? "active" : ""
                  }
                  onClick={() => setFilter(option)}
                >
                  {option}
                </button>
              )
            )}
          </div>
        </section>

        {/* LEARNING LIST */}
        <section className="learning-list">
          {filteredTopics.length === 0 ? (
            <div className="empty-learning">
              <div>📚</div>

              <h2>No learning topics found</h2>

              <p>
                {search
                  ? `No results for "${search}"`
                  : "Start learning a topic from your dashboard."}
              </p>

              <button
                onClick={() => navigate("/dashboard")}
              >
                Start Learning →
              </button>
            </div>
          ) : (
            filteredTopics.map((item) => {
              const topic =
                item.topic || item.name || "Untitled Topic";

              const progress = Math.min(
                100,
                Math.max(0, Number(item.progress) || 0)
              );

              const completed =
                progress >= 100 ||
                item.status === "Completed";

              const quizScore = item.quizScore;

              return (
                <article
                  className="learning-card"
                  key={
                    item.id ||
                    `${topic}-${item.originalIndex}`
                  }
                >
                  <div className="topic-icon">
                    {getTopicIcon(topic)}
                  </div>

                  <div className="topic-content">
                    <div className="topic-header">
                      <div>
                        <span
                          className={
                            completed
                              ? "status completed"
                              : "status progress"
                          }
                        >
                          {completed
                            ? "COMPLETED"
                            : "IN PROGRESS"}
                        </span>

                        <h2>{topic}</h2>
                      </div>

                      <strong className="percentage">
                        {progress}%
                      </strong>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="topic-progress">
                      <div
                        className="topic-progress-fill"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    {/* QUIZ + ACTIONS */}
                    <div className="topic-bottom">
                      <p>
                        Quiz Score:{" "}
                        <strong>
                          {quizScore !== null &&
                          quizScore !== undefined
                            ? `${quizScore}%`
                            : "Not attempted"}
                        </strong>
                      </p>

                      <div className="learning-actions">
                        <button
                          className="continue-learning-btn"
                          onClick={() =>
                            continueLearning(item)
                          }
                        >
                          {completed ? "Review" : "Continue"} →
                        </button>

                        <button
                          type="button"
                          className="delete-learning-btn"
                          onClick={() =>
                            deleteTopic(item.originalIndex)
                          }
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}

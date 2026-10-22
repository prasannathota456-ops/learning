
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyLearning.css";
import { deleteLesson } from "../services/api";

export default function MyLearning() {
  const navigate = useNavigate();

  const [history, setHistory] = useState(() => {
    try {
      const savedHistory = JSON.parse(
        localStorage.getItem("learningHistory") || "[]"
      );

      return Array.isArray(savedHistory) ? savedHistory : [];
    } catch (error) {
      console.error("Learning history error:", error);
      return [];
    }
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // LOAD LEARNING HISTORY
  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedHistory = JSON.parse(
          localStorage.getItem("learningHistory") || "[]"
        );

        setHistory(
          Array.isArray(savedHistory) ? savedHistory : []
        );
      } catch (error) {
        console.error("Learning history error:", error);
        setHistory([]);
      }
    };

    window.addEventListener("storage", loadHistory);
    window.addEventListener("focus", loadHistory);

    return () => {
      window.removeEventListener("storage", loadHistory);
      window.removeEventListener("focus", loadHistory);
    };
  }, []);

  // DELETE A TOPIC
  // DELETE A TOPIC FROM MONGODB AND LOCAL HISTORY
const deleteTopic = async (item, index) => {
  const topic = item.topic || item.name || "Untitled Topic";

  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${topic}" from your learning history?`
  );

  if (!confirmDelete) return;

  // MongoDB ID is required for deleting a database lesson.
  const mongoId = item.mongoId || item.lesson?._id;

  if (!mongoId) {
    alert(
      "This topic has no saved database ID. Generate this lesson again, then try deleting it."
    );
    return;
  }

  try {
    const { response, data } = await deleteLesson(mongoId);

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to delete this lesson."
      );
    }

    // Remove the topic locally only after MongoDB confirms deletion.
    const updatedHistory = history.filter(
      (_, currentIndex) => currentIndex !== index
    );

    localStorage.setItem(
      "learningHistory",
      JSON.stringify(updatedHistory)
    );

    setHistory(updatedHistory);

    alert("Topic deleted successfully!");
  } catch (error) {
    console.error("Delete Topic Error:", error);

    alert(
      error.message ||
        "Unable to delete the topic. Please try again."
    );
  }
};
  // SEARCH + FILTER
  const filteredTopics = history
    .map((item, originalIndex) => ({
      ...item,
      originalIndex,
    }))
    .filter((item) => {
      const topicName = item.topic || item.name || "";
      const matchesSearch = topicName
        .toLowerCase()
        .includes(search.toLowerCase());

      let matchesFilter = true;

      if (filter === "Completed") {
        matchesFilter =
          Number(item.progress) >= 100 ||
          item.status === "Completed";
      }

      if (filter === "In Progress") {
        matchesFilter =
          Number(item.progress || 0) < 100 &&
          item.status !== "Completed";
      }

      return matchesSearch && matchesFilter;
    });

  // CONTINUE LEARNING
  const continueLearning = (item) => {
    const topic = item.topic || item.name || "Learning";

    navigate("/dashboard", {
      state: {
        resumeTopic: topic,
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
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="filter-buttons">
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

              <button onClick={() => navigate("/dashboard")}>
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

              const quizScore = item.quizScore;

              const completed =
                progress >= 100 || item.status === "Completed";

              return (
                <article
                  className="learning-card"
                  key={
                    item.id ||
                    `${topic}-${item.originalIndex}`
                  }
                >
                  {/* ICON */}
                  <div className="topic-icon">
                    {getTopicIcon(topic)}
                  </div>

                  {/* CONTENT */}
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
                          {completed ? "COMPLETED" : "IN PROGRESS"}
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
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* BOTTOM */}
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
                          onClick={() => continueLearning(item)}
                        >
                          {completed ? "Review" : "Continue"} →
                        </button>

                        <button
                          className="delete-learning-btn"
                          onClick={() =>
                            deleteTopic(item, item.originalIndex)
                          }
                          title={`Delete ${topic}`}
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

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="welcome-page">

      <div className="welcome-bg"></div>

      <div className="welcome-overlay"></div>

      <section className="welcome-content">

        <div className="welcome-tag">
          WELCOME
        </div>

        <h1>
          LEARNING
        </h1>

        <div className="welcome-divider"></div>

        <p>
          DISCOVER • GROW • ACHIEVE
        </p>

      </section>

      <div className="welcome-footer">
        <span></span>

        <small>
          YOUR JOURNEY STARTS HERE
        </small>

        <span></span>
      </div>

    </main>
  );
}
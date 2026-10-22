
import { useState } from "react";
import {
  loginUser,
  registerUser,
  resetPassword,
} from "../services/api";

export default function Auth() {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setName("");
    setEmail("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    clearMessage();
  };

  // REGISTER
  const handleRegister = async (event) => {
    event.preventDefault();
    clearMessage();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      showMessage("Please enter your full name.", "error");
      return;
    }

    if (password.length < 6) {
      showMessage(
        "Password must contain at least 6 characters.",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const { response, data } = await registerUser({
          name: cleanName,
          email: cleanEmail,
          password,
      });

      if (!response.ok) {
        showMessage(data.message || "Registration failed.", "error");
        return;
      }

      showMessage(
        data.message || "Account created successfully. Please login.",
        "success"
      );

      setTimeout(() => {
        setMode("login");
        setName("");
        setEmail(cleanEmail);
        setPassword("");
        clearMessage();
      }, 1200);
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      showMessage(
        "Cannot connect to the server. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const handleLogin = async (event) => {
    event.preventDefault();
    clearMessage();
    setLoading(true);

    try {
      const { response, data } = await loginUser({
          email: email.trim().toLowerCase(),
          password,
      });

      if (!response.ok) {
        showMessage(
          data.message || "Wrong email or password.",
          "error"
        );
        return;
      }

      // Save the name and details returned by MongoDB backend.
      if (!data.user || !data.user.name) {
        showMessage(
          "User name was not returned by the server. Check the backend login route.",
          "error"
        );
        return;
      }

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        })
      );

      showMessage("Login successful.", "success");

      setTimeout(() => {
        window.location.href = "/avatar";
      }, 800);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      showMessage(
        "Cannot connect to the server. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // RESET PASSWORD
  const handleForgotPassword = async (event) => {
    event.preventDefault();
    clearMessage();

    if (newPassword.length < 6) {
      showMessage(
        "New password must contain at least 6 characters.",
        "error"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(
        "New password and confirm password do not match.",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const { response, data } = await resetPassword({
          email: email.trim().toLowerCase(),
          newPassword,
          confirmPassword,
      });

      if (!response.ok) {
        showMessage(
          data.message || "Password reset failed.",
          "error"
        );
        return;
      }

      showMessage(
        data.message || "Password updated successfully. Please login.",
        "success"
      );

      setPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setMode("login");
        clearMessage();
      }, 1200);
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);
      showMessage(
        "Cannot connect to the server. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-bg"></div>
      <div className="auth-overlay"></div>

      <div className="auth-layout">
        <section className="auth-intro">
          <div className="intro-label">
            {mode === "login"
              ? "WELCOME BACK"
              : mode === "register"
              ? "GET STARTED"
              : "ACCOUNT RECOVERY"}
          </div>

          <h1>
            {mode === "login" && (
              <>
                Continue your
                <br />
                <strong>journey.</strong>
              </>
            )}

            {mode === "register" && (
              <>
                Start your
                <br />
                <strong>journey.</strong>
              </>
            )}

            {mode === "forgot" && (
              <>
                Reset your
                <br />
                <strong>password.</strong>
              </>
            )}
          </h1>

          <p>Learn. Explore. Grow.</p>
          <div className="intro-line"></div>
        </section>

        <section className="auth-card">
          {mode !== "forgot" && (
            <div className="auth-tabs">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => switchMode("login")}
                type="button"
                disabled={loading}
              >
                LOGIN
              </button>

              <button
                className={mode === "register" ? "active" : ""}
                onClick={() => switchMode("register")}
                type="button"
                disabled={loading}
              >
                REGISTER
              </button>
            </div>
          )}

          {mode === "login" && (
            <>
              <div className="form-heading">
                <h2>Welcome back</h2>
                <p>Sign in to continue.</p>
              </div>

              {message && (
                <div
                  className={`auth-message ${
                    messageType === "error"
                      ? "error-message"
                      : "success-message"
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label>EMAIL</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>PASSWORD</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <div className="forgot-row">
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => switchMode("forgot")}
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  <span>{loading ? "PLEASE WAIT..." : "LOGIN"}</span>
                  <span>→</span>
                </button>
              </form>

              <div className="switch-text">
                Don't have an account?
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  disabled={loading}
                >
                  Create account
                </button>
              </div>
            </>
          )}

          {mode === "register" && (
            <>
              <div className="form-heading">
                <h2>Create account</h2>
                <p>Create your account to begin.</p>
              </div>

              {message && (
                <div
                  className={`auth-message ${
                    messageType === "error"
                      ? "error-message"
                      : "success-message"
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="input-group">
                  <label>FULL NAME</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>EMAIL</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>PASSWORD</label>
                  <input
                    type="password"
                    placeholder="Create your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  <span>
                    {loading ? "PLEASE WAIT..." : "CREATE ACCOUNT"}
                  </span>
                  <span>→</span>
                </button>
              </form>

              <div className="switch-text">
                Already have an account?
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  disabled={loading}
                >
                  Login
                </button>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div className="forgot-header">
                <button
                  type="button"
                  className="back-button"
                  onClick={() => switchMode("login")}
                  disabled={loading}
                >
                  ← Back to login
                </button>
              </div>

              <div className="form-heading">
                <h2>Reset password</h2>
                <p>
                  Enter your registered email and create a new password.
                </p>
              </div>

              {message && (
                <div
                  className={`auth-message ${
                    messageType === "error"
                      ? "error-message"
                      : "success-message"
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleForgotPassword}>
                <div className="input-group">
                  <label>REGISTERED EMAIL</label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>NEW PASSWORD</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    minLength={6}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>CONFIRM PASSWORD</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    minLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  <span>
                    {loading ? "PLEASE WAIT..." : "RESET PASSWORD"}
                  </span>
                  <span>→</span>
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

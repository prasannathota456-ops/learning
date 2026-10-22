import { useState } from "react";

function Signup({ goLogin }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = (e) => {

    e.preventDefault();

    setMessage("");

    if (!name || !email || !password) {
      setSuccess(false);
      setMessage("Please fill in all fields.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setSuccess(false);
      setMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setSuccess(false);
      setMessage("Password must be at least 6 characters.");
      return;
    }

    // Save registered user
    const user = {
      name: name,
      email: email,
      password: password
    };

    localStorage.setItem(
      "learningUser",
      JSON.stringify(user)
    );

    setSuccess(true);
    setMessage("Account created successfully!");

    // Go to login
    setTimeout(() => {
      goLogin();
    }, 1000);
  };

  return (
    <div className="auth-page">

      {/* Same background */}
      <div className="auth-background"></div>
      <div className="auth-overlay"></div>

      <div className="auth-container">

        {/* LEFT SIDE */}
        <div className="auth-intro">

          <div className="small-label">
            WELCOME
          </div>

          <h1>
            Begin your
            <br />
            <span>journey.</span>
          </h1>

          <p>
            A simple place to learn, explore and grow.
          </p>

          <div className="intro-line"></div>

        </div>

        {/* RIGHT CARD */}
        <div className="auth-card">

          {/* Tabs */}
          <div className="auth-tabs">

            <button onClick={goLogin}>
              Login
            </button>

            <button className="active">
              Register
            </button>

          </div>

          {/* Heading */}
          <div className="form-heading">

            <h2>Create account</h2>

            <p>
              Start your journey today.
            </p>

          </div>

          {/* Message */}
          {message && (
            <div
              className={`auth-message ${
                success
                  ? "success-message"
                  : "error-message"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleRegister}>

            {/* Name */}
            <div className="input-group">

              <label>Full name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

            </div>

            {/* Email */}
            <div className="input-group">

              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

            {/* Password */}
            <div className="input-group">

              <label>Password</label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>

            {/* Button */}
            <button
              type="submit"
              className="submit-button"
            >

              <strong>
                Create account
              </strong>

              <span>→</span>

            </button>

          </form>

          {/* Switch */}
          <div className="switch-text">

            Already have an account?

            <button onClick={goLogin}>
              Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Signup;
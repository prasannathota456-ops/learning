import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  /* ==============================
     REGISTER
  ============================== */

  const handleRegister = (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!name || !registerEmail || !registerPassword) {
      setMessage("Please fill in all fields.");
      setMessageType("error");
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(registerEmail)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    if (registerPassword.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      setMessageType("error");
      return;
    }

    const user = {
      name: name,
      email: registerEmail.toLowerCase().trim(),
      password: registerPassword,
    };

    localStorage.setItem(
      "learningUser",
      JSON.stringify(user)
    );

    setMessage(
      "Account created successfully. Please login."
    );
    setMessageType("success");

    setTimeout(() => {
      setActiveTab("login");

      setLoginEmail(registerEmail);
      setLoginPassword("");

      setMessage("");
      setMessageType("");
    }, 1200);
  };


  /* ==============================
     LOGIN
  ============================== */

  const handleLogin = (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    const savedUser =
      localStorage.getItem("learningUser");

    if (!savedUser) {
      setMessage(
        "No account found. Please create an account first."
      );
      setMessageType("error");
      return;
    }

    const user = JSON.parse(savedUser);

    const enteredEmail =
      loginEmail.toLowerCase().trim();

    if (
      enteredEmail === user.email &&
      loginPassword === user.password
    ) {
      setMessage("Login successful.");
      setMessageType("success");

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } else {
      setMessage(
        "Wrong credentials. Please check your email and password."
      );
      setMessageType("error");
    }
  };


  /* ==============================
     SWITCH TAB
  ============================== */

  const switchToRegister = () => {
    setActiveTab("register");
    setMessage("");
    setMessageType("");
  };

  const switchToLogin = () => {
    setActiveTab("login");
    setMessage("");
    setMessageType("");
  };


  return (
    <div className="auth-page">

      {/* Background */}
      <div className="auth-background"></div>

      {/* Overlay */}
      <div className="auth-overlay"></div>


      <div className="auth-container">

        {/* ==========================
            LEFT SIDE
        ========================== */}

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
            A simple place to learn,
            explore and grow.
          </p>

          <div className="intro-line"></div>

        </div>


        {/* ==========================
            AUTH CARD
        ========================== */}

        <div className="auth-card">

          {/* Tabs */}

          <div className="auth-tabs">

            <button
              type="button"
              className={
                activeTab === "login"
                  ? "active"
                  : ""
              }
              onClick={switchToLogin}
            >
              Login
            </button>

            <button
              type="button"
              className={
                activeTab === "register"
                  ? "active"
                  : ""
              }
              onClick={switchToRegister}
            >
              Register
            </button>

          </div>


          {/* ==========================
              MESSAGE
          ========================== */}

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


          {/* ==========================
              LOGIN FORM
          ========================== */}

          {activeTab === "login" && (

            <form onSubmit={handleLogin}>

              <div className="form-heading">

                <h2>
                  Welcome back
                </h2>

                <p>
                  Continue your learning journey.
                </p>

              </div>


              {/* Email */}

              <div className="input-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) =>
                    setLoginEmail(e.target.value)
                  }
                  required
                />

              </div>


              {/* Password */}

              <div className="input-group">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) =>
                    setLoginPassword(e.target.value)
                  }
                  required
                />

              </div>


              {/* Submit */}

              <button
                type="submit"
                className="submit-button"
              >

                <span>
                  Login
                </span>

                <span>
                  →
                </span>

              </button>


              <p className="switch-text">

                Don't have an account?

                <button
                  type="button"
                  onClick={switchToRegister}
                >
                  Register
                </button>

              </p>

            </form>

          )}


          {/* ==========================
              REGISTER FORM
          ========================== */}

          {activeTab === "register" && (

            <form onSubmit={handleRegister}>

              <div className="form-heading">

                <h2>
                  Create account
                </h2>

                <p>
                  Start your journey today.
                </p>

              </div>


              {/* Full Name */}

              <div className="input-group">

                <label>
                  Full name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />

              </div>


              {/* Email */}

              <div className="input-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={registerEmail}
                  onChange={(e) =>
                    setRegisterEmail(e.target.value)
                  }
                  required
                />

              </div>


              {/* Password */}

              <div className="input-group">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(e) =>
                    setRegisterPassword(e.target.value)
                  }
                  required
                />

              </div>


              {/* Create Account */}

              <button
                type="submit"
                className="submit-button"
              >

                <span>
                  Create account
                </span>

                <span>
                  →
                </span>

              </button>


              <p className="switch-text">

                Already have an account?

                <button
                  type="button"
                  onClick={switchToLogin}
                >
                  Login
                </button>

              </p>

            </form>

          )}

        </div>

      </div>

    </div>
  );
}
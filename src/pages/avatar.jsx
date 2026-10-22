import { useState } from "react";
import "./avatar.css";

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
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
  avatar10,
  avatar11,
  avatar12,
  avatar13,
  avatar14,
  avatar15,
  avatar16,
];

export default function Avatar() {
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  
 // Get logged-in user's name
const savedUser = JSON.parse(
  localStorage.getItem("loggedInUser") || "{}"
);

const userName = savedUser.name || "Learner";

  const handleContinue = () => {
    if (selectedAvatar === null) {
      return;
    }

    localStorage.setItem(
      "selectedAvatar",
      String(selectedAvatar + 1)
    );

    window.location.href = "/dashboard";
  };

  return (
    <div className="avatar-page">

      {/* Background */}
      <div className="avatar-background"></div>
      <div className="avatar-overlay"></div>

      {/* Header */}
      <div className="avatar-header">

        {/* USER NAME */}
        <div className="welcome-user">
          Welcome, <span>{userName}</span>
        </div>

        <h1>
          Choose Your <span>Avatar</span>
        </h1>

        <p>
          Select an avatar that represents you
        </p>

        <div className="avatar-line"></div>

      </div>

      {/* Main Card */}
      <div className="avatar-container">

        {/* Section Heading */}
        <div className="avatar-section-header">

          <div className="avatar-number">
            01
          </div>

          <div>
            <h2>
              Select your profile avatar
            </h2>

            <p>
              You can choose one avatar to personalize
              your learning profile.
            </p>
          </div>

        </div>

        <div className="avatar-divider"></div>

        {/* Avatar Grid */}
        <div className="avatar-grid">

          {avatars.map((avatar, index) => (
            <button
              key={index}
              type="button"
              className={`avatar-card ${
                selectedAvatar === index
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedAvatar(index)
              }
            >

              <img
                src={avatar}
                alt={`Avatar ${index + 1}`}
              />

              {selectedAvatar === index && (
                <div className="avatar-check">
                  ✓
                </div>
              )}

            </button>
          ))}

        </div>

        {/* Bottom */}
        <div className="avatar-footer">

          {selectedAvatar !== null && (
            <p className="selected-text">
              Avatar {selectedAvatar + 1} selected
            </p>
          )}

          <button
            type="button"
            className={`continue-button ${
              selectedAvatar === null
                ? "disabled"
                : ""
            }`}
            onClick={handleContinue}
            disabled={selectedAvatar === null}
          >
            Continue
            <span>→</span>
          </button>

        </div>

      </div>

    </div>
  );
}
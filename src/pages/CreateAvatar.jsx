import { useState } from "react";
import { useNavigate } from "react-router-dom";

const avatars = [
  ["#f2c6a5", "#241914", "#202b3b", "hoodie"],
  ["#e7ad87", "#3b211b", "#b98564", "long"],
  ["#a96b4d", "#171312", "#314b2f", "glasses"],
  ["#f0c09c", "#191515", "#7096b4", "bun"],
  ["#d9946d", "#48251b", "#9a5c32", "jacket"],
  ["#f0c3a1", "#211817", "#eee9df", "long"],
  ["#9b5e43", "#121111", "#24456c", "glasses"],
  ["#d99777", "#43241e", "#d67e9d", "ponytail"],
  ["#f0bd98", "#181514", "#f1f0e9", "short"],
  ["#d28d68", "#2a1916", "#b88732", "glasses"],

  ["#a9684c", "#171313", "#365477", "glasses"],
  ["#e6ae88", "#43261f", "#eeeae1", "long"],
  ["#89513a", "#111111", "#4c713e", "curly"],
  ["#d99a78", "#281917", "#282c39", "long"],
  ["#bd7957", "#151313", "#171b22", "short"],
  ["#efba93", "#3a211b", "#7194ae", "glasses"],
  ["#a9674a", "#111111", "#526e45", "curly"],
  ["#e2a57f", "#39221d", "#30495f", "long"],
  ["#b97855", "#151313", "#343942", "short"],
  ["#edb790", "#3a241e", "#c4b092", "glasses"]
];

function Character({ data }) {
  const [skin, hair, shirt, style] = data;

  return (
    <svg
      viewBox="0 0 180 210"
      className="character-svg"
    >
      {/* BODY */}
      <path
        d="M22 210 C24 157 45 132 90 132 C135 132 156 157 158 210Z"
        fill={shirt}
      />

      {/* SHOULDERS LIGHT */}
      <path
        d="M25 181 Q48 148 90 148 Q132 148 155 181"
        fill="none"
        stroke="rgba(255,255,255,.10)"
        strokeWidth="5"
      />

      {/* NECK */}
      <path
        d="M67 113 L67 143 Q90 160 113 143 L113 113"
        fill={skin}
      />

      {/* EARS */}
      <ellipse cx="51" cy="83" rx="10" ry="14" fill={skin} />
      <ellipse cx="129" cy="83" rx="10" ry="14" fill={skin} />

      {/* FACE */}
      <path
        d="M52 72
           Q53 38 90 36
           Q127 38 128 72
           L124 105
           Q115 132 90 137
           Q65 132 56 105Z"
        fill={skin}
      />

      {/* HAIR */}
      {style === "long" && (
        <>
          <path
            d="M48 88
               Q38 39 65 25
               Q90 9 117 27
               Q143 45 132 91
               L125 126
               Q119 143 109 149
               L108 92
               Q101 63 90 57
               Q72 63 57 93Z"
            fill={hair}
          />
          <path
            d="M51 78 Q60 45 89 43 Q117 44 128 78"
            fill="none"
            stroke={hair}
            strokeWidth="15"
            strokeLinecap="round"
          />
        </>
      )}

      {style === "short" && (
        <path
          d="M49 75
             Q42 38 66 24
             Q91 9 115 25
             Q139 40 130 76
             Q121 53 109 49
             Q91 57 72 47
             Q59 52 49 75Z"
          fill={hair}
        />
      )}

      {style === "bun" && (
        <>
          <circle cx="90" cy="19" r="18" fill={hair} />
          <path
            d="M48 81 Q42 38 65 25 Q90 10 116 28 Q140 46 130 82
               Q120 55 108 48 Q91 57 72 48 Q58 54 48 81Z"
            fill={hair}
          />
        </>
      )}

      {style === "ponytail" && (
        <>
          <circle cx="132" cy="42" r="20" fill={hair} />
          <path
            d="M47 82 Q40 39 65 25 Q91 10 117 28 Q139 47 130 82
               Q120 54 108 48 Q91 56 72 48 Q58 54 47 82Z"
            fill={hair}
          />
        </>
      )}

      {style === "curly" && (
        <>
          {[
            [52, 48], [65, 32], [82, 27], [100, 27],
            [117, 34], [128, 51], [60, 35], [110, 44]
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="13"
              fill={hair}
            />
          ))}
        </>
      )}

      {style === "hoodie" && (
        <path
          d="M48 79
             Q42 39 65 25
             Q91 10 116 28
             Q139 45 130 79
             Q118 53 107 48
             Q91 56 72 48
             Q58 54 48 79Z"
          fill={hair}
        />
      )}

      {style === "glasses" && (
        <path
          d="M48 79
             Q42 39 66 25
             Q91 10 116 28
             Q140 46 130 79
             Q118 53 107 48
             Q91 56 72 48
             Q58 54 48 79Z"
          fill={hair}
        />
      )}

      {/* EYEBROWS */}
      <path
        d="M61 72 Q72 65 81 71"
        fill="none"
        stroke={hair}
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M99 71 Q109 65 119 72"
        fill="none"
        stroke={hair}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* EYES */}
      <ellipse cx="71" cy="83" rx="5" ry="6" fill="#171515" />
      <ellipse cx="109" cy="83" rx="5" ry="6" fill="#171515" />

      <circle cx="72.5" cy="81" r="1.5" fill="white" />
      <circle cx="110.5" cy="81" r="1.5" fill="white" />

      {/* NOSE */}
      <path
        d="M90 84 L85 101 Q90 105 95 101"
        fill="none"
        stroke="#a96952"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* SMILE */}
      <path
        d="M77 113 Q90 123 103 113"
        fill="none"
        stroke="#743d39"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* CHEEKS */}
      <ellipse
        cx="62"
        cy="103"
        rx="7"
        ry="4"
        fill="#e79b86"
        opacity=".25"
      />

      <ellipse
        cx="118"
        cy="103"
        rx="7"
        ry="4"
        fill="#e79b86"
        opacity=".25"
      />

      {/* GLASSES */}
      {style === "glasses" && (
        <>
          <rect
            x="54"
            y="73"
            width="32"
            height="24"
            rx="9"
            fill="rgba(255,255,255,.05)"
            stroke="#25272b"
            strokeWidth="4"
          />

          <rect
            x="94"
            y="73"
            width="32"
            height="24"
            rx="9"
            fill="rgba(255,255,255,.05)"
            stroke="#25272b"
            strokeWidth="4"
          />

          <path
            d="M86 81 L94 81"
            stroke="#25272b"
            strokeWidth="4"
          />
        </>
      )}

      {/* HOODIE STRINGS */}
      {style === "hoodie" && (
        <>
          <path
            d="M76 147 L72 175"
            stroke="#d9d9d9"
            strokeWidth="3"
          />
          <path
            d="M104 147 L108 175"
            stroke="#d9d9d9"
            strokeWidth="3"
          />
          <circle cx="72" cy="176" r="4" fill="#e5c16b" />
          <circle cx="108" cy="176" r="4" fill="#e5c16b" />
        </>
      )}
    </svg>
  );
}

export default function Avatar() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (selected === null) return;

    localStorage.setItem(
      "selectedAvatar",
      JSON.stringify(avatars[selected])
    );

    navigate("/dashboard");
  };

  return (
    <main className="avatar-page">

      <div className="avatar-bg"></div>
      <div className="avatar-overlay"></div>

      <div className="avatar-container">

        <div className="avatar-header">
          <div className="avatar-label">
            PROFILE SETUP
          </div>

          <h1>
            Choose Your <span>Avatar</span>
          </h1>

          <p>
            Select an avatar that represents you
          </p>

          <div className="avatar-line"></div>
        </div>


        <section className="avatar-selection-card">

          <div className="selection-heading">

            <div className="selection-number">
              01
            </div>

            <div>
              <h2>
                Select your profile avatar
              </h2>

              <p>
                You can choose one avatar to personalize your learning profile.
              </p>
            </div>

          </div>


          <div className="avatar-grid">

            {avatars.map((avatar, index) => (
              <button
                key={index}
                type="button"
                className={
                  selected === index
                    ? "avatar-item selected"
                    : "avatar-item"
                }
                onClick={() => setSelected(index)}
              >

                <div className="avatar-circle">
                  <Character data={avatar} />
                </div>

                {selected === index && (
                  <div className="avatar-check">
                    ✓
                  </div>
                )}

              </button>
            ))}

          </div>


          <div className="avatar-footer">

            <div className="avatar-status">
              <span className="status-dot"></span>

              <span>
                {selected === null
                  ? "Choose an avatar to continue"
                  : "Avatar selected"}
              </span>
            </div>

            <button
              type="button"
              className={
                selected === null
                  ? "avatar-continue disabled"
                  : "avatar-continue"
              }
              disabled={selected === null}
              onClick={handleContinue}
            >
              <span>CONTINUE</span>
              <span className="continue-arrow">→</span>
            </button>

          </div>

        </section>

        <div className="avatar-bottom-text">
          YOUR LEARNING JOURNEY STARTS HERE
        </div>

      </div>

    </main>
  );
}
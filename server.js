
require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

console.log("SERVER STARTING...");
console.log(
  "GROQ API KEY:",
  process.env.GROQ_API_KEY ? "FOUND" : "NOT FOUND"
);
console.log(
  "MONGODB URI:",
  process.env.MONGODB_URI ? "FOUND" : "NOT FOUND"
);

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// =========================
// LESSON MODEL
// =========================

const lessonSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    language: { type: String, default: "en-US" },
    title: String,
    explanation: String,
    howItWorks: String,
    example: String,
    importantPoints: [String],
    summary: String,
  },
  {
    timestamps: true,
    collection: "lessons",
  }
);

const Lesson =
  mongoose.models.Lesson ||
  mongoose.model("Lesson", lessonSchema);

// =========================
// MONGODB CONNECTION
// =========================


let mongoConnectionPromise = null;

async function connectMongoDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log("MONGODB CONNECTED SUCCESSFULLY");
        console.log("DATABASE:", mongoose.connection.name);
        console.log("LESSON COLLECTION:", Lesson.collection.name);
      })
      .catch((error) => {
        mongoConnectionPromise = null;
        throw error;
      });
  }

  await mongoConnectionPromise;
}
// =========================
// DATABASE MIDDLEWARE
// =========================

async function checkDatabase(req, res, next) {
  try {
    await connectMongoDB();
    next();
  } catch (error) {
    console.error("DATABASE CONNECTION ERROR:", error.message);

    return res.status(503).json({
      success: false,
      message: "Database connection failed. Please try again.",
    });
  }
}

// =========================
// REGISTER API
// =========================

app.post("/api/auth/register", checkDatabase, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    console.log("USER REGISTERED:", newUser._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully. Please login.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

// =========================
// LOGIN API
// =========================

app.post("/api/auth/login", checkDatabase, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Wrong email or password.",
      });
    }

    console.log("USER LOGIN SUCCESS:", user._id);

    return res.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// =========================
// RESET PASSWORD API
// =========================

app.post(
  "/api/auth/reset-password",
  checkDatabase,
  async (req, res) => {
    try {
      const { email, newPassword, confirmPassword } = req.body;

      if (!email?.trim() || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Please fill all fields.",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must contain at least 6 characters.",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match.",
        });
      }

      const user = await User.findOne({
        email: email.trim().toLowerCase(),
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Email is not registered.",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      console.log("PASSWORD UPDATED:", user._id);

      return res.json({
        success: true,
        message: "Password updated successfully. Please login.",
      });
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error.message);

      return res.status(500).json({
        success: false,
        message: "Password reset failed. Please try again.",
      });
    }
  }
);

// =========================
// TEST BACKEND
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "LearnSphere Backend is Working",
    mongodb:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Not Connected",
    database: mongoose.connection.name || null,
  });
});

// =========================
// GENERATE AND SAVE LESSON
// ENGLISH / TELUGU / HINDI
// =========================

app.post("/api/learn", checkDatabase, async (req, res) => {
  try {
    const { topic, language = "en-US" } = req.body;

    if (typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({
        error: "Topic is required",
      });
    }

    const supportedLanguages = {
      "en-US": "English",
      "te-IN": "Telugu",
      "hi-IN": "Hindi",
    };

    const selectedLanguage =
      supportedLanguages[language] || "English";

    const validLanguage = supportedLanguages[language]
      ? language
      : "en-US";

    const cleanTopic = topic.trim();

    const languageInstruction = `
Write the entire lesson in ${selectedLanguage}.
The title, explanation, howItWorks, example, every important
point, and summary must all be in ${selectedLanguage}.
Keep the explanation clear and easy for a student to understand.
Use the selected language consistently.
Return valid JSON only.
`;

    console.log("GENERATING LESSON FOR:", cleanTopic);
    console.log("SELECTED LANGUAGE:", selectedLanguage);

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `
You are a professional educational AI tutor.
Explain topics clearly and simply.
Follow the language requested by the user.
Return valid JSON only.
`,
        },
        {
          role: "user",
          content: `
Create a learning lesson about "${cleanTopic}".

${languageInstruction}

Return ONLY valid JSON in this format:
{
  "title": "",
  "explanation": "",
  "howItWorks": "",
  "example": "",
  "importantPoints": [],
  "summary": ""
}

Rules:
- All lesson content must use ${selectedLanguage}.
- importantPoints must be an array of strings.
- Include useful examples.
- Do not include markdown or code fences.
`,
        },
      ],
    });

    const text = response.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Empty response from AI");
    }

    const cleanText = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const lesson = JSON.parse(cleanText);

    if (
      typeof lesson.title !== "string" ||
      typeof lesson.explanation !== "string" ||
      typeof lesson.howItWorks !== "string" ||
      typeof lesson.example !== "string" ||
      !Array.isArray(lesson.importantPoints) ||
      typeof lesson.summary !== "string"
    ) {
      throw new Error("AI returned an invalid lesson format");
    }

    const savedLesson = await Lesson.create({
      topic: cleanTopic,
      language: validLanguage,
      title: lesson.title,
      explanation: lesson.explanation,
      howItWorks: lesson.howItWorks,
      example: lesson.example,
      importantPoints: lesson.importantPoints,
      summary: lesson.summary,
    });

    console.log("LESSON SAVED SUCCESSFULLY:", {
      id: savedLesson._id.toString(),
      topic: savedLesson.topic,
      language: savedLesson.language,
      database: mongoose.connection.name,
      collection: Lesson.collection.name,
    });

    return res.status(201).json({
      ...lesson,
      _id: savedLesson._id,
      topic: savedLesson.topic,
      language: validLanguage,
      createdAt: savedLesson.createdAt,
      saved: true,
    });
  } catch (error) {
    console.error("LEARNING ERROR:", error.message);

    return res.status(500).json({
      error: "Failed to generate or save lesson",
      details: error.message,
    });
  }
});

// =========================
// GET ALL / SEARCH LESSONS
// =========================

app.get("/api/lessons", checkDatabase, async (req, res) => {
  try {
    const search = String(
      req.query.search || req.query.topic || ""
    ).trim();

    const filter = {};

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { topic: { $regex: escapedSearch, $options: "i" } },
        { title: { $regex: escapedSearch, $options: "i" } },
        { explanation: { $regex: escapedSearch, $options: "i" } },
        { summary: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const lessons = await Lesson.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    console.log(
      `LESSONS FETCHED: ${lessons.length}; SEARCH: ${search || "ALL"}`
    );

    return res.status(200).json(lessons);
  } catch (error) {
    console.error("FETCH LESSONS ERROR:", error.message);

    return res.status(500).json({
      error: "Failed to fetch lessons",
    });
  }
});
// =========================
// DELETE A SAVED LESSON
// =========================

app.delete("/api/lessons/:id", checkDatabase, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID.",
      });
    }

    const deletedLesson = await Lesson.findByIdAndDelete(id);

    if (!deletedLesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lesson deleted successfully.",
      id: deletedLesson._id.toString(),
    });
  } catch (error) {
    console.error("DELETE LESSON ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete lesson.",
    });
  }
});

// =========================
// GENERATE QUIZ
// =========================


app.post("/api/quiz", async (req, res) => {
  try {
    const { topic, language = "en-US" } = req.body;

    if (typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({
        error: "Topic is required",
      });
    }

    const supportedLanguages = {
      "en-US": "English",
      "te-IN": "Telugu",
      "hi-IN": "Hindi",
    };

    const selectedLanguage =
      supportedLanguages[language] || "English";

    console.log("GENERATING QUIZ FOR:", topic.trim());
    console.log("QUIZ LANGUAGE:", selectedLanguage);

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `
You are a professional educational quiz generator.
Generate quizzes in the language requested by the user.
Return valid JSON only.
`,
        },
        {
          role: "user",
          content: `
Create exactly 5 multiple-choice questions about "${topic.trim()}".

IMPORTANT LANGUAGE RULE:
Write the entire quiz in ${selectedLanguage}.

The following must all be in ${selectedLanguage}:
- Questions
- All four options for every question
- Correct answers
- Explanations

Return ONLY valid JSON in this format:
{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": "Exact correct option text",
      "explanation": "Explain why this answer is correct"
    }
  ]
}

Rules:
- Generate exactly 5 questions.
- Include exactly 4 options per question.
- Only one option must be correct.
- correctAnswer must exactly match one of the options.
- Keep the questions suitable for a student.
- Do not include markdown or code fences.
- Return valid JSON only.
`,
        },
      ],
    });

    const text = response.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Empty response from AI");
    }

    const cleanText = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const quiz = JSON.parse(cleanText);

    if (
      !Array.isArray(quiz.questions) ||
      quiz.questions.length !== 5
    ) {
      throw new Error("Quiz must contain exactly 5 questions");
    }

    const validatedQuestions = quiz.questions.map(
      (question, index) => {
        if (
          typeof question.question !== "string" ||
          !Array.isArray(question.options) ||
          question.options.length !== 4 ||
          !question.options.every(
            (option) => typeof option === "string"
          ) ||
          typeof question.correctAnswer !== "string" ||
          !question.options.some(
            (option) =>
              option.trim() === question.correctAnswer.trim()
          ) ||
          typeof question.explanation !== "string" ||
          !question.explanation.trim()
        ) {
          throw new Error(
            `Invalid question data at question ${index + 1}`
          );
        }

        const matchedAnswer = question.options.find(
          (option) =>
            option.trim() === question.correctAnswer.trim()
        );

        return {
          question: question.question,
          options: question.options,
          correctAnswer: matchedAnswer,
          explanation: question.explanation,
        };
      }
    );

    console.log("QUIZ GENERATED SUCCESSFULLY");

    return res.json({
      language: supportedLanguages[language]
        ? language
        : "en-US",
      questions: validatedQuestions,
    });
  } catch (error) {
    console.error("QUIZ ERROR:", error.message);

    return res.status(500).json({
      error: "Failed to generate quiz",
      details: error.message,
    });
  }
});

// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `LearnSphere Backend running on http://localhost:${PORT}`
    );
  });
}

module.exports = app;
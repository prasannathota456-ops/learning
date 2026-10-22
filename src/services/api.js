
const API_BASE_URL = "/api";

async function request(path, { method = "POST", body } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined && {
          "Content-Type": "application/json",
        }),
      },
      ...(body !== undefined && {
        body: JSON.stringify(body),
      }),
    });
  } catch (error) {
    console.error("API connection error:", error);

    throw new Error(
      "Cannot connect to server. Please check the deployed backend.",
      { cause: error }
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = {
      success: false,
      message: text || `Server returned status ${response.status}`,
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return { response, data };
}

// Register
export const registerUser = (user) =>
  request("/auth/register", { body: user });

// Login
export const loginUser = (credentials) =>
  request("/auth/login", { body: credentials });

// Reset password
export const resetPassword = (passwordDetails) =>
  request("/auth/reset-password", { body: passwordDetails });

// Generate lesson
export const generateLesson = (lessonRequest) =>
  request("/learn", { body: lessonRequest });

// Generate quiz
export const generateQuiz = (quizRequest) =>
  request("/quiz", { body: quizRequest });

// Get lessons
export const getLessons = () =>
  request("/lessons", { method: "GET" });

// Delete lesson
export const deleteLesson = (lessonId) =>
  request(`/lessons/${encodeURIComponent(lessonId)}`, {
    method: "DELETE",
  });

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Avatar from "./pages/avatar";
import Dashboard from "./pages/Dashboard";
import Learning from "./pages/learning";
import Quiz from "./pages/QuizGenarator";

import Achievements from "./pages/Achievements";
import Progress from "./pages/progress";
import MyLearning from "./pages/MyLearning";
import Games from "./pages/Games";
import LearningRewards from "./pages/LearningRewards";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Welcome />} />

        <Route path="/auth" element={<Auth />} />

        <Route path="/avatar" element={<Avatar />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/learning" element={<Learning />} />

        <Route path="/quiz" element={<Quiz />} />

        <Route
          path="/my-learning"
          element={<MyLearning />}
        />

        <Route
          path="/progress"
          element={<Progress />}
        />

        <Route
          path="/achievements"
          element={<Achievements />}
        />
        <Route path="/games" element={<Games />} />
        <Route path="/learning-rewards"
         element={<LearningRewards />} />

      </Routes>
    </BrowserRouter>
  );
}
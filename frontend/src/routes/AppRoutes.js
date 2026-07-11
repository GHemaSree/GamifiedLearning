import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Topics from "../pages/Topics/Topics";
import Trail from "../pages/Trail/Trail";
import Module from "../pages/Module/Module";
import Notes from "../pages/Notes/Notes";
import Quiz from "../pages/Quiz/Quiz";
import Score from "../pages/Score/Score";
import Progress from "../pages/Progress/Progress";
import Recommendations from "../pages/Recommendations/Recommendations";
import Profile from "../pages/Profile/Profile";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/topics"
        element={
          <ProtectedRoute>
            <Topics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trail/:trailId"
        element={
          <ProtectedRoute>
            <Trail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/module/:moduleId"
        element={
          <ProtectedRoute>
            <Module />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes/:moduleId"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:moduleId"
        element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/score"
        element={
          <ProtectedRoute>
            <Score />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default AppRoutes;
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Topics from "../pages/Topics/Topics";
import Trail from "../pages/Trail/Trail";
import Module from "../pages/Module/Module";
import Notes from "../pages/Notes/Notes";
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
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default AppRoutes;
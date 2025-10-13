import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Home from "./pages/private/Home";
import ProtectedRoute from "./components/Guard";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import Landing from "./pages/public/Landing";
import ResetPassword from "./pages/public/reset_password";
import Fingerspelling from "./pages/private/fingerspelling";
import Progress from "./pages/private/Progress";
import Settings from "./pages/private/Settings";

import PracticeAlpha from "./pages/private/PracticeAlpha";
import PracticeFree from "./pages/private/PracticeFree";
import About from "./pages/public/About";
import TestingPage from "./pages/testing";
import WOTDPractice from "./components/WOTDPractice";

function Logout() {
  localStorage.clear(); // clear access and register token
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/reset_password" element={<ResetPassword />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/about" element={<About />} />

        {/* if route not listed, redirect to 404 not Found */}
        <Route path="*" element={<NotFound />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/home/fingerspelling"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Fingerspelling />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Progress />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings></Settings>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fingerspelling/practice/:sign"
          element={
            <ProtectedRoute>
              <PracticeAlpha></PracticeAlpha>
            </ProtectedRoute>
          }
        />
        <Route
          path="/home/freepractice"
          element={
            <ProtectedRoute>
              <PracticeFree></PracticeFree>
            </ProtectedRoute>
          }
        />
        <Route
          path="/home/wotd"
          element={
            <ProtectedRoute>
              <WOTDPractice></WOTDPractice>
            </ProtectedRoute>
          }
        />
        <Route path="/testing" element={<TestingPage></TestingPage>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

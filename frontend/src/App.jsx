import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import AddWord from './pages/AddWord';
import MyWords from './pages/MyWords';
import History from './pages/History';
import Stats from './pages/Stats';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Layout wrapper that renders Navbar + child pages
const AppLayout = () => (
  <div className="min-h-screen bg-slate-900">
    <Navbar />
    <Outlet />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes — wrapped in Navbar layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddWord />} />
            <Route path="/words" element={<MyWords />} />
            <Route path="/history" element={<History />} />
            <Route path="/stats" element={<Stats />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

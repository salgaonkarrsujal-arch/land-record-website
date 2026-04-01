import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import ConfirmBookingPage from "./pages/ConfirmBookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import RoomOccupancyPage from "./pages/RoomOccupancyPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import UserBookingsPage from "./pages/UserBookingsPage";

function App() {
  const { isAdmin, isAuthenticated, isProfileComplete, loading } = useAuth();

  const rootElement = loading ? (
    <div className="page-message">Loading page...</div>
  ) : !isAuthenticated ? (
    <Navigate to="/login" replace />
  ) : isAdmin ? (
    <HomePage />
  ) : isProfileComplete ? (
    <HomePage />
  ) : (
    <Navigate to="/profile" replace />
  );

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={rootElement} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute adminOnly>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-booking"
            element={
              <ProtectedRoute adminOnly>
                <ConfirmBookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room-occupancy"
            element={
              <ProtectedRoute adminOnly>
                <RoomOccupancyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                {isAdmin ? <Navigate to="/" replace /> : <ProfilePage />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                {isAdmin ? <Navigate to="/bookings" replace /> : <UserBookingsPage />}
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

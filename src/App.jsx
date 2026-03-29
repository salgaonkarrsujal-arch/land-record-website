import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import ListingsPage from "./pages/ListingsPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import ConfirmBookingPage from "./pages/ConfirmBookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import LoginPage from "./pages/LoginPage";
import UserBookingsPage from "./pages/UserBookingsPage";
import ProfilePage from "./pages/ProfilePage";

function UserOnlyRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="page-message">Loading page...</div>;
  }

  if (isAdmin) {
    return <Navigate to="/bookings" replace />;
  }

  return children;
}

function App() {
  const location = useLocation();
  const { isAdmin, isAuthenticated, loading } = useAuth();
  const hideChrome = !loading && !isAuthenticated && location.pathname === "/login";

  const rootElement = loading ? (
    <div className="page-message">Loading page...</div>
  ) : isAuthenticated ? (
    isAdmin ? <Navigate to="/bookings" replace /> : <HomePage />
  ) : (
    <Navigate to="/login" replace />
  );

  return (
    <div className="app-shell">
      {!hideChrome ? <Navbar /> : null}
      <main className="page-content">
        <Routes>
          <Route path="/" element={rootElement} />
          <Route
            path="/explore"
            element={
              <UserOnlyRoute>
                <ListingsPage />
              </UserOnlyRoute>
            }
          />
          <Route
            path="/room-details"
            element={
              <UserOnlyRoute>
                <RoomDetailPage />
              </UserOnlyRoute>
            }
          />
          <Route
            path="/confirm-booking"
            element={
              <ProtectedRoute>
                <UserOnlyRoute>
                  <ConfirmBookingPage />
                </UserOnlyRoute>
              </ProtectedRoute>
            }
          />
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
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <UserOnlyRoute>
                  <UserBookingsPage />
                </UserOnlyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!hideChrome ? <Footer /> : null}
    </div>
  );
}

export default App;

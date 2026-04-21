import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import RoleSelection from "@/pages/RoleSelection";
import Appointments from "@/pages/Appointments";

import PatientDashboard from "@/pages/patient/PatientDashboard";
import MoodLog from "@/pages/patient/MoodLog";
import Journal from "@/pages/patient/Journal";
import Chat from "@/pages/patient/Chat";
import Assessment from "@/pages/patient/Assessment";
import Analytics from "@/pages/patient/Analytics";
import BookAppointment from "@/pages/patient/BookAppointment";

import DoctorRegister from "@/pages/doctor/DoctorRegister";
import DoctorPending from "@/pages/doctor/DoctorPending";
import DoctorDashboard from "@/pages/doctor/DoctorDashboard";

import AdminDashboard from "@/pages/admin/AdminDashboard";

import "@/App.css";

function RoleSelectionGuard({ children }) {
  const { firebaseUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!firebaseUser) return <Navigate to="/auth" replace />;
  return children;
}

function HomeRedirect() {
  const { firebaseUser, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!firebaseUser) return <Landing />;
  if (!profile?.role) return <Navigate to="/role" replace />;
  if (profile.role === "patient") return <Navigate to="/patient" replace />;
  if (profile.role === "doctor") {
    if (!profile.doctor_profile) return <Navigate to="/doctor/register" replace />;
    if (!profile.doctor_profile.is_approved) return <Navigate to="/doctor/pending" replace />;
    return <Navigate to="/doctor" replace />;
  }
  if (profile.role === "admin") return <Navigate to="/admin" replace />;
  return <Landing />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/role" element={<RoleSelectionGuard><RoleSelection /></RoleSelectionGuard>} />

          {/* Patient routes */}
          <Route element={<ProtectedRoute roles={["patient"]}><Layout /></ProtectedRoute>}>
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/mood" element={<MoodLog />} />
            <Route path="/patient/journal" element={<Journal />} />
            <Route path="/patient/chat" element={<Chat />} />
            <Route path="/patient/assessment" element={<Assessment />} />
            <Route path="/patient/analytics" element={<Analytics />} />
            <Route path="/patient/book" element={<BookAppointment />} />
            <Route path="/patient/appointments" element={<Appointments mode="patient" />} />
          </Route>

          {/* Doctor routes */}
          <Route path="/doctor/register" element={<ProtectedRoute roles={["doctor"]}><DoctorRegister /></ProtectedRoute>} />
          <Route path="/doctor/pending" element={<ProtectedRoute roles={["doctor"]}><DoctorPending /></ProtectedRoute>} />
          <Route element={<ProtectedRoute roles={["doctor"]}><Layout /></ProtectedRoute>}>
            <Route path="/doctor" element={<DoctorDashboard />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute roles={["admin"]}><Layout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;

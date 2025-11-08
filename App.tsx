import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import Billing from "@/pages/dashboard/Billing";
import Invoice from "@/pages/dashboard/Invoice";
import Tryout from "@/pages/dashboard/Tryout";
import Practice from "@/pages/dashboard/Practice";
import PracticeSession from "@/pages/dashboard/PracticeSession";
import TryoutSession from "@/pages/dashboard/TryoutSession";
import Results from "@/pages/dashboard/Results";
import ResultDetail from "@/pages/dashboard/ResultDetail";
import ReviewQuestions from "@/pages/dashboard/ReviewQuestions";
import PracticeReview from "@/pages/dashboard/PracticeReview";
import Ranking from "@/pages/dashboard/Ranking";
import History from "@/pages/dashboard/History";
import Settings from "@/pages/dashboard/Settings";
import Help from "@/pages/dashboard/Help";

// Admin imports
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminTryoutList from "@/pages/admin/TryoutList";
import AdminQuestionList from "@/pages/admin/QuestionList";
import AdminRanking from "@/pages/admin/Ranking";
import AdminRevenue from "@/pages/admin/Revenue";
import AdminPromoCodeManagement from "@/pages/admin/PromoCodeManagement";
import AdminUserList from "@/pages/admin/UserList";
import AdminSettings from "@/pages/admin/Settings";
import AdminNotifications from "@/pages/admin/Notifications";
import AdminPracticeList from "@/pages/admin/PracticeList";
import AdminPracticeQuestions from "@/pages/admin/PracticeQuestions";
import AdminPracticeQuestionForm from "@/pages/admin/PracticeQuestionForm";
import PracticePackageQuestions from "@/pages/admin/PracticePackageQuestions";
import TambahTryoutPage from "@/pages/TambahTryoutPage";
import TambahSoalPageV2 from "@/pages/TambahSoalPageV2";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dashboard Routes - Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="billing" element={<Billing />} />
            <Route path="invoice/:paymentId" element={<Invoice />} />

            {/* Tryout Routes */}
            <Route path="tryout" element={<Tryout />} />
            <Route path="practice" element={<Practice />} />
            <Route path="results" element={<Results />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="history" element={<History />} />

            {/* Settings & Help */}
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<Help />} />
          </Route>

          {/* Tryout Execution - Outside dashboard layout for fullscreen */}
          <Route
            path="/dashboard/tryout/:sessionId"
            element={
              <ProtectedRoute>
                <TryoutSession />
              </ProtectedRoute>
            }
          />
n          {/* Practice Execution - Outside dashboard layout for fullscreen */}
          <Route
            path="/dashboard/practice/:sessionId"
            element={
              <ProtectedRoute>
                <PracticeSession />
              </ProtectedRoute>
            }
          />

          {/* Result Detail - Inside dashboard layout */}
          <Route
            path="/dashboard/results/:sessionId"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ResultDetail />} />
          </Route>

          {/* Review Questions - Inside dashboard layout */}
          <Route
            path="/dashboard/review/:sessionId"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ReviewQuestions />} />
          </Route>

          {/* Practice Review - Full page for better experience */}
          <Route
            path="/dashboard/practice-review/:sessionId"
            element={
              <ProtectedRoute>
                <PracticeReview />
              </ProtectedRoute>
          }
          />

          {/* Admin Routes - Protected with AdminRoute */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="tryouts" element={<AdminTryoutList />} />
              <Route path="practice" element={<AdminPracticeList />} />
              <Route path="practice-questions" element={<AdminPracticeQuestions />} />
              <Route path="practice-questions/create" element={<AdminPracticeQuestionForm />} />
              <Route path="practice-questions/:id/edit" element={<AdminPracticeQuestionForm />} />

              {/* Package-specific practice question routes */}
              <Route path="practice/:packageId/questions" element={<PracticePackageQuestions />} />
              <Route path="practice/:packageId/questions/create" element={<AdminPracticeQuestionForm />} />
              <Route path="practice/:packageId/questions/:questionId/edit" element={<AdminPracticeQuestionForm />} />
              <Route path="practice/:packageId/questions/:questionId/view" element={<AdminPracticeQuestionForm />} />
              <Route path="questions" element={<AdminQuestionList />} />
              <Route path="ranking" element={<AdminRanking />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route
                path="promo-codes"
                element={<AdminPromoCodeManagement />}
              />
              <Route path="users" element={<AdminUserList />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            {/* N8N Webhook Routes (outside AdminLayout) */}
            <Route path="tambah-tryout" element={<TambahTryoutPage />} />
            <Route
              path="tambah-soal/:tryout_package_id"
              element={<TambahSoalPageV2 />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

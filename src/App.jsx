import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import AdminRoute from "./components/AdminRoute";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const StoneDetail = lazy(() => import("./pages/StoneDetail"));
const Privacy = lazy(() => import("./pages/Privacy"));


const Reports = lazy(() => import("./pages/admin/Reports"));
const AddGemPage = lazy(() => import("./pages/admin/AddGemPage"));
const EditGemPage = lazy(() => import("./pages/admin/EditGemPage"));
const AdminStoneDetailPage = lazy(() =>import("./pages/admin/AdminStoneDetailPage"));
const LeadsDashboard = lazy(() => import("./pages/admin/LeadsDashboard"));
const DraftsPage = lazy(() => import("./pages/admin/DraftsPage"));

// Warm the two most-visited public page chunks during browser idle time
// so navigating to them feels instant even on first visit.
function usePrefetchPublicRoutes() {
  useEffect(() => {
    const prefetch = () => {
      import("./pages/Home");
      import("./pages/Marketplace");
    };
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(prefetch, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(prefetch, 2000);
    return () => clearTimeout(t);
  }, []);
}

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="lux-spinner" aria-hidden="true" />
      <p className="lux-eyebrow text-[10px] text-amber-300/70">
        Loading
      </p>
    </div>
  );
}

function App() {
  usePrefetchPublicRoutes();
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/collection" element={<Marketplace />} />
              <Route path="/stone/:id" element={<StoneDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/privacy" element={<Privacy />} />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Dashboard />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/add"
                element={
                  <AdminRoute>
                    <AddGemPage />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/edit/:id"
                element={
                  <AdminRoute>
                    <EditGemPage />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/stone/:id"
                element={
                  <AdminRoute>
                    <AdminStoneDetailPage />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/reports"
                element={
                  <AdminRoute>
                    <Reports />
                  </AdminRoute>
                }
              />

              <Route
  path="/admin/leads"
  element={
    <AdminRoute>
      <LeadsDashboard />
    </AdminRoute>
  }
/>


              <Route
                path="/admin/drafts"
                element={
                  <AdminRoute>
                    <DraftsPage />
                  </AdminRoute>
                }
              />

            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import AdminRoute from "./components/AdminRoute";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const About = lazy(() => import("./pages/About"));
const HowToBuy = lazy(() => import("./pages/HowToBuy"));
const Contact = lazy(() => import("./pages/Contact"));
const StoneDetail = lazy(() => import("./pages/StoneDetail"));
const Privacy = lazy(() => import("./pages/Privacy"));


const Reports = lazy(() => import("./pages/admin/Reports"));
const AddGemPage = lazy(() => import("./pages/admin/AddGemPage"));
const EditGemPage = lazy(() => import("./pages/admin/EditGemPage"));
const AdminStoneDetailPage = lazy(() =>import("./pages/admin/AdminStoneDetailPage"));
const LeadsDashboard = lazy(() => import("./pages/admin/LeadsDashboard"));
const DraftsPage = lazy(() => import("./pages/admin/DraftsPage"));

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
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/collection" element={<Marketplace />} />
              <Route path="/stone/:id" element={<StoneDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-to-buy" element={<HowToBuy />} />
              <Route path="/contact" element={<Contact />} />
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
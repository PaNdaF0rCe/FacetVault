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

const AddGemPage = lazy(() => import("./pages/admin/AddGemPage"));
const EditGemPage = lazy(() => import("./pages/admin/EditGemPage"));
const AdminStoneDetailPage = lazy(() =>
  import("./pages/admin/AdminStoneDetailPage")
);

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
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
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
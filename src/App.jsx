import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import About from "./pages/About";
import HowToBuy from "./pages/HowToBuy";
import Contact from "./pages/Contact";
import StoneDetail from "./pages/StoneDetail";

import AddGemPage from "./pages/admin/AddGemPage";
import EditGemPage from "./pages/admin/EditGemPage";
import AdminStoneDetailPage from "./pages/admin/AdminStoneDetailPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
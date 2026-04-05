import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";

// NEW PAGES
import About from "./pages/About";
import HowToBuy from "./pages/HowToBuy";
import Contact from "./pages/Contact";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>

            {/* Public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Marketplace />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-to-buy" element={<HowToBuy />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin only */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Dashboard />
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
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import SelfCare from "./pages/SelfCare";
import ArticleDetail from "./pages/ArticleDetail";
import Community from "./pages/Community";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

function ScrollRestoration() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-blush overflow-x-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#fff9fb",
            color: "#4b0d32",
            border: "1px solid #f2c9d8",
            fontFamily: "Poppins, sans-serif",
            fontSize: "14px",
          },
          iconTheme: { primary: "#e91e78", secondary: "#fff9fb" },
        }}
      />
      <Navbar />
      <ScrollRestoration />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/self-care" element={<SelfCare />} />
          <Route path="/self-care/:slug" element={<ArticleDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export default App;

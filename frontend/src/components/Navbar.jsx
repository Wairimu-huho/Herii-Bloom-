import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import lotus from "../assets/logo/lotus-mark.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/self-care", label: "Self-Care" },
  { to: "/community", label: "Community" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="border-b border-hairline bg-cream/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5" aria-label="Heri Bloom home">
          <img src={lotus} alt="" className="h-11 w-auto" />
          <span className="flex flex-col items-center leading-none">
            <span className="font-display font-bold text-[26px] text-ink">Heri Bloom</span>
            <span className="flex items-center gap-1.5 mt-1.5 w-full">
              <span className="h-px flex-1 bg-brand/60" />
              <span className="font-body text-[8px] tracking-[0.28em] text-brand whitespace-nowrap">
                THE RITUAL BOX
              </span>
              <span className="h-px flex-1 bg-brand/60" />
            </span>
            <Heart size={8} className="text-brand mt-1" fill="currentColor" />
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8 font-body text-sm text-ink">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive
                  ? "text-brand relative after:content-[''] after:absolute after:-bottom-6 after:left-0 after:right-0 after:h-0.5 after:bg-brand"
                  : "hover:text-brand transition-colors"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-5 text-ink">
          <Search size={19} className="hidden sm:block hover:text-brand transition-colors cursor-pointer" />

          {user ? (
            <div className="hidden sm:flex items-center gap-3 font-body text-sm">
              <span className="text-ink-soft">Hi, {user.name?.split(" ")[0]}</span>
              {user.role === "admin" && <Link to="/admin" className="text-brand hover:text-brand-dark transition-colors">Admin</Link>}
              <button onClick={logout} className="hover:text-brand transition-colors">
                Log out
              </button>
            </div>
          ) : (
            <Link to="/login" aria-label="Log in">
              <User size={19} className="hover:text-brand transition-colors" />
            </Link>
          )}

          <div className="relative">
            <ShoppingBag size={19} className="hover:text-brand transition-colors cursor-pointer" />
            <span className="absolute -top-2 -right-2 bg-brand text-cream text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </div>

          <button
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-hairline bg-cream px-6 py-4 flex flex-col gap-1 font-body text-sm text-ink">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `py-3 border-b border-hairline/60 ${isActive ? "text-brand" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <>
            {user.role === "admin" && <Link to="/admin" onClick={closeMenu} className="py-3 text-brand">Admin dashboard</Link>}
            <button
              onClick={() => {
                logout();
                closeMenu();
              }}
              className="py-3 text-left text-brand"
            >
              Log out ({user.name?.split(" ")[0]})
            </button>
            </>
          ) : (
            <Link to="/login" onClick={closeMenu} className="py-3 text-brand">
              Log in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
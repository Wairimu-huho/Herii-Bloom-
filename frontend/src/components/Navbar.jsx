import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { User, ShoppingBag, Menu, X, Sparkles } from "lucide-react";
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
    <header className="absolute inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 md:pt-5">
      <div className="w-fit max-w-full">
        <div className="relative inline-flex min-h-[58px] max-w-full items-center gap-3 rounded-full border border-white/70 bg-[#FBF7F2]/88 px-3 py-2 shadow-[0_18px_45px_-30px_rgba(75,13,50,0.65)] backdrop-blur-xl sm:px-4">
          <Link to="/" onClick={closeMenu} className="flex shrink-0 items-center gap-2" aria-label="Heri Bloom home">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B0D32] p-1.5 shadow-sm">
              <img src={lotus} alt="" className="h-full w-full object-contain brightness-0 invert" />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[19px] font-bold tracking-[-.04em] text-[#4B0D32]">Heri Bloom</span>
              <span className="mt-1 flex items-center gap-1 font-body text-[7px] font-semibold tracking-[.2em] text-[#C2185B]">
                <span className="h-px w-3 bg-[#C2185B]/50" /> THE RITUAL BOX <span className="h-px w-3 bg-[#C2185B]/50" />
              </span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-full bg-white/55 p-1 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 font-body text-[11px] font-medium transition-all lg:px-4 ${
                    isActive
                      ? "bg-[#4B0D32] text-[#FBF7F2] shadow-sm"
                      : "text-[#4B0D32]/70 hover:bg-[#F8E8ED] hover:text-[#4B0D32]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 text-[#4B0D32] sm:gap-2">
            {user ? (
              <div className="hidden items-center gap-2 font-body text-[11px] sm:flex">
                <span className="hidden text-[#4B0D32]/60 lg:inline">Hi, {user.name?.split(" ")[0]}</span>
                {user.role === "admin" && <Link to="/admin" className="font-semibold text-[#C2185B] hover:text-[#4B0D32]">Admin</Link>}
                <button type="button" onClick={logout} className="text-[#4B0D32]/70 hover:text-[#C2185B]">Log out</button>
              </div>
            ) : (
              <Link to="/login" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4B0D32]/10 bg-white/55 transition hover:border-[#C2185B] hover:text-[#C2185B]" aria-label="Log in">
                <User size={15} />
              </Link>
            )}
            <Link to="/shop" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#F8E8ED] transition hover:bg-[#C2185B] hover:text-[#FBF7F2]" aria-label="Shopping bag">
              <ShoppingBag size={15} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C2185B] px-1 font-body text-[9px] font-semibold text-[#FBF7F2]">0</span>
            </Link>
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B0D32] text-[#FBF7F2] md:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close menu" : "Open menu"}>
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {open && (
          <nav aria-label="Mobile navigation" className="mt-2 rounded-3xl border border-white/70 bg-[#FBF7F2]/95 p-3 font-body text-sm shadow-xl backdrop-blur-xl md:hidden">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={closeMenu}
                className={({ isActive }) => `flex items-center justify-between rounded-2xl px-4 py-3 transition ${isActive ? "bg-[#4B0D32] text-[#FBF7F2]" : "text-[#4B0D32] hover:bg-[#F8E8ED]"}`}
              >
                <span>{link.label}</span>
                {link.to === "/" && <Sparkles size={13} />}
              </NavLink>
            ))}
            {user ? (
              <>
                {user.role === "admin" && <Link to="/admin" onClick={closeMenu} className="mt-1 block rounded-2xl px-4 py-3 text-[#C2185B] hover:bg-[#F8E8ED]">Admin dashboard</Link>}
                <button type="button" onClick={() => { logout(); closeMenu(); }} className="block w-full rounded-2xl px-4 py-3 text-left text-[#C2185B] hover:bg-[#F8E8ED]">Log out ({user.name?.split(" ")[0]})</button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu} className="mt-1 block rounded-2xl px-4 py-3 text-[#C2185B] hover:bg-[#F8E8ED]">Log in</Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

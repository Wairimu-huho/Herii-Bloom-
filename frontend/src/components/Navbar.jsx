
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  User,
  ShoppingBag,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
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

  const navClass = ({ isActive }) =>
    `whitespace-nowrap rounded-full px-3.5 py-2.5 font-body text-[11px] font-bold tracking-wide transition-all duration-300 lg:px-4 ${
      isActive
        ? "bg-[#FBF7F2] text-[#4B0D32] shadow-md"
        : "border border-white/15 bg-[#4B0D32]/85 text-[#FBF7F2] shadow-sm backdrop-blur-md hover:bg-[#6B1747] hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-[100] w-full bg-[#FBF7F2] px-3 py-3 shadow-[0_8px_24px_-18px_rgba(75,13,50,0.35)] sm:px-6">
      <div className="mx-auto w-full max-w-[1440px]">

        {/* MAIN NAVBAR */}
        <div className="flex min-h-[58px] items-center justify-between gap-3">

          {/* LEFT: MENU + BRANDING */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 bg-[#4B0D32]/85 text-[#FBF7F2] shadow-sm backdrop-blur-md transition hover:bg-[#6B1747]"
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>

            <Link
              to="/"
              onClick={closeMenu}
              aria-label="Heri Bloom home"
              className="flex shrink-0 items-center gap-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B0D32] p-1.5 shadow-md ring-1 ring-white/40">
                <img
                  src={lotus}
                  alt=""
                  className="h-full w-full object-contain brightness-0 invert"
                />
              </span>

              <span className="hidden flex-col leading-none sm:flex">
                <span className="whitespace-nowrap font-display text-[19px] font-bold tracking-[-.04em] text-[#4B0D32]">
                  Heri Bloom
                </span>

                <span className="mt-1 flex items-center gap-1 font-body text-[7px] font-bold tracking-[.18em] text-[#4B0D32]">
                  <span className="h-px w-3 bg-[#FBF7F2]/80" />
                  THE RITUAL BOX
                  <span className="h-px w-3 bg-[#FBF7F2]/80" />
                </span>
              </span>
            </Link>
          </div>

          {/* MIDDLE: DESKTOP NAVIGATION */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center justify-center gap-1.5 lg:flex"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={navClass}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT: ACCOUNT + SHOPPING */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

            {user ? (
              <div className="hidden items-center gap-2 font-body text-[11px] lg:flex">

                <span className="font-bold text-[#4B0D32]">
                  Hi, {user.name?.split(" ")[0]}
                </span>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="rounded-full bg-[#4B0D32]/95 px-3 py-2 font-bold text-[#FBF7F2] transition hover:bg-[#6B1747]"
                  >
                    Admin
                  </Link>
                )}

                <button
                  type="button"
                  onClick={logout}
                  className="font-bold text-[#4B0D32] transition hover:text-[#C2185B]"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Log in"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-[#4B0D32]/90 text-[#FBF7F2] shadow-sm transition hover:bg-[#6B1747]"
              >
                <User size={15} />
              </Link>
            )}

            <Link
              to="/shop"
              aria-label="Shopping bag"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-[#4B0D32]/90 text-[#FBF7F2] shadow-sm transition hover:bg-[#6B1747]"
            >
              <ShoppingBag size={15} />

              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white/50 bg-[#C2185B] px-1 font-body text-[9px] font-bold text-white">
                0
              </span>
            </Link>
          </div>
        </div>

        {/* EXPANDABLE MENU */}
        {open && (
          <nav
            aria-label="Expanded navigation"
            className="mt-3 w-full max-w-sm rounded-3xl border border-white/50 bg-[#FBF7F2]/95 p-3 font-body text-sm text-[#4B0D32] shadow-xl backdrop-blur-xl"
          >
            <p className="px-4 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[.2em] text-[#C2185B]">
              Explore Heri Bloom
            </p>

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-2xl px-4 py-3 font-semibold transition ${
                    isActive
                      ? "bg-[#4B0D32] text-[#FBF7F2]"
                      : "text-[#4B0D32] hover:bg-[#F8E8ED]"
                  }`
                }
              >
                <span>{link.label}</span>
                {link.to === "/" && <Sparkles size={13} />}
              </NavLink>
            ))}

            <div className="my-2 border-t border-[#4B0D32]/10" />

            {user ? (
              <>
                <div className="px-4 py-2 text-xs font-medium text-[#4B0D32]/70">
                  Signed in as {user.name?.split(" ")[0]}
                </div>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="block rounded-2xl px-4 py-3 font-semibold text-[#C2185B] hover:bg-[#F8E8ED]"
                  >
                    Admin dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="block w-full rounded-2xl px-4 py-3 text-left font-semibold text-[#C2185B] hover:bg-[#F8E8ED]"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="block rounded-2xl px-4 py-3 font-semibold text-[#C2185B] hover:bg-[#F8E8ED]"
              >
                Log in
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

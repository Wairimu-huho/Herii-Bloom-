
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const navClass = ({ isActive }) =>
    `whitespace-nowrap rounded-full border border-[#4B0D32]/55 px-3.5 py-2.5 font-body text-[11px] font-bold tracking-wide text-[#4B0D32] transition-all duration-300 lg:px-4 ${
      isActive
        ? "bg-[#4B0D32] text-[#FBF7F2] shadow-sm"
        : "bg-white/55 hover:bg-white/85 hover:border-[#4B0D32]"
    }`;

  return (
    <header className={isHome ? "sticky top-0 z-[100] bg-transparent w-full border-0 px-3 sm:px-6 -mb-[78px]" : "sticky top-0 z-[100] w-full bg-gradient-to-r from-[#F8E8ED] via-[#FFF4F7] to-[#F2CDDB] px-3 py-3 shadow-[0_8px_24px_-18px_rgba(75,13,50,0.25)] sm:px-6"}>
      <div className={isHome ? "mx-auto w-full max-w-[1440px] border-0 px-4 py-2 sm:px-7 lg:px-9 bg-transparent shadow-none" : "mx-auto w-full max-w-[1440px]"}>

        {/* MAIN NAVBAR */}
        <div className="flex min-h-[58px] items-center justify-between gap-3">

          {/* LEFT: MENU + BRANDING */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-sm transition lg:hidden ${isHome ? "border-[#4B0D32]/25 bg-white/15 text-[#4B0D32] hover:bg-white/35" : "border-[#4B0D32]/15 bg-[#4B0D32] text-[#FBF7F2] hover:bg-[#6B1747]"}`}
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>

            <Link
              to="/"
              onClick={closeMenu}
              aria-label="Heri Bloom home"
              className="flex shrink-0 items-center gap-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-transparent p-1.5 sm:h-12 sm:w-12">
                <span
                  aria-hidden="true"
                  className="h-full w-full"
                  style={{
                    background: "linear-gradient(to right, #FF2D95 0%, #FF2D95 49.5%, #4B0D32 50.5%, #4B0D32 100%)",
                    WebkitMaskImage: `url(${lotus})`,
                    maskImage: `url(${lotus})`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                  }}
                />
              </span>

              <span className="hidden flex-col leading-none sm:flex">
                <span className="whitespace-nowrap font-display text-[23px] font-bold tracking-[-.04em] sm:text-[25px]">
                  <span className={isHome ? "text-[#4B0D32]" : "text-[#4B0D32]"}>Heri </span><span className={isHome ? "text-[#FF2D95]" : "text-[#C2185B]"}>Bloom</span>
                </span>

                <span className={`mt-1 flex items-center gap-1 font-body text-[8px] font-extrabold tracking-[.18em] ${isHome ? "text-[#4B0D32]" : "text-[#4B0D32]"}`}>
                  <span className={`h-px w-3 ${isHome ? "bg-[#4B0D32]" : "bg-[#4B0D32]/50"}`} />
                  THE RITUAL BOX
                  <span className={`h-px w-3 ${isHome ? "bg-[#4B0D32]" : "bg-[#4B0D32]/50"}`} />
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
              <div className="hidden items-center gap-3 font-body text-sm lg:flex">

                <span className={`text-sm font-bold ${isHome ? "text-[#4B0D32]" : "text-[#4B0D32]"}`}>
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
                  className={`text-sm font-bold transition hover:text-[#C2185B] ${isHome ? "text-[#4B0D32]" : "text-[#4B0D32]"}`}
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Log in"
                className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition ${isHome ? "border-[#4B0D32]/25 bg-white/15 text-[#4B0D32] hover:bg-white/35" : "border-[#4B0D32]/15 bg-[#4B0D32] text-[#FBF7F2] hover:bg-[#6B1747]"}`}
              >
                <User size={15} />
              </Link>
            )}

            <Link
              to="/shop"
              aria-label="Shopping bag"
              className={`relative flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition ${isHome ? "border-[#4B0D32]/25 bg-white/15 text-[#4B0D32] hover:bg-white/35" : "border-[#4B0D32]/15 bg-[#4B0D32] text-[#FBF7F2] hover:bg-[#6B1747]"}`}
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
            className="mt-3 w-full max-w-sm rounded-3xl border border-white/50 bg-[#FBF7F2]/95 p-3 font-body text-sm text-[#4B0D32] shadow-xl backdrop-blur-xl lg:hidden"
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
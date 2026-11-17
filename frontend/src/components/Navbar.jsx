
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

const primaryLinks = ["/", "/shop", "/self-care", "/about"];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const navClass = ({ isActive }) =>
    `whitespace-nowrap rounded-full px-3 py-2 font-body text-[11px] font-medium transition-all duration-300 ${
      isActive
        ? "bg-[#FBF7F2] text-[#4B0D32] shadow-sm"
        : "bg-white/10 text-[#FBF7F2]/90 hover:bg-white/20 hover:text-white"
    }`;

  return (
    <header className="absolute inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 md:pt-5">
      <div className="relative mx-auto w-full max-w-[1440px]">

        {/* MAIN NAVIGATION */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4">

          {/* LEFT: MENU + DESKTOP LINKS */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/10 text-[#FBF7F2] backdrop-blur-md transition hover:bg-white/25"
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>

            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-1 lg:flex"
            >
              {navLinks
                .filter((link) => primaryLinks.includes(link.to))
                .map((link) => (
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
          </div>

          {/* CENTER: HERI BLOOM BRANDING */}
          <Link
            to="/"
            onClick={closeMenu}
            aria-label="Heri Bloom home"
            className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4B0D32] p-1.5 shadow-md sm:h-10 sm:w-10">
              <img
                src={lotus}
                alt=""
                className="h-full w-full object-contain brightness-0 invert"
              />
            </span>

            <span className="flex flex-col items-start leading-none">
              <span className="whitespace-nowrap font-display text-[16px] font-bold tracking-[-.045em] text-[#FBF7F2] drop-shadow-sm sm:text-[20px]">
                Heri Bloom
              </span>

              <span className="mt-1 flex items-center gap-1 font-body text-[6px] font-semibold tracking-[.17em] text-[#FBF7F2]/90 sm:text-[7px] sm:tracking-[.2em]">
                <span className="h-px w-2 bg-[#FBF7F2]/70 sm:w-3" />
                THE RITUAL BOX
                <span className="h-px w-2 bg-[#FBF7F2]/70 sm:w-3" />
              </span>
            </span>
          </Link>

          {/* RIGHT: ACCOUNT + SHOPPING BAG */}
          <div className="flex min-w-0 items-center justify-end gap-1.5 text-[#FBF7F2] sm:gap-2">

            {user && (
              <div className="hidden items-center gap-2 font-body text-[11px] lg:flex">
                <span className="hidden text-[#FBF7F2]/80 xl:inline">
                  Hi, {user.name?.split(" ")[0]}
                </span>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="font-semibold text-[#F6B6C8] transition hover:text-white"
                  >
                    Admin
                  </Link>
                )}

                <button
                  type="button"
                  onClick={logout}
                  className="text-[#FBF7F2]/80 transition hover:text-white"
                >
                  Log out
                </button>
              </div>
            )}

            {!user && (
              <Link
                to="/login"
                aria-label="Log in"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/10 backdrop-blur-md transition hover:bg-white/25"
              >
                <User size={15} />
              </Link>
            )}

            <Link
              to="/shop"
              aria-label="Shopping bag"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/90 text-[#4B0D32] shadow-sm transition hover:bg-[#F8E8ED]"
            >
              <ShoppingBag size={15} />

              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C2185B] px-1 font-body text-[9px] font-semibold text-white">
                0
              </span>
            </Link>

          </div>
        </div>

        {/* EXPANDABLE MENU */}
        {open && (
          <nav
            aria-label="Expanded navigation"
            className="absolute left-0 right-0 top-full mt-3 rounded-3xl border border-white/60 bg-[#FBF7F2]/95 p-3 font-body text-sm text-[#4B0D32] shadow-xl backdrop-blur-xl sm:left-0 sm:right-auto sm:w-72"
          >
            <p className="px-4 pb-2 pt-1 text-[9px] font-semibold uppercase tracking-[.2em] text-[#C2185B]">
              Explore Heri Bloom
            </p>

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-2xl px-4 py-3 transition ${
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
                <div className="px-4 py-2 text-xs text-[#4B0D32]/60">
                  Signed in as {user.name?.split(" ")[0]}
                </div>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="block rounded-2xl px-4 py-3 font-medium text-[#C2185B] hover:bg-[#F8E8ED]"
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
                  className="block w-full rounded-2xl px-4 py-3 text-left text-[#C2185B] hover:bg-[#F8E8ED]"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="block rounded-2xl px-4 py-3 font-medium text-[#C2185B] hover:bg-[#F8E8ED]"
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

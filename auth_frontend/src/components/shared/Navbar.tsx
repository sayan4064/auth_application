import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  User,
} from "lucide-react";

import useAuthStore from "@/auth/authStore";

function Navbar() {
  const navigate = useNavigate();

  // =========================
  // AUTH STATE
  // =========================

  const {
    isAuthenticated,
    user,
    logout,
  } = useAuthStore();

  const isAdmin = user?.roles?.some((role) => role.name === "ROLE_ADMIN");

  // =========================
  // THEME STATE
  // =========================

  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") !== "light";
  });

  // =========================
  // APPLY THEME
  // =========================

  useEffect(() => {
    const html = document.documentElement;

    if (dark) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await logout();

      // Logout successful হলে Home page-এ যাবে
      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);

      // Backend logout fail করলেও
      // Home page-এ redirect করবে
      navigate("/", {
        replace: true,
      });
    }
  };

  return (
    <nav className="w-full border-b border-border bg-background transition-colors duration-300">
      <div
        className="
          mx-auto
          flex
          h-16
          max-w-7xl
          items-center
          justify-between
          px-6
          lg:px-8
        "
      >
        {/* =========================
            LOGO
        ========================= */}

        <NavLink
          to="/"
          className="flex items-center gap-3"
        >
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              bg-gradient-to-br
              from-foreground
              to-muted-foreground
            "
          >
            <span className="text-sm font-bold text-background">
              A
            </span>
          </div>

          <span
            className="
              text-lg
              font-semibold
              tracking-tight
              text-foreground
            "
          >
            Auth App
          </span>
        </NavLink>

        {/* =========================
            RIGHT SIDE
        ========================= */}

        <div className="flex items-center gap-3">

          {/* =========================
              THEME TOGGLE
          ========================= */}

          <button
            type="button"
            onClick={() =>
              setDark((previous) => !previous)
            }
            className="
              inline-flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              border
              border-border
              text-foreground
              transition-colors
              hover:bg-accent
              hover:text-accent-foreground
            "
            aria-label="Toggle theme"
          >
            {dark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* =========================
              LOGGED IN USER
          ========================= */}

          {isAuthenticated ? (
            <>
              {/* USER NAME */}

              <NavLink
                to="/profile"
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2.5
                  rounded-xl
                  border
                  border-[#27272a]
                  bg-[#1c1c1e]
                  px-4.5
                  text-sm
                  font-medium
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-neutral-800
                "
              >
                <User className="h-4.5 w-4.5" />
                <span className="lowercase">{user?.name || "User"}</span>
              </NavLink>

              {/* DASHBOARD */}

              {isAdmin && (
                <NavLink
                  to="/dashboard"
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2.5
                    rounded-xl
                    border
                    border-[#27272a]
                    bg-[#1c1c1e]
                    px-4.5
                    text-sm
                    font-medium
                    text-white
                    shadow-sm
                    transition-all
                    hover:bg-neutral-800
                  "
                >
                  <LayoutDashboard className="h-4.5 w-4.5" />
                  <span>Dashboard</span>
                </NavLink>
              )}

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-primary
                  px-5
                  text-sm
                  font-medium
                  text-primary-foreground
                  transition-colors
                  hover:opacity-90
                "
              >
                <LogOut className="h-4 w-4" />

                <span>
                  Logout
                </span>
              </button>
            </>
          ) : (

            /* =========================
               LOGGED OUT USER
            ========================= */

            <>
              {/* LOGIN */}

              <NavLink
                to="/login"
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-border
                  px-5
                  text-sm
                  font-medium
                  text-foreground
                  transition-colors
                  hover:bg-accent
                  hover:text-accent-foreground
                "
              >
                Login
              </NavLink>

              {/* REGISTER */}

              <NavLink
                to="/signup"
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  rounded-lg
                  bg-primary
                  px-5
                  text-sm
                  font-medium
                  text-primary-foreground
                  transition-colors
                  hover:opacity-90
                "
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
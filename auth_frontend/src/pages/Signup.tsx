import { useState } from "react";
import { Link, useNavigate } from "react-router";

import {
  User,
  Mail,
  LockKeyhole,
} from "lucide-react";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { toast } from "react-hot-toast";

import { registerUser } from "@/services/authService";
import type { RegisterData } from "@/models/RegisterData";

function Signup() {
  const navigate = useNavigate();

  const [data, setData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  /*
   * ============================
   * HANDLE INPUT CHANGE
   * ============================
   */

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setData((oldData) => ({
      ...oldData,
      [name]: value,
    }));
  };

  /*
   * ============================
   * HANDLE FORM SUBMIT
   * ============================
   */

  const handleFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    /*
     * ==========================
     * VALIDATION
     * ==========================
     */

    if (!data.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!data.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!data.password.trim()) {
      toast.error("Password is required");
      return;
    }

    /*
     * ==========================
     * API CALL
     * ==========================
     */

   try {
  setLoading(true);

  const result = await registerUser(data);

  console.log("Registration result:", result);

  // Clear form
  setData({
    name: "",
    email: "",
    password: "",
  });

  // Go directly to login page.
  // Success message will be shown ONLY on Login page.
  navigate("/login", {
    replace: true,
    state: {
      signupSuccess: "Account created successfully!",
    },
  });
} catch (error) {
      console.error("Registration error:", error);

      toast.error("Error in registering user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        min-h-[calc(100vh-64px)]
        bg-background
        px-6
        py-14
        text-foreground
        transition-colors
        duration-300
      "
    >
      <div className="mx-auto w-full max-w-xl">

        {/* Card */}
        <div
          className="
            rounded-2xl
            border
            border-border
            bg-card
            p-8
            shadow-sm
            transition-colors
            duration-300
            sm:p-10
          "
        >

          {/* Header */}
          <div className="mb-8">
            <h1
              className="
                text-3xl
                font-semibold
                tracking-tight
                text-card-foreground
              "
            >
              Create your account
            </h1>

            <p className="mt-3 text-base text-muted-foreground">
              Start building faster
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleFormSubmit}
            autoComplete="off"
            className="space-y-5"
          >

            {/* ================= NAME ================= */}

            <div>
              <label
                htmlFor="name"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                Name
              </label>

              <div className="relative">
                <User
                  className="
                    absolute
                    left-4
                    top-1/2
                    h-5
                    w-5
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={data.name}
                  onChange={handleInputChange}
                  autoComplete="off"
                  placeholder="Your name"
                  className="
                    h-12
                    w-full
                    rounded-lg
                    border
                    border-border
                    bg-background
                    pl-12
                    pr-4
                    text-foreground
                    outline-none
                    placeholder:text-muted-foreground
                    transition
                    focus:border-ring
                    focus:ring-2
                    focus:ring-ring/20
                  "
                />
              </div>
            </div>

            {/* ================= EMAIL ================= */}

            <div>
              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  className="
                    absolute
                    left-4
                    top-1/2
                    h-5
                    w-5
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={data.email}
                  onChange={handleInputChange}
                  autoComplete="off"
                  placeholder="you@example.com"
                  className="
                    h-12
                    w-full
                    rounded-lg
                    border
                    border-border
                    bg-background
                    pl-12
                    pr-4
                    text-foreground
                    outline-none
                    placeholder:text-muted-foreground
                    transition
                    focus:border-ring
                    focus:ring-2
                    focus:ring-ring/20
                  "
                />
              </div>
            </div>

            {/* ================= PASSWORD ================= */}

            <div>
              <label
                htmlFor="password"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  className="
                    absolute
                    left-4
                    top-1/2
                    h-5
                    w-5
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={data.password}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="
                    h-12
                    w-full
                    rounded-lg
                    border
                    border-border
                    bg-background
                    pl-12
                    pr-16
                    text-foreground
                    outline-none
                    placeholder:text-muted-foreground
                    transition
                    focus:border-ring
                    focus:ring-2
                    focus:ring-ring/20
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-xs
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* ================= SUBMIT ================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                h-12
                w-full
                rounded-lg
                bg-primary
                text-sm
                font-semibold
                text-primary-foreground
                transition-colors
                hover:bg-primary/90
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center">
            <div className="h-px flex-1 bg-border" />

            <span
              className="
                mx-4
                bg-card
                px-2
                text-sm
                text-muted-foreground
              "
            >
              or
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() => {
              window.location.href =
                "http://localhost:8083/oauth2/authorization/google";
            }}
            className="
              flex
              h-12
              w-full
              items-center
              justify-center
              gap-3
              rounded-lg
              border
              border-border
              bg-background
              text-sm
              font-semibold
              text-foreground
              transition-colors
              hover:bg-accent
              hover:text-accent-foreground
            "
          >
            <FcGoogle className="h-5 w-5" />

            Continue with Google
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => {
              window.location.href =
                "http://localhost:8083/oauth2/authorization/github";
            }}
            className="
              mt-3
              flex
              h-12
              w-full
              items-center
              justify-center
              gap-3
              rounded-lg
              border
              border-border
              bg-background
              text-sm
              font-semibold
              text-foreground
              transition-colors
              hover:bg-accent
              hover:text-accent-foreground
            "
          >
            <FaGithub className="h-5 w-5" />

            Continue with GitHub
          </button>

          {/* Login */}
          <div className="mt-7">
            <span className="text-sm text-muted-foreground">
              Already have an account?
            </span>

            <Link
              to="/login"
              className="
                ml-2
                text-sm
                font-medium
                text-foreground
                transition-colors
                hover:underline
              "
            >
              Login
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}

export default Signup;
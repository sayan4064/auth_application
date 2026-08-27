import { useEffect, useRef, useState } from "react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router";

import toast from "react-hot-toast";

import {
  ArrowRight,
  LockKeyhole,
  Mail,
  Loader2,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import useAuthStore from "@/auth/authStore";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // ZUSTAND AUTH STORE
  // ==========================================

  const login = useAuthStore(
    (state) => state.login
  );

  const authLoading = useAuthStore(
    (state) => state.authLoading
  );

  // ==========================================
  // SIGNUP TOAST CONTROL
  // ==========================================

  const signupToastShown = useRef(false);

  // ==========================================
  // LOGIN FORM STATE
  // ==========================================

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // ==========================================
  // SHOW SIGNUP SUCCESS MESSAGE
  // ==========================================

  useEffect(() => {
    const signupSuccess =
      location.state?.signupSuccess;

    if (
      !signupSuccess ||
      signupToastShown.current
    ) {
      return;
    }

    signupToastShown.current = true;

    toast.success(signupSuccess, {
      id: "signup-success",
      position: "top-center",
      duration: 4000,
    });

    // Clear navigation state
    navigate("/login", {
      replace: true,
      state: null,
    });
  }, [location.state, navigate]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setLoginData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ==========================================
  // LOGIN SUBMIT
  // ==========================================

  const handleFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // ==========================================
    // EMAIL VALIDATION
    // ==========================================

    if (!loginData.email.trim()) {
      toast.error("Email is required!", {
        id: "login-email-error",
        position: "top-center",
      });

      return;
    }

    // ==========================================
    // PASSWORD VALIDATION
    // ==========================================

    if (!loginData.password.trim()) {
      toast.error("Password is required!", {
        id: "login-password-error",
        position: "top-center",
      });

      return;
    }

    try {
      // ==========================================
      // CALL ZUSTAND LOGIN
      // ==========================================

      const response = await login(loginData);

      console.log(
        "Login successful:",
        response
      );

      const user = useAuthStore.getState().user;
      const isAdmin = user?.roles?.some((role) => role.name === "ROLE_ADMIN");

      // ==========================================
      // SUCCESS TOAST
      // ==========================================

      toast.success("Login successful!", {
        id: "login-success",
        position: "top-center",
      });

      // ==========================================
      // GO TO ROLE-SPECIFIC PAGE
      // ==========================================

      if (isAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/profile");
      }
    } catch (error: any) {
      console.error(
        "Login error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Invalid email or password.";

      toast.error(message, {
        id: "login-error",
        position: "top-center",
      });
    }
  };

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogleLogin = () => {
    if (authLoading) {
      return;
    }

    window.location.href =
      "http://localhost:8083/oauth2/authorization/google";
  };

  // ==========================================
  // GITHUB LOGIN
  // ==========================================

  const handleGithubLogin = () => {
    if (authLoading) {
      return;
    }

    window.location.href =
      "http://localhost:8083/oauth2/authorization/github";
  };

  return (
    <main
      className="
        min-h-screen
        bg-background
        px-6
        py-14
        text-foreground
        transition-colors
        duration-300
      "
    >
      <div className="mx-auto flex max-w-md justify-center">

        {/* ======================================
            LOGIN CARD
        ====================================== */}

        <div
          className="
            w-full
            rounded-2xl
            border
            border-border
            bg-card
            p-8
            shadow-sm
            transition-colors
            duration-300
          "
        >

          {/* ======================================
              HEADER
          ====================================== */}

          <div className="mb-8">

            <h1
              className="
                text-3xl
                font-semibold
                text-card-foreground
              "
            >
              Welcome back
            </h1>

            <p
              className="
                mt-3
                text-base
                text-muted-foreground
              "
            >
              Login to your account
            </p>

          </div>

          {/* ======================================
              LOGIN FORM
          ====================================== */}

          <form
            onSubmit={handleFormSubmit}
            autoComplete="off"
            className="space-y-5"
          >

            {/* EMAIL */}

            <div className="space-y-2">

              <Label
                htmlFor="email"
                className="
                  text-base
                  font-medium
                  text-foreground
                "
              >
                Email
              </Label>

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

                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  value={loginData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  disabled={authLoading}
                  className="
                    h-12
                    border-border
                    bg-background
                    pl-12
                    text-foreground
                    placeholder:text-muted-foreground
                    focus-visible:ring-ring
                  "
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="space-y-2">

              <Label
                htmlFor="password"
                className="
                  text-base
                  font-medium
                  text-foreground
                "
              >
                Password
              </Label>

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

                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={loginData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={authLoading}
                  className="
                    h-12
                    border-border
                    bg-background
                    pl-12
                    text-foreground
                    placeholder:text-muted-foreground
                    focus-visible:ring-ring
                  "
                />

              </div>

            </div>

            {/* SIGN IN BUTTON */}

            <Button
              type="submit"
              disabled={authLoading}
              className="
                h-12
                w-full
                bg-primary
                text-base
                font-semibold
                text-primary-foreground
                transition-colors
                hover:bg-primary/90
              "
            >

              {authLoading ? (
                <>
                  <Loader2
                    className="
                      mr-2
                      h-5
                      w-5
                      animate-spin
                    "
                  />

                  Please wait...
                </>
              ) : (
                <>
                  <ArrowRight
                    className="
                      mr-2
                      h-5
                      w-5
                    "
                  />

                  Sign in
                </>
              )}

            </Button>

          </form>

          {/* ======================================
              DIVIDER
          ====================================== */}

          <div
            className="
              my-7
              flex
              items-center
            "
          >

            <div
              className="
                h-px
                flex-1
                bg-border
              "
            />

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

            <div
              className="
                h-px
                flex-1
                bg-border
              "
            />

          </div>

          {/* ======================================
              GOOGLE LOGIN
          ====================================== */}

          <Button
            type="button"
            variant="outline"
            disabled={authLoading}
            onClick={handleGoogleLogin}
            className="
              h-12
              w-full
              border-border
              bg-background
              text-base
              text-foreground
              transition-colors
              hover:bg-accent
              hover:text-accent-foreground
            "
          >
            <GoogleIcon />

            Continue with Google
          </Button>

          {/* ======================================
              GITHUB LOGIN
          ====================================== */}

          <Button
            type="button"
            variant="outline"
            disabled={authLoading}
            onClick={handleGithubLogin}
            className="
              mt-3
              h-12
              w-full
              border-border
              bg-background
              text-base
              text-foreground
              transition-colors
              hover:bg-accent
              hover:text-accent-foreground
            "
          >
            <FaGithub
              className="
                mr-3
                h-5
                w-5
              "
            />

            Continue with GitHub
          </Button>

          {/* ======================================
              BOTTOM LINKS
          ====================================== */}

          <div
            className="
              mt-6
              flex
              items-center
              justify-between
              text-sm
            "
          >

            <NavLink
              to="/signup"
              className="
                text-muted-foreground
                transition-colors
                hover:text-foreground
              "
            >
              Create account
            </NavLink>

            <NavLink
              to="/forgot-password"
              className="
                text-muted-foreground
                transition-colors
                hover:text-foreground
              "
            >
              Forgot password?
            </NavLink>

          </div>

        </div>
      </div>
    </main>
  );
}


// ==========================================
// GOOGLE ICON
// ==========================================

function GoogleIcon() {
  return (
    <svg
      className="mr-3 h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
        fill="#4285F4"
      />

      <path
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
        fill="#34A853"
      />

      <path
        d="M6.54 13.83A5.86 5.86 0 0 1 6.24 12c0-.64.11-1.26.3-1.83V7.64H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.36l3.24-2.53Z"
        fill="#FBBC05"
      />

      <path
        d="M12 6.14c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.24 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.39l3.24 2.53C7.31 7.86 9.46 6.14 12 6.14Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default Login;
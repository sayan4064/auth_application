import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import useAuthStore from "@/auth/authStore";

function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const updateAuthData = useAuthStore((state) => state.updateAuthData);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const initiatedRef = useRef(false);

  useEffect(() => {
    if (initiatedRef.current) return;
    initiatedRef.current = true;
    try {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("accessToken");

      if (accessToken) {
        // 1. Save access token to store and localStorage
        updateAuthData(accessToken, null);

        // 2. Fetch current user profile details
        fetchCurrentUser()
          .then((user) => {
            if (user) {
              toast.success("Welcome back! Logged in with Google.");
              
              // 3. Redirect based on user role
              const isAdmin = user.roles?.some((role) => role.name === "ROLE_ADMIN");
              if (isAdmin) {
                navigate("/dashboard", { replace: true });
              } else {
                navigate("/profile", { replace: true });
              }
            } else {
              toast.error("Failed to load user profile details.");
              navigate("/login", { replace: true });
            }
          })
          .catch((err) => {
            console.error("OAuth2 Redirect Error:", err);
            toast.error("Failed to load user profile.");
            navigate("/login", { replace: true });
          });
      } else {
        toast.error("Invalid login session. Please sign in again.");
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Redirect Handler Exception:", error);
      toast.error("An error occurred during redirect.");
      navigate("/login", { replace: true });
    }
  }, [navigate, updateAuthData, fetchCurrentUser]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#09090b] text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <h2 className="text-lg font-semibold tracking-wide">Syncing account session...</h2>
        <p className="text-sm text-neutral-400">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}

export default OAuth2RedirectHandler;

import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import RootLayout from "./pages/RootLayout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import useAuthStore from "@/auth/authStore";

function App() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    if (accessToken) {
      fetchCurrentUser();
    }
  }, [accessToken, fetchCurrentUser]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 1500,
        }}
      />
      <Routes>

        <Route element={<RootLayout />}>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/about"
            element={<About />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="/profile"
            element={<Profile />}
          />
          <Route
            path="/oauth2/redirect"
            element={<OAuth2RedirectHandler />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
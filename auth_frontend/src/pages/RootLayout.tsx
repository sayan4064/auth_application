import { Outlet } from "react-router";
import Navbar from "@/components/shared/Navbar";

function RootLayout() {
  return (
    <div className="min-h-screen bg-[#0b0b0b]">
      <Navbar />

      <Outlet />
    </div>
  );
}

export default RootLayout;
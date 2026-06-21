import { Outlet } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9F9F7]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

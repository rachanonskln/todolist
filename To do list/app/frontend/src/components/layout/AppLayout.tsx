import { Outlet } from "react-router-dom";
import { Sidebar, MobileTabBar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function AppLayout() {
  return (
    <div className="min-h-screen w-full">
      <div className="app-background" />
      <Sidebar />
      <MobileTabBar />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pb-6 md:pl-72">
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
}

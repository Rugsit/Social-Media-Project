import { Outlet } from "react-router";
import Navbar from "./components/Navbar";

export default function AppLayout() {
  return (
    <>
      <div className="flex flex-col h-screen text-[#242424]">
        <Navbar />
        <Outlet />
      </div>
    </>
  );
}

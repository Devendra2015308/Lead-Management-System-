import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/Button";
import { LogOut, Users } from "lucide-react";
import { AppSidebar } from "./app-sidebar";

const Layout = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const Navbar = () => (
    <nav className="flex-1 bg-white shadow-sm border-b h-16">
      <div className="flex justify-between items-center h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-gray-900">
            Lead Management
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            Welcome, {user?.firstName} {user?.lastName}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-1"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Navbar with SidebarTrigger */}
          <div className="flex items-center">
            <SidebarTrigger />
            <Navbar />
          </div>

          {/* Main content area where child routes will render */}
          <main className="flex-1 overflow-auto p-4 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogOutIcon, UserIcon } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "../Sidebar";
import { NavItem } from "../../utils/navigationItems";
import { UserProfile } from "../UserProfile";

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  navItems: NavItem[];
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const DashboardLayout = ({
  children,
  pageTitle,
  navItems,
  isSidebarOpen,
  toggleSidebar,
}: DashboardLayoutProps) => {
  const { logout, userRoles } = useAuth();
  return (
    <div
      className="min-h-screen text-black relative"
      style={{
        background:
          "linear-gradient(90deg, #FFFFFF 0%, #F1FAFF 37%, #F1FAFF 69%, #FFFFFF 100%)",
      }}
    >
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-full px-4 sm:px-6">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                onClick={toggleSidebar}
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isSidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900 ml-3">
                Case Flow
              </h1>
            </div>
            <div className="flex items-center">
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>
      <div className="pt-16 flex relative">
        <AnimatePresence mode="wait">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={toggleSidebar}
            navItems={navItems}
          />
        </AnimatePresence>
        <div className="flex-1 lg:pl-64 min-h-screen">
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {pageTitle}
              </h2>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

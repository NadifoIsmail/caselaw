import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../../components/layouts/DashboardLayout";
import { lawyerNavItems } from "../../../utils/navigationItems";
import { Outlet } from "react-router-dom";
export const LawyerDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 1024;
  });
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <DashboardLayout
      // pageTitle="Lawyer Dashboard"
      navItems={lawyerNavItems}
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      <Outlet />
    </DashboardLayout>
  );
};

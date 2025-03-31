import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { NavItem } from "../utils/navigationItems";
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}
export const Sidebar = ({ isOpen, onClose, navItems }: SidebarProps) => {
  const location = useLocation();
  return (
    <>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={onClose}
        />
      )}
      <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] lg:block z-50">
        <motion.div
          initial={false}
          animate={isOpen ? "open" : "closed"}
          variants={{
            open: {
              x: 0,
              opacity: 1,
            },
            closed: {
              x: "-100%",
              opacity: 0,
            },
          }}
          className="w-64 h-full bg-white shadow-lg lg:shadow-none lg:transform-none lg:opacity-100 lg:static lg:translate-x-0"
        >
          <div className="flex flex-col h-full">
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto sidebar-scrollbar">
              {navItems.map((item, index) => {
                if (item.type === "section") {
                  return (
                    <h3
                      key={index}
                      className="px-4 pt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {item.sectionName}
                    </h3>
                  );
                }
                if (item.type === "divider") {
                  return (
                    <div
                      key={index}
                      className="border-t border-gray-200 my-2"
                    />
                  );
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center px-4 py-2 text-sm rounded-md transition-colors
                      ${location.pathname === item.path ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}
                    `}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </motion.div>
      </div>
    </>
  );
};

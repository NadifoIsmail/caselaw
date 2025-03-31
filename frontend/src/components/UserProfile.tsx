import React, { useEffect, useState, useRef } from "react";
import { LogOutIcon, UserIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, userRoles, user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(prev => !prev);
  
  // Navigation handler
  const handleUpdateProfile = () => {
    const baseRoute = userRoles.includes("lawyer") ? "/lawyer" : "/client";
    navigate(`${baseRoute}/settings`);
    setIsOpen(false);
  };
  
  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is handled inside the logout function
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  // Format user's full name
  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";
  
  // Get user role for display
  const displayRole = userRoles.length > 0 ? userRoles[0] : "user";
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center focus:outline-none rounded-full"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <img
          src="https://img.freepik.com/free-vector/young-man-orange-hoodie_1308-173533.jpg?w=740"
          alt="User avatar"
          className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 hover:border-gray-300 transition-colors"
        />
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu">
            {/* User info */}
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{displayRole}</p>
            </div>
            
            {/* Menu items */}
            <button
              onClick={handleUpdateProfile}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              role="menuitem"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              Update Profile
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              role="menuitem"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
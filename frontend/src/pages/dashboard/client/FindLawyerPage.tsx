import React, { useState } from "react";
import { TextField } from "../../../components/TextField";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";

export const FindLawyerPage = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }
    setError("");
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };
  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Find a Lawyer</h2>
      <div className="backdrop-blur-sm bg-white/30 rounded-lg shadow-lg p-8 border border-white/20">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <TextField
              label="Search Lawyers"
              placeholder="Search by name, specialization, or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setError("");
              }}
              className="pr-10 border-gray-300 focus:border-black border-[1.5px] focus:ring-1 focus:ring-black"
              error={
                error
                  ? {
                      message: error,
                    }
                  : undefined
              }
              required
            />
            <SearchIcon className="absolute right-3 top-[38px] h-5 w-5 text-gray-400" />
          </div>
          <button
            type="submit"
            className="mt-[30px] px-8 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 h-[42px] transition-all duration-200 ease-in-out"
          >
            Search
          </button>
        </form>
        {isSearching && (
          <div className="mt-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="rounded-full bg-gray-200 h-12 w-12 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

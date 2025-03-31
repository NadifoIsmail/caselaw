import React, { useEffect, useState } from "react";
import { CaseCard, type CaseCardProps } from "../../../components/CaseCard";
import { useAuth } from "../../../contexts/AuthContext";
import { Loader2, Filter } from "lucide-react";
import { toast } from "sonner";

// Interface for the API response
interface ApiAvailableCase {
  _id: string;
  title: string;
  description: string;
  status: string;
  category?: string;
  urgencyLevel?: string;
  clientId: string;
  client?: {
    name: string;
    contactPerson: string;
  };
  created_at: string;
  updated_at: string;
}

export const AvailableCasesPage = () => {
  const { api } = useAuth();
  const [availableCases, setAvailableCases] = useState<CaseCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Fetch available cases from the API
  useEffect(() => {
    const fetchAvailableCases = async () => {
      try {
        setLoading(true);
        const response = await api.get('/lawyer/cases/available-cases');
        
        if (response.data && response.data.cases) {
          // Transform API response to match CaseCardProps format
          const formattedCases: CaseCardProps[] = response.data.cases.map((caseData: ApiAvailableCase) => ({
            id: caseData._id,
            title: caseData.title,
            description: caseData.description,
            status: "Pending",
            lastUpdated: caseData.updated_at,
            category: caseData.category,
            urgencyLevel: caseData.urgencyLevel,
            client: caseData.client
          }));
          
          setAvailableCases(formattedCases);
        } else {
          // Fall back to mock data if the API doesn't return the expected format
          console.warn("API returned unexpected format, using mock data");
          setAvailableCases(MOCK_AVAILABLE_CASES);
        }
      } catch (err) {
        console.error("Error fetching available cases:", err);
        setError("Failed to load available cases. Please try again later.");
        
        // Fall back to mock data in development
        if (process.env.NODE_ENV === "development") {
          setAvailableCases(MOCK_AVAILABLE_CASES);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCases();
  }, [api]);

  // Handle accepting a case
  const handleAcceptCase = async (caseId: string) => {
    try {
      setAvailableCases(prevCases => 
        prevCases.map(c => 
          c.id === caseId 
            ? { ...c, status: "Processing..." as any } 
            : c
        )
      );
      
      // Call the API to accept the case
      const response = await api.post(`/lawyer/cases/accept-case/${caseId}`);
      
      if (response.data && response.data.message) {
        // Show success message
        toast.success("Case accepted successfully!");
        
        // Remove the case from available cases
        setAvailableCases(prevCases => 
          prevCases.filter(c => c.id !== caseId)
        );
      }
    } catch (err: any) {
      console.error("Error accepting case:", err);
      
      // Show error message
      toast.error(err.response?.data?.message || "Failed to accept case. Please try again.");
      
      // Revert the case status
      setAvailableCases(prevCases => 
        prevCases.map(c => 
          c.id === caseId 
            ? { ...c, status: "Pending" } 
            : c
        )
      );
    }
  };

  // Filter cases based on selected filter
  const filteredCases = availableCases.filter(caseItem => {
    if (filter === "all") return true;
    if (filter === "high" && caseItem.urgencyLevel === "High") return true;
    if (filter === "medium" && caseItem.urgencyLevel === "Medium") return true;
    if (filter === "low" && caseItem.urgencyLevel === "Low") return true;
    if (filter === caseItem.category) return true;
    return false;
  });

  // Empty state - no cases
  if (!loading && availableCases.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Cases</h2>
          <p className="text-sm text-gray-500 mt-1">
            Cases that need legal representation
          </p>
        </div>
        <div className="text-center py-12 bg-white/30 backdrop-blur-sm rounded-lg border border-white/20 shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No available cases found</h3>
          <p className="text-gray-500">
            There are no cases available for you to handle at this time.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Cases</h2>
          <p className="text-sm text-gray-500 mt-1">
            Cases that need legal representation
          </p>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="sr-only">Loading available cases...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Cases</h2>
          <p className="text-sm text-gray-500 mt-1">
            Cases that need legal representation
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Normal state - cases loaded successfully
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Cases</h2>
          <p className="text-sm text-gray-500 mt-1">
            Cases that need legal representation
          </p>
        </div>
        
        {/* Filter controls */}
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-md shadow-sm border border-gray-200">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Cases</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
            <option value="civil">Civil Law</option>
            <option value="criminal">Criminal Law</option>
            <option value="corporate">Corporate Law</option>
            <option value="family">Family Law</option>
            <option value="property">Property Law</option>
          </select>
        </div>
      </div>
      
      {filteredCases.length === 0 ? (
        <div className="text-center py-12 bg-white/30 backdrop-blur-sm rounded-lg border border-white/20 shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching cases found</h3>
          <p className="text-gray-500">
            Try adjusting your filters to see more cases.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              {...caseItem}
              actionButton={
                <button
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={() => handleAcceptCase(caseItem.id as string)}
                  disabled={caseItem.status !== "Pending"}
                >
                  {caseItem.status === "Pending" ? "Accept Case" : caseItem.status}
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Mock data for development and fallback
const MOCK_AVAILABLE_CASES: CaseCardProps[] = [
  {
    id: "mock-1",
    title: "Intellectual Property Dispute",
    description:
      "Need legal assistance with a patent infringement case. Company has been using our patented technology without authorization.",
    status: "Pending",
    lastUpdated: "2024-02-20",
    category: "intellectual-property",
    urgencyLevel: "High",
    client: {
      name: "Tech Innovations Inc.",
      contactPerson: "Sarah Chen",
    },
  },
  {
    id: "mock-2",
    title: "Business Partnership Dissolution",
    description:
      "Need assistance with dissolving a business partnership and negotiating fair distribution of assets.",
    status: "Pending",
    lastUpdated: "2024-02-17",
    category: "corporate",
    urgencyLevel: "Medium",
    client: {
      name: "Johnson & Smith LLC",
      contactPerson: "David Johnson",
    },
  },
  {
    id: "mock-3",
    title: "Employment Contract Dispute",
    description:
      "Former employee claims wrongful termination and breach of employment contract. Need legal representation for upcoming mediation.",
    status: "Pending",
    lastUpdated: "2024-02-22",
    category: "employment",
    urgencyLevel: "High",
    client: {
      name: "Global Services Co.",
      contactPerson: "Michael Brown",
    },
  },
];
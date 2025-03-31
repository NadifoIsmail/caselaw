import React, { useEffect, useState } from "react";
import { CaseCard, type CaseCardProps } from "../../../components/CaseCard";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  Loader2, 
  Filter, 
  ArrowRight, 
  ChevronLeft, 
  Calendar, 
  Tag, 
  AlertTriangle, 
  Clock, 
  User, 
  FileText, 
  Download 
} from "lucide-react";
import { toast } from "sonner";

// Interface for the API response
interface ApiAssignedCase {
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
  assignedAt: string;
  documents?: Array<{
    filename: string;
    path: string;
    uploadedAt: string;
  }>;
  comments?: Array<{
    userId: string;
    userType: string;
    text: string;
    timestamp: string;
  }>;
}

// Status options for the update dropdown
const STATUS_OPTIONS = [
  { value: "InProgress", label: "In Progress" },
  { value: "OnHold", label: "On Hold" },
  { value: "Closed", label: "Closed" }
];

// Main component
export const AssignedCasesPage = () => {
  const { api } = useAuth();
  const [assignedCases, setAssignedCases] = useState<CaseCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  
  // For the detail view
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<ApiAssignedCase | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);

  // Fetch assigned cases from the API
  useEffect(() => {
    const fetchAssignedCases = async () => {
      if (selectedCase) return; // Don't fetch if we're viewing a case detail
      
      try {
        setLoading(true);
        const response = await api.get('/lawyer/cases/assigned-cases');
        
        if (response.data && response.data.cases) {
          // Transform API response to match CaseCardProps format
          const formattedCases: CaseCardProps[] = response.data.cases.map((caseData: ApiAssignedCase) => ({
            id: caseData._id,
            title: caseData.title,
            description: caseData.description,
            status: formatStatus(caseData.status),
            lastUpdated: caseData.updated_at,
            category: caseData.category,
            urgencyLevel: caseData.urgencyLevel,
            client: caseData.client
          }));
          
          setAssignedCases(formattedCases);
        } else {
          // Fall back to mock data if the API doesn't return the expected format
          console.warn("API returned unexpected format, using mock data");
          setAssignedCases(MOCK_ASSIGNED_CASES);
        }
      } catch (err) {
        console.error("Error fetching assigned cases:", err);
        setError("Failed to load your assigned cases. Please try again later.");
        
        // Fall back to mock data in development
    
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedCases();
  }, [api, selectedCase]);

  // Fetch case detail when a case is selected
  useEffect(() => {
    const fetchCaseDetail = async () => {
      if (!selectedCase) return;
      
      try {
        setLoadingDetail(true);
        const response = await api.get(`/cases/case/${selectedCase}`);
        
        if (response.data) {
          setCaseDetail(response.data);
          // Set the initial status for the update form
          if (response.data.status) {
            setNewStatus(response.data.status);
          }
        } else {
          toast.error("Failed to load case details");
          // Find the case in our current list as a fallback
          const fallbackCase = assignedCases.find(c => c.id === selectedCase);
          if (fallbackCase) {
            setCaseDetail({
              _id: fallbackCase.id as string,
              title: fallbackCase.title,
              description: fallbackCase.description,
              status: getApiStatus(fallbackCase.status),
              category: fallbackCase.category,
              urgencyLevel: fallbackCase.urgencyLevel,
              clientId: "",
              client: fallbackCase.client,
              created_at: "",
              updated_at: fallbackCase.lastUpdated,
              assignedAt: ""
            });
          }
        }
      } catch (err) {
        console.error("Error fetching case details:", err);
        toast.error("Failed to load case details. Please try again.");
        setSelectedCase(null);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchCaseDetail();
  }, [api, selectedCase, assignedCases]);

  // Helper function to convert API status to display status
  const formatStatus = (apiStatus: string): "Active" | "Pending" | "Closed" | "On Hold" => {
    const statusMap: Record<string, "Active" | "Pending" | "Closed" | "On Hold"> = {
      'Pending': "Pending",
      'Assigned': "Active",
      'InProgress': "Active",
      'OnHold': "On Hold",
      'Closed': "Closed"
    };
    
    return statusMap[apiStatus] || "Active";
  };

  // Helper function to convert display status to API status
  const getApiStatus = (displayStatus: string): string => {
    const statusMap: Record<string, string> = {
      'Pending': "Pending",
      'Active': "InProgress",
      'On Hold': "OnHold",
      'Closed': "Closed"
    };
    
    return statusMap[displayStatus] || "InProgress";
  };

  // Handle case status update
  const handleUpdateStatus = async () => {
    if (!selectedCase || !newStatus) {
      return;
    }
    
    try {
      setUpdating(true);
      
      // Call the API to update the case status
      const response = await api.post(`/lawyer/cases/update-case-status/${selectedCase}`, {
        status: newStatus,
        comment: comment
      });
      
      if (response.data && response.data.message) {
        // Show success message
        toast.success("Case status updated successfully!");
        
        // Update the case in our state
        if (response.data.case) {
          setCaseDetail(response.data.case);
        }
        
        // Update the case in the list for when we return
        setAssignedCases(prevCases => 
          prevCases.map(c => 
            c.id === selectedCase 
              ? { 
                  ...c, 
                  status: formatStatus(newStatus),
                  lastUpdated: new Date().toISOString()
                } 
              : c
          )
        );
        
        // Clear the comment field
        setComment("");
      }
    } catch (err: any) {
      console.error("Error updating case status:", err);
      
      // Show error message
      toast.error(err.response?.data?.message || "Failed to update case status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Helper to format dates
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper to display category names
  const getCategoryDisplay = (category?: string) => {
    if (!category) return "Uncategorized";
    
    const categoryMap: Record<string, string> = {
      "civil": "Civil Law",
      "criminal": "Criminal Law",
      "corporate": "Corporate Law",
      "family": "Family Law",
      "property": "Property Law",
      "intellectual-property": "Intellectual Property",
      "employment": "Employment Law",
      "immigration": "Immigration Law",
      "tax": "Tax Law",
      "personal-injury": "Personal Injury"
    };
    
    return categoryMap[category] || category;
  };

  // Filter cases based on selected filter
  const filteredCases = assignedCases.filter(caseItem => {
    if (filter === "all") return true;
    if (filter === "active" && caseItem.status === "Active") return true;
    if (filter === "onhold" && caseItem.status === "On Hold") return true;
    if (filter === "closed" && caseItem.status === "Closed") return true;
    if (filter === caseItem.category) return true;
    return false;
  });

  // Handle downloads (this would need to be implemented on the backend)
  const handleDownload = (filePath: string, filename: string) => {
    window.open(`${API_BASE_URL}/documents/download?path=${encodeURIComponent(filePath)}`, '_blank');
  };

  // Empty state - no cases
  if (!selectedCase && !loading && assignedCases.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Assigned Cases</h2>
          <p className="text-sm text-gray-500 mt-1">
            Cases that you are currently handling
          </p>
        </div>
        <div className="text-center py-12 bg-white/30 backdrop-blur-sm rounded-lg border border-white/20 shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned cases found</h3>
          <p className="text-gray-500">
            You don't have any cases assigned to you yet. Check the available cases section to accept new cases.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!selectedCase && loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Assigned Cases</h2>
          <p className="text-sm text-gray-500 mt-1">
            Cases that you are currently handling
          </p>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="sr-only">Loading assigned cases...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (!selectedCase && error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Assigned Cases</h2>
          <p className="text-sm text-gray-500 mt-1">
            Cases that you are currently handling
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Case Detail View
  if (selectedCase && caseDetail) {
    return (
      <div className="space-y-6">
        {/* Back button and header */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => {
              setSelectedCase(null);
              setCaseDetail(null);
              setNewStatus("");
              setComment("");
            }}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Cases</span>
          </button>
        </div>
        
        {loadingDetail ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Case header */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{caseDetail.title}</h1>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Updated: {formatDate(caseDetail.updated_at)}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    caseDetail.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                    caseDetail.status === "InProgress" || caseDetail.status === "Assigned" ? "bg-green-100 text-green-800" :
                    caseDetail.status === "OnHold" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {caseDetail.status === "InProgress" ? "In Progress" : 
                     caseDetail.status === "OnHold" ? "On Hold" : 
                     caseDetail.status}
                  </div>
                  
                  {caseDetail.urgencyLevel && (
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      caseDetail.urgencyLevel === "High" ? "bg-red-50 text-red-700" :
                      caseDetail.urgencyLevel === "Medium" ? "bg-yellow-50 text-yellow-700" :
                      "bg-green-50 text-green-700"
                    }`}>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {caseDetail.urgencyLevel} Priority
                    </div>
                  )}
                  
                  {caseDetail.category && (
                    <div className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      <Tag className="h-3 w-3 mr-1" />
                      {getCategoryDisplay(caseDetail.category)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Case details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Description</h2>
                  <p className="text-gray-700 whitespace-pre-line">{caseDetail.description}</p>
                </div>
                
                {/* Documents */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Documents</h2>
                  
                  {caseDetail.documents && caseDetail.documents.length > 0 ? (
                    <div className="space-y-3">
                      {caseDetail.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-500 mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">{doc.filename}</p>
                              <p className="text-xs text-gray-500">Uploaded: {formatDate(doc.uploadedAt)}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDownload(doc.path, doc.filename)}
                            className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No documents available for this case.</p>
                  )}
                </div>
                
                {/* Comments/Activity */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Activity</h2>
                  
                  {caseDetail.comments && caseDetail.comments.length > 0 ? (
                    <div className="space-y-4">
                      {caseDetail.comments.map((comment, index) => (
                        <div key={index} className="border-l-4 border-gray-300 pl-4 py-1">
                          <div className="flex items-center text-sm">
                            <span className={`font-medium capitalize ${
                              comment.userType === "lawyer" ? "text-blue-700" : "text-gray-700"
                            }`}>
                              {comment.userType}
                            </span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-gray-500">{formatDate(comment.timestamp)}</span>
                          </div>
                          <p className="mt-1 text-gray-700">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2">
                      <p className="text-gray-500 italic">No activity recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right column - Actions and details */}
              <div className="space-y-6">
                {/* Client information */}
                {caseDetail.client && (
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">{caseDetail.client.name}</p>
                        {caseDetail.client.contactPerson && (
                          <p className="text-sm text-gray-600 mt-1">
                            Contact: {caseDetail.client.contactPerson}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Case timing */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Timeline</h2>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="font-medium text-gray-900">{formatDate(caseDetail.created_at)}</p>
                      </div>
                    </div>
                    
                    {caseDetail.assignedAt && (
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Assigned to you</p>
                          <p className="font-medium text-gray-900">{formatDate(caseDetail.assignedAt)}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Last updated</p>
                        <p className="font-medium text-gray-900">{formatDate(caseDetail.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Update status form */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Case Status</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="" disabled>Select new status</option>
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add Comment
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-y"
                        rows={3}
                        placeholder="Add a comment about this status change..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>
                    
                    <button
                      type="button"
                      className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={handleUpdateStatus}
                      disabled={!newStatus || updating}
                    >
                      {updating ? "Updating..." : "Update Status"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Normal state - cases loaded successfully
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Assigned Cases</h2>
          <p className="text-sm text-gray-500 mt-1">
            Cases that you are currently handling
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
            <option value="active">Active Cases</option>
            <option value="onhold">On Hold</option>
            <option value="closed">Closed</option>
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
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors flex items-center"
                  onClick={() => setSelectedCase(caseItem.id as string)}
                >
                  View Details <ArrowRight className="ml-1 h-3 w-3" />
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Define API base URL for file downloads
const API_BASE_URL = 'http://localhost:5000/api';

// Mock data for development and fallback
const MOCK_ASSIGNED_CASES: CaseCardProps[] = [
  {
    id: "mock-4",
    title: "Trademark Infringement Case",
    description:
      "Client's trademark being used by competitor in marketing materials. Need to draft cease and desist letter and prepare for potential litigation.",
    status: "Active",
    lastUpdated: "2024-02-25",
    category: "intellectual-property",
    urgencyLevel: "High",
    client: {
      name: "Digital Solutions Ltd.",
      contactPerson: "James Wilson",
    },
  },
  {
    id: "mock-5",
    title: "Real Estate Contract Review",
    description:
      "Review and finalize commercial lease agreement for client's new office space. Negotiating terms with landlord's counsel.",
    status: "Active",
    lastUpdated: "2024-02-23",
    category: "property",
    urgencyLevel: "Medium",
    client: {
      name: "Growth Ventures Inc.",
      contactPerson: "Emily Richards",
    },
  },
  {
    id: "mock-6",
    title: "Divorce Settlement",
    description:
      "Representing client in divorce proceedings. Need to negotiate division of assets and child custody arrangement.",
    status: "On Hold",
    lastUpdated: "2024-02-18",
    category: "family",
    urgencyLevel: "Medium",
    client: {
      name: "Robert Thompson",
      contactPerson: "Robert Thompson",
    },
  },
];
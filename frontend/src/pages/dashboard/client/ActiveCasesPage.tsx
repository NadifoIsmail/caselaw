import React, { useEffect, useState } from "react";
import { CaseCard, type CaseCardProps } from "../../../components/CaseCard";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  Loader2, 
  ChevronLeft, 
  Calendar, 
  Tag, 
  AlertTriangle, 
  Clock, 
  User, 
  FileText, 
  Download,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

// Case data shape from the API
interface ApiCase {
  _id: string;
  title: string;
  description: string;
  status: string;
  urgencyLevel?: string;
  category?: string;
  clientId: string;
  clientName: string;
  assignedLawyer?: {
    name: string;
    id: string;
  };
  created_at: string;
  updated_at: string;
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

export const ActiveCasesPage = () => {
  const { api } = useAuth();
  const [cases, setCases] = useState<CaseCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // For the detail view
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<ApiCase | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  // Fetch cases from the API
  useEffect(() => {
    const fetchCases = async () => {
      if (selectedCase) return; // Don't fetch if we're viewing a case detail
      
      try {
        setLoading(true);
        const response = await api.get('/cases/client/cases');
        
        if (response.data && response.data.cases) {
          // Transform API response to match CaseCardProps format
          const formattedCases: CaseCardProps[] = response.data.cases.map((caseData: ApiCase) => ({
            id: caseData._id,
            title: caseData.title,
            description: caseData.description,
            status: formatStatus(caseData.status),
            lastUpdated: caseData.updated_at,
            lawyer: caseData.assignedLawyer ? {
              name: caseData.assignedLawyer.name
            } : undefined,
            category: caseData.category,
            urgencyLevel: caseData.urgencyLevel
          }));
          
          setCases(formattedCases);
        } else {
          // Handle unexpected response format
          console.error("Unexpected API response format:", response);
          setError("Received an invalid response from the server");
          
          if (process.env.NODE_ENV === "development") {
            setCases(MOCK_CASES);
          }
        }
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError("Failed to load your cases. Please try again later.");
        
        // Fall back to mock data in development
        if (process.env.NODE_ENV === "development") {
          setCases(MOCK_CASES);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
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
        } else {
          toast.error("Failed to load case details");
          // Find the case in our current list as a fallback
          const fallbackCase = cases.find(c => c.id === selectedCase);
          if (fallbackCase) {
            setCaseDetail({
              _id: fallbackCase.id as string,
              title: fallbackCase.title,
              description: fallbackCase.description,
              status: getApiStatus(fallbackCase.status),
              category: fallbackCase.category,
              urgencyLevel: fallbackCase.urgencyLevel,
              clientId: "",
              clientName: "",
              created_at: "",
              updated_at: fallbackCase.lastUpdated
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
  }, [api, selectedCase, cases]);

  // Helper function to convert API status to display status
  const formatStatus = (apiStatus: string): "Active" | "Pending" | "Closed" | "On Hold" => {
    const statusMap: Record<string, "Active" | "Pending" | "Closed" | "On Hold"> = {
      'Pending': "Pending",
      'Assigned': "Active",
      'InProgress': "Active",
      'OnHold': "On Hold",
      'Closed': "Closed"
    };
    
    return statusMap[apiStatus] || "Pending";
  };

  // Helper function to convert display status to API status
  const getApiStatus = (displayStatus: string): string => {
    const statusMap: Record<string, string> = {
      'Pending': "Pending",
      'Active': "InProgress",
      'On Hold': "OnHold",
      'Closed': "Closed"
    };
    
    return statusMap[displayStatus] || "Pending";
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

  // Handle downloads (this would need to be implemented on the backend)
  const handleDownload = (filePath: string, filename: string) => {
    window.open(`${API_BASE_URL}/documents/download?path=${encodeURIComponent(filePath)}`, '_blank');
  };

  // Handle submitting a comment
  const handleSubmitComment = async () => {
    if (!selectedCase || !comment.trim()) {
      return;
    }
    
    try {
      setSubmittingComment(true);
      
      // Call the API to add a comment
      const response = await api.post(`/cases/add-comment/${selectedCase}`, {
        comment: comment.trim()
      });
      
      if (response.data && response.data.message) {
        // Show success message
        toast.success("Comment added successfully!");
        
        // Update the case detail
        if (response.data.case) {
          setCaseDetail(response.data.case);
        } else {
          // Refresh the case detail
          const detailResponse = await api.get(`/cases/case/${selectedCase}`);
          if (detailResponse.data) {
            setCaseDetail(detailResponse.data);
          }
        }
        
        // Clear the comment field
        setComment("");
      }
    } catch (err: any) {
      console.error("Error adding comment:", err);
      toast.error(err.response?.data?.message || "Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Empty state - no cases
  if (!selectedCase && !loading && cases.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Active Cases</h2>
        <div className="text-center py-12 bg-white/30 backdrop-blur-sm rounded-lg border border-white/20 shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active cases found</h3>
          <p className="text-gray-500">
            You don't have any active cases yet. Submit a new case to get started.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!selectedCase && loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Active Cases</h2>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="sr-only">Loading cases...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (!selectedCase && error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Active Cases</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        {/* Render mock data in development when there's an error */}
        {process.env.NODE_ENV === "development" && cases.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((caseItem, index) => (
              <CaseCard 
                key={caseItem.id || index} 
                {...caseItem} 
                onClick={() => setSelectedCase(caseItem.id as string)}
              />
            ))}
          </div>
        )}
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
                    <div className="space-y-4 mb-6">
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
                    <div className="mb-6">
                      <p className="text-gray-500 italic">No activity recorded yet.</p>
                    </div>
                  )}
                  
                  {/* Add Comment Form */}
                  <div className="border-t pt-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Add a Comment</h3>
                    <div className="space-y-3">
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Write your comment here..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <button
                        onClick={handleSubmitComment}
                        disabled={!comment.trim() || submittingComment}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
                      >
                        {submittingComment ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Submit Comment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Status and info */}
              <div className="space-y-6">
                {/* Assigned lawyer */}
                {caseDetail.assignedLawyer ? (
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Lawyer</h2>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{caseDetail.assignedLawyer.name}</p>
                        <p className="text-sm text-gray-500">Working on your case</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Lawyer Assignment</h2>
                    <div className="flex items-center text-yellow-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <p>Waiting for lawyer assignment</p>
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
                    
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Last updated</p>
                        <p className="font-medium text-gray-900">{formatDate(caseDetail.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status info */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h2>
                  <div className="space-y-2">
                    <div className={`p-3 rounded-md ${
                      caseDetail.status === "Pending" ? "bg-yellow-50 border border-yellow-100" :
                      caseDetail.status === "InProgress" || caseDetail.status === "Assigned" ? "bg-green-50 border border-green-100" :
                      caseDetail.status === "OnHold" ? "bg-red-50 border border-red-100" :
                      "bg-gray-50 border border-gray-100"
                    }`}>
                      <div className="font-medium mb-1 text-gray-900">
                        Current Status: {caseDetail.status === "InProgress" ? "In Progress" : 
                                        caseDetail.status === "OnHold" ? "On Hold" : 
                                        caseDetail.status}
                      </div>
                      <p className="text-sm text-gray-600">
                        {caseDetail.status === "Pending" ? 
                          "Your case is waiting to be assigned to a lawyer." :
                         caseDetail.status === "Assigned" ?
                          "A lawyer has been assigned to your case and will begin working on it soon." :
                         caseDetail.status === "InProgress" ?
                          "Your lawyer is actively working on your case." :
                         caseDetail.status === "OnHold" ?
                          "Your case is temporarily on hold. Your lawyer will provide more information." :
                         caseDetail.status === "Closed" ?
                          "Your case has been closed. Thank you for using our services." :
                          "Your case status is being updated."
                        }
                      </p>
                    </div>
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Active Cases</h2>
        <span className="text-sm text-gray-500">
          Showing {cases.length} case{cases.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((caseItem, index) => (
          <CaseCard 
            key={caseItem.id || index} 
            {...caseItem} 
            onClick={() => setSelectedCase(caseItem.id as string)}
          />
        ))}
      </div>
    </div>
  );
};

// Define API base URL for file downloads
const API_BASE_URL = 'http://localhost:5000/api';

// Mock data for development and fallback
const MOCK_CASES: CaseCardProps[] = [
  {
    id: "mock-1",
    title: "Property Dispute - 123 Main St",
    description:
      "Dispute regarding property boundaries and easement rights with neighboring property owner. Case involves survey documentation and historical property records.",
    status: "Active",
    lawyer: {
      name: "John Smith",
      imageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    lastUpdated: "2024-02-15",
    category: "property",
    urgencyLevel: "High"
  },
  {
    id: "mock-2",
    title: "Contract Review - Software License",
    description:
      "Review and negotiation of enterprise software licensing agreement. Focusing on liability clauses and service level agreements.",
    status: "Pending",
    lastUpdated: "2024-02-14",
    category: "corporate",
    urgencyLevel: "Medium"
  },
  {
    id: "mock-3",
    title: "Employment Dispute",
    description:
      "Workplace discrimination case involving review of company policies and documentation of incidents.",
    status: "On Hold",
    lawyer: {
      name: "Michael Chen",
    },
    lastUpdated: "2024-02-10",
    category: "employment",
    urgencyLevel: "Low"
  },
];
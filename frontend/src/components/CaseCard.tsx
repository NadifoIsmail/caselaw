import React, { useState } from "react";
import { Badge } from "./ui/Badge";
import { UserIcon, Calendar, Tag, User } from "lucide-react";
import { Dialog } from "./ui/Dialog";

export interface CaseCardProps {
  id?: string;
  title: string;
  description: string;
  status: "Active" | "Pending" | "Closed" | "On Hold";
  lawyer?: {
    name: string;
    imageUrl?: string;
  };
  client?: {
    name: string;
    contactPerson?: string;
  };
  lastUpdated: string;
  category?: string;
  urgencyLevel?: string;
  actionButton?: React.ReactNode;
  onClick?: () => void;
}

// Status color mapping
const STATUS_COLORS = {
  "Active": "bg-green-100 text-green-800 border-green-200",
  "Pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Closed": "bg-gray-100 text-gray-800 border-gray-200",
  "On Hold": "bg-red-100 text-red-800 border-red-200"
};

// Category display names
const CATEGORY_NAMES: Record<string, string> = {
  "civil": "Civil Law",
  "criminal": "Criminal Law",
  "corporate": "Corporate Law",
  "family": "Family Law",
  "property": "Property Law",
  "employment": "Employment Law"
};

export const CaseCard = ({
  id,
  title,
  description,
  status,
  lawyer,
  client,
  lastUpdated,
  category,
  urgencyLevel,
  actionButton,
  onClick
}: CaseCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const getStatusColor = (status: CaseCardProps["status"]) => {
    return STATUS_COLORS[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString; // Fallback to original string if parsing fails
    }
  };
  
  const getCategoryDisplay = (categoryKey?: string) => {
    if (!categoryKey) return null;
    return CATEGORY_NAMES[categoryKey] || categoryKey;
  };
  
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <div  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full border border-gray-100">
        <div className="p-6 flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Updated: {formatDate(lastUpdated)}</span>
              </div>
            </div>
            <Badge className={getStatusColor(status)}>{status}</Badge>
          </div>
          
          <button
            onClick={handleCardClick}
            className="w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 rounded-sm"
            aria-label="View case details"
          >
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 hover:text-gray-900 transition-colors">
              {description}
            </p>
          </button>
          
          {/* Optional metadata section */}
          {(category || urgencyLevel) && (
            <div className="flex flex-wrap gap-2 mt-2 mb-4">
              {category && (
                <div className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                  <Tag className="h-3 w-3 mr-1" />
                  {getCategoryDisplay(category)}
                </div>
              )}
              {urgencyLevel && (
                <div className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
                  urgencyLevel === "High" ? "bg-red-50 text-red-700" :
                  urgencyLevel === "Medium" ? "bg-yellow-50 text-yellow-700" :
                  "bg-green-50 text-green-700"
                }`}>
                  {urgencyLevel} Priority
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Lawyer or client information */}
        {(lawyer || client || actionButton) && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between">
              {lawyer && (
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {lawyer.imageUrl ? (
                      <img 
                        src={lawyer.imageUrl} 
                        alt={lawyer.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Assigned to</p>
                    <p className="text-sm font-medium text-gray-900">{lawyer.name}</p>
                  </div>
                </div>
              )}
              
              {client && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Client</p>
                    <p className="text-sm font-medium text-gray-900">{client.name}</p>
                  </div>
                </div>
              )}
              
              {actionButton && (
                <div>{actionButton}</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Case details dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={title}
      >
        <div className="space-y-4">
          {/* Case status and date */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(status)}>{status}</Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              Last updated: {formatDate(lastUpdated)}
            </div>
          </div>
          
          {/* Category and priority */}
          {(category || urgencyLevel) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {category && (
                <div className="inline-flex items-center text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                  <Tag className="h-3.5 w-3.5 mr-1" />
                  {getCategoryDisplay(category)}
                </div>
              )}
              {urgencyLevel && (
                <div className={`inline-flex items-center text-sm px-2 py-1 rounded-full ${
                  urgencyLevel === "High" ? "bg-red-50 text-red-700" :
                  urgencyLevel === "Medium" ? "bg-yellow-50 text-yellow-700" :
                  "bg-green-50 text-green-700"
                }`}>
                  {urgencyLevel} Priority
                </div>
              )}
            </div>
          )}
          
          {/* Full description */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600">{description}</p>
          </div>
          
          {/* Lawyer information */}
          {lawyer && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Assigned Lawyer</h4>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {lawyer.imageUrl ? (
                    <img 
                      src={lawyer.imageUrl} 
                      alt={lawyer.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{lawyer.name}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Client information */}
          {client && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Client Information</h4>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Name:</span> {client.name}
              </p>
              {client.contactPerson && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Contact Person:</span> {client.contactPerson}
                </p>
              )}
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "../../../components/TextField";
import { reportCaseSchema, type ReportCaseFormData } from "../../../utils/validation";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

// Component for form field with error messaging
const FormField = ({ 
  label, 
  error, 
  children, 
  optional = false 
}: { 
  label: string; 
  error?: { message?: string }; 
  children: React.ReactNode; 
  optional?: boolean;
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {optional && <span className="text-gray-500 text-xs">(Optional)</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
  </div>
);

// Select input component with fixed React warnings
const SelectField = ({ 
  register, 
  name, 
  options, 
  error, 
  placeholder = "Select an option", 
  optional = false 
}: { 
  register: any; 
  name: string; 
  options: { value: string; label: string }[]; 
  error?: { message?: string }; 
  placeholder?: string; 
  optional?: boolean;
}) => {
  // Get the formatted label from the name
  const formattedLabel = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
  
  return (
    <FormField label={formattedLabel} error={error} optional={optional}>
      <select
        {...register(name)}
        className="w-full px-3 py-2 border-[1.5px] border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
        defaultValue="" // Use defaultValue instead of selected on option
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

// Textarea component
const TextareaField = ({ 
  register, 
  name, 
  error, 
  placeholder, 
  optional = false 
}: { 
  register: any; 
  name: string; 
  error?: { message?: string }; 
  placeholder: string; 
  optional?: boolean;
}) => {
  // Get the formatted label from the name
  const formattedLabel = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
  
  return (
    <FormField label={formattedLabel} error={error} optional={optional}>
      <textarea
        {...register(name)}
        className="w-full px-3 py-2 border-[1.5px] border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-y min-h-[100px]"
        placeholder={placeholder}
      />
    </FormField>
  );
};

export const ReportCasePage = () => {
  const { api } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiClassification, setAiClassification] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ReportCaseFormData>({
    resolver: zodResolver(reportCaseSchema),
    defaultValues: {
      title: "",
      description: "",
      urgencyLevel: "",
      communicationMethod: "",
      specialRequirements: ""
    }
  });

  // Get selected files for preview
  const selectedFiles = watch("documents") as FileList;
  const description = watch("description");

  // Form submission handler
  const onSubmit = async (data: ReportCaseFormData) => {
    setIsSubmitting(true);
    
    try {
      // Create FormData object to send files
      const formData = new FormData();
      
      // Add text fields
      formData.append("title", data.title);
      formData.append("description", data.description);
      
      formData.append("urgencyLevel", data.urgencyLevel);
      formData.append("communicationMethod", data.communicationMethod);
      
      if (data.specialRequirements) {
        formData.append("specialRequirements", data.specialRequirements);
      }
      
      // Add files if present
      if (data.documents && data.documents instanceof FileList) {
        for (let i = 0; i < data.documents.length; i++) {
          formData.append("documents", data.documents[i]);
        }
      }
      
      // Send API request
      const response = await api.post('/cases/report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Get the AI classification from the response
      if (response.data && response.data.category) {
        setAiClassification(response.data.category);
      }
      
      // Display success notification
      toast(
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium">Case Submitted</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {response.data.aiClassified && (
            <div className="flex items-center gap-2 mt-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>AI classified as: {getCategoryDisplay(response.data.category)}</span>
            </div>
          )}
        </div>,
        {
          position: "bottom-right",
        }
      );
      
      // Reset form after successful submission
      reset();
      
    } catch (error: any) {
      console.error("Error submitting case:", error);
      
      // Display error notification
      toast(
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="font-medium">Submission Failed</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {error.response?.data?.message || "Failed to submit case. Please try again."}
          </p>
        </div>,
        {
          position: "bottom-right",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to display category names
  const getCategoryDisplay = (category: string) => {
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

  // Urgency level options
  const urgencyOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" }
  ];

  // Communication method options
  const communicationOptions = [
    { value: "Email", label: "Email" },
    { value: "Phone", label: "Phone" },
    { value: "In-Person", label: "In-Person" }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto relative z-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Report New Case</h2>
      <div className="backdrop-blur-sm bg-white/30 rounded-lg shadow-lg p-8 border border-white/20">
        <div className="flex items-center mb-6 gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded">
          <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <span>
            Our AI will automatically classify your case based on the description. 
            Just provide a detailed description of your legal matter.
          </span>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Case title */}
          <TextField
            label="Case Title"
            {...register("title")}
            error={errors.title}
            placeholder="Enter case title"
            className="border-gray-300 focus:border-black border-[1.5px] focus:ring-1 focus:ring-black"
          />
          
          {/* Case description */}
          <TextareaField
            register={register}
            name="description"
            error={errors.description}
            placeholder="Provide a detailed description of your case - our AI will classify it automatically"
          />
          
          {/* Urgency level and Communication method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              register={register}
              name="urgencyLevel"
              options={urgencyOptions}
              error={errors.urgencyLevel}
              placeholder="Select urgency level"
            />
            
            <SelectField
              register={register}
              name="communicationMethod"
              options={communicationOptions}
              error={errors.communicationMethod}
              placeholder="Select communication method"
            />
          </div>
          
          {/* Document upload */}
          <FormField label="Upload Documents" error={errors.documents} optional={true}>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.jpeg,.jpg"
              {...register("documents")}
              className="w-full px-3 py-2 border-[1.5px] border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum 10MB per file. Allowed formats: PDF, DOCX, JPEG
            </p>
            
            {/* File preview */}
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Selected files:</p>
                <ul className="text-sm text-gray-600 pl-5 list-disc">
                  {Array.from(selectedFiles).map((file, index) => (
                    <li key={index}>
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </FormField>
          
          {/* Special requirements */}
          <TextareaField
            register={register}
            name="specialRequirements"
            error={errors.specialRequirements}
            placeholder="Any special requirements or additional information"
            optional={true}
          />
          
          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
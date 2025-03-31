import React, { forwardRef } from "react";
import { FieldError } from "react-hook-form";
interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full px-3 py-2 border text-left ${error ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black touch-manipulation ${className}`}
          style={{
            WebkitTapHighlightColor: "transparent",
            cursor: "text",
            textAlign: "left",
          }}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      </div>
    );
  },
);
TextField.displayName = "TextField";

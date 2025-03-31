import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { TextField } from "../../components/form/TextField";
import {  forgotPasswordSchema,  type ForgotPasswordFormData,} from "../../utils/validation";
import { authApi } from "../../utils/auth";
import { useAuth } from "../../contexts/AuthContext";
import LoadingPage from "../../components/LoadingPage";

export const ForgotPasswordPage = () => {
  const { csrfToken } = useAuth();
  const navigate = useNavigate();
  const { control, register, handleSubmit, formState: { errors }, } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  
  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) => {
      if (!csrfToken) throw new Error("CSRF token not available");
      return authApi.forgotPassword(data, csrfToken);
    },
    onSuccess: () => {
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };
  if (forgotPasswordMutation.isPending) {
    return <LoadingPage />;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>
        {forgotPasswordMutation.isSuccess && (
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-700">
              If your email exists in our system, you will receive a password
              reset link shortly. Redirecting to login...
            </p>
          </div>
        )}
        {forgotPasswordMutation.isError && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">
              {forgotPasswordMutation.error instanceof Error
                ? forgotPasswordMutation.error.message
                : "There was an error processing your request. Please try again."}
            </p>
          </div>
        )}
        {!forgotPasswordMutation.isSuccess && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <TextField 
            name="email" 
            control={control} 
            label="Email" 
            type="email" 
            required />
            <div>
              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {forgotPasswordMutation.isPending
                  ? "Sending..."
                  : "Send reset link"}
              </button>
            </div>
          </form>
        )}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { useSearchParams, Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, Typography, FormControlLabel, Checkbox, Alert } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { TextField } from "../../components/form/TextField";
import { UserTypeSelector } from "../../components/form/UserTypeSelector";
import { loginSchema, type LoginFormData } from "../../utils/validation";
import { useAuth } from "../../contexts/AuthContext";
import LoadingPage from "../../components/LoadingPage";

export function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type") || "client";
  const { isAuthenticated, userRoles, login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { isSubmitting, errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  // Handle Form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };
  
  if (isLoading) {
    return <LoadingPage />;
  }
  
  if (isAuthenticated && userRoles.length > 0) {
    const defaultRoute = userRoles.includes("lawyer") ? "/lawyer" : "/client";
    return <Navigate to={defaultRoute} replace />;
  }

  // Handle user type change
  const handleTypeChange = (newType: "client" | "lawyer") => {
    setSearchParams({
      type: newType
    });
  };
  
  return (
    <Box className="w-full min-h-screen bg-white pt-20">
      <Box className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Box className="flex flex-col lg:flex-row items-center justify-between gap-12 relative">

          {/* Image container */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block lg:w-1/2 relative"
          >
            <img 
              src="https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg?uid=R187223128&ga=GA1.1.1439759661.1737426593&semt=ais_hybrid" 
              alt="Login illustration" 
              className="w-full max-w-md mx-auto fixed top-[120px] left-[120px]" 
            />
          </motion.div>

          {/* Form Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full lg:w-1/2 max-w-md relative"
          >
            <Paper 
              elevation={0} 
              className="p-8" 
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2
              }}
            >
              {/* Header */}
              <Box className="mb-6 flex items-center justify-between">
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-5 h-5" />
                </Link>

                {/* Title */}
                <Typography 
                  variant="h5" 
                  className="text-center flex-1" 
                  sx={{
                    fontWeight: 600,
                    color: "text.primary"
                  }}
                >
                  Login
                </Typography>

                {/* User type selector */}
                <UserTypeSelector selectedType={type} onChange={handleTypeChange} />
              </Box>

              {/* Error message */}
              {error && (
                <Alert severity="error" className="mb-4">
                  {error}
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email input */}
                <TextField 
                  name="email" 
                  control={control} 
                  label="Email" 
                  type="email" 
                  required 
                />

                {/* Password Input */}
                <TextField 
                  name="password"
                  control={control} 
                  label="Password" 
                  type="password" 
                  required 
                />

                {/* Remember me and forgot password */}
                <Box className="flex items-center justify-between">
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        sx={{
                          color: "primary.main",
                          "&.Mui-checked": {
                            color: "primary.main"
                          }
                        }} 
                      />
                    } 
                    label={<Typography variant="body2">Remember me</Typography>} 
                  />
                  <Link 
                    to="/forgot-password" 
                    className="text-[#0066ff] hover:underline text-sm"
                  >
                    Forgot password?
                  </Link>
                </Box>

                {/* Submit button */}
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    textTransform: "none",
                    fontSize: "1rem",
                    bgcolor: "#0066ff",
                    "&:hover": {
                      bgcolor: "#0052cc"
                    }
                  }}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>

                {/* Signup Link */}
                <Box className="text-center mt-4">
                  <Typography variant="body2" color="textSecondary">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-[#0066ff] hover:underline">
                      Sign up
                    </Link>
                  </Typography>
                </Box>
              </form>
            </Paper>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
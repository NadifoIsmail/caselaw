import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, Typography, FormControlLabel, Checkbox, Grid, Alert } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { TextField } from "../../components/form/TextField";
import { UserTypeSelector } from "../../components/form/UserTypeSelector";
import { PasswordStrengthIndicator } from "../../components/form/PasswordStrengthIndicator";
import { signupSchema, type SignupFormData } from "../../utils/validation";
import { useAuth } from "../../contexts/AuthContext";
import LoadingPage from "../../components/LoadingPage";

export function SignUp() {
  // Get and set query parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFromQuery = searchParams.get("type") || "client";
  
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: {
      isSubmitting,
      errors
    }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: typeFromQuery as "client" | "lawyer",
      barNumber: ""
    },
    mode: 'all'
  });
  
  // Update form when query parameter changes
  useEffect(() => {
    setValue("userType", typeFromQuery as "client" | "lawyer");
    if (typeFromQuery === "client") {
      setValue("barNumber", "");
    }
  }, [typeFromQuery, setValue]);
  
  const userType = watch("userType");
  const password = watch('password');

  // Asynchronous form submission to handle signup
  const onSubmit = async (data: SignupFormData) => {
    setIsSigningUp(true);
    try {
      const response = await signup(data);
      
      navigate('/login', {
        state: {
          message: response.message || 'Account created successfully. Please log in.',
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };
  
  if (isSigningUp) {
    return <LoadingPage />;
  }

  // Handle changes to the user type selection
  const handleUserTypeChange = (type: "client" | "lawyer") => {
    // Update the query parameter
    setSearchParams({ type });
    
    // The form value will be updated by the useEffect
  };
  
  return (
    <Box className="w-full min-h-screen bg-white pt-20">
      <Box className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Box className="flex flex-col lg:flex-row items-center justify-between gap-12 relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block lg:w-1/2 relative"
          >
            <img 
              src="https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg?uid=R187223128&ga=GA1.1.1439759661.1737426593&semt=ais_hybrid" 
              alt="Signup illustration" 
              className="w-full max-w-md mx-auto fixed left-[120px] top-[120px]" 
            />
          </motion.div>

          {/* Form container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} 
            className="w-full lg:w-1/2 max-w-md"
          >
            <Paper className="p-8">
              <Box className="mb-6 flex items-center justify-between">
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <Typography variant="h5" className="text-center flex-1">
                  Create Account
                </Typography>

                {/* User type selector */}
                <UserTypeSelector 
                  selectedType={userType}
                  onChange={handleUserTypeChange} 
                />
              </Box>

              {/* Display error message if signup attempt fails */}
              {error && (
                <Alert 
                  severity="error"
                  className="mb-4"
                >
                  {error}
                </Alert>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* First and last name fields */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField 
                      name="firstName" 
                      control={control} 
                      label="First Name" 
                      required 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      name="lastName" 
                      control={control} 
                      label="Last Name" 
                      required 
                    />
                  </Grid>
                </Grid>

                {/* Email field */}
                <TextField 
                  name="email" 
                  control={control} 
                  label="Email" 
                  type="email" 
                  required 
                />

                {/* Conditionally render bar number field */}
                {userType === "lawyer" && (
                  <TextField 
                    name="barNumber" 
                    control={control} 
                    label="Bar Number" 
                    required 
                  />
                )}
                
                {/* Password field */}
                <TextField 
                  name="password" 
                  control={control}
                  label="Password" 
                  type="password" 
                  required 
                />
                
                {/* Password strength indicator */}
                <PasswordStrengthIndicator password={password || ""} />
                
                {/* Confirm Password field */}
                <TextField 
                  name="confirmPassword" 
                  control={control} 
                  label="Confirm Password"
                  type="password"
                  required 
                />

                {/* Terms of service and privacy policy agreement */}
                <FormControlLabel 
                  control={<Checkbox required color="primary" />} 
                  label={
                    <Typography variant="body2">
                      I agree to the{" "}
                      <Link to="/terms" className="text-[#0066ff] hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-[#0066ff] hover:underline">
                        Privacy Policy
                      </Link>
                    </Typography>
                  } 
                />
                
                {/* Signup button */}
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
                  {isSubmitting ? "Creating Account..." : "Sign up"}
                </Button>

                {/* Link to login page with query parameter */}
                <Box className="text-center mt-4">
                  <Typography variant="body2" color="textSecondary">
                    Already have an account?{" "}
                    <Link to={`/login?type=${userType}`} className="text-[#0066ff] hover:underline">
                      Sign in
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
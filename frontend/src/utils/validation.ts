import * as z from 'zod';

export const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const passwordRegex = {
  minLength: /.{8,}/,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
};

export const baseAuthSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(passwordRegex.hasUpperCase, 'Password must contain at least one uppercase letter').regex(passwordRegex.hasLowerCase, 'Password must contain at least one lowercase letter').regex(passwordRegex.hasNumber, 'Password must contain at least one number').regex(passwordRegex.hasSpecialChar, 'Password must contain at least one special character')
});

export const loginSchema = baseAuthSchema;

export const signupSchema = baseAuthSchema.extend({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  userType: z.enum(['client', 'lawyer'], {
    required_error: 'Please select a user type'
  }),
  confirmPassword: z.string(),
  barNumber: z.string().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine(
  (data) => {
    if (data.userType === "lawyer") {
      return !!data.barNumber;
    }
    return true;
  },
  {
    message: "Bar number is required for lawyers",
    path: ["barNumber"],
  }
);

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
});

export const reportCaseSchema = z.object({
  title: z.string()
    .min(5, "Case title must be at least 5 characters")
    .max(100, "Case title must not exceed 100 characters"),
  description: z.string()
    .min(20, "Please provide a more detailed description")
    .max(5000, "Description must not exceed 5000 characters"),
  category: z.string().optional(),
  urgencyLevel: z.enum(["Low", "Medium", "High"], {
    required_error: "Please select an urgency level",
  }),
  communicationMethod: z.enum(["Email", "Phone", "In-Person"], {
    required_error: "Please select a communication method",
  }),
  documents: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => {
        if (!files) return true;
        return Array.from(files).every(
          (file) =>
            file.size <= 10 * 1024 * 1024 && // 10MB
            ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg"].includes(
              file.type
            )
        );
      },
      "Files must be less than 10MB and in PDF, DOCX, or JPEG format"
    ),
  specialRequirements: z.string().max(500, "Special requirements must not exceed 500 characters").optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ReportCaseFormData = z.infer<typeof reportCaseSchema>;
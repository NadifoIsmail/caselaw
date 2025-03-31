import React from "react";
import { Box, Checkbox, Typography } from "@mui/material";
import { Check } from "lucide-react";
import { passwordRegex } from "../../utils/validation";
interface PasswordStrengthIndicatorProps {
  password: string;
}
export const PasswordStrengthIndicator = ({
  password
}: PasswordStrengthIndicatorProps) => {
  const checks = [{
    regex: passwordRegex.minLength,
    label: "At least 8 characters"
  }, {
    regex: passwordRegex.hasUpperCase,
    label: "Contains uppercase letter"
  }, {
    regex: passwordRegex.hasLowerCase,
    label: "Contains lowercase letter"
  }, {
    regex: passwordRegex.hasNumber,
    label: "Contains number"
  }, {
    regex: passwordRegex.hasSpecialChar,
    label: "Contains special character"
  }];
  return <Box sx={{
    mt: 2
  }}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Password Requirements:
      </Typography>
      {checks.map(({
      regex,
      label
    }) => <Box key={label} sx={{
      display: "flex",
      alignItems: "center"
    }}>
          <Checkbox checked={regex.test(password)} icon={<Check size={20} />} checkedIcon={<Check size={20} />} sx={{
        color: regex.test(password) ? "success.main" : "text.disabled",
        "&.Mui-checked": {
          color: "success.main"
        }
      }} />
          <Typography variant="body2" color={regex.test(password) ? "success.main" : "text.secondary"}>
            {label}
          </Typography>
        </Box>)}
    </Box>;
};
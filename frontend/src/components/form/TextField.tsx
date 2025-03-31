import React from "react";
import { TextField as MuiTextField } from "@mui/material";
import { Controller, Control } from "react-hook-form";
interface TextFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  type?: string;
  required?: boolean;
  fullWidth?: boolean;
}

export const TextField = ({
  name,
  control,
  label,
  type = "text",
  required = false,
  fullWidth = true
}: TextFieldProps) => {
  return <Controller name={name} control={control} render={({
    field,
    fieldState: {
      error
    }
  }) => <MuiTextField {...field} label={label} type={type} required={required} fullWidth={fullWidth} error={!!error} helperText={error?.message} variant="outlined" margin="normal" sx={{
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: "#0066ff"
      },
      "&.Mui-focused fieldset": {
        borderColor: "#0066ff"
      }
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#0066ff"
    }
  }} />} />;
};
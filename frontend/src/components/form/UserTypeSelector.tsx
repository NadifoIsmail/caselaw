import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";


interface UserTypeSelectorProps {
  selectedType: string;
  onChange: (type: "client" | "lawyer") => void;
  variant?: "mobile" | "desktop";
}


export const UserTypeSelector = ({
  selectedType,
  onChange,
  variant = "desktop"
}: UserTypeSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSelect = (type: "client" | "lawyer") => {
    onChange(type);
    handleClose();
  };

  
  return <Box>
      <Button onClick={handleClick} endIcon={open ? <ChevronUp size={20} /> : <ChevronDown size={20} />} fullWidth={variant === "mobile"} sx={{
      color: "text.primary",
      textTransform: "none",
      ...(variant === "mobile" && {
        justifyContent: "space-between",
        px: 2,
        py: 1.5
      })
    }}>
        {variant === "mobile" ? `Login as ${selectedType}` : selectedType}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{
      vertical: "bottom",
      horizontal: "right"
    }} transformOrigin={{
      vertical: "top",
      horizontal: "right"
    }}>
        <MenuItem onClick={() => handleSelect("client")}>Client</MenuItem>
        <MenuItem onClick={() => handleSelect("lawyer")}>Lawyer</MenuItem>
      </Menu>
    </Box>;
};
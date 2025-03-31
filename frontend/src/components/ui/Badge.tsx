/* eslint-disable @typescript-eslint/no-empty-interface */
import React from "react";
import { cn } from "../../utils/cn";


interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}
export const Badge = ({ className, ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
};

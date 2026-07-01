import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function GlassButton({
  variant = "secondary",
  className,
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={clsx(
        variant === "primary" ? "glass-button-primary" : "glass-button",
        className,
      )}
      {...props}
    />
  );
}

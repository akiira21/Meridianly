"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
  onLogout?: () => void;
  showIcon?: boolean;
}

export default function LogoutButton({
  children,
  className,
  onLogout,
  showIcon = true,
}: LogoutButtonProps) {
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);

  async function handleConfirm() {
    await logout();
    onLogout?.();
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn("transition-colors", className)}
      >
        {showIcon && <LogOut size={15} />}
        {children || "Log out"}
      </button>
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Log out?"
        description="Are you sure you want to log out of Meridianly?"
        confirmLabel="Log out"
        variant="destructive"
      />
    </>
  );
}

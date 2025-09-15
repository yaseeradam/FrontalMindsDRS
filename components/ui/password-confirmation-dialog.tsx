"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PasswordConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  adminName: string;
}

export function PasswordConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  adminName,
}: PasswordConfirmationDialogProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleConfirm = async () => {
    if (!password.trim()) {
      toast.error("Password is required for security verification");
      return;
    }

    // In production, this would verify against the actual admin password
    // For demo purposes, we'll use the same demo123 password
    if (password !== "demo123") {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      // Check if this is the 3rd failed attempt
      if (newAttempts >= 3) {
        // Mark as intruder and redirect to intruder page
        if (typeof window !== 'undefined') {
          localStorage.setItem('intruder_detected', 'true');
          localStorage.setItem('intruder_attempts', newAttempts.toString());
        }
        
        toast.error("🚨 INTRUDER ALERT! Too many failed attempts!");
        
        // Close dialog and redirect
        onOpenChange(false);
        setTimeout(() => {
          router.push('/intruder');
        }, 1000);
        
        return;
      }
      
      // Show warning for failed attempts
      const remainingAttempts = 3 - newAttempts;
      toast.error(`❌ Invalid password! ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before lockout!`);
      setPassword("");
      return;
    }

    setLoading(true);
    
    // Reset failed attempts on successful password
    setFailedAttempts(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('intruder_attempts');
      localStorage.removeItem('intruder_detected');
    }
    
    // Simulate security processing
    setTimeout(() => {
      onConfirm();
      setPassword("");
      setLoading(false);
      onOpenChange(false);
      toast.success("✅ Security verification passed. Data deleted successfully.");
    }, 1000);
  };

  const handleCancel = () => {
    setPassword("");
    setFailedAttempts(0); // Reset attempts on cancel
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
              <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="font-mono text-lg">{title}</DialogTitle>
              <div className="text-xs text-muted-foreground font-mono">SECURITY VERIFICATION REQUIRED</div>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-red-800 dark:text-red-300 text-sm mb-2">HIGH SECURITY ACTION</div>
                <DialogDescription className="text-red-700 dark:text-red-400 text-xs font-mono leading-relaxed">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-sm font-mono font-semibold">ADMIN IDENTITY</span>
            </div>
            <div className="text-sm font-mono text-muted-foreground">
              Logged in as: <span className="text-foreground font-semibold">{adminName}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-mono font-semibold">
              Enter your password to confirm this action:
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="font-mono"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleConfirm();
                }
              }}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-mono">
                Use password: <code className="bg-muted px-1 rounded">demo123</code>
              </div>
              {failedAttempts > 0 && (
                <div className="text-xs text-red-500 font-mono">
                  ❌ Failed: {failedAttempts}/3
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="font-mono"
          >
            CANCEL
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || !password.trim()}
            className="font-mono"
          >
            {loading ? "VERIFYING..." : "CONFIRM DELETE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

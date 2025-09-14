import { useAuth, UserRole } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function useRoleProtection(requiredRoles?: UserRole[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Redirect to login if not authenticated
      if (!user) {
        router.push('/login');
        return;
      }

      // Check role permissions
      if (requiredRoles && !requiredRoles.includes(user.role)) {
        toast.error(`Access denied. ${requiredRoles.join(' or ')} role required.`);
        router.push('/dashboard');
        return;
      }
    }
  }, [user, isLoading, requiredRoles, router]);

  return {
    user,
    isLoading,
    hasAccess: !isLoading && user && (!requiredRoles || requiredRoles.includes(user.role))
  };
}

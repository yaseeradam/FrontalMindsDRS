import Link from "next/link";
import { Shield, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4 text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Shield className="h-16 w-16 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-wider text-primary font-mono">404</h1>
            <h2 className="text-xl font-semibold text-foreground font-mono">ACCESS DENIED</h2>
            <p className="text-sm text-muted-foreground font-mono">
              The requested resource could not be located in the system database.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="space-y-4">
            <div className="text-xs font-mono text-muted-foreground text-center">
              SYSTEM NOTIFICATION
            </div>
            <div className="text-sm text-foreground font-mono text-center">
              Page not found in Braniacs Police DRS
            </div>
            
            <div className="flex flex-col gap-3 pt-4">
              <Button asChild className="w-full font-mono bg-primary hover:bg-primary/90">
                <Link href="/dashboard" className="flex items-center justify-center gap-2">
                  <Home className="h-4 w-4" />
                  RETURN TO COMMAND CENTER
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full font-mono">
                <Link href="javascript:history.back()" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  GO BACK
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground font-mono">
          BRANIACS POLICE DRS v0.1.0 | PROTOTYPE SYSTEM
        </div>
      </div>
    </div>
  );
}

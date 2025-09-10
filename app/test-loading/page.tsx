"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useButtonLoading } from "@/hooks/use-button-loading";
import { useLoading } from "@/contexts/loading-context";
import { Plus, Download, Trash, RefreshCcw } from "lucide-react";

export default function TestLoadingPage() {
  const { withLoading, showLoading } = useButtonLoading();
  const { isLoading } = useLoading();

  const simulateAction = async () => {
    // Simulate some async work
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Action completed");
  };

  const handleManualLoading = () => {
    showLoading(3000); // Show loading for 3 seconds
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h1 className="text-2xl font-bold tracking-wider text-primary font-mono">LOADING SYSTEM DEMO</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          TESTING GLOBAL LOADING SPINNER FUNCTIONALITY
        </p>
        <div className="mt-4">
          <div className="text-sm font-mono">
            Loading State: <span className={isLoading ? "text-green-400" : "text-gray-400"}>
              {isLoading ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono">LoadingButton Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoadingButton 
              className="w-full"
              loadingText="Creating..."
              onClick={withLoading(simulateAction, 2000)}
            >
              <Plus className="h-4 w-4 mr-2" />
              CREATE RECORD
            </LoadingButton>

            <LoadingButton 
              variant="outline"
              className="w-full"
              loadingText="Downloading..."
              loadingDuration={3000}
            >
              <Download className="h-4 w-4 mr-2" />
              DOWNLOAD REPORT
            </LoadingButton>

            <LoadingButton 
              variant="destructive"
              className="w-full"
              loadingText="Deleting..."
              loadingDuration={1500}
            >
              <Trash className="h-4 w-4 mr-2" />
              DELETE ITEM
            </LoadingButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Manual Loading Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline"
              className="w-full"
              onClick={handleManualLoading}
              disabled={isLoading}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              TRIGGER 3s LOADING
            </Button>

            <div className="text-sm text-muted-foreground">
              Click above to manually trigger a 3-second loading spinner.
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-xs font-mono text-muted-foreground mb-2">FEATURES:</div>
              <ul className="text-xs space-y-1">
                <li>• Global loading spinner overlay</li>
                <li>• Automatic button disabled state</li>
                <li>• Customizable loading duration</li>
                <li>• Works with any button click</li>
                <li>• Consistent UI across all pages</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm font-mono font-semibold mb-2">Method 1: LoadingButton Component</div>
              <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
{`<LoadingButton 
  loadingText="Processing..."
  loadingDuration={2000}
>
  PROCESS DATA
</LoadingButton>`}
              </pre>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm font-mono font-semibold mb-2">Method 2: useButtonLoading Hook</div>
              <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
{`const { withLoading } = useButtonLoading();

<Button onClick={withLoading(myFunction, 1500)}>
  CLICK ME
</Button>`}
              </pre>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm font-mono font-semibold mb-2">Method 3: Manual Control</div>
              <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
{`const { showLoading } = useLoading();

const handleClick = () => {
  showLoading(2000);
  // Your action here
};`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

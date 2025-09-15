import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[50vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-3 gap-2 items-center">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h1 className="text-xl md:text-2xl font-semibold">404 Page Not Found</h1>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

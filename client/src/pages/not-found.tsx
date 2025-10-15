import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen bg-eth-warm-tan">
      <div className="ethiopian-pattern-sidebar fixed left-0 top-0 hidden lg:block"></div>
      <div className="flex-1 lg:ml-20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-white/60 backdrop-blur-sm border-eth-brown/20">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-eth-orange" />
              <h1 className="text-2xl font-bold text-eth-brown">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-eth-brown">
              Did you forget to add the page to the router?
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

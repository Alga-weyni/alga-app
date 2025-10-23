import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    navigate("/");
    return null;
  }

  const handleAddCard = () => {
    toast({
      title: "Add Payment Method",
      description: "Payment method feature coming soon.",
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "#faf5f0" }}>
      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/profile")}
            data-testid="button-back-profile"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8" style={{ color: "#2d1405" }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#2d1405" }}>
                Payment Methods
              </h1>
              <p style={{ color: "#5a4a42" }}>
                Manage your payment options
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card style={{ background: "#fff" }} data-testid="card-payment-methods">
          <CardHeader>
            <CardTitle style={{ color: "#2d1405" }}>Saved Payment Methods</CardTitle>
            <CardDescription>Your cards and payment accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: "#5a4a42" }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: "#2d1405" }}>
                No payment methods yet
              </h3>
              <p className="text-sm mb-6" style={{ color: "#5a4a42" }}>
                Add a payment method to make booking faster
              </p>
              <Button onClick={handleAddCard} data-testid="button-add-payment">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }} data-testid="card-payment-options">
          <CardHeader>
            <CardTitle style={{ color: "#2d1405" }}>Accepted Payment Options</CardTitle>
            <CardDescription>Available payment methods on Alga</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CreditCard className="w-5 h-5" style={{ color: "#5a4a42" }} />
              <div>
                <p className="font-medium" style={{ color: "#2d1405" }}>Credit & Debit Cards</p>
                <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CreditCard className="w-5 h-5" style={{ color: "#5a4a42" }} />
              <div>
                <p className="font-medium" style={{ color: "#2d1405" }}>Chapa</p>
                <p className="text-sm text-muted-foreground">Telebirr, CBE Birr, M-Pesa</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CreditCard className="w-5 h-5" style={{ color: "#5a4a42" }} />
              <div>
                <p className="font-medium" style={{ color: "#2d1405" }}>PayPal</p>
                <p className="text-sm text-muted-foreground">International payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

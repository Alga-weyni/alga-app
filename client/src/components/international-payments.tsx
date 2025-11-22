import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Smartphone, 
  Globe, 
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface InternationalPaymentsProps {
  amount: number;
  currency: string;
  bookingId: string;
  userCountry?: string;
  onPaymentSuccess: (paymentResult: any) => void;
}

export default function InternationalPayments({ 
  amount, 
  currency, 
  bookingId, 
  userCountry,
  onPaymentSuccess 
}: InternationalPaymentsProps) {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Payment methods based on user's region/country
  const getAvailablePaymentMethods = () => {
    const methods = [
      // Ethiopian methods
      {
        id: 'telebirr',
        name: 'Telebirr',
        icon: '📱',
        description: 'Ethiopian mobile payment',
        regions: ['ET'],
        type: 'mobile'
      },
      {
        id: 'cbe',
        name: 'Commercial Bank of Ethiopia',
        icon: '🏦',
        description: 'Direct bank transfer',
        regions: ['ET'],
        type: 'bank'
      },
      {
        id: 'dashen',
        name: 'Dashen Bank',
        icon: '🏦',
        description: 'Ethiopian banking',
        regions: ['ET'],
        type: 'bank'
      },
      
      // International methods
      {
        id: 'wechat_pay',
        name: 'WeChat Pay',
        icon: '💬',
        description: '微信支付 - Chinese mobile payment',
        regions: ['CN', 'HK', 'TW'],
        type: 'mobile'
      },
      {
        id: 'alipay',
        name: 'Alipay',
        icon: '🅰️',
        description: '支付宝 - Chinese digital wallet',
        regions: ['CN', 'HK', 'TW'],
        type: 'mobile'
      },
      {
        id: 'mada',
        name: 'Mada',
        icon: '💳',
        description: 'مدى - Saudi Arabian payment network',
        regions: ['SA', 'AE', 'KW'],
        type: 'card'
      },
      {
        id: 'orange_money',
        name: 'Orange Money',
        icon: '🍊',
        description: 'African mobile money',
        regions: ['SN', 'ML', 'CI', 'BF', 'NE', 'GN', 'MG'],
        type: 'mobile'
      },
      {
        id: 'mpesa',
        name: 'M-Pesa',
        icon: '📱',
        description: 'East African mobile money',
        regions: ['KE', 'TZ', 'UG', 'RW'],
        type: 'mobile'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: '🅿️',
        description: 'Global digital payments',
        regions: ['US', 'EU', 'AU', 'CA', 'GB'],
        type: 'wallet'
      },
      {
        id: 'visa',
        name: 'Visa',
        icon: '💳',
        description: 'International credit card',
        regions: ['GLOBAL'],
        type: 'card'
      },
      {
        id: 'mastercard',
        name: 'Mastercard',
        icon: '💳',
        description: 'International credit card',
        regions: ['GLOBAL'],
        type: 'card'
      }
    ];

    // Filter methods based on user's country or show all
    if (userCountry) {
      return methods.filter(method => 
        method.regions.includes(userCountry) || 
        method.regions.includes('GLOBAL') ||
        method.regions.includes('ET') // Always show Ethiopian methods
      );
    }
    
    return methods;
  };

  const handlePayment = async (methodId: string) => {
    setIsProcessing(true);
    
    try {
      let paymentEndpoint = '';
      let paymentData = {
        amount,
        currency,
        bookingId,
        paymentMethod: methodId
      };

      // Route to appropriate payment processor
      switch (methodId) {
        case 'telebirr':
          paymentEndpoint = '/api/payments/telebirr';
          break;
        case 'cbe':
          paymentEndpoint = '/api/payments/cbe';
          break;
        case 'dashen':
          paymentEndpoint = '/api/payments/dashen';
          break;
        case 'wechat_pay':
          paymentEndpoint = '/api/payments/wechat';
          break;
        case 'alipay':
          paymentEndpoint = '/api/payments/alipay';
          break;
        case 'mada':
          paymentEndpoint = '/api/payments/mada';
          break;
        case 'orange_money':
          paymentEndpoint = '/api/payments/orange-money';
          break;
        case 'mpesa':
          paymentEndpoint = '/api/payments/mpesa';
          break;
        case 'paypal':
          paymentEndpoint = '/api/payments/paypal';
          break;
        default:
          paymentEndpoint = '/api/payments/card';
      }

      const response = await fetch(paymentEndpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Payment Successful! 🎉",
          description: `Your booking has been confirmed with ${getAvailablePaymentMethods().find(m => m.id === methodId)?.name}`,
        });
        onPaymentSuccess(result);
      } else {
        throw new Error(result.message || 'Payment failed');
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Please try a different payment method",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const availableMethods = getAvailablePaymentMethods();
  const ethiopianMethods = availableMethods.filter(m => m.regions.includes('ET'));
  const internationalMethods = availableMethods.filter(m => !m.regions.includes('ET') || m.regions.includes('GLOBAL'));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>International Payment Options</span>
          </CardTitle>
          <CardDescription>
            Choose your preferred payment method from options available in your region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-2xl font-bold">{amount} {currency}</div>
            <p className="text-muted-foreground">Total amount to pay</p>
          </div>
        </CardContent>
      </Card>

      {/* Ethiopian Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-lg">🇪🇹</span>
            <span>Ethiopian Payment Methods</span>
          </CardTitle>
          <CardDescription>Local payment options for Ethiopian residents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ethiopianMethods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                selectedMethod === method.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-muted-foreground">{method.description}</div>
                </div>
              </div>
              <Badge variant={method.type === 'mobile' ? 'default' : 'secondary'}>
                {method.type}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* International Payment Methods */}
      {internationalMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>International Payment Methods</span>
            </CardTitle>
            <CardDescription>Global payment options for international visitors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {internationalMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMethod === method.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={method.type === 'mobile' ? 'default' : method.type === 'card' ? 'secondary' : 'outline'}>
                    {method.type}
                  </Badge>
                  {method.regions.includes('GLOBAL') && (
                    <Badge variant="outline" className="text-xs">Global</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>All payments are secured with 256-bit SSL encryption and comply with international payment standards</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      {selectedMethod && (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={() => handlePayment(selectedMethod)}
              disabled={isProcessing}
              className="w-full h-12 text-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Pay {amount} {currency} with {availableMethods.find(m => m.id === selectedMethod)?.name}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
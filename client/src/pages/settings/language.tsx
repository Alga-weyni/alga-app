import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Globe, DollarSign, Calendar } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";

export default function LanguageSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("ETB");
  const [dateFormat, setDateFormat] = useState("dd/mm/yyyy");

  if (!user) {
    navigate("/");
    return null;
  }

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your language and region preferences have been updated.",
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ background: "#faf5f0" }}>
      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/settings")}
            data-testid="button-back-settings"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8" style={{ color: "#2d1405" }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#2d1405" }}>
                Language & Region
              </h1>
              <p style={{ color: "#5a4a42" }}>
                Customize your location and display preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card style={{ background: "#fff" }} data-testid="card-language">
          <CardHeader>
            <CardTitle style={{ color: "#2d1405" }}>Language</CardTitle>
            <CardDescription>Choose your preferred language</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={language} onValueChange={setLanguage}>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="en" id="lang-en" data-testid="radio-lang-en" />
                <Label htmlFor="lang-en" className="flex-1 cursor-pointer">
                  <p className="font-medium" style={{ color: "#2d1405" }}>English</p>
                  <p className="text-sm text-muted-foreground">English (US)</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="am" id="lang-am" data-testid="radio-lang-am" />
                <Label htmlFor="lang-am" className="flex-1 cursor-pointer">
                  <p className="font-medium" style={{ color: "#2d1405" }}>አማርኛ</p>
                  <p className="text-sm text-muted-foreground">Amharic</p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }} data-testid="card-currency">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <DollarSign className="w-5 h-5" />
              Currency
            </CardTitle>
            <CardDescription>Select your preferred currency</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger data-testid="select-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETB">Ethiopian Birr (ETB)</SelectItem>
                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="GBP">British Pound (GBP)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }} data-testid="card-date-format">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <Calendar className="w-5 h-5" />
              Date Format
            </CardTitle>
            <CardDescription>Choose how dates are displayed</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={dateFormat} onValueChange={setDateFormat}>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="dd/mm/yyyy" id="date-1" data-testid="radio-date-ddmmyyyy" />
                <Label htmlFor="date-1" className="flex-1 cursor-pointer">
                  <p className="font-medium" style={{ color: "#2d1405" }}>DD/MM/YYYY</p>
                  <p className="text-sm text-muted-foreground">Example: 23/10/2025</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="mm/dd/yyyy" id="date-2" data-testid="radio-date-mmddyyyy" />
                <Label htmlFor="date-2" className="flex-1 cursor-pointer">
                  <p className="font-medium" style={{ color: "#2d1405" }}>MM/DD/YYYY</p>
                  <p className="text-sm text-muted-foreground">Example: 10/23/2025</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="yyyy-mm-dd" id="date-3" data-testid="radio-date-yyyymmdd" />
                <Label htmlFor="date-3" className="flex-1 cursor-pointer">
                  <p className="font-medium" style={{ color: "#2d1405" }}>YYYY-MM-DD</p>
                  <p className="text-sm text-muted-foreground">Example: 2025-10-23</p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} data-testid="button-save-language">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api-config";
import { 
  Globe, 
  Languages, 
  Star, 
  Calendar,
  Gift,
  MapPin,
  Users
} from "lucide-react";

interface InternationalFeaturesProps {
  userCountry?: string;
  userLanguage?: string;
  propertyId?: number;
}

export default function InternationalFeatures({ 
  userCountry, 
  userLanguage = 'en',
  propertyId 
}: InternationalFeaturesProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(userLanguage);
  const [selectedCurrency, setSelectedCurrency] = useState('ETB');
  const [reviews, setReviews] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const { toast } = useToast();

  // Supported languages with native names
  const supportedLanguages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
    { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' }
  ];

  // Supported currencies
  const supportedCurrencies = [
    { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹' },
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' }
  ];

  // Get culturally relevant promotions
  const getCulturalPromotions = () => {
    const promotions = [];
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;

    // Chinese market promotions
    if (selectedLanguage === 'zh' || userCountry === 'CN') {
      if (month === 2) {
        promotions.push({
          id: 'chinese_new_year',
          title: '春节特惠 Chinese New Year Special',
          description: '15% off all bookings during Spring Festival',
          discount: '15%',
          validUntil: 'February 28',
          cultural: true
        });
      }
      promotions.push({
        id: 'dragon_boat',
        title: '端午节优惠 Dragon Boat Festival Offer',
        description: 'Special rates for cultural heritage stays',
        discount: '10%',
        validUntil: 'June 30',
        cultural: true
      });
    }

    // Arabic market promotions
    if (selectedLanguage === 'ar' || ['SA', 'AE', 'KW'].includes(userCountry || '')) {
      promotions.push({
        id: 'ramadan_special',
        title: 'عرض رمضان الكريم Ramadan Special',
        description: 'Peaceful retreat packages during holy month',
        discount: '20%',
        validUntil: 'End of Ramadan',
        cultural: true
      });
    }

    // Ethiopian cultural events
    promotions.push({
      id: 'timkat_festival',
      title: 'Timkat Festival Experience',
      description: 'Special packages for Ethiopian Orthodox Epiphany',
      discount: '25%',
      validUntil: 'January 20',
      cultural: true
    });

    return promotions;
  };

  // Auto-translate review text
  const translateReview = async (text: string, targetLang: string) => {
    try {
      // In production, use Google Translate API or similar
      // For now, showing the concept
      const response = await fetch(getApiUrl('/api/translate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text, targetLanguage: targetLang })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.translatedText;
      }
    } catch (error) {
      console.error('Translation failed:', error);
    }
    return text; // Fallback to original text
  };

  // Geo-IP based recommendations
  const getGeoRecommendations = () => {
    const recommendations = [];

    switch (userCountry) {
      case 'SD': // Sudan
        recommendations.push({
          title: 'Bahir Dar Lake Retreats',
          description: 'Cool lakeside escapes near the Blue Nile source',
          highlight: 'Popular with Sudanese visitors'
        });
        break;
      case 'KE': // Kenya  
        recommendations.push({
          title: 'Rift Valley Adventures',
          description: 'Explore Ethiopian highlands and crater lakes',
          highlight: 'Similar landscapes to Kenya'
        });
        break;
      case 'CN': // China
        recommendations.push({
          title: 'Lalibela Heritage Tours',
          description: 'Ancient rock churches and spiritual experiences',
          highlight: 'UNESCO World Heritage sites'
        });
        break;
      default:
        recommendations.push({
          title: 'Addis Ababa Cultural Hub',
          description: 'Perfect base for exploring Ethiopian culture',
          highlight: 'International visitor favorite'
        });
    }

    return recommendations;
  };

  useEffect(() => {
    setPromotions(getCulturalPromotions());
  }, [selectedLanguage, userCountry]);

  return (
    <div className="space-y-6">
      {/* Language & Currency Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Language & Currency</span>
          </CardTitle>
          <CardDescription>
            Customize your experience in your preferred language and currency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.native}</span>
                        <span className="text-muted-foreground">({lang.name})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Currency</label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center space-x-2">
                        <span>{currency.flag}</span>
                        <span>{currency.code}</span>
                        <span className="text-muted-foreground">({currency.symbol})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cultural Promotions */}
      {promotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5" />
              <span>Special Offers for You</span>
            </CardTitle>
            <CardDescription>
              Culturally relevant promotions and seasonal discounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {promotions.map((promo) => (
              <div key={promo.id} className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{promo.title}</h4>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {promo.discount} OFF
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{promo.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Valid until {promo.validUntil}</span>
                  {promo.cultural && <Badge variant="outline">Cultural Event</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Geo-based Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Recommended for You</span>
          </CardTitle>
          <CardDescription>
            Personalized suggestions based on your location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {getGeoRecommendations().map((rec, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-1">{rec.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
              <Badge variant="outline" className="text-xs">
                {rec.highlight}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Multi-language Reviews Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="h-5 w-5" />
            <span>Guest Reviews</span>
          </CardTitle>
          <CardDescription>
            Reviews from international guests in multiple languages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇨🇳</span>
                  <span className="font-medium">李明 (Li Ming)</span>
                  <div className="flex items-center">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <Badge variant="outline">Auto-translated</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {selectedLanguage === 'zh' 
                  ? "这是一次令人难忘的体验！主人非常热情，房间干净舒适。强烈推荐给其他中国游客。"
                  : "An unforgettable experience! The host was very welcoming and the room was clean and comfortable. Highly recommend to other Chinese visitors."
                }
              </p>
              <span className="text-xs text-muted-foreground">Originally in Chinese</span>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇸🇦</span>
                  <span className="font-medium">أحمد المالكي (Ahmed Al-Malki)</span>
                  <div className="flex items-center">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <Badge variant="outline">Auto-translated</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {selectedLanguage === 'ar'
                  ? "مكان رائع للإقامة في أديس أبابا. المضيف كان مفيداً جداً ونصحني بأماكن حلال للطعام."
                  : "Wonderful place to stay in Addis Ababa. The host was very helpful and recommended halal food places."
                }
              </p>
              <span className="text-xs text-muted-foreground">Originally in Arabic</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 24/7 Multilingual Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>24/7 Support</span>
          </CardTitle>
          <CardDescription>
            Get help in your language, anytime
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="font-medium">AI Chat Support</div>
              <div className="text-sm text-muted-foreground">Available in 12 languages</div>
              <div className="text-xs text-muted-foreground mt-1">Instant responses</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium">Human Support</div>
              <div className="text-sm text-muted-foreground">English, Amharic, Arabic</div>
              <div className="text-xs text-muted-foreground mt-1">24/7 availability</div>
            </div>
          </div>
          
          <Button className="w-full mt-4">
            <Languages className="h-4 w-4 mr-2" />
            Start Chat in {supportedLanguages.find(l => l.code === selectedLanguage)?.native}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
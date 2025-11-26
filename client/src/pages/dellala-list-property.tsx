import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2, Upload, Plus, X, ImageIcon, ArrowLeft, Home, User, Phone, Mail, FileText, Shield, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";

// Property suggestions and constants (same as host dashboard)
const PROPERTY_TITLE_SUGGESTIONS = [
  "Cozy Guesthouse in Addis",
  "Traditional Ethiopian Home",
  "Modern Apartment with Mountain View",
  "Peaceful Lake View Lodge",
  "Historic Gondar Family Home",
  "Eco-Friendly Cottage in Bahir Dar",
  "Harar Heritage House",
  "Addis City Center Studio",
  "Lalibela Stone House",
  "Rift Valley Eco Lodge",
];

const PROPERTY_TYPES = [
  { value: "hotel", label: "Hotel" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "traditional_home", label: "Traditional Home" },
  { value: "eco_lodge", label: "Eco Lodge" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
];

const ETHIOPIAN_CITIES = [
  "Addis Ababa",
  "Bahir Dar",
  "Gondar",
  "Mekelle",
  "Hawassa",
  "Dire Dawa",
  "Adama",
  "Jimma",
  "Harar",
  "Lalibela",
  "Axum",
  "Arba Minch",
];

const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Oromia",
  "Amhara",
  "Tigray",
  "SNNPR",
  "Somali",
  "Afar",
  "Benishangul-Gumuz",
  "Gambela",
  "Harari",
  "Dire Dawa",
  "Sidama",
];

const AMENITIES = [
  "WiFi",
  "Air Conditioning",
  "Kitchen",
  "Parking",
  "Swimming Pool",
  "Restaurant",
  "Bar",
  "Gym",
  "Spa",
  "Conference Room",
  "Airport Shuttle",
  "Pet Friendly",
  "24/7 Reception",
  "Room Service",
  "Laundry Service",
  "Traditional Coffee Ceremony",
  "Cultural Tours",
  "Mountain View",
  "Lake View",
  "Garden",
];

const propertySchema = z.object({
  // Property fields
  title: z.string().min(1, "Property title is required"),
  type: z.string().min(1, "Property type is required"),
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "Region is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  images: z.array(z.string()).min(5, "At least 5 images are required"),
  maxGuests: z.number().min(1, "At least 1 guest required"),
  bedrooms: z.number().min(1, "At least 1 bedroom required"),
  bathrooms: z.number().min(1, "At least 1 bathroom required"),
  pricePerNight: z.string().min(1, "Price is required"),
  amenities: z.array(z.string()).optional(),
  
  // Owner information fields (REQUIRED for legitimacy verification)
  ownerFullName: z.string().min(1, "Owner full name is required"),
  ownerPhone: z.string().min(10, "Owner phone number is required"),
  ownerEmail: z.string().email("Valid email required").optional(),
  ownerIdNumber: z.string().min(1, "Owner ID number is required for verification"),
  propertyDeedUrl: z.string().min(1, "Property title deed document is required"),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function DellalaListProperty() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [propertyDeedUrl, setPropertyDeedUrl] = useState<string>("");
  const [uploadingDeed, setUploadingDeed] = useState(false);
  const deedInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      type: "",
      city: "",
      region: "",
      location: "",
      description: "",
      images: [],
      maxGuests: 1,
      bedrooms: 1,
      bathrooms: 1,
      pricePerNight: "0",
      amenities: [],
      ownerFullName: "",
      ownerPhone: "",
      ownerEmail: "",
      ownerIdNumber: "",
      propertyDeedUrl: "",
    },
  });

  useEffect(() => {
    form.setValue("images", imageUrls);
    form.setValue("amenities", selectedAmenities);
    form.setValue("propertyDeedUrl", propertyDeedUrl);
  }, [imageUrls, selectedAmenities, propertyDeedUrl, form]);

  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      return await apiRequest("POST", "/api/dellala/list-property", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dellala/dashboard'] });
      toast({
        title: "Property Listed Successfully! 🎉",
        description: "The property owner will be notified and the listing will be reviewed by our team.",
      });
      navigate("/dellala/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFiles(Array.from(files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    setUploadingFiles(true);
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: `${file.name} is not an image`,
          variant: "destructive",
        });
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setUploadingFiles(false);
      return;
    }

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append("images", file);
      });

      const response = await fetch("/api/upload/property-images", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      setImageUrls([...imageUrls, ...result.urls]);
      
      toast({
        title: "Images uploaded successfully",
        description: `${result.count} image(s) uploaded`,
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    }

    setUploadingFiles(false);
  };

  const removeImageUrl = (urlToRemove: string) => {
    setImageUrls(imageUrls.filter(url => url !== urlToRemove));
  };

  const handleDeedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast({
        title: "Invalid File",
        description: "Please upload an image or PDF document",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Document must be under 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingDeed(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload/id-document", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      setPropertyDeedUrl(result.url);
      toast({
        title: "Document Uploaded",
        description: "Property title deed uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload property deed document",
        variant: "destructive",
      });
    } finally {
      setUploadingDeed(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const onSubmit = (data: PropertyFormData) => {
    if (imageUrls.length < 5) {
      toast({
        title: "Not Enough Images",
        description: "Please upload at least 5 images",
        variant: "destructive",
      });
      return;
    }
    createPropertyMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#F8F1E7]">
      <Header />
      
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dellala/dashboard")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-eth-brown flex items-center gap-2">
              <Home className="h-6 w-6" />
              List New Property (as Agent)
            </CardTitle>
            <CardDescription>
              Fill out property details and owner information. You'll earn 5% commission on all bookings for 36 months!
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Owner Information Section */}
                <div className="space-y-4 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-blue-700" />
                    <h3 className="text-lg font-bold text-eth-brown">
                      Property Owner Information <span className="text-red-700">(NOT ደላላ information!)</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ownerFullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            Owner Full Name <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Full name as on ID..."
                              required
                              data-testid="input-owner-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ownerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            Owner Phone Number <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <Input 
                                {...field} 
                                placeholder="+251912345678"
                                type="tel"
                                required
                                data-testid="input-owner-phone"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ownerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            Owner Email <span className="text-gray-500">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <Input 
                                {...field} 
                                placeholder="owner@example.com"
                                type="email"
                                data-testid="input-owner-email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ownerIdNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            Owner ID Number <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Ethiopian ID or Passport..."
                              required
                              data-testid="input-owner-id"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Property Title Deed Upload */}
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <Shield className="h-5 w-5 text-yellow-700 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-eth-brown mb-1">Ownership Verification Required</h4>
                        <p className="text-sm text-eth-brown/80">
                          To ensure legitimacy and protect property owners, we require proof of ownership. 
                          Upload a clear photo or scan of the property title deed.
                        </p>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="propertyDeedUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            Property Title Deed <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <input
                                ref={deedInputRef}
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleDeedUpload}
                                className="hidden"
                                data-testid="input-deed-upload"
                              />
                              
                              {!propertyDeedUrl ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => deedInputRef.current?.click()}
                                  disabled={uploadingDeed}
                                  className="w-full border-2 border-dashed border-yellow-500 hover:border-yellow-600 hover:bg-yellow-50"
                                  data-testid="button-upload-deed"
                                >
                                  {uploadingDeed ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="mr-2 h-4 w-4" />
                                      Upload Property Title Deed (Image or PDF)
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-green-700" />
                                    <span className="text-sm font-medium text-green-800">
                                      ✓ Document Uploaded
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setPropertyDeedUrl("");
                                      if (deedInputRef.current) {
                                        deedInputRef.current.value = "";
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    data-testid="button-remove-deed"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Remove
                                  </Button>
                                </div>
                              )}
                              <p className="text-xs text-eth-brown/60">
                                Accepted formats: JPG, PNG, PDF • Max 10MB
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Property Details Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-eth-brown">Property Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            Property Title <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-1">
                              <Input
                                {...field}
                                list="property-title-suggestions"
                                placeholder="Choose or type your own..."
                                required
                                data-testid="input-property-title"
                              />
                              <datalist id="property-title-suggestions">
                                {PROPERTY_TITLE_SUGGESTIONS.map((suggestion) => (
                                  <option key={suggestion} value={suggestion} />
                                ))}
                              </datalist>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                💡 <span>Choose a name that reflects your stay's character</span>
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            Property Type <span className="text-red-600">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} required>
                            <FormControl>
                              <SelectTrigger data-testid="select-property-type">
                                <SelectValue placeholder="Select property type..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PROPERTY_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            City <span className="text-red-600">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} required>
                            <FormControl>
                              <SelectTrigger data-testid="select-city">
                                <SelectValue placeholder="Select city..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ETHIOPIAN_CITIES.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            Region <span className="text-red-600">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} required>
                            <FormControl>
                              <SelectTrigger data-testid="select-region">
                                <SelectValue placeholder="Select region..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ETHIOPIAN_REGIONS.map((region) => (
                                <SelectItem key={region} value={region}>
                                  {region}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-eth-brown">
                          Specific Location <span className="text-red-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Street address or area name..." {...field} required data-testid="input-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-eth-brown">
                          Description <span className="text-gray-500">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your property, its unique features, and what makes it special..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Property Images Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-eth-brown">
                        Property Images <span className="text-red-600">*</span> {imageUrls.length > 0 && `(${imageUrls.length})`}
                      </Label>
                      <span className={`text-sm font-semibold ${imageUrls.length >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                        {imageUrls.length < 5 ? `Minimum 5 images required (${5 - imageUrls.length} more needed)` : '✓ Minimum met'}
                      </span>
                    </div>

                    <div
                      className={`relative border-2 border-dashed rounded-lg transition-all ${
                        dragActive
                          ? 'border-eth-brown bg-eth-brown/10'
                          : 'border-eth-brown/30 hover:border-eth-brown/50 bg-eth-light-tan/30'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        data-testid="input-file-upload"
                      />
                      
                      <div className="p-8 text-center">
                        <div className="flex justify-center mb-4">
                          {uploadingFiles ? (
                            <Loader2 className="h-16 w-16 text-eth-brown animate-spin" />
                          ) : (
                            <div className="relative inline-block">
                              <div className="bg-eth-brown/10 p-4 rounded-full">
                                <Upload className="h-10 w-10 text-eth-brown" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-eth-brown rounded-full p-1.5">
                                <ImageIcon className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-base font-semibold text-eth-brown">
                            {uploadingFiles ? 'Uploading images...' : dragActive ? 'Drop your images here' : 'Upload Property Images'}
                          </p>
                          <p className="text-sm text-eth-brown/70">
                            Drag and drop images here, or click to browse
                          </p>
                          <p className="text-xs text-eth-brown/50">
                            Supports: JPG, PNG, WebP • Max 10MB per file
                          </p>
                        </div>

                        {!uploadingFiles && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 border-eth-brown text-eth-brown hover:bg-eth-brown hover:text-white"
                            data-testid="button-browse-images"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Browse Files
                          </Button>
                        )}
                      </div>
                    </div>

                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {imageUrls.map((url, index) => (
                          <div 
                            key={index} 
                            className="relative group rounded-lg overflow-hidden border-2 border-eth-brown/20 hover:border-eth-brown/40 transition-all"
                            data-testid={`uploaded-image-${index}`}
                          >
                            <div className="aspect-square">
                              <img 
                                src={url} 
                                alt={`Property ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {index === 0 && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-eth-brown text-white text-xs">Main</Badge>
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeImageUrl(url)}
                              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                              data-testid={`button-remove-image-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-eth-brown/60">
                      Upload at least 5 high-quality images of your property. The first image will be used as the main display image.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="maxGuests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            Max Guests <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              required
                              data-testid="input-max-guests"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            Bedrooms <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              required
                              data-testid="input-bedrooms"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            Bathrooms <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              required
                              data-testid="input-bathrooms"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricePerNight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">
                            Price per Night (ETB) <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01"
                              {...field}
                              required
                              data-testid="input-price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Amenities */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Amenities</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {AMENITIES.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`amenity-${amenity}`}
                            checked={selectedAmenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            className="rounded border-gray-300"
                            data-testid={`checkbox-amenity-${amenity}`}
                          />
                          <label
                            htmlFor={`amenity-${amenity}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dellala/dashboard")}
                    disabled={createPropertyMutation.isPending}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPropertyMutation.isPending || imageUrls.length < 5}
                    className="flex-1 bg-eth-orange hover:opacity-90"
                    data-testid="button-create-property"
                  >
                    {createPropertyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Property"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

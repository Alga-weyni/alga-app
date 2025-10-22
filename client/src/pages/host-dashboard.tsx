import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Home,
  Calendar,
  BarChart3,
  Settings,
  Bed,
  Bath,
  Users,
  MapPin,
  Star,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Bookmark,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { BackButton } from "@/components/back-button";
import { HostEarnings } from "@/components/host-earnings";
import { insertPropertySchema } from "@shared/schema";
import { PROPERTY_TYPES, ETHIOPIAN_CITIES, ETHIOPIAN_REGIONS, AMENITIES } from "@/lib/constants";
import type { Property, Booking } from "@shared/schema";

const propertyFormSchema = insertPropertySchema.omit({
  hostId: true,
}).extend({
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).min(5, "At least 5 property images are required"),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

// Ethiopian-relevant property title suggestions
const PROPERTY_TITLE_SUGGESTIONS = [
  "Traditional Ethiopian Home",
  "Modern City Apartment",
  "Family Guesthouse Retreat",
  "Lakeside Villa",
  "Mountain View Lodge",
  "Eco Stay & Coffee Farm",
  "Urban Studio Room",
  "Peaceful Garden Residence",
];

// Auto-suggested descriptions based on title choice
const TITLE_DESCRIPTIONS: Record<string, string> = {
  "Traditional Ethiopian Home": "Experience authentic Ethiopian living in this beautifully preserved traditional home. Features classic architecture, warm hospitality, and proximity to local markets and cultural sites. Perfect for families seeking an immersive cultural experience.",
  "Modern City Apartment": "Contemporary urban living with all modern amenities. Located in the heart of the city with easy access to restaurants, shops, and business districts. Ideal for travelers who value convenience and comfort.",
  "Family Guesthouse Retreat": "Spacious and welcoming family-friendly accommodation. Multiple bedrooms, shared living spaces, and a warm, homely atmosphere. Great for groups and families looking to explore Ethiopia together.",
  "Lakeside Villa": "Stunning waterfront property with panoramic lake views. Enjoy peaceful mornings, beautiful sunsets, and outdoor activities. Perfect for relaxation and nature enthusiasts.",
  "Mountain View Lodge": "Breathtaking mountain vistas and fresh highland air. Cozy retreat with spectacular views, ideal for hikers and those seeking tranquility away from the city.",
  "Eco Stay & Coffee Farm": "Sustainable living on a working coffee farm. Learn about Ethiopian coffee culture, enjoy organic meals, and experience rural life. Perfect for eco-conscious travelers and coffee lovers.",
  "Urban Studio Room": "Compact and efficient city accommodation. Well-designed space with everything you need for a comfortable stay. Great for solo travelers and short business trips.",
  "Peaceful Garden Residence": "Serene property surrounded by lush gardens and green spaces. Quiet neighborhood, perfect for relaxation while still being close to city amenities. Ideal for those seeking peace and nature.",
};

export default function HostDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showAddPropertyDialog, setShowAddPropertyDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      location: "",
      city: "",
      region: "",
      pricePerNight: "0",
      currency: "ETB",
      maxGuests: 1,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
      images: [],
      isActive: true,
    },
  });

  // Fetch host properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/host/properties"],
  });

  // Fetch all bookings for host properties
  const { data: allBookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      return await apiRequest("POST", "/api/properties", {
        ...data,
        amenities: selectedAmenities,
        images: imageUrls,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/host/properties"] });
      toast({
        title: "Property created successfully!",
        description: "Your property has been added to Alga.",
      });
      setShowAddPropertyDialog(false);
      form.reset();
      setSelectedAmenities([]);
      setImageUrls([]);
    },
    onError: (error: any) => {
      console.error('Property creation error:', error);
      toast({
        title: "Error creating property",
        description: error.message || "Failed to create property. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PropertyFormData> }) => {
      return await apiRequest("PUT", `/api/properties/${id}`, {
        ...data,
        amenities: selectedAmenities,
        images: imageUrls,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/host/properties"] });
      toast({
        title: "Property updated successfully!",
        description: "Your property changes have been saved.",
      });
      setEditingProperty(null);
      setShowAddPropertyDialog(false);
      form.reset();
      setSelectedAmenities([]);
      setImageUrls([]);
    },
    onError: (error: any) => {
      console.error('Property update error:', error);
      toast({
        title: "Error updating property",
        description: error.message || "Failed to update property. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/host/properties"] });
      toast({
        title: "Property deleted successfully",
        description: "Your property has been removed from Alga.",
      });
    },
    onError: () => {
      toast({
        title: "Error deleting property",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Image URLs:', imageUrls);
    console.log('Selected amenities:', selectedAmenities);
    console.log('Form errors:', form.formState.errors);
    
    // Ensure we have at least 5 images
    if (imageUrls.length < 5) {
      toast({
        title: "Not enough images",
        description: "Please upload at least 5 images of your property",
        variant: "destructive",
      });
      return;
    }
    
    if (editingProperty) {
      updatePropertyMutation.mutate({ id: editingProperty.id, data });
    } else {
      createPropertyMutation.mutate(data);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setSelectedAmenities(property.amenities || []);
    setImageUrls(property.images || []);
    form.reset({
      title: property.title,
      description: property.description,
      type: property.type,
      location: property.location,
      city: property.city,
      region: property.region,
      pricePerNight: property.pricePerNight,
      currency: property.currency,
      maxGuests: property.maxGuests,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      amenities: property.amenities || [],
      images: property.images || [],
      isActive: property.isActive,
    });
    setShowAddPropertyDialog(true);
  };

  const handleAddNew = () => {
    setEditingProperty(null);
    setSelectedAmenities([]);
    setImageUrls([]);
    form.reset();
    setShowAddPropertyDialog(true);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const uploadImages = async (files: File[]) => {
    if (files.length === 0) {
      console.log('No files to upload');
      return;
    }

    console.log('Starting upload of', files.length, 'files');
    setUploadingFiles(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
        console.log('Added file to formData:', file.name, file.size, 'bytes');
      });

      console.log('Sending upload request...');
      const response = await fetch('/api/upload/property-images', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      console.log('Upload response status:', response.status);
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        let errorMessage = 'Upload failed';
        
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const text = await response.text();
          if (response.status === 401) {
            errorMessage = 'Please sign in to upload images';
          } else {
            errorMessage = `Upload failed (${response.status})`;
          }
        }
        
        throw new Error(errorMessage);
      }

      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response from server');
      }

      const data = await response.json();
      console.log('Upload response data:', data);
      
      const newImageUrls = [...imageUrls, ...data.urls];
      console.log('New image URLs:', newImageUrls);
      setImageUrls(newImageUrls);
      
      // Update form field to sync with uploaded images
      form.setValue('images', newImageUrls, { shouldValidate: true });
      console.log('Form images field updated:', newImageUrls.length, 'images');

      // Reset file input so same files can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Images uploaded successfully",
        description: `${data.count} image(s) uploaded. Total: ${newImageUrls.length}`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('File input changed, files selected:', files.length);
    if (files.length > 0) {
      console.log('Uploading files:', files.map(f => f.name));
      uploadImages(files);
    }
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      uploadImages(imageFiles);
    } else {
      toast({
        title: "Invalid files",
        description: "Please select only image files",
        variant: "destructive",
      });
    }
  };

  const removeImageUrl = (url: string) => {
    const newImageUrls = imageUrls.filter(img => img !== url);
    setImageUrls(newImageUrls);
    // Update form field to sync with removed images
    form.setValue('images', newImageUrls, { shouldValidate: true });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const getTypeLabel = (type: string) => {
    const typeObj = PROPERTY_TYPES.find(t => t.value === type);
    return typeObj?.label || type;
  };

  // Calculate statistics
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.isActive).length;
  const totalBookings = allBookings.length;
  const totalRevenue = allBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);
  const averageRating = properties.length > 0
    ? properties.reduce((sum, p) => sum + parseFloat(p.rating || "0"), 0) / properties.length
    : 0;

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark">Host Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Welcome back, {user?.firstName}! Manage your properties and bookings.
            </p>
          </div>
          <Button onClick={handleAddNew} className="bg-eth-green hover:bg-green-700 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Home className="h-6 w-6 sm:h-8 sm:w-8 text-eth-green" />
                <div className="ml-2 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-lg sm:text-2xl font-bold text-neutral-dark">{totalProperties}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-eth-yellow" />
                <div className="ml-2 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-lg sm:text-2xl font-bold text-neutral-dark">{totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-eth-red" />
                <div className="ml-2 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-lg sm:text-2xl font-bold text-neutral-dark">
                    {formatPrice(totalRevenue.toString())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-eth-yellow" />
                <div className="ml-2 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-lg sm:text-2xl font-bold text-neutral-dark">
                    {averageRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-6">
            {propertiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-80"></div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start earning by adding your first property to Alga.
                  </p>
                  <Button onClick={handleAddNew} className="bg-eth-green hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Property
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <img
                      src={property.images?.[0] || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={property.isActive ? "default" : "secondary"}>
                          {property.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-eth-yellow text-eth-yellow" />
                          <span className="text-sm font-medium">
                            {parseFloat(property.rating || "0").toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-semibold text-lg text-neutral-dark mb-1 line-clamp-1">
                        {property.title}
                      </h4>

                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="line-clamp-1">{property.location}, {property.city}</span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{property.maxGuests}</span>
                        </div>
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span>{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>{property.bathrooms}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-neutral-dark">
                          {formatPrice(property.pricePerNight)}/night
                        </span>
                        <span className="text-sm text-gray-500">
                          {property.reviewCount} reviews
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setLocation(`/properties/${property.id}`)}
                          data-testid={`button-view-${property.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(property)}
                          className="flex-1"
                          data-testid={`button-edit-${property.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Property</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{property.title}"? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePropertyMutation.mutate(property.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            {bookingsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-24"></div>
                ))}
              </div>
            ) : allBookings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600">
                    Bookings for your properties will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {allBookings.map((booking) => {
                  const property = properties.find(p => p.id === booking.propertyId);
                  return (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-neutral-dark mb-1">
                              {property?.title || `Property #${booking.propertyId}`}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>
                                {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                              </span>
                              <span>{booking.guests} guests</span>
                              <Badge variant={
                                booking.status === 'confirmed' ? 'default' :
                                booking.status === 'pending' ? 'secondary' :
                                booking.status === 'cancelled' ? 'destructive' : 'default'
                              }>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-neutral-dark">
                              {formatPrice(booking.totalPrice)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.paymentStatus}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <HostEarnings />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Properties</span>
                      <span className="font-semibold">{activeProperties}/{totalProperties}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Occupancy Rate</span>
                      <span className="font-semibold">
                        {totalProperties > 0 ? ((totalBookings / totalProperties) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Rating</span>
                      <span className="font-semibold">{averageRating.toFixed(1)}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Revenue</span>
                      <span className="font-semibold text-lg">
                        {formatPrice(totalRevenue.toString())}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average per Booking</span>
                      <span className="font-semibold">
                        {totalBookings > 0 ? formatPrice((totalRevenue / totalBookings).toString()) : formatPrice("0")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completed Bookings</span>
                      <span className="font-semibold">
                        {allBookings.filter(b => b.status === 'completed').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Property Dialog */}
      <Dialog open={showAddPropertyDialog} onOpenChange={setShowAddPropertyDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProperty ? "Edit Property" : "Add New Property"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-suggest description when a preset title is selected
                              const selectedTitle = e.target.value;
                              if (TITLE_DESCRIPTIONS[selectedTitle]) {
                                // Only auto-fill if description is empty
                                const currentDescription = form.getValues("description");
                                if (!currentDescription || currentDescription.trim() === "") {
                                  form.setValue("description", TITLE_DESCRIPTIONS[selectedTitle]);
                                  toast({
                                    title: "Description suggested! ✨",
                                    description: "Feel free to customize it to match your property.",
                                  });
                                }
                              }
                            }}
                            className="text-base"
                            data-testid="input-property-title"
                            aria-label="Property title with suggestions"
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
                      <FormLabel className="text-eth-brown">Property Type <span className="text-red-600">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} required>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormLabel className="text-eth-brown">City <span className="text-red-600">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} required>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormLabel className="text-eth-brown">Region <span className="text-red-600">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} required>
                        <FormControl>
                          <SelectTrigger>
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
                    <FormLabel className="text-eth-brown">Specific Location <span className="text-red-600">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Street address or area name..." {...field} required />
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
                    <FormLabel className="text-eth-brown">Description <span className="text-red-600">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your property, its unique features, and what makes it special..."
                        className="min-h-[100px]"
                        {...field}
                        required
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
                {form.formState.errors.images && (
                  <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                    ⚠️ {form.formState.errors.images.message}
                  </p>
                )}

                {/* Drag and Drop Upload Area */}
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

                {/* Uploaded Images Grid */}
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
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=200&fit=crop";
                            }}
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
                  {imageUrls.length === 0 
                    ? "Upload at least 5 high-quality images of your property. The first image will be used as the main display image."
                    : "The first image will be used as the main display image. You can remove and re-upload to change the order."}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="maxGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-eth-brown">Max Guests <span className="text-red-600">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          required
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
                      <FormLabel className="text-eth-brown">Bedrooms <span className="text-red-600">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          required
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
                      <FormLabel className="text-eth-brown">Bathrooms <span className="text-red-600">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          required
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
                      <FormLabel className="text-eth-brown">Price per Night (ETB) <span className="text-red-600">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          {...field}
                          required
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
                        className="rounded border-gray-300 text-eth-green focus:ring-eth-green"
                      />
                      <label 
                        htmlFor={`amenity-${amenity}`} 
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddPropertyDialog(false)}
                  data-testid="button-cancel-property"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-eth-green hover:bg-green-700"
                  disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}
                  data-testid="button-submit-property"
                  onClick={(e) => {
                    console.log('Submit button clicked');
                    console.log('Form state:', {
                      isValid: form.formState.isValid,
                      errors: form.formState.errors,
                      values: form.getValues(),
                      imageUrls,
                      selectedAmenities
                    });
                  }}
                >
                  {createPropertyMutation.isPending || updatePropertyMutation.isPending 
                    ? "Saving..." 
                    : editingProperty 
                      ? "Update Property" 
                      : "Create Property"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

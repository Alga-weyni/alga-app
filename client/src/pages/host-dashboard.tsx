import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { BackButton } from "@/components/back-button";
import { insertPropertySchema } from "@shared/schema";
import { PROPERTY_TYPES, ETHIOPIAN_CITIES, ETHIOPIAN_REGIONS, AMENITIES } from "@/lib/constants";
import type { Property, Booking } from "@shared/schema";

const propertyFormSchema = insertPropertySchema.omit({
  hostId: true,
}).extend({
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

export default function HostDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddPropertyDialog, setShowAddPropertyDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

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
      const response = await apiRequest("POST", "/api/properties", {
        ...data,
        amenities: selectedAmenities,
        images: imageUrls,
      });
      return response.json();
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
      setNewImageUrl("");
    },
    onError: () => {
      toast({
        title: "Error creating property",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PropertyFormData> }) => {
      const response = await apiRequest("PUT", `/api/properties/${id}`, {
        ...data,
        amenities: selectedAmenities,
        images: imageUrls,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/host/properties"] });
      toast({
        title: "Property updated successfully!",
        description: "Your property changes have been saved.",
      });
      setEditingProperty(null);
      form.reset();
      setSelectedAmenities([]);
      setImageUrls([]);
      setNewImageUrl("");
    },
    onError: () => {
      toast({
        title: "Error updating property",
        description: "Failed to update property. Please try again.",
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
    setNewImageUrl("");
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

  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImageUrl = (url: string) => {
    setImageUrls(imageUrls.filter(img => img !== url));
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
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
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(property)}
                          className="flex-1"
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
                      <FormLabel>Property Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Beautiful lakeside retreat..." {...field} />
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
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormLabel>City</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormLabel>Region</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormLabel>Specific Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address or area name..." {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your property, its unique features, and what makes it special..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Property Images */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Property Images</Label>
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageUrl();
                      }
                    }}
                    data-testid="input-image-url"
                  />
                  <Button
                    type="button"
                    onClick={addImageUrl}
                    variant="outline"
                    className="whitespace-nowrap"
                    data-testid="button-add-image"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Image
                  </Button>
                </div>
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <img 
                          src={url} 
                          alt={`Property ${index + 1}`}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=100&h=100&fit=crop";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 truncate">{url}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImageUrl(url)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`button-remove-image-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Add URLs of property images. The first image will be used as the main display image.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="maxGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Guests</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                      <FormLabel>Price per Night (ETB)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          {...field}
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
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-eth-green hover:bg-green-700"
                  disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}
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

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Save, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const propertyInfoSchema = z.object({
  lockboxCode: z.string().optional(),
  lockboxLocation: z.string().optional(),
  wifiNetwork: z.string().optional(),
  wifiPassword: z.string().optional(),
  parkingInstructions: z.string().optional(),
  checkInInstructions: z.string().optional(),
  checkOutInstructions: z.string().optional(),
  houseRules: z.string().optional(),
  applianceInstructions: z.string().optional(),
  emergencyContacts: z.string().optional(),
  nearbyRestaurants: z.string().optional(),
  nearbyAttractions: z.string().optional(),
  transportationTips: z.string().optional(),
  hostNotes: z.string().optional(),
});

type PropertyInfoFormData = z.infer<typeof propertyInfoSchema>;

interface PropertyInfoFormProps {
  propertyId: number;
}

export function PropertyInfoForm({ propertyId }: PropertyInfoFormProps) {
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing property info
  const { data: propertyInfo, isLoading } = useQuery({
    queryKey: ["/api/lemlem/property-info", propertyId],
  });

  const form = useForm<PropertyInfoFormData>({
    resolver: zodResolver(propertyInfoSchema),
    defaultValues: propertyInfo || {
      lockboxCode: "",
      lockboxLocation: "",
      wifiNetwork: "",
      wifiPassword: "",
      parkingInstructions: "",
      checkInInstructions: "",
      checkOutInstructions: "",
      houseRules: "",
      applianceInstructions: "",
      emergencyContacts: "",
      nearbyRestaurants: "",
      nearbyAttractions: "",
      transportationTips: "",
      hostNotes: "",
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (propertyInfo) {
      form.reset(propertyInfo);
    }
  }, [propertyInfo, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: PropertyInfoFormData) => {
      return await apiRequest("POST", `/api/lemlem/property-info/${propertyId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lemlem/property-info", propertyId] });
      toast({
        title: "✅ Saved!",
        description: "Lemlem can now help your guests with this information.",
      });
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save property information",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PropertyInfoFormData) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#CD7F32]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#CD7F32]" />
          <CardTitle>Lemlem AI Assistant Setup</CardTitle>
        </div>
        <CardDescription>
          Configure what Lemlem tells your guests. The more you fill out, the better she can help! 👵🏾
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 border-[#CD7F32] bg-[#f9e9d8]">
          <AlertDescription className="text-sm">
            💡 <strong>Save Money!</strong> Information you add here helps Lemlem answer questions WITHOUT using AI (which costs money). 
            Fill this out thoroughly to keep costs near $0! ✨
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} onChange={() => setHasChanges(true)} className="space-y-6">
            {/* Access Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#2d1405] border-b pb-2">🔑 Access Information</h3>
              
              <FormField
                control={form.control}
                name="lockboxCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lockbox Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1234" {...field} data-testid="input-lockbox-code" />
                    </FormControl>
                    <FormDescription>
                      The code guests need to access the property
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lockboxLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lockbox Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., On the front gate, left side" {...field} data-testid="input-lockbox-location" />
                    </FormControl>
                    <FormDescription>
                      Where the lockbox is located
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* WiFi Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#2d1405] border-b pb-2">📶 WiFi Information</h3>
              
              <FormField
                control={form.control}
                name="wifiNetwork"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WiFi Network Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AlgaGuest" {...field} data-testid="input-wifi-network" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wifiPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WiFi Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter WiFi password" {...field} data-testid="input-wifi-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Check-in/Check-out */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#2d1405] border-b pb-2">⏰ Check-in & Check-out</h3>
              
              <FormField
                control={form.control}
                name="checkInInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Check-in is at 2 PM. Use the lockbox code to access. Keys are on the kitchen table."
                        rows={3}
                        {...field}
                        data-testid="input-checkin-instructions"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkOutInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Check-out is at 11 AM. Please lock all doors and return keys to the lockbox."
                        rows={3}
                        {...field}
                        data-testid="input-checkout-instructions"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* House Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#2d1405] border-b pb-2">🏠 House Information</h3>
              
              <FormField
                control={form.control}
                name="parkingInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parking Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Free parking in the driveway. Street parking also available."
                        rows={2}
                        {...field}
                        data-testid="input-parking-instructions"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="houseRules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>House Rules</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., No smoking indoors. Pets allowed with prior approval. Quiet hours 10 PM - 7 AM."
                        rows={3}
                        {...field}
                        data-testid="input-house-rules"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applianceInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appliance Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., AC remote is on the coffee table. Press the red button to turn on the water heater."
                        rows={3}
                        {...field}
                        data-testid="input-appliance-instructions"
                      />
                    </FormControl>
                    <FormDescription>
                      How to use heating, AC, TV, kitchen appliances, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Emergency & Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#2d1405] border-b pb-2">🚨 Emergency & Contact</h3>
              
              <FormField
                control={form.control}
                name="emergencyContacts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contacts</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Host: 0912345678, Building Manager: 0923456789"
                        rows={2}
                        {...field}
                        data-testid="input-emergency-contacts"
                      />
                    </FormControl>
                    <FormDescription>
                      Your contact number and any other emergency contacts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Local Recommendations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#2d1405] border-b pb-2">🗺️ Local Recommendations</h3>
              
              <FormField
                control={form.control}
                name="nearbyRestaurants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nearby Restaurants</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Yod Abyssinia (5 min walk, traditional food), Castelli's (10 min drive, Italian)"
                        rows={3}
                        {...field}
                        data-testid="input-nearby-restaurants"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nearbyAttractions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nearby Attractions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., National Museum (15 min), Merkato Market (20 min), Unity Park (10 min)"
                        rows={3}
                        {...field}
                        data-testid="input-nearby-attractions"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transportationTips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transportation Tips</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Ride app available, taxi stand nearby, bus stop 5 min walk"
                        rows={2}
                        {...field}
                        data-testid="input-transportation-tips"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#2d1405] border-b pb-2">📝 Additional Notes</h3>
              
              <FormField
                control={form.control}
                name="hostNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any other information you'd like Lemlem to share with guests"
                        rows={3}
                        {...field}
                        data-testid="input-host-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saveMutation.isPending || !hasChanges}
                className="bg-[#CD7F32] hover:bg-[#B87333]"
                data-testid="button-save-property-info"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Information
                  </>
                )}
              </Button>
              {hasChanges && (
                <span className="text-sm text-gray-500 flex items-center">
                  You have unsaved changes
                </span>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

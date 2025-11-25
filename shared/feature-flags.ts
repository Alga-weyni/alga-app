// Feature flags for INSA compliance and testing
export type FeatureFlag = {
  id: string;
  enabled: boolean;
  name: string;
  description: string;
};

export const DEFAULT_FEATURE_FLAGS: Record<string, FeatureFlag> = {
  "new-property": {
    id: "new-property",
    enabled: true,
    name: "New Property Listing",
    description: "Allow hosts to create new property listings",
  },
  "service-manager": {
    id: "service-manager",
    enabled: true,
    name: "Service Manager Application",
    description: "Manage add-on services for properties",
  },
  "list-admin": {
    id: "list-admin",
    enabled: true,
    name: "List Admin Application",
    description: "Administrative property listing management",
  },
  "bookings": {
    id: "bookings",
    enabled: true,
    name: "Bookings",
    description: "Allow users to book properties",
  },
  "payments": {
    id: "payments",
    enabled: true,
    name: "Payments",
    description: "Enable payment processing",
  },
};

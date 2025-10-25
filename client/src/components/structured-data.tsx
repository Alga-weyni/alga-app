import { useEffect } from 'react';

interface PropertyStructuredDataProps {
  property: {
    id: number;
    title: string;
    description: string;
    pricePerNight: string;
    images?: string[] | null;
    rating?: string | null;
    reviewCount?: number | null;
    city: string;
    address?: string | null;
    latitude?: string | null;
    longitude?: string | null;
  };
}

export function PropertyStructuredData({ property }: PropertyStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "name": property.title,
      "description": property.description,
      "image": property.images?.[0] || "",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": property.city,
        "addressCountry": "ET",
        "streetAddress": property.address || ""
      },
      "geo": property.latitude && property.longitude ? {
        "@type": "GeoCoordinates",
        "latitude": parseFloat(property.latitude),
        "longitude": parseFloat(property.longitude)
      } : undefined,
      "priceRange": `ETB ${property.pricePerNight}`,
      "aggregateRating": property.rating && property.reviewCount ? {
        "@type": "AggregateRating",
        "ratingValue": parseFloat(property.rating),
        "reviewCount": property.reviewCount
      } : undefined
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = 'property-structured-data';
    
    const existingScript = document.getElementById('property-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('property-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [property]);

  return null;
}

interface ServiceStructuredDataProps {
  service: {
    name: string;
    description: string;
    serviceType: string;
    city: string;
    rating?: number;
    reviewCount?: number;
  };
}

export function ServiceStructuredData({ service }: ServiceStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": service.name,
      "description": service.description,
      "serviceType": service.serviceType,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": service.city,
        "addressCountry": "ET"
      },
      "aggregateRating": service.rating && service.reviewCount ? {
        "@type": "AggregateRating",
        "ratingValue": service.rating,
        "reviewCount": service.reviewCount
      } : undefined
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = 'service-structured-data';
    
    const existingScript = document.getElementById('service-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('service-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [service]);

  return null;
}

interface OrganizationStructuredDataProps {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
}

export function OrganizationStructuredData({
  name = "Alga",
  description = "Ethiopia's premier property rental and hospitality platform",
  url = "https://alga.repl.co",
  logo = "/logo.png"
}: OrganizationStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": name,
      "description": description,
      "url": url,
      "logo": logo,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "ET"
      },
      "sameAs": []
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = 'organization-structured-data';
    
    const existingScript = document.getElementById('organization-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('organization-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [name, description, url, logo]);

  return null;
}

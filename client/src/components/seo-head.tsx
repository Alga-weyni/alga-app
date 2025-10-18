import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEOHead({
  title = "Alga — Stay. Discover. Belong — The Ethiopian Way!",
  description = "Discover authentic Ethiopian stays with Alga — from city apartments to countryside lodges. Book safely, pay securely, and feel at home wherever you go.",
  image = "/og-image.jpg",
  url = typeof window !== 'undefined' ? window.location.href : '',
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title;
    
    const metaTags = [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const key = name ? `name="${name}"` : `property="${property}"`;
      let meta = document.querySelector(`meta[${key}]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (name) meta.name = name;
        if (property) meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      
      meta.content = content;
    });
  }, [title, description, image, url]);

  return null;
}

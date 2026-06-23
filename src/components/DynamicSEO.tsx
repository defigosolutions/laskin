import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { publicApiClient as api } from '../lib/api';

interface SEORoute {
  path: string;
  title: string;
  description: string;
  keywords: string;
}

export default function DynamicSEO() {
  const location = useLocation();
  const [routes, setRoutes] = useState<SEORoute[]>([]);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const { data } = await api.get('/public/seo');
        if (Array.isArray(data)) {
          setRoutes(data);
        }
      } catch (err) {
        console.error('Failed to fetch SEO routes', err);
      }
    };
    fetchSEO();
  }, []);

  const currentSEO = routes.find(r => r.path === location.pathname);

  if (!currentSEO) return null;

  return (
    <Helmet>
      {currentSEO.title && <title>{currentSEO.title}</title>}
      {currentSEO.title && <meta name="twitter:title" content={currentSEO.title} />}
      {currentSEO.title && <meta property="og:title" content={currentSEO.title} />}
      
      {currentSEO.description && <meta name="description" content={currentSEO.description} />}
      {currentSEO.description && <meta name="twitter:description" content={currentSEO.description} />}
      {currentSEO.description && <meta property="og:description" content={currentSEO.description} />}
      
      {currentSEO.keywords && <meta name="keywords" content={currentSEO.keywords} />}
    </Helmet>
  );
}

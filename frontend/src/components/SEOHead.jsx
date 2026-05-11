import { Helmet } from 'react-helmet-async';
import { useSettings } from '../context/SettingsContext';

export default function SEOHead({ title, description }) {
  const settings = useSettings();
  const siteName = settings.seo_title || settings.site_name || '南天母中壇元帥道場';
  const pageTitle = title ? `${title} | ${siteName}` : siteName;
  const pageDesc = description || settings.meta_description || '';
  const keywords = settings.meta_keywords || '';

  return (
    <Helmet>
      <title>{pageTitle}</title>
      {pageDesc && <meta name="description" content={pageDesc} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={pageTitle} />
      {pageDesc && <meta property="og:description" content={pageDesc} />}
      <meta property="og:type" content="website" />
      {settings.site_name && <meta property="og:site_name" content={settings.site_name} />}
    </Helmet>
  );
}

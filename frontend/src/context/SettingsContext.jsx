import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const SettingsContext = createContext({});

function setMetaTag(attr, name, content) {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/settings').then((res) => {
      const s = res.data;
      setSettings(s);

      if (s.seo_title || s.site_name) {
        document.title = s.seo_title || s.site_name;
      }
      if (s.meta_description) {
        setMetaTag('name', 'description', s.meta_description);
        setMetaTag('property', 'og:description', s.meta_description);
      }
      if (s.meta_keywords) {
        setMetaTag('name', 'keywords', s.meta_keywords);
      }
      if (s.seo_title || s.site_name) {
        setMetaTag('property', 'og:title', s.seo_title || s.site_name);
        setMetaTag('property', 'og:site_name', s.site_name || '');
      }
    }).catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { getPublicWebsite } from "../service/website.service";

const defaultWebsite = {
  websiteName: "School Management System",

  favicon: {
    publicId: "",
    url: "",
    alt: "",
  },

  lightLogo: {
    publicId: "",
    url: "",
    alt: "",
  },

  darkLogo: {
    publicId: "",
    url: "",
    alt: "",
  },

  mainPoster: {
    publicId: "",
    url: "",
    alt: "",
  },

  about: {
    title: "Everything your school needs in one place.",
    description:
      "A simple and powerful platform for managing students, staff, classes, attendance and daily school activities from one place.",

    image: {
      publicId: "",
      url: "",
      alt: "",
    },
  },

  contact: {
    phone: "",
    email: "",
    address: "",
    mapUrl: "",
    whatsapp: "",
  },

  socialLinks: {
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
  },
};

const WebsiteContext = createContext(null);

const normalizeWebsite = (website) => ({
  ...defaultWebsite,
  ...website,

  favicon: {
    ...defaultWebsite.favicon,
    ...website?.favicon,
  },

  lightLogo: {
    ...defaultWebsite.lightLogo,
    ...website?.lightLogo,
  },

  darkLogo: {
    ...defaultWebsite.darkLogo,
    ...website?.darkLogo,
  },

  mainPoster: {
    ...defaultWebsite.mainPoster,
    ...website?.mainPoster,
  },

  about: {
    ...defaultWebsite.about,
    ...website?.about,

    image: {
      ...defaultWebsite.about.image,
      ...website?.about?.image,
    },
  },

  contact: {
    ...defaultWebsite.contact,
    ...website?.contact,
  },

  socialLinks: {
    ...defaultWebsite.socialLinks,
    ...website?.socialLinks,
  },
});

export const WebsiteProvider = ({ children }) => {
  const [website, setWebsite] = useState(defaultWebsite);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWebsite = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPublicWebsite();

      if (response?.website) {
        setWebsite(normalizeWebsite(response.website));
      } else {
        setWebsite(defaultWebsite);
      }
    } catch (error) {
      console.error("Fetch website context error:", error);

      setError(error);
      setWebsite(defaultWebsite);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebsite();
  }, [fetchWebsite]);

  useEffect(() => {
    if (website.websiteName) {
      document.title = website.websiteName;
    }

    if (website.favicon?.url) {
      let favicon = document.querySelector("link[rel='icon']");

      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }

      favicon.href = website.favicon.url;
    }
  }, [website]);

  const updateWebsite = useCallback((data) => {
    setWebsite((currentWebsite) =>
      normalizeWebsite({
        ...currentWebsite,
        ...data,
      }),
    );
  }, []);

  const value = {
    website,
    loading,
    error,
    refreshWebsite: fetchWebsite,
    updateWebsite,
  };

  return (
    <WebsiteContext.Provider value={value}>{children}</WebsiteContext.Provider>
  );
};

export const useWebsite = () => {
  const context = useContext(WebsiteContext);

  if (!context) {
    throw new Error("useWebsite must be used inside WebsiteProvider.");
  }

  return context;
};

export default WebsiteContext;

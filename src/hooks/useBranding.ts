"use client";
import { useEffect, useState } from "react";
import { getElementsMainREQ } from "@/api/element";

interface BrandingData {
  site_name?: string;
  favicon?: string;
  logo?: string;
  [key: string]: unknown;
}

export const useBranding = () => {
  const [branding, setBranding] = useState<BrandingData | null>(null);

  useEffect(() => {
    const updateBranding = async () => {
      try {
        const data = await getElementsMainREQ();
        if (data) {
          setBranding(data);

          // Update Favicon
          if (data.favicon) {
            const faviconUrl = `${window.location.origin}/${data.favicon}`;
            let link: HTMLLinkElement | null =
              document.querySelector("link[rel~='icon']");

            if (!link) {
              link = document.createElement("link");
              link.rel = "icon";
              document.getElementsByTagName("head")[0].appendChild(link);
            }
            link.href = faviconUrl;
          }

          // Update Page Title if site_name is provided
          if (data.site_name) {
            document.title = data.site_name;
          }
        }
      } catch (error) {
        console.error("Error loading branding:", error);
      }
    };

    updateBranding();
  }, []);

  return branding;
};

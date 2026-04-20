import { useState, useEffect } from "react";

const DEFAULT_SETTINGS = {
  autoExpire: false, defaultExpireDays: 30,
  enableAnalytics: true, emailNotifications: true,
  clickThreshold: 1000, customDomain: "",
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("linkSettings");
      if (saved) setSettings(JSON.parse(saved));
    } catch (_) {}
  }, []);

  const saveSettings = () => {
    localStorage.setItem("linkSettings", JSON.stringify(settings));
  };

  return { settings, setSettings, saveSettings };
}
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Preferences = { largerText: boolean; reduceMotion: boolean };
const defaults: Preferences = { largerText: false, reduceMotion: false };
const key = "moblink-display-preferences-v1";
const PreferencesContext = createContext({ preferences: defaults, save: (_: Preferences): boolean => false });

export function ExperiencePreferences({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(defaults);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "null");
      if (stored) setPreferences({ largerText: stored.largerText === true, reduceMotion: stored.reduceMotion === true });
    } catch { /* Keep defaults when browser storage is unavailable. */ }
  }, []);
  function save(next: Preferences) {
    try { localStorage.setItem(key, JSON.stringify(next)); setPreferences(next); return true; }
    catch { return false; }
  }
  return <PreferencesContext.Provider value={{ preferences, save }}><div className="experience-preferences" data-larger-text={preferences.largerText} data-reduce-motion={preferences.reduceMotion}>{children}</div></PreferencesContext.Provider>;
}

export function DisplayPreferences() {
  const { preferences, save } = useContext(PreferencesContext);
  const [status, setStatus] = useState("");
  function change(field: keyof Preferences, value: boolean) {
    setStatus(save({ ...preferences, [field]: value }) ? "Preference saved on this browser." : "Could not save. Browser storage may be unavailable.");
  }
  return <div className="account-group">
    <label className="account-toggle"><span><strong>Larger text</strong><small>Make messages and service descriptions easier to read</small></span><input type="checkbox" role="switch" checked={preferences.largerText} onChange={e => change("largerText", e.target.checked)} /></label>
    <label className="account-toggle"><span><strong>Reduce motion</strong><small>Keep transitions and animations to a minimum</small></span><input type="checkbox" role="switch" checked={preferences.reduceMotion} onChange={e => change("reduceMotion", e.target.checked)} /></label>
    <p className="account-save-status" role="status">{status || "Changes save automatically on this browser."}</p>
  </div>;
}

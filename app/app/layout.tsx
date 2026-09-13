import "./experience.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moblink | Find support near you",
  description: "Find Aboriginal and community services near you — health, legal, housing, crisis support and more.",
};

export default function CommunityAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

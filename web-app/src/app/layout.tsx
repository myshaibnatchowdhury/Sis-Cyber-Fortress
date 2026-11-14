import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "SIS CYBER FORTRESS — 12-in-1 Enterprise Cybersecurity Ecosystem",
  description: "Next-generation enterprise cybersecurity platform uniting native Android endpoints, web defense portals, and zero-trust Supabase backends.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cyber-bg text-slate-100 antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

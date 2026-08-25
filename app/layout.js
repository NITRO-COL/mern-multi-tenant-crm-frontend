import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { themeScript } from "@/components/ui/ThemeToggle";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata = {
  title: "Morsh CRM — Multi-Tenant CRM",
  description: "A secure multi-tenant CRM for managing leads, customers and activities.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets the layout reach into the iOS safe areas
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before paint so the stored theme never flashes. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

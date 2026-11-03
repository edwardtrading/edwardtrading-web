import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getProductCategories, getSiteSettings } from "@/lib/cms-data";
import {
  medicalSupplierKeywords,
  organizationJsonLd,
  websiteJsonLd
} from "@/lib/seo";
import { site } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Medical Equipment Supplier in Nepal | ${site.name}`,
    template: `%s | ${site.name}`
  },
  description: site.description,
  applicationName: site.name,
  publisher: site.name,
  icons: {
    icon: [
      {
        url: "/edward-trading-favicon.png",
        type: "image/png"
      }
    ],
    shortcut: "/edward-trading-favicon.png",
    apple: "/edward-trading-favicon.png"
  },
  keywords: [
    ...medicalSupplierKeywords,
    "Diversey Nepal",
    "TASKI Nepal",
    "institutional supplies Nepal"
  ],
  openGraph: {
    title: `Medical Equipment Supplier in Nepal | ${site.name}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "en_US",
    type: "website",
    images: [site.logo]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getProductCategories()
  ]);
  const structuredData = [organizationJsonLd(settings, categories), websiteJsonLd()];

  return (
    <html lang="en">
      <body className={cn(inter.variable, manrope.variable, "font-sans antialiased")}>
        {structuredData.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

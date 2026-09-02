import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleSwitcher } from "@/components/RoleSwitcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Mandi",
  description: "Real-Time Multi-Crop Agricultural Procurement & Queue Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {children}
        <RoleSwitcher />
      </body>
    </html>
  );
}

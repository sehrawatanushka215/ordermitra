import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrderMitra",
  description: "Ask about your orders in plain language.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

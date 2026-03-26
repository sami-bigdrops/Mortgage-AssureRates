import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mortgage - AssureRates",
  description: "AssureRates is a trusted mortgage provider in the USA offering home loans, cash-out refinancing, and easy solutions to buy a home. Get the best mortgage rates, compare lenders, and secure your home financing online with AssureRates.",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMaintenanceMode = true;

  return (
    <html lang="en">
      <body className={`${mulish.variable} antialiased`}>
        <main>
          {isMaintenanceMode ? (
            <div className="min-h-screen w-full flex items-center justify-center px-6 text-center">
              <div>
                <h1 className="text-4xl font-bold">Under Maintenance</h1>
                <p className="mt-4 text-base opacity-80">
                  We are currently performing scheduled maintenance. Please check back soon.
                </p>
              </div>
            </div>
          ) : (
            children
          )}
          <Analytics />
          <SpeedInsights 
            sampleRate={1}
          />
        </main>
      </body>
    </html>
  );
}

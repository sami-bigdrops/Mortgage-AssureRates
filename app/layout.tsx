import type { Metadata } from "next";
import { Mulish } from "next/font/google";
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
  return (
    <html lang="en">
      <body className={`${mulish.variable} antialiased`}>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}

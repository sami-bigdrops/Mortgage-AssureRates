import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Thank You | AssureRates - Mortgage",
  description: "Thank you for submitting your mortgage application. Our team will reach out to you shortly to discuss your options.",
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-y-auto">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}


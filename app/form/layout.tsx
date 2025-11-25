import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
    title: "Form | AssureRates - Mortgage",
    description: "Complete the form to reach out to AssureRates regarding our mortgage services. Submit your inquiry and our team will get back to you promptly.",
};

export default function FormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-y-auto">
      <Navbar />
      {children}
      <Footer/>
    </div>
  );
}

import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Partners from "@/components/sections/Partners";
import Features from "@/components/sections/Features";
import Testimonials from "@/components/sections/Testimonials";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
   <div>
    <Navbar />
    <Hero />
    <Partners />
    <Features />
    <Testimonials />
    <Footer />
   </div>
  );
}

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Speakers from "@/components/Speakers";
import Schedule from "@/components/Schedule";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Speakers />
      <Schedule />
      <Pricing />
      <Footer />
    </main>
  );
}

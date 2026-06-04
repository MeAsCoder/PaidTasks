'use client';

import { useEffect } from 'react';
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LiveEarningsTicker from "@/components/LiveEarningsTicker";
import EarningCategories from "@/components/EarningCategories";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import TrustAndFAQ from "@/components/TrustAndFAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      window.location.href = "https://play.google.com/store/apps/details?id=com.payingsurveys.homeworkjobs";
    }, 2000); // 4 seconds

    // Cleanup timer if component unmounts before redirect
    return () => clearTimeout(redirectTimer);
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <main>
      <Navbar />
      <HeroSection />
      <LiveEarningsTicker />
      <EarningCategories />
      <HowItWorks />
      <Testimonials />
      <TrustAndFAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
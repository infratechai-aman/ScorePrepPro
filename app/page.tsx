"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Workflow } from "@/components/landing/Workflow";
import { SupportedBoards } from "@/components/landing/SupportedBoards";
import { ExamPatterns } from "@/components/landing/ExamPatterns";
import { Features } from "@/components/landing/Features";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden font-sans">
      <Navbar />
      <Hero />
      <Workflow />
      <SupportedBoards />
      <ExamPatterns />
      <Features />
      <CallToAction />
      <Footer />
    </main>
  );
}

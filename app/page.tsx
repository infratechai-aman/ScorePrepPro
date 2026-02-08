"use client";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRight, Sparkles, Wand2, ShieldCheck, GraduationCap, Zap, BrainCircuit, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-[800px] h-[600px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob animation-delay-2000"></div>

        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">


          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-serif text-slate-900 tracking-tight leading-tight"
          >
            Create Perfect <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Question Papers</span> in Seconds
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
          >
            ScorePrepPro helps teachers and students generate board-aligned exam papers with AI precision. No more manual typing or formatting.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button size="xl" className="shadow-xl shadow-blue-500/20 text-lg px-8 py-6 rounded-2xl" onClick={() => router.push("/generate")}>
              Start Generating Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="xl" className="bg-white/50 backdrop-blur-sm text-lg px-8 py-6 rounded-2xl border-slate-200 hover:bg-white/80" onClick={() => router.push("/pricing")}>
              View Pro Plans
            </Button>
          </motion.div>

          {/* 3D Card Visual */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="mt-16 relative mx-auto max-w-4xl"
            style={{ perspective: "1000px" }}
          >
            <GlassCard className="bg-white/80 backdrop-blur-xl border-white/50 shadow-2xl rounded-3xl p-2 ml-4 md:p-4 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <img src="/paper_wizard_preview.png" alt="Dashboard Preview" className="rounded-2xl shadow-inner border border-slate-100" />
              {/* Note: In a real app, I'd use an actual screenshot here */}
            </GlassCard>

            {/* Floating Elements */}
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 hidden md:flex">
              <div className="bg-green-100 p-2 rounded-lg"><CheckCircleIcon className="h-6 w-6 text-green-600" /></div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Accuracy</p>
                <p className="font-bold text-slate-800">100% Syllabus</p>
              </div>
            </motion.div>
            <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-20 -left-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 hidden md:flex">
              <div className="bg-blue-100 p-2 rounded-lg"><Zap className="h-6 w-6 text-blue-600" /></div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Speed</p>
                <p className="font-bold text-slate-800">&lt; 30 Seconds</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 font-serif">Everything you need to <br />ace the exams</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Powerful features designed for modern educators and ambitious students.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BrainCircuit className="h-8 w-8 text-purple-600" />}
              title="AI-Driven Logic"
              desc="Our advanced AI ensures every question is relevant, unique, and strictly adheres to the board pattern."
              color="bg-purple-50"
            />
            <FeatureCard
              icon={<Wand2 className="h-8 w-8 text-blue-600" />}
              title="Instant formatting"
              desc="Get perfectly formatted PDFs and Word documents in one click. No more hours spent on layout."
              color="bg-blue-50"
            />
            <FeatureCard
              icon={<ShieldCheck className="h-8 w-8 text-green-600" />}
              title="Board Compliant"
              desc="Strictly follows CBSE & Maharashtra State Board patterns including weightage and question types."
              color="bg-green-50"
            />
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="py-20 px-4 md:px-6 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-around items-center gap-8 text-center">
          <div className="space-y-2">
            <p className="text-4xl md:text-5xl font-bold text-slate-900">50k+</p>
            <p className="text-slate-600 font-medium">Questions Generated</p>
          </div>
          <div className="w-px h-16 bg-slate-200 hidden md:block"></div>
          <div className="space-y-2">
            <p className="text-4xl md:text-5xl font-bold text-slate-900">1,200+</p>
            <p className="text-slate-600 font-medium">Happy Teachers</p>
          </div>
          <div className="w-px h-16 bg-slate-200 hidden md:block"></div>
          <div className="space-y-2">
            <p className="text-4xl md:text-5xl font-bold text-slate-900">4.9/5</p>
            <p className="text-slate-600 font-medium">User Rating</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 md:px-6 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 font-serif text-center">Loved by Educators</h2>

          <div className="grid md:grid-cols-2 gap-6 relative">
            {/* Decorative quote mark */}
            <div className="absolute -top-10 -left-10 text-9xl text-slate-100 font-serif font-bold -z-10">“</div>

            <GlassCard className="p-8 bg-slate-50 hover:bg-white transition-colors border-slate-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">R</div>
                <div>
                  <p className="font-bold text-slate-900">Rahul Sharma</p>
                  <p className="text-xs text-slate-500">Physics Teacher, Mumbai</p>
                </div>
                <div className="ml-auto flex text-amber-400">★★★★★</div>
              </div>
              <p className="text-slate-600 italic">"I used to spend 3 hours every Sunday making test papers. With ScorePrepPro, it takes me literally 2 minutes. The questions are actually good!"</p>
            </GlassCard>

            <GlassCard className="p-8 bg-slate-50 hover:bg-white transition-colors border-slate-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">A</div>
                <div>
                  <p className="font-bold text-slate-900">Anjali Desai</p>
                  <p className="text-xs text-slate-500">Tution Owner, Pune</p>
                </div>
                <div className="ml-auto flex text-amber-400">★★★★★</div>
              </div>
              <p className="text-slate-600 italic">"The strict board pattern adherence is a lifesaver. My students are getting better practice now. Highly recommended for coaching classes."</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden bg-slate-900 text-white text-center p-12 md:p-24 shadow-2xl">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold font-serif">Ready to transform how you teach?</h2>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">Join thousands of educators saving time and improving student results today.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-10 py-6 h-auto rounded-xl shadow-lg shadow-white/10" onClick={() => router.push("/signup")}>
                Get Started for Free
              </Button>
            </div>
            <p className="text-sm text-slate-400 mt-4">No credit card required for free trial.</p>
          </div>
        </div>
      </section>

    </main>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
  )
}

function FeatureCard({ icon, title, desc, color }: any) {
  return (
    <GlassCard className="p-8 hover:-translate-y-2 transition-transform duration-300 border-slate-100 bg-white shadow-lg hover:shadow-xl">
      <div className={`h-14 w-14 ${color} rounded-2xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </GlassCard>
  )
}

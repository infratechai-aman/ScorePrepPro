"use client";

import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function CallToAction() {
    const router = useRouter();

    return (
        <section className="py-20 px-4 md:px-6">
            <div className="max-w-6xl mx-auto bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                <div className="relative z-10 space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold">Ready to reclaim your weekends?</h2>
                    <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
                        Join 5,000+ Indian educators who use ScorePrepPro AI to focus on teaching, not paper setting.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button
                            className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-6 rounded-xl text-lg font-bold shadow-lg"
                            onClick={() => router.push("/signup")}
                        >
                            Get Started for Free
                        </Button>
                        <Button
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10 px-8 py-6 rounded-xl text-lg"
                            onClick={() => router.push("/pricing")}
                        >
                            Contact Sales
                        </Button>
                    </div>

                    <p className="text-xs text-indigo-200 mt-6 tracking-wide uppercase">No Credit Card Required • Instant Setup</p>
                </div>
            </div>
        </section>
    );
}

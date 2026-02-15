"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ChevronDown, ChevronUp, MessageCircle, Send } from "lucide-react";

export function SupportForm() {
    const { user } = useAuth();
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message || !user) return;

        setSending(true);
        try {
            await addDoc(collection(db, "support_requests"), {
                userId: user.uid,
                email: user.email,
                subject,
                message,
                status: "open",
                createdAt: serverTimestamp()
            });
            setSent(true);
            setSubject("");
            setMessage("");
            setTimeout(() => setSent(false), 3000);
        } catch (error) {
            console.error("Error sending support request:", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const faqs = [
        {
            q: "How do I download the generated question paper?",
            a: "After generating a paper, you will see a 'Download PDF' button at the top right corner of the preview page. Click it to save the paper to your device."
        },
        {
            q: "Can I customize the branding on the paper?",
            a: "Yes! Go to the 'Paper Generator' page, and in the third step 'Advanced Options', you can upload your school logo and set the institute name."
        },
        {
            q: "What is the daily limit for the AI Tutor?",
            a: "The AI Tutor has a daily limit of 100,000 tokens per user. This resets automatically every 24 hours."
        },
        {
            q: "How can I upgrade my plan?",
            a: "Currently, we are offering verified teacher accounts for free. If you need enterprise features, please contact our sales team using the form on this page."
        }
    ];

    return (
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl">
            {/* Contact Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-indigo-600" /> Send us a Message
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                        <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="e.g., Issue with PDF generation"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-32 resize-none"
                            placeholder="Describe your issue or feedback..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={sending || sent}
                        className={`w-full py-4 rounded-xl shadow-lg transition-all ${sent ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
                    >
                        {sending ? "Sending..." : sent ? "Message Sent!" : <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Message</span>}
                    </Button>
                </form>
            </div>

            {/* FAQs */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Frequently Asked Questions</h3>
                {faqs.map((faq, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                        >
                            <span className="font-bold text-slate-700 text-sm">{faq.q}</span>
                            {openFaq === i ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {openFaq === i && (
                            <div className="p-4 pt-0 text-sm text-slate-600 bg-slate-50/50 border-t border-slate-100 leading-relaxed">
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mt-6">
                    <h4 className="font-bold text-indigo-900 mb-2">Need direct assistance?</h4>
                    <p className="text-sm text-indigo-700 mb-4">You can also email us directly at support@edubharat.com. We typically respond within 24 hours.</p>
                    <a href="mailto:support@edubharat.com" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 underline">
                        Email Support Team
                    </a>
                </div>
            </div>
        </div>
    );
}

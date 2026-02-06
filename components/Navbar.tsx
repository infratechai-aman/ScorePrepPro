
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/Button";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/40 bg-white/60 backdrop-blur-xl">
            <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 font-serif">
                        ScorePrepPro
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                        How it works
                    </Link>
                    <Link href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                        Pricing
                    </Link>
                    <Button size="sm" variant="primary">
                        Get Started
                    </Button>
                </div>
            </div>
        </nav>
    );
}


"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = "" }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-slate-100 rounded-full h-8 w-8 p-0">
                        <X className="h-5 w-5 text-slate-500" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

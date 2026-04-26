"use client";

import { FileText, Brain, Upload, CheckCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface UnitCardProps {
    id: string;
    subjectId: string;
    title: string;
    description: string;
    materialCount: number;
    knowledgeExtracted: boolean;
    concepts?: string[];
}

export function UnitCard({ id, subjectId, title, description, materialCount, knowledgeExtracted, concepts }: UnitCardProps) {
    return (
        <Link href={`/teacher-dashboard/custom-subjects/${subjectId}/${id}`}>
            <div className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${knowledgeExtracted ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                            {knowledgeExtracted ? (
                                <Brain className="text-emerald-600" size={20} />
                            ) : (
                                <FileText className="text-slate-400" size={20} />
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900">{title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1">{description || "No description"}</p>
                        </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={18} />
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Upload size={12} />
                        <span className="font-medium">{materialCount}</span> files
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${knowledgeExtracted ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {knowledgeExtracted ? (
                            <>
                                <CheckCircle size={12} />
                                <span className="font-medium">AI Ready</span>
                            </>
                        ) : (
                            <>
                                <Clock size={12} />
                                <span className="font-medium">Upload content</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Concepts preview */}
                {concepts && concepts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                        {concepts.slice(0, 3).map((c, i) => (
                            <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                                {c}
                            </span>
                        ))}
                        {concepts.length > 3 && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                +{concepts.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}

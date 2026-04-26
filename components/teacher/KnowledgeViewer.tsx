"use client";

import { Brain, BookOpen, Lightbulb, FlaskConical, Target } from "lucide-react";

interface KnowledgeViewerProps {
    summary?: string;
    concepts?: string[];
    definitions?: { term: string; definition: string }[];
    formulas?: string[];
    keyTopics?: string[];
}

export function KnowledgeViewer({ summary, concepts, definitions, formulas, keyTopics }: KnowledgeViewerProps) {
    if (!summary && (!concepts || concepts.length === 0)) {
        return (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center">
                <Brain className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-sm text-slate-500 font-medium">No AI knowledge yet</p>
                <p className="text-xs text-slate-400 mt-1">Upload materials above to build AI memory for this unit</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary */}
            {summary && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="text-indigo-600" size={18} />
                        <h4 className="font-semibold text-indigo-900 text-sm">AI Knowledge Summary</h4>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                {/* Key Topics */}
                {keyTopics && keyTopics.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="text-emerald-500" size={16} />
                            <h4 className="font-semibold text-slate-800 text-sm">Key Topics</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {keyTopics.map((topic, i) => (
                                <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Concepts */}
                {concepts && concepts.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="text-amber-500" size={16} />
                            <h4 className="font-semibold text-slate-800 text-sm">Concepts ({concepts.length})</h4>
                        </div>
                        <ul className="space-y-1.5">
                            {concepts.slice(0, 10).map((concept, i) => (
                                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                    {concept}
                                </li>
                            ))}
                            {concepts.length > 10 && (
                                <li className="text-xs text-slate-400 font-medium">+{concepts.length - 10} more concepts</li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Definitions */}
                {definitions && definitions.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="text-blue-500" size={16} />
                            <h4 className="font-semibold text-slate-800 text-sm">Definitions ({definitions.length})</h4>
                        </div>
                        <div className="space-y-2">
                            {definitions.slice(0, 5).map((def, i) => (
                                <div key={i} className="text-xs">
                                    <span className="font-bold text-slate-800">{def.term}:</span>{" "}
                                    <span className="text-slate-600">{def.definition}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Formulas */}
                {formulas && formulas.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <FlaskConical className="text-purple-500" size={16} />
                            <h4 className="font-semibold text-slate-800 text-sm">Formulas ({formulas.length})</h4>
                        </div>
                        <ul className="space-y-1.5">
                            {formulas.map((formula, i) => (
                                <li key={i} className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5 font-mono">
                                    {formula}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

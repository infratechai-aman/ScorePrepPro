"use client";

import { BookOpen, Layers, Calendar, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface SubjectCardProps {
    id: string;
    name: string;
    grade: string;
    board: string;
    description: string;
    unitCount: number;
    createdAt: any;
    onDelete?: (id: string) => void;
}

export function SubjectCard({ id, name, grade, board, description, unitCount, createdAt, onDelete }: SubjectCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <Link href={`/teacher-dashboard/custom-subjects/${id}`}>
            <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all duration-300 cursor-pointer">
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Menu */}
                {onDelete && (
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <MoreVertical size={16} />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-36 z-20">
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(id); setShowMenu(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                    <BookOpen className="text-indigo-600" size={24} />
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-slate-900 mb-1 font-serif">{name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{description || "No description"}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {grade && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                            {grade}
                        </span>
                    )}
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-600">
                        {board}
                    </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Layers size={14} className="text-indigo-400" />
                        <span className="font-medium">{unitCount}</span> Units
                    </div>
                    {createdAt && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Calendar size={14} className="text-slate-400" />
                            {createdAt?.toDate ? new Date(createdAt.toDate()).toLocaleDateString() : "Recently"}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

"use client";

import { Upload, FileText, X, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useRef, useCallback } from "react";

interface FileUploaderProps {
    subjectId: string;
    unitId: string;
    onUploadComplete: (result: any) => void;
}

export function FileUploader({ subjectId, unitId, onUploadComplete }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "extracting" | "processing" | "done" | "error">("idle");
    const [progress, setProgress] = useState("");
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const ALLOWED_TYPES = [".pdf", ".docx", ".pptx", ".ppt", ".txt", ".md", ".png", ".jpg", ".jpeg", ".webp"];

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) uploadFile(files[0]);
    }, [subjectId, unitId]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) uploadFile(files[0]);
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        setError("");
        setUploadStatus("extracting");
        setProgress(`Uploading ${file.name}...`);

        try {
            const formData = new FormData();
            formData.append("file", file);

            setProgress("Extracting text from file...");
            setUploadStatus("processing");

            const res = await fetch(`/api/custom-subjects/${subjectId}/units/${unitId}/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setUploadStatus("done");
            setProgress(`✅ Processed! Found ${data.conceptCount} concepts, ${data.topicCount} topics.`);
            onUploadComplete(data);

            // Reset after 3 seconds
            setTimeout(() => {
                setUploadStatus("idle");
                setProgress("");
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Upload failed");
            setUploadStatus("error");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-3">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragging
                        ? "border-indigo-400 bg-indigo-50/50 scale-[1.01]"
                        : uploadStatus === "done"
                        ? "border-emerald-300 bg-emerald-50/50"
                        : uploadStatus === "error"
                        ? "border-red-300 bg-red-50/50"
                        : "border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30"
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={ALLOWED_TYPES.join(",")}
                    onChange={handleFileSelect}
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Loader2 className="text-indigo-600 animate-spin" size={24} />
                        </div>
                        <p className="text-sm font-medium text-indigo-700">{progress}</p>
                        <p className="text-xs text-slate-500">
                            {uploadStatus === "extracting" && "Extracting text content..."}
                            {uploadStatus === "processing" && "AI is understanding your content... This may take a minute."}
                        </p>
                        {/* Animated progress bar */}
                        <div className="w-48 mx-auto h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: uploadStatus === "extracting" ? "40%" : "75%" }} />
                        </div>
                    </div>
                ) : uploadStatus === "done" ? (
                    <div className="space-y-2">
                        <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
                        <p className="text-sm font-medium text-emerald-700">{progress}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <Upload className="text-indigo-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700">
                                Drop files here or <span className="text-indigo-600">browse</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                PDF, DOCX, PPT, Images, TXT — Max 10MB
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1.5">
                            {["PDF", "DOCX", "PPT", "PNG", "JPG", "TXT"].map((ext) => (
                                <span key={ext} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                    .{ext}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
                    <X size={16} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}
        </div>
    );
}

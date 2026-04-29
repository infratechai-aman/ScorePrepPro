"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill/dist/quill.snow.css"; // Import styles

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
    ssr: false,
    loading: () => <div className="h-48 w-full bg-slate-50 border border-slate-200 rounded-xl animate-pulse" />
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
    // Memoize the modules so Quill doesn't re-render on every keystroke
    const modules = useMemo(() => ({
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],     // lists
            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            ['clean']                                         // remove formatting button
        ],
    }), []);

    return (
        <div className="rich-text-editor-container">
            <ReactQuill 
                theme="snow" 
                value={value} 
                onChange={onChange} 
                modules={modules}
                placeholder={placeholder || "Type your answer here..."}
            />
            <style jsx global>{`
                .rich-text-editor-container .ql-toolbar {
                    border-top-left-radius: 0.75rem;
                    border-top-right-radius: 0.75rem;
                    border-color: #e2e8f0;
                    background-color: #f8fafc;
                    padding: 8px;
                }
                .rich-text-editor-container .ql-container {
                    border-bottom-left-radius: 0.75rem;
                    border-bottom-right-radius: 0.75rem;
                    border-color: #e2e8f0;
                    min-height: 150px;
                    font-family: 'Inter', -apple-system, sans-serif;
                    font-size: 0.875rem;
                }
                .rich-text-editor-container .ql-editor {
                    min-height: 150px;
                }
                .rich-text-editor-container .ql-editor:focus {
                    border-radius: 0.75rem;
                }
            `}</style>
        </div>
    );
};

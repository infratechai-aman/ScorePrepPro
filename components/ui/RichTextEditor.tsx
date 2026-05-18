"use client";

import { useRef, useCallback } from "react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    const execCommand = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value);
        handleInput();
    }, [handleInput]);

    return (
        <div className="rich-text-editor-container">
            {/* Toolbar */}
            <div className="rte-toolbar">
                <button type="button" onClick={() => execCommand("bold")} title="Bold" className="rte-btn"><b>B</b></button>
                <button type="button" onClick={() => execCommand("italic")} title="Italic" className="rte-btn"><i>I</i></button>
                <button type="button" onClick={() => execCommand("underline")} title="Underline" className="rte-btn"><u>U</u></button>
                <button type="button" onClick={() => execCommand("strikethrough")} title="Strikethrough" className="rte-btn"><s>S</s></button>
                <span className="rte-separator" />
                <button type="button" onClick={() => execCommand("insertOrderedList")} title="Numbered List" className="rte-btn">1.</button>
                <button type="button" onClick={() => execCommand("insertUnorderedList")} title="Bullet List" className="rte-btn">•</button>
                <span className="rte-separator" />
                <button type="button" onClick={() => execCommand("subscript")} title="Subscript" className="rte-btn">x₂</button>
                <button type="button" onClick={() => execCommand("superscript")} title="Superscript" className="rte-btn">x²</button>
                <span className="rte-separator" />
                <button type="button" onClick={() => execCommand("removeFormat")} title="Clear Formatting" className="rte-btn">✕</button>
            </div>

            {/* Editable Area */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                className="rte-editor"
                dangerouslySetInnerHTML={{ __html: value || "" }}
                data-placeholder={placeholder || "Type your answer here..."}
            />

            <style jsx global>{`
                .rich-text-editor-container {
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    overflow: hidden;
                }
                .rte-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    padding: 6px 8px;
                    background-color: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    flex-wrap: wrap;
                }
                .rte-btn {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    background: transparent;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    color: #475569;
                    transition: all 0.15s;
                }
                .rte-btn:hover {
                    background-color: #e2e8f0;
                    color: #1e293b;
                }
                .rte-btn:active {
                    background-color: #cbd5e1;
                }
                .rte-separator {
                    width: 1px;
                    height: 20px;
                    background-color: #e2e8f0;
                    margin: 0 4px;
                }
                .rte-editor {
                    min-height: 150px;
                    padding: 12px 16px;
                    font-family: 'Inter', -apple-system, sans-serif;
                    font-size: 0.875rem;
                    line-height: 1.6;
                    color: #1e293b;
                    outline: none;
                    overflow-y: auto;
                }
                .rte-editor:empty::before {
                    content: attr(data-placeholder);
                    color: #94a3b8;
                    pointer-events: none;
                }
                .rte-editor:focus {
                    box-shadow: inset 0 0 0 1px #818cf8;
                }
                .rte-editor ul { list-style: disc; padding-left: 24px; }
                .rte-editor ol { list-style: decimal; padding-left: 24px; }
                .rte-editor li { margin-bottom: 4px; }
                @media print {
                    .rte-toolbar { display: none !important; }
                }
            `}</style>
        </div>
    );
};

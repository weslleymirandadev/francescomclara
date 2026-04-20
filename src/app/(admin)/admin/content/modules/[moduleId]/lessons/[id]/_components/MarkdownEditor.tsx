"use client";

import { useState } from "react";
import {
  Bold,
  List,
  Eye,
  Pencil,
  Italic,
  Quote,
  Code,
  LinkIcon,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  id: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  id,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById(id) as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || "";
    onChange(
      currentVal.substring(0, start) +
        prefix +
        currentVal.substring(start, end) +
        suffix +
        currentVal.substring(end),
    );
    setTimeout(() => {
      textarea.focus();
    }, 10);
  };

  return (
    <div className="w-full border rounded-[32px] overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between p-3 border-b bg-s-25/50">
        <div className="flex gap-1 bg-s-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${mode === "edit" ? "bg-white text-s-900 shadow-sm" : "text-s-400"}`}
          >
            <Pencil size={12} className="inline mr-1" /> Editar
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${mode === "preview" ? "bg-white text-s-900 shadow-sm" : "text-s-400"}`}
          >
            <Eye size={12} className="inline mr-1" /> Visualizar
          </button>
        </div>

        {mode === "edit" && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 border-r pr-1 mr-1">
              <button
                type="button"
                onClick={() => insertMarkdown("# ")}
                className="p-2 hover:bg-s-50 rounded-lg text-s-500"
              >
                <Heading1 size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("## ")}
                className="p-2 hover:bg-s-50 rounded-lg text-s-500"
              >
                <Heading2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("### ")}
                className="p-2 hover:bg-s-50 rounded-lg text-s-500"
              >
                <Heading3 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => insertMarkdown("**", "**")}
                className="p-2 hover:bg-s-50 rounded-lg text-s-500"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("_", "_")}
                className="p-2 hover:bg-s-50 rounded-lg text-s-500"
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("> ")}
                className="p-2 hover:bg-s-50 rounded-lg text-s-500"
              >
                <Quote size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("`", "`")}
                className="p-2 hover:bg-s-50 rounded-lg text-s-500"
              >
                <Code size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("[", "](url)")}
                className="p-2 hover:bg-s-50 rounded-lg text-s-500"
              >
                <LinkIcon size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("- ")}
                className="p-2 hover:bg-s-50 rounded-lg text-s-500"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {mode === "edit" ? (
        <textarea
          id={id}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-8 min-h-[400px] outline-none text-s-700 font-medium resize-none bg-transparent text-lg"
        />
      ) : (
        <div className="p-8 min-h-[400px] bg-white">
          <div className="max-w-none prose prose-slate prose-lg">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-3xl font-black text-s-900 mb-6 mt-8"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-2xl font-black text-s-900 mb-4 mt-6 border-b pb-2"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-xl font-bold text-s-800 mb-3 mt-5"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-6 whitespace-pre-wrap" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc ml-6 mb-6 space-y-2" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-black text-slate-900" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a
                    className="text-blue-600 underline hover:text-blue-800"
                    {...props}
                  />
                ),
                pre: ({ node, ...props }) => (
                  <div className="w-full my-6 overflow-hidden rounded-[2rem]">
                    {" "}
                    <pre
                      className="bg-slate-900 p-6 overflow-x-auto custom-scrollbar text-slate-200 text-sm md:text-base"
                      {...props}
                    />
                  </div>
                ),
                code: ({ node, ...props }: any) => {
                  const isInline = !props.children?.toString().includes("\n");

                  if (isInline) {
                    return (
                      <code
                        className="bg-slate-100 text-pink-500 px-1.5 py-0.5 rounded-md font-bold text-[0.85em] break-all"
                        {...props}
                      />
                    );
                  }

                  return (
                    <code
                      className="block w-full text-slate-200 text-sm md:text-base leading-relaxed"
                      {...props}
                    />
                  );
                },
              }}
            >
              {value || "*Nada para visualizar ainda...*"}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

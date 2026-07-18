"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Undo,
  Redo,
  Loader2,
} from "lucide-react";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function TiptapEditor({ content, onChange }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full my-6 mx-auto block shadow-sm border border-neutral-200 dark:border-neutral-800",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-neutral-950 underline underline-offset-4 font-semibold dark:text-white hover:text-neutral-700 dark:hover:text-neutral-300",
        },
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[350px] px-6 py-5",
      },
    },
  });

  // Watch for external content updates (e.g., when loading existing post data)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      }
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden dark:border-neutral-805 dark:bg-neutral-900">
      {/* Menu Bar */}
      <div className="flex flex-wrap gap-1 border-b border-neutral-200 bg-neutral-50/50 p-2 dark:border-neutral-805 dark:bg-neutral-950/50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive("bold") ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white" : "text-neutral-500"
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive("italic") ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white" : "text-neutral-500"
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive("code") ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white" : "text-neutral-500"
          }`}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive("heading", { level: 1 }) ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white" : "text-neutral-500"
          }`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive("heading", { level: 2 }) ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white" : "text-neutral-500"
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive("heading", { level: 3 }) ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white" : "text-neutral-500"
          }`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive("bulletList") ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white" : "text-neutral-500"
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive("orderedList") ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white" : "text-neutral-500"
          }`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive("blockquote") ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white" : "text-neutral-500"
          }`}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive("link") ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white" : "text-neutral-500"
          }`}
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={triggerFileInput}
          disabled={uploading}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors disabled:opacity-50"
          title="Insert Image"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors disabled:opacity-30"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors disabled:opacity-30"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} className="bg-white dark:bg-neutral-900" />
    </div>
  );
}

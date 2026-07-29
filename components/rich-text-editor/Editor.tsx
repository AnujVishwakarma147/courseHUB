"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";

import { Menubar } from "./Menubar";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function RichTextEditor({
  value = "",
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] max-w-none p-4 text-base focus:outline-none prose prose-sm sm:prose-base dark:prose-invert [&_strong]:font-bold [&_em]:italic [&_s]:line-through",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    content: value || "<p></p>",
  });

  return (
    <div className="w-full overflow-hidden rounded-none border border-input bg-background dark:bg-input/30">
      <Menubar editor={editor} />
      <div className="min-h-[300px]" aria-busy={!editor}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

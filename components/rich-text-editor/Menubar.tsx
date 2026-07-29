"use client";

import { type Editor, useEditorState } from "@tiptap/react";
import type { ReactNode } from "react";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List as ListIcon,
  ListOrdered,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";

interface MenubarProps {
  editor: Editor | null;
}

interface ToolbarToggleProps {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPressedChange: () => void;
  children: ReactNode;
}

function ToolbarToggle({
  label,
  active,
  disabled = false,
  onPressedChange,
  children,
}: ToolbarToggleProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => {
        // Keep the current ProseMirror selection while using the toolbar.
        event.preventDefault();
      }}
      onClick={onPressedChange}
      className="inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-muted data-[active=true]:text-foreground"
      data-active={active}
    >
      {children}
    </button>
  );
}

interface ToolbarButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolbarButton({
  label,
  disabled = false,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="mx-2 h-6 w-px bg-border" />;
}

type ExclusiveMark = "bold" | "italic" | "strike";

function toggleExclusiveMark(editor: Editor, mark: ExclusiveMark) {
  const isOnlyActive =
    editor.isActive(mark) &&
    (mark === "bold" || !editor.isActive("bold")) &&
    (mark === "italic" || !editor.isActive("italic")) &&
    (mark === "strike" || !editor.isActive("strike"));
  const chain = editor
    .chain()
    .focus()
    .unsetBold()
    .unsetItalic()
    .unsetStrike();

  if (!isOnlyActive) {
    if (mark === "bold") chain.setBold();
    if (mark === "italic") chain.setItalic();
    if (mark === "strike") chain.setStrike();
  }

  chain.run();
}

export function Menubar({ editor }: MenubarProps) {
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return null;

      const bold = currentEditor.isActive("bold");
      const italic = currentEditor.isActive("italic");
      const strike = currentEditor.isActive("strike");
      const activeMark: ExclusiveMark | null = bold
        ? "bold"
        : italic
          ? "italic"
          : strike
            ? "strike"
            : null;

      return {
        bold: activeMark === "bold",
        italic: activeMark === "italic",
        strike: activeMark === "strike",
        heading1: currentEditor.isActive("heading", { level: 1 }),
        heading2: currentEditor.isActive("heading", { level: 2 }),
        heading3: currentEditor.isActive("heading", { level: 3 }),
        bulletList: currentEditor.isActive("bulletList"),
        orderedList: currentEditor.isActive("orderedList"),
        alignLeft: currentEditor.isActive({ textAlign: "left" }),
        alignCenter: currentEditor.isActive({ textAlign: "center" }),
        alignRight: currentEditor.isActive({ textAlign: "right" }),
        canUndo: currentEditor.can().chain().focus().undo().run(),
        canRedo: currentEditor.can().chain().focus().redo().run(),
      };
    },
  });

  const state = toolbarState ?? {
    bold: false,
    italic: false,
    strike: false,
    heading1: false,
    heading2: false,
    heading3: false,
    bulletList: false,
    orderedList: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
    canUndo: false,
    canRedo: false,
  };
  const isEditorReady = Boolean(editor);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input bg-card p-2">
      <>
        {/* Basic formatting */}
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarToggle
            label="Bold"
            active={state.bold}
            disabled={!isEditorReady}
            onPressedChange={() => {
              if (editor) toggleExclusiveMark(editor, "bold");
            }}
          >
            <Bold className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Italic"
            active={state.italic}
            disabled={!isEditorReady}
            onPressedChange={() => {
              if (editor) toggleExclusiveMark(editor, "italic");
            }}
          >
            <Italic className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Strikethrough"
            active={state.strike}
            disabled={!isEditorReady}
            onPressedChange={() => {
              if (editor) toggleExclusiveMark(editor, "strike");
            }}
          >
            <Strikethrough className="size-4" />
          </ToolbarToggle>
        </div>

        <ToolbarSeparator />

        {/* Headings */}
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarToggle
            label="Heading 1"
            active={state.heading1}
            disabled={!isEditorReady}
            onPressedChange={() => {
              editor
                ?.chain()
                .focus()
                .toggleHeading({ level: 1 })
                .run();
            }}
          >
            <Heading1 className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Heading 2"
            active={state.heading2}
            disabled={!isEditorReady}
            onPressedChange={() => {
              editor
                ?.chain()
                .focus()
                .toggleHeading({ level: 2 })
                .run();
            }}
          >
            <Heading2 className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Heading 3"
            active={state.heading3}
            disabled={!isEditorReady}
            onPressedChange={() => {
              editor
                ?.chain()
                .focus()
                .toggleHeading({ level: 3 })
                .run();
            }}
          >
            <Heading3 className="size-4" />
          </ToolbarToggle>
        </div>

        <ToolbarSeparator />

        {/* Lists */}
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarToggle
            label="Bullet List"
            active={state.bulletList}
            disabled={!isEditorReady}
            onPressedChange={() => {
              editor?.chain().focus().toggleBulletList().run();
            }}
          >
            <ListIcon className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Ordered List"
            active={state.orderedList}
            disabled={!isEditorReady}
            onPressedChange={() => {
              editor?.chain().focus().toggleOrderedList().run();
            }}
          >
            <ListOrdered className="size-4" />
          </ToolbarToggle>
        </div>

        <ToolbarSeparator />

        {/* Text alignment */}
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarToggle
            label="Align Left"
            active={state.alignLeft}
            disabled={!isEditorReady}
            onPressedChange={() => {
              editor?.chain().focus().setTextAlign("left").run();
            }}
          >
            <AlignLeft className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Align Center"
            active={state.alignCenter}
            disabled={!isEditorReady}
            onPressedChange={() => {
              editor
                ?.chain()
                .focus()
                .setTextAlign("center")
                .run();
            }}
          >
            <AlignCenter className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Align Right"
            active={state.alignRight}
            disabled={!isEditorReady}
            onPressedChange={() => {
              editor
                ?.chain()
                .focus()
                .setTextAlign("right")
                .run();
            }}
          >
            <AlignRight className="size-4" />
          </ToolbarToggle>
        </div>

        <ToolbarSeparator />

        {/* History */}
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton
            label="Undo"
            disabled={!isEditorReady || !state.canUndo}
            onClick={() => {
              editor?.chain().focus().undo().run();
            }}
          >
            <Undo2 className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Redo"
            disabled={!isEditorReady || !state.canRedo}
            onClick={() => {
              editor?.chain().focus().redo().run();
            }}
          >
            <Redo2 className="size-4" />
          </ToolbarButton>
        </div>
      </>
    </div>
  );
}

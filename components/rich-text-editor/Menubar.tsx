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

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

interface MenubarProps {
  editor: Editor | null;
}

interface ToolbarToggleProps {
  label: string;
  active: boolean;
  onPressedChange: () => void;
  children: ReactNode;
}

function ToolbarToggle({
  label,
  active,
  onPressedChange,
  children,
}: ToolbarToggleProps) {
  return (
    <Toggle
      type="button"
      size="sm"
      pressed={active}
      aria-label={label}
      title={label}
      onPressedChange={onPressedChange}
      className={cn(
        "size-8 p-0",
        active && "bg-muted text-foreground",
      )}
    >
      {children}
    </Toggle>
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
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="size-8 p-0"
    >
      {children}
    </Button>
  );
}

function ToolbarSeparator() {
  return <div className="mx-2 h-6 w-px bg-border" />;
}

export function Menubar({ editor }: MenubarProps) {
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return null;

      return {
        bold: currentEditor.isActive("bold"),
        italic: currentEditor.isActive("italic"),
        strike: currentEditor.isActive("strike"),
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

  if (!editor || !toolbarState) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input bg-card p-2">
      <>
        {/* Basic formatting */}
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarToggle
            label="Bold"
            active={toolbarState.bold}
            onPressedChange={() => {
              editor.chain().focus().toggleBold().run();
            }}
          >
            <Bold className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Italic"
            active={toolbarState.italic}
            onPressedChange={() => {
              editor.chain().focus().toggleItalic().run();
            }}
          >
            <Italic className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Strikethrough"
            active={toolbarState.strike}
            onPressedChange={() => {
              editor.chain().focus().toggleStrike().run();
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
            active={toolbarState.heading1}
            onPressedChange={() => {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: 1 })
                .run();
            }}
          >
            <Heading1 className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Heading 2"
            active={toolbarState.heading2}
            onPressedChange={() => {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: 2 })
                .run();
            }}
          >
            <Heading2 className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Heading 3"
            active={toolbarState.heading3}
            onPressedChange={() => {
              editor
                .chain()
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
            active={toolbarState.bulletList}
            onPressedChange={() => {
              editor.chain().focus().toggleBulletList().run();
            }}
          >
            <ListIcon className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Ordered List"
            active={toolbarState.orderedList}
            onPressedChange={() => {
              editor.chain().focus().toggleOrderedList().run();
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
            active={toolbarState.alignLeft}
            onPressedChange={() => {
              editor.chain().focus().setTextAlign("left").run();
            }}
          >
            <AlignLeft className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Align Center"
            active={toolbarState.alignCenter}
            onPressedChange={() => {
              editor
                .chain()
                .focus()
                .setTextAlign("center")
                .run();
            }}
          >
            <AlignCenter className="size-4" />
          </ToolbarToggle>

          <ToolbarToggle
            label="Align Right"
            active={toolbarState.alignRight}
            onPressedChange={() => {
              editor
                .chain()
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
            disabled={!toolbarState.canUndo}
            onClick={() => {
              editor.chain().focus().undo().run();
            }}
          >
            <Undo2 className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Redo"
            disabled={!toolbarState.canRedo}
            onClick={() => {
              editor.chain().focus().redo().run();
            }}
          >
            <Redo2 className="size-4" />
          </ToolbarButton>
        </div>
      </>
    </div>
  );
}

"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  BotIcon,
  LoaderCircleIcon,
  MessageCircleIcon,
  RotateCcwIcon,
  SendIcon,
  XIcon,
} from "lucide-react";

type MessageRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
};

type ChatApiResponse = {
  message?: string;
  error?: string;
};

const welcomeMessage: ChatMessage = {
  id: "coursehub-welcome",
  role: "assistant",
  content:
    "Hi! I can help you find a CourseHUB course, understand enrollment, or use your learning dashboard.",
};

const quickQuestions = [
  "Which course is right for me?",
  "What courses are available?",
  "Recommend a beginner course.",
  "How do I enroll in a course?",
] as const;

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function CourseAiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasStartedConversation = messages.some(
    (message) => message.role === "user",
  );

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeout = window.setTimeout(() => textareaRef.current?.focus(), 100);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  async function sendMessage(customContent?: string) {
    const content = (customContent ?? input).trim();

    if (!content || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content,
    };
    const nextMessages = [...messages, userMessage];
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.slice(-8).map(({ role, content: text }) => ({
            role,
            content: text,
          })),
        }),
        signal: controller.signal,
      });
      const result = (await response.json()) as ChatApiResponse;

      if (!response.ok) {
        throw new Error(result.error ?? "The AI assistant could not respond.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            result.message ?? "Sorry, I could not generate a response.",
        },
      ]);
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "AbortError"
          ? "The response took too long. Please try again."
          : error instanceof Error
            ? error.message
            : "The AI assistant is temporarily unavailable.";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      window.clearTimeout(timeout);
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  function startNewConversation() {
    setMessages([welcomeMessage]);
    setInput("");
    textareaRef.current?.focus();
  }

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          aria-label="Open CourseHUB AI assistant"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-100 flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
        >
          <MessageCircleIcon className="size-5" />
        </button>
      ) : null}

      {isOpen ? (
        <section
          role="dialog"
          aria-modal="false"
          aria-label="CourseHUB AI assistant"
          className="fixed bottom-3 right-3 z-100 flex h-[min(520px,calc(100vh-1.5rem))] w-[calc(100vw-1.5rem)] max-w-95 flex-col overflow-hidden border bg-background shadow-xl sm:bottom-6 sm:right-6 sm:h-130"
        >
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-card px-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BotIcon className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-semibold">CourseHUB Assistant</h2>
                <p className="text-xs text-muted-foreground">Course support in English</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close AI assistant"
              onClick={() => setIsOpen(false)}
              className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <XIcon className="size-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2.5 text-sm leading-5 ${
                      message.role === "assistant"
                        ? "border bg-card text-card-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {!hasStartedConversation ? (
                <div className="grid gap-2 pt-1">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      disabled={isLoading}
                      onClick={() => void sendMessage(question)}
                      className="w-full rounded-md border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/40 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              ) : null}

              {isLoading ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm text-muted-foreground">
                    <LoaderCircleIcon className="size-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="shrink-0 border-t bg-background p-3">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                rows={1}
                maxLength={1000}
                disabled={isLoading}
                placeholder="Ask about courses..."
                aria-label="AI chat message"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                className="max-h-24 min-h-10 flex-1 resize-none rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || isLoading}
                className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <LoaderCircleIcon className="size-4 animate-spin" />
                ) : (
                  <SendIcon className="size-4" />
                )}
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground">
                AI can make mistakes.
              </p>
              {hasStartedConversation && !isLoading ? (
                <button
                  type="button"
                  onClick={startNewConversation}
                  className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  <RotateCcwIcon className="size-3" />
                  New chat
                </button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

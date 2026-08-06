"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  FaBookOpen,
  FaEnvelope,
  FaPaperPlane,
  FaRegComments,
} from "react-icons/fa";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/site-config";

export default function ContactPage() {
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    setIsSending(true);

    const formData = new FormData(
      form,
    );

    const name = String(
      formData.get("name") ?? "",
    ).trim();

    const email = String(
      formData.get("email") ?? "",
    ).trim();

    const subject = String(
      formData.get("subject") ?? "",
    ).trim();

    const message = String(
      formData.get("message") ?? "",
    ).trim();

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.message || "Unable to send your message.");
      }

      toast.success(result?.message || "Your message has been sent.");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send your message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl py-12 md:py-16">
      {/* Heading */}
      <section className="mx-auto mb-12 max-w-3xl text-center">
        <Badge
          variant="outline"
          className="rounded-full px-4 py-1.5"
        >
          Contact Us
        </Badge>

        <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
          How can we{" "}
          <span className="text-primary">
            help you?
          </span>
        </h1>

        <p className="mt-5 text-base leading-8 text-muted-foreground md:text-xl">
          Have a question about courses, enrollment,
          your account or the platform? Send us a
          message and our support team will help you.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Left cards */}
        <div className="space-y-10 py-2 lg:py-5">
          <section className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FaEnvelope className="size-5" />
            </div>

            <div className="min-w-0 pt-0.5">
              <h2 className="text-xl font-bold">Email Support</h2>
              <p className="mt-2 leading-7 text-muted-foreground">
                Contact us regarding your account, payment or any general query.
              </p>
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="mt-4 inline-flex break-all font-semibold text-primary hover:underline"
              >
                {siteConfig.supportEmail}
              </a>
            </div>
          </section>

          <section className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FaBookOpen className="size-5" />
            </div>

            <div className="min-w-0 pt-0.5">
              <h2 className="text-xl font-bold">Course Assistance</h2>
              <p className="mt-2 leading-7 text-muted-foreground">
                Need help selecting a course, accessing lessons or understanding
                your enrollment?
              </p>
              <Link
                href="/courses"
                className="mt-4 inline-flex font-semibold text-primary transition-colors hover:underline"
              >
                Explore available courses
              </Link>
            </div>
          </section>

          <section className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <FaRegComments className="size-5" />
            </div>

            <div className="min-w-0 pt-0.5">
              <h2 className="text-xl font-bold">Get Faster Support</h2>
              <p className="mt-2 leading-7 text-muted-foreground">
                Include your account email, course name and a clear description
                of your problem.
              </p>
            </div>
          </section>
        </div>

        {/* Contact form */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              Send a message
            </CardTitle>

            <CardDescription className="text-base">
              Fill in your details below and we&apos;ll send
              your message directly to our support team.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full name
                  </Label>

                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email address
                  </Label>

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject
                </Label>

                <Input
                  id="subject"
                  name="subject"
                  placeholder="What do you need help with?"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  Message
                </Label>

                <Textarea
                  id="message"
                  name="message"
                  placeholder="Describe your question or problem..."
                  className="min-h-40 resize-none rounded-xl"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-xl px-6 text-base sm:w-auto"
                disabled={isSending}
              >
                {isSending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <FaPaperPlane className="size-4" />
                )}
                {isSending ? "Sending..." : "Send Email"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

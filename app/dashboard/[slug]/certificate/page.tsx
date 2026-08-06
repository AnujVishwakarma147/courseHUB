import { getCourseCertificate } from "@/app/data/course/get-course-certificate";
import { buttonVariants } from "@/components/ui/button";
import { Award, BadgeCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CertificatePrintButton } from "./CertificatePrintButton";

type Params = Promise<{ slug: string }>;

export default async function CourseCertificatePage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const certificate = await getCourseCertificate(slug);
  const completionDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(certificate.completedAt);

  return (
    <main className="px-1 pb-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/dashboard/${certificate.courseSlug}`}
          className={buttonVariants({
            variant: "outline",
            className: "h-11 rounded-none px-5 text-base",
          })}
        >
          <ArrowLeft className="size-4" />
          Back to Course
        </Link>
        <CertificatePrintButton />
      </div>

      <article className="course-certificate-print relative mx-auto aspect-[1.414/1] w-full max-w-6xl overflow-hidden border-2 border-[#cf6544] bg-white p-3 text-stone-900 shadow-xl">
        <div className="flex h-full flex-col items-center justify-center border border-[#cf6544] px-8 py-8 text-center sm:px-14">
          <Award className="size-12 text-[#cf6544] sm:size-16" />
          <p className="mt-3 text-sm font-bold uppercase tracking-[0.35em] text-[#cf6544] sm:text-base">
            CourseHub
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold uppercase tracking-wide sm:text-5xl">
            Certificate of Completion
          </h1>
          <p className="mt-5 text-sm text-stone-600 sm:text-lg">
            This certificate is proudly presented to
          </p>
          <p className="mt-2 border-b-2 border-[#cf6544] px-8 pb-2 font-serif text-3xl font-bold sm:px-20 sm:text-5xl">
            {certificate.studentName}
          </p>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-lg">
            for successfully completing the course
          </p>
          <h2 className="mt-2 max-w-3xl text-2xl font-bold text-[#cf6544] sm:text-4xl">
            {certificate.courseTitle}
          </h2>
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold sm:text-lg">
            <BadgeCheck className="size-5 text-emerald-600" />
            100% Course Completion — Congratulations!
          </p>

          <div className="mt-7 grid w-full max-w-3xl grid-cols-2 gap-8 text-sm sm:text-base">
            <div>
              <p className="font-semibold">{completionDate}</p>
              <p className="mt-1 border-t border-stone-400 pt-1 text-stone-500">
                Completion date
              </p>
            </div>
            <div>
              <p className="font-semibold">CourseHub Admin</p>
              <p className="mt-1 border-t border-stone-400 pt-1 text-stone-500">
                Authorized signature
              </p>
            </div>
          </div>

          <p className="mt-5 text-xs tracking-wider text-stone-500">
            Certificate ID: {certificate.certificateId}
          </p>
        </div>
      </article>
    </main>
  );
}

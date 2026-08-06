import Link from "next/link";

import {
  FaChevronRight,
  FaClock,
  FaEnvelope,
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";

import { siteConfig } from "@/lib/site-config";

const helpfulLinks = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Courses",
    href: "/courses",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Contact Us",
    href: "/contact",
  },
];

const socialLinks = [
  {
    name: "Facebook",
    href: siteConfig.socialLinks.facebook,
    icon: FaFacebookF,
    brandClass: "bg-[#1877F2] text-white ring-[#1877F2]/30",
  },
  {
    name: "Twitter",
    href: siteConfig.socialLinks.twitter,
    icon: FaTwitter,
    brandClass: "bg-[#1DA1F2] text-white ring-[#1DA1F2]/30",
  },
  {
    name: "LinkedIn",
    href: siteConfig.socialLinks.linkedin,
    icon: FaLinkedinIn,
    brandClass: "bg-[#0A66C2] text-white ring-[#0A66C2]/30",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[rgb(253,253,253)] text-[#302f2a] dark:bg-[#232321] dark:text-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10 lg:py-14">
        {/* Main footer content */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-20">
          {/* Helpful links */}
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Helpful Links
            </h2>

            <nav className="mt-5 flex flex-col gap-4">
              {helpfulLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex w-fit items-center gap-3 text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <FaChevronRight className="size-3.5 text-primary transition-transform duration-200 group-hover:translate-x-1" />

                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact details */}
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Get In Touch
            </h2>

            <div className="mt-5 space-y-5">
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="group flex items-start gap-3 text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FaEnvelope className="size-5" />
                </span>

                <div className="min-w-0">
                  <p className="text-lg font-semibold text-foreground">
                    Email Support
                  </p>

                  <p className="mt-1 break-all text-base font-medium">
                    {siteConfig.supportEmail}
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-3 text-muted-foreground">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FaClock className="size-5" />
                </span>

                <div>
                  <p className="text-lg font-semibold text-foreground">
                    Support Team
                  </p>

                  <p className="mt-1 text-base font-medium leading-6">
                    {siteConfig.supportHours}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Connect With Us
            </h2>

            <div className="mt-5 flex flex-col gap-3.5">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                if (!item.href) {
                  return (
                    <div
                      key={item.name}
                      className="flex w-fit items-center gap-3 text-lg font-medium text-muted-foreground"
                    >
                      <span
                        className={`flex size-11 items-center justify-center rounded-xl shadow-sm ring-1 ${item.brandClass}`}
                      >
                        <Icon className="size-5" />
                      </span>

                      <span>{item.name}</span>
                    </div>
                  );
                }

                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex w-fit items-center gap-3 text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span
                      className={`flex size-11 items-center justify-center rounded-xl shadow-sm ring-1 transition-[filter,transform] group-hover:scale-105 group-hover:brightness-110 ${item.brandClass}`}
                    >
                      <Icon className="size-5" />
                    </span>

                    <span>{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center copyright — no line */}
        <div className="mt-10 text-center">
          <p className="text-base font-semibold text-muted-foreground md:text-lg">
            Copyright © {currentYear} CourseHUB. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

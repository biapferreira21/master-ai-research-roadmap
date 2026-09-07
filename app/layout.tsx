import type { Metadata } from "next";
import { headers } from "next/headers";
import { courses, totalLessons } from "./course-data";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const origin = `${protocol}://${host}`;
  const description = `A prerequisite-aware AI research curriculum with ${courses.length} university courses and ${totalLessons} class sections, official resources, embedded videos and PDFs, progress tracking, bookmarks, and private study notes.`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "AI Research Roadmap",
      template: "%s · AI Research Roadmap",
    },
    description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "AI Research Roadmap",
      description,
      type: "website",
      images: [{ url: `${origin}/og-v6.png`, width: 1200, height: 630, alt: `AI Research Roadmap - ${courses.length} university courses and ${totalLessons} class sections` }],
    },
    twitter: {
      card: "summary_large_image",
      title: "AI Research Roadmap",
      description,
      images: [`${origin}/og-v6.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

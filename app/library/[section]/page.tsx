import { notFound } from "next/navigation";
import { LibraryApp } from "../../LibraryApp";
import { librarySectionOrder, type LibrarySection } from "../../library";

export function generateStaticParams() {
  return librarySectionOrder.map((section) => ({ section }));
}

export default async function LibrarySectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!librarySectionOrder.includes(section as LibrarySection)) notFound();
  return <LibraryApp activeSection={section as LibrarySection} />;
}

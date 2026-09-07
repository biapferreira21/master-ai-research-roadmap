import { notFound } from "next/navigation";
import { StudyApp } from "../../StudyApp";
import { courseBySlug, courses } from "../../course-data";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courseBySlug[slug];
  if (!course) notFound();
  return <StudyApp activeCourse={course} />;
}


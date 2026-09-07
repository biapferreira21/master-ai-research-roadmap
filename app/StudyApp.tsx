"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Course, Lesson, Resource, ScheduleEntry } from "./course-data";
import { courses, totalLessons } from "./course-data";
import { libraryCounts, librarySectionMeta, librarySectionOrder } from "./library";

type StudyState = {
  completed: Record<string, boolean>;
  bookmarks: Record<string, boolean>;
  notes: Record<string, string>;
  lastLesson?: string;
};

const emptyStudyState: StudyState = { completed: {}, bookmarks: {}, notes: {} };
const storageKey = "ai-research-roadmap-v1";
const themeStorageKey = "ai-research-roadmap-theme";

type Theme = "light" | "dark";
type UploadedLessonPdf = {
  id: string;
  lessonId: string;
  fileName: string;
  size: number;
  createdAt: string;
  url: string;
};

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark ${small ? "brand-mark-small" : ""}`} aria-hidden="true">
      <span className="brand-letter">A</span>
      <span className="brand-route"><i /><i /><i /></span>
    </span>
  );
}

type YouTubePlayerInstance = { destroy: () => void };
type YouTubeNamespace = {
  Player: new (element: HTMLElement, options: {
    videoId: string;
    host?: string;
    playerVars?: Record<string, string | number>;
    events?: {
      onReady?: () => void;
      onError?: (event: { data: number }) => void;
    };
  }) => YouTubePlayerInstance;
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeNamespace> | undefined;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YouTubeNamespace>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => reject(new Error("YouTube player timed out")), 12000);

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      window.clearTimeout(timeout);
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube player unavailable"));
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.addEventListener("error", () => {
        window.clearTimeout(timeout);
        reject(new Error("YouTube player failed to load"));
      }, { once: true });
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

type StoredBook = { name: string; blob: Blob };
const bookDatabase = "ai-research-roadmap-library";
const bookStore = "books";
const aimaBookKey = "aima-4th-edition";

function openBookDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("Local document storage is unavailable in this browser."));
      return;
    }
    const request = window.indexedDB.open(bookDatabase, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(bookStore)) request.result.createObjectStore(bookStore);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open the local library."));
  });
}

async function readStoredBook() {
  const database = await openBookDatabase();
  return new Promise<StoredBook | undefined>((resolve, reject) => {
    const transaction = database.transaction(bookStore, "readonly");
    const request = transaction.objectStore(bookStore).get(aimaBookKey);
    request.onsuccess = () => resolve(request.result as StoredBook | undefined);
    request.onerror = () => reject(request.error ?? new Error("Could not read the local book."));
    transaction.oncomplete = () => database.close();
  });
}

async function storeBook(book: StoredBook) {
  const database = await openBookDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(bookStore, "readwrite");
    transaction.objectStore(bookStore).put(book, aimaBookKey);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not save the local book."));
  });
}

async function deleteStoredBook() {
  const database = await openBookDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(bookStore, "readwrite");
    transaction.objectStore(bookStore).delete(aimaBookKey);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not remove the local book."));
  });
}

function progressFor(course: Course, state: StudyState) {
  const done = course.lessons.filter((lesson) => state.completed[lesson.id]).length;
  return { done, percent: Math.round((done / course.lessons.length) * 100) };
}

function resourceGlyph(kind: Resource["kind"]) {
  return ({ course: "↗", slides: "▤", assignment: "✓", reading: "≡", project: "◇", video: "▶" } as const)[kind];
}

function findLesson(id?: string) {
  if (!id) return undefined;
  for (const course of courses) {
    const lesson = course.lessons.find((item) => item.id === id);
    if (lesson) return { course, lesson };
  }
}

export function StudyApp({ activeCourse }: { activeCourse?: Course }) {
  const [study, setStudy] = useState<StudyState>(emptyStudyState);
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string>();
  const [resourceFilter, setResourceFilter] = useState<"all" | Resource["kind"]>("all");
  const [coursesOpen, setCoursesOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setStudy({ ...emptyStudyState, ...JSON.parse(saved) });
    } catch {
      // A private or restricted browser can decline local storage; the app remains usable.
    }
    setReady(true);
    try { setCoursesOpen(JSON.parse(localStorage.getItem("ai-research-courses-open") ?? "true") as boolean); } catch { /* Keep courses expanded. */ }
  }, []);

  useEffect(() => {
    let savedTheme: Theme = "light";
    try {
      const stored = localStorage.getItem(themeStorageKey);
      if (stored === "dark" || stored === "light") savedTheme = stored;
    } catch {
      // The theme remains usable for this session if storage is restricted.
    }
    setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(study));
    } catch {
      // Keep the in-memory study session working if persistence is unavailable.
    }
  }, [study, ready]);

  function updateStudy(recipe: (current: StudyState) => StudyState) {
    setStudy((current) => recipe(current));
  }

  function toggleComplete(lesson: Lesson) {
    updateStudy((current) => ({
      ...current,
      completed: { ...current.completed, [lesson.id]: !current.completed[lesson.id] },
      lastLesson: lesson.id,
    }));
  }

  function toggleBookmark(lesson: Lesson) {
    updateStudy((current) => ({
      ...current,
      bookmarks: { ...current.bookmarks, [lesson.id]: !current.bookmarks[lesson.id] },
      lastLesson: lesson.id,
    }));
  }

  function openLesson(lesson: Lesson) {
    setExpanded((current) => (current === lesson.id ? undefined : lesson.id));
    updateStudy((current) => ({ ...current, lastLesson: lesson.id }));
  }

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(themeStorageKey, next);
      } catch {
        // Keep the selected theme active for the current session.
      }
      return next;
    });
  }

  function toggleCourses() {
    setCoursesOpen((current) => {
      const next = !current;
      try { localStorage.setItem("ai-research-courses-open", JSON.stringify(next)); } catch { /* Keep the current session usable. */ }
      return next;
    });
  }

  const completedCount = Object.values(study.completed).filter(Boolean).length;
  const overallPercent = Math.round((completedCount / totalLessons) * 100);
  const last = findLesson(study.lastLesson);
  const normalizedQuery = query.trim().toLowerCase();

  const matchingLessons = useMemo(() => {
    if (!activeCourse) return [];
    if (!normalizedQuery) return activeCourse.lessons;
    return activeCourse.lessons.filter((lesson) => `${lesson.title} ${lesson.description} ${(lesson.topics ?? []).join(" ")}`.toLowerCase().includes(normalizedQuery));
  }, [activeCourse, normalizedQuery]);

  const allResources = activeCourse?.resources.filter((resource) => resourceFilter === "all" || resource.kind === resourceFilter) ?? [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="AI Research Roadmap home">
          <BrandMark />
          <span><strong>AI Research</strong><small>University roadmap</small></span>
        </a>

        <div className="sidebar-progress">
          <div className="eyebrow-row"><span>Your progress</span><strong>{overallPercent}%</strong></div>
          <div className="progress-track"><span style={{ width: `${overallPercent}%` }} /></div>
          <small>{completedCount} of {totalLessons} lectures complete</small>
        </div>

        <nav className="roadmap-nav research-nav" aria-label="Research workspace">
          <button className="nav-group-toggle" onClick={toggleCourses} aria-expanded={coursesOpen}><span>Courses</span><b>{courses.length}</b><i>{coursesOpen ? "−" : "+"}</i></button>
          {coursesOpen && courses.map((course, index) => {
            const progress = progressFor(course, study);
            const current = activeCourse?.slug === course.slug;
            return (
              <a key={course.slug} className={`nav-course ${current ? "is-active" : ""}`} href={`/course/${course.slug}`} style={{ "--course-accent": course.accent } as React.CSSProperties}>
                <span className="nav-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="nav-copy"><strong>{course.code}</strong><small>{progress.done}/{course.lessons.length} lectures</small></span>
                {progress.percent > 0 && <span className="nav-dot" aria-label={`${progress.percent}% complete`} />}
              </a>
            );
          })}
          <span className="nav-label library-label">Research library</span>
          {librarySectionOrder.map((section) => {
            const meta = librarySectionMeta[section];
            return <a key={section} className="library-nav-item" href={`/library/${section}`} style={{ "--item-accent": meta.accent } as React.CSSProperties}><span className="library-nav-icon">{meta.icon}</span><span><strong>{meta.title}</strong><small>{meta.short}</small></span>{section !== "favourites" && <b>{libraryCounts[section].toLocaleString()}</b>}</a>;
          })}
        </nav>

        <div className="sidebar-foot">
          <span className="save-indicator"><i /> Saved on this device</span>
          <small>Progress, bookmarks, and notes stay private in your browser.</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <a className="mobile-brand" href="/" aria-label="AI Research Roadmap home"><BrandMark small /><span>AI Research</span></a>
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={activeCourse ? `Search ${activeCourse.code} lectures` : "Search the roadmap"} aria-label="Search lectures" />
            <kbd>/</kbd>
          </label>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <a className="bookmarks-link" href={activeCourse ? `#bookmarked` : "#roadmap"}>
            <span>◆</span> {Object.values(study.bookmarks).filter(Boolean).length} saved
          </a>
        </header>

        {!activeCourse ? (
          <HomeView study={study} overallPercent={overallPercent} completedCount={completedCount} last={last} query={normalizedQuery} />
        ) : (
          <CourseView
            course={activeCourse}
            study={study}
            lessons={matchingLessons}
            expanded={expanded}
            openLesson={openLesson}
            toggleComplete={toggleComplete}
            toggleBookmark={toggleBookmark}
            updateStudy={updateStudy}
            resources={allResources}
            resourceFilter={resourceFilter}
            setResourceFilter={setResourceFilter}
          />
        )}
      </main>
    </div>
  );
}

function HomeView({ study, overallPercent, completedCount, last, query }: { study: StudyState; overallPercent: number; completedCount: number; last?: { course: Course; lesson: Lesson }; query: string }) {
  const visibleCourses = courses.filter((course) => !query || `${course.code} ${course.title} ${course.description}`.toLowerCase().includes(query));

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">A complete path to advanced AI research</p>
          <h1>Learn the field.<br />Build the frontier.</h1>
          <p className="hero-lede">{courses.length} carefully ordered courses from Harvard, Berkeley, MIT, and Stanford, spanning first principles through frontier AI research. Every class, video, reading, assignment, and research resource in one focused workspace.</p>
          <div className="hero-actions">
            <a className="primary-button" href={last ? `/course/${last.course.slug}#${last.lesson.id}` : `/course/${courses[0].slug}`}>{last ? "Continue learning" : "Start the roadmap"}<span>→</span></a>
            <a className="text-button" href="#roadmap">Explore all courses ↓</a>
          </div>
        </div>
        <div className="hero-stat-panel" aria-label="Roadmap summary">
          <div className="big-progress"><span>{overallPercent}</span><sup>%</sup></div>
          <p>Overall completion</p>
          <div className="progress-track large"><span style={{ width: `${overallPercent}%` }} /></div>
          <div className="stat-grid">
            <div><strong>{courses.length}</strong><span>Courses</span></div>
            <div><strong>{totalLessons}</strong><span>Lectures</span></div>
            <div><strong>{completedCount}</strong><span>Completed</span></div>
          </div>
        </div>
      </section>

      {last && (
        <section className="continue-strip">
          <span className="continue-icon">▶</span>
          <div><small>Continue where you left off</small><strong>{last.course.code} · {last.lesson.title}</strong></div>
          <span className="duration">{last.lesson.duration}</span>
          <a href={`/course/${last.course.slug}#${last.lesson.id}`}>Resume →</a>
        </section>
      )}

      <section id="roadmap" className="roadmap-section">
        <div className="section-heading">
          <div><p className="kicker">Your curriculum</p><h2>The research roadmap</h2></div>
          <p>Follow the sequence. Each course builds the conceptual and technical depth required by the next.</p>
        </div>
        <div className="course-list">
          {visibleCourses.map((course, index) => {
            const progress = progressFor(course, study);
            return (
              <a href={`/course/${course.slug}`} className="course-card" key={course.slug} style={{ "--course-accent": course.accent } as React.CSSProperties}>
                <div className="course-number">{String(index + 1).padStart(2, "0")}</div>
                <div className="course-main">
                  <div className="course-meta"><span>{course.code}</span><i />{course.level}</div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                </div>
                <div className="course-side">
                  <span>{course.lessons.length} lectures</span>
                  <strong>{progress.percent}%</strong>
                  <div className="progress-track"><span style={{ width: `${progress.percent}%` }} /></div>
                  <b>Open course →</b>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function CourseView({ course, study, lessons, expanded, openLesson, toggleComplete, toggleBookmark, updateStudy, resources, resourceFilter, setResourceFilter }: {
  course: Course;
  study: StudyState;
  lessons: Lesson[];
  expanded?: string;
  openLesson: (lesson: Lesson) => void;
  toggleComplete: (lesson: Lesson) => void;
  toggleBookmark: (lesson: Lesson) => void;
  updateStudy: (recipe: (current: StudyState) => StudyState) => void;
  resources: Resource[];
  resourceFilter: "all" | Resource["kind"];
  setResourceFilter: (filter: "all" | Resource["kind"]) => void;
}) {
  const progress = progressFor(course, study);
  const bookmarked = lessons.filter((lesson) => study.bookmarks[lesson.id]);

  return (
    <div className="page course-page" style={{ "--course-accent": course.accent } as React.CSSProperties}>
      <a className="back-link" href="/">← Back to roadmap</a>
      <section className="course-hero">
        <div className="course-code-block"><span>{course.code}</span><small>{course.level}</small></div>
        <div className="course-title-block">
          <p className="kicker">{course.institution} · {course.edition}</p>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="source-note"><span>i</span>{course.sourceNote}</div>
        </div>
        <div className="course-progress-card">
          <div><strong>{progress.percent}%</strong><span>complete</span></div>
          <div className="progress-track large"><span style={{ width: `${progress.percent}%` }} /></div>
          <p>{progress.done} of {course.lessons.length} lectures</p>
          <a href={course.playlistUrl ?? course.courseUrl} target="_blank" rel="noreferrer">{course.playlistUrl ? "Open full playlist" : "Open official schedule"} ↗</a>
        </div>
      </section>

      {course.slug === "cs221" && <LocalBookReader />}
      {course.scheduleExtras?.length ? <CourseScheduleExtras entries={course.scheduleExtras} /> : null}

      <div className="course-layout">
        <div className="curriculum-column">
          <div className="column-heading">
            <div><p className="kicker">Curriculum</p><h2>{lessons.length} lectures</h2></div>
            <span>Open a lecture to watch, study, and take notes.</span>
          </div>
          <div className="lesson-list">
            {lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                number={course.lessons.indexOf(lesson) + 1}
                open={expanded === lesson.id}
                complete={Boolean(study.completed[lesson.id])}
                bookmarked={Boolean(study.bookmarks[lesson.id])}
                note={study.notes[lesson.id] ?? ""}
                onOpen={() => openLesson(lesson)}
                onComplete={() => toggleComplete(lesson)}
                onBookmark={() => toggleBookmark(lesson)}
                onNote={(note) => updateStudy((current) => ({ ...current, notes: { ...current.notes, [lesson.id]: note }, lastLesson: lesson.id }))}
              />
            ))}
          </div>

          {bookmarked.length > 0 && (
            <section id="bookmarked" className="bookmarked-section">
              <p className="kicker">Saved for review</p>
              <h2>Bookmarked lectures</h2>
              <div className="bookmark-grid">
                {bookmarked.map((lesson) => <button key={lesson.id} onClick={() => openLesson(lesson)}><span>◆</span>{lesson.title}<small>{lesson.duration}</small></button>)}
              </div>
            </section>
          )}
        </div>

        <aside className="course-aside">
          <section className="aside-card">
            <p className="kicker">Before you begin</p>
            <h3>Prerequisites</h3>
            <ul>{course.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className="aside-card">
            <p className="kicker">By the end</p>
            <h3>Research outcomes</h3>
            <ul className="outcome-list">{course.outcomes.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul>
          </section>
          <section className="aside-card resource-card">
            <p className="kicker">Resource library</p>
            <h3>Official materials</h3>
            <div className="resource-filters">
              {(["all", "slides", "assignment", "reading", "project"] as const).map((filter) => <button className={resourceFilter === filter ? "active" : ""} onClick={() => setResourceFilter(filter)} key={filter}>{filter}</button>)}
            </div>
            <div className="resource-list">
              {resources.map((resource) => (
                <a key={`${resource.label}-${resource.url}`} href={resource.url} target="_blank" rel="noreferrer"><span>{resourceGlyph(resource.kind)}</span><div><strong>{resource.label}</strong><small>{resource.kind}</small></div><b>↗</b></a>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function LessonRow({ lesson, number, open, complete, bookmarked, note, onOpen, onComplete, onBookmark, onNote }: {
  lesson: Lesson;
  number: number;
  open: boolean;
  complete: boolean;
  bookmarked: boolean;
  note: string;
  onOpen: () => void;
  onComplete: () => void;
  onBookmark: () => void;
  onNote: (note: string) => void;
}) {
  return (
    <article id={lesson.id} className={`lesson-row ${open ? "is-open" : ""} ${complete ? "is-complete" : ""}`}>
      <div className="lesson-summary">
        <button className={`completion-button ${complete ? "checked" : ""}`} onClick={onComplete} aria-label={complete ? `Mark ${lesson.title} incomplete` : `Mark ${lesson.title} complete`}>{complete ? "✓" : ""}</button>
        <button className="lesson-open" onClick={onOpen} aria-expanded={open}>
          <span className="lesson-number">{String(number).padStart(2, "0")}</span>
          <span className="lesson-copy"><strong>{lesson.title}</strong><small>Lecture · {lesson.duration}{lesson.date ? ` · ${lesson.date}` : ""}</small></span>
        </button>
        <button className={`bookmark-button ${bookmarked ? "saved" : ""}`} onClick={onBookmark} aria-label={bookmarked ? `Remove ${lesson.title} bookmark` : `Bookmark ${lesson.title}`}>◆</button>
        <button className="expand-button" onClick={onOpen} aria-label={open ? "Close lecture" : "Open lecture"}>{open ? "−" : "+"}</button>
      </div>
      {open && (
        <div className="lesson-detail">
          <LessonVideo lesson={lesson} />
          {lesson.scheduleEntries?.length ? <LessonScheduleEntries entries={lesson.scheduleEntries} /> : null}
          {lesson.classContext && <LessonClassContext context={lesson.classContext} />}
          {(lesson.studyMaterials?.length || lesson.studyMaterial) && <LessonStudyMaterials lesson={lesson} />}
          <LessonPdfNotes lesson={lesson} />
          <div className="detail-grid">
            <div className="lesson-context">
              <p className="kicker">Lecture details</p>
              <p>{lesson.description}</p>
              {lesson.topics?.length ? (
                <div className="lesson-topic-block">
                  <p className="kicker">Official syllabus topics</p>
                  <ul>{lesson.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
                </div>
              ) : null}
              <div className="lesson-resources">
                {lesson.resources?.map((resource) => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer"><span>{resourceGlyph(resource.kind)}</span>{resource.label} ↗</a>)}
              </div>
            </div>
            <label className="notes-box">
              <span><strong>Study notes</strong><small>Autosaved on this device</small></span>
              <textarea value={note} onChange={(event) => onNote(event.target.value)} placeholder="Capture the central claim, key equations, questions, and research ideas…" />
            </label>
          </div>
        </div>
      )}
    </article>
  );
}

function LessonVideo({ lesson }: { lesson: Lesson }) {
  const videos = lesson.videos?.length
    ? lesson.videos
    : lesson.videoId
      ? [{ videoId: lesson.videoId, title: lesson.title, duration: lesson.duration }]
      : [];
  const [activeVideoId, setActiveVideoId] = useState(videos[0]?.videoId);
  const activeVideo = videos.find((video) => video.videoId === activeVideoId) ?? videos[0];

  if (!activeVideo) {
    return (
      <div className="resource-led-video">
        <span aria-hidden="true">□</span>
        <div>
          <p className="kicker">Resource-led class</p>
          <h3>No public recording is attached to this class</h3>
          <p>The official lecture materials, readings, assignments, and links are organized directly below.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={videos.length > 1 ? "topic-video-collection" : undefined}>
      {videos.length > 1 && (
        <div className="topic-video-head">
          <div><p className="kicker">Topic video collection</p><strong>{videos.length} short recordings mapped to this class</strong></div>
          <span>{videos.findIndex((video) => video.videoId === activeVideo.videoId) + 1} / {videos.length}</span>
        </div>
      )}
      <YouTubeVideo videoId={activeVideo.videoId} title={activeVideo.title} />
      {videos.length > 1 && (
        <div className="topic-video-list" aria-label={`Topic videos for ${lesson.title}`}>
          {videos.map((video, index) => (
            <button
              type="button"
              className={video.videoId === activeVideo.videoId ? "active" : ""}
              key={video.videoId}
              onClick={() => setActiveVideoId(video.videoId)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{video.title}</strong>
              <small>{video.duration}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function YouTubeVideo({ videoId, title }: { videoId: string; title: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  useEffect(() => {
    let cancelled = false;
    let player: YouTubePlayerInstance | undefined;
    setStatus("loading");

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !mountRef.current) return;
        const slot = document.createElement("div");
        mountRef.current.replaceChildren(slot);
        player = new YT.Player(slot, {
          videoId,
          host: "https://www.youtube.com",
          playerVars: {
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
            widget_referrer: window.location.href,
          },
          events: {
            onReady: () => {
              if (!cancelled) setStatus("ready");
            },
            onError: () => {
              if (!cancelled) setStatus("unavailable");
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });

    return () => {
      cancelled = true;
      player?.destroy();
      mountRef.current?.replaceChildren();
    };
  }, [videoId]);

  return (
    <div className={`video-wrap video-status-${status}`}>
      <img
        className="video-poster"
        src={thumbnailUrl}
        alt={`Thumbnail for ${title}`}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        }}
      />
      <div className="video-player-mount" ref={mountRef} />
      {status === "loading" && <div className="video-loading" aria-live="polite">Checking inline playback…</div>}
      {status === "unavailable" && (
        <div className="video-fallback">
          <span>Inline playback is unavailable for this lecture</span>
          <a href={youtubeUrl} target="_blank" rel="noreferrer" aria-label={`Watch ${title} on YouTube`}>
            <b>▶</b> Watch on YouTube
          </a>
        </div>
      )}
    </div>
  );
}

function LessonClassContext({ context }: { context: NonNullable<Lesson["classContext"]> }) {
  return (
    <section className="class-context">
      <div className="class-context-head">
        <div>
          <span className="material-badge material-class">Official schedule</span>
          <h3>{context.eventLabel}</h3>
        </div>
        <time>{context.date}</time>
      </div>
      <div className="class-context-grid">
        <div>
          <p className="kicker">In-class lecture</p>
          <ul>{context.inClassLecture.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <p className="kicker">Online modules to complete</p>
          <ul>{context.onlineModules.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
      {context.sections.length > 0 && (
        <div className="class-sections">
          <p className="kicker">Corresponding TA sections</p>
          <div>
            {context.sections.map((section) => (
              <a key={section.url} href={section.url} target="_blank" rel="noreferrer">
                <small>{section.label}</small>
                <strong>{section.title}</strong>
                <b>Open section ↗</b>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ScheduleResourceGroup({ title, resources, note }: { title: string; resources: Resource[]; note?: string }) {
  if (!resources.length && !note) return null;
  return (
    <section className="schedule-resource-group">
      <p className="kicker">{title}</p>
      {note ? <p className="schedule-note">{note}</p> : null}
      {resources.length ? (
        <div className="schedule-resource-links">
          {resources.map((resource) => (
            <a key={`${resource.url}-${resource.label}`} href={resource.url} target="_blank" rel="noreferrer">
              <span>{resourceGlyph(resource.kind)}</span>
              <strong>{resource.label}</strong>
              <small>{resource.kind}</small>
              <b>↗</b>
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ScheduleEntryCard({ entry, compact = false }: { entry: ScheduleEntry; compact?: boolean }) {
  return (
    <article className={`schedule-entry ${compact ? "schedule-entry-compact" : ""}`}>
      <header className="schedule-entry-head">
        <div>
          <span className="material-badge material-class">Official course schedule</span>
          {entry.description ? <h3>{entry.description}</h3> : null}
        </div>
        <time>{entry.date}</time>
      </header>
      <div className="schedule-resource-groups">
        <ScheduleResourceGroup title="Lecture materials" resources={entry.lectureMaterials} />
        <ScheduleResourceGroup title="Suggested readings" resources={entry.readings} note={entry.courseMaterialNote} />
        <ScheduleResourceGroup title="Events and assignments" resources={entry.eventResources} note={entry.eventText} />
        <ScheduleResourceGroup title="Deadlines" resources={entry.deadlineResources} note={entry.deadline} />
      </div>
    </article>
  );
}

function LessonScheduleEntries({ entries }: { entries: ScheduleEntry[] }) {
  return <div className="schedule-entry-stack">{entries.map((entry, index) => <ScheduleEntryCard key={`${entry.date}-${index}`} entry={entry} />)}</div>;
}

function CourseScheduleExtras({ entries }: { entries: ScheduleEntry[] }) {
  return (
    <section className="course-schedule-extras">
      <div className="course-schedule-extras-head">
        <div><p className="kicker">Course schedule</p><h2>Assignments, milestones, and events</h2></div>
        <p>Official schedule items that are not represented by a separate video lecture.</p>
      </div>
      <div>{entries.map((entry, index) => <ScheduleEntryCard key={`${entry.date}-${index}`} entry={entry} compact />)}</div>
    </section>
  );
}

function LessonStudyMaterials({ lesson }: { lesson: Lesson }) {
  const materials = lesson.studyMaterials ?? (lesson.studyMaterial ? [lesson.studyMaterial] : []);
  const groups = materials.reduce<Array<{ label: string; items: typeof materials }>>((result, material) => {
    const label = material.group ?? "Companion materials";
    const group = result.find((item) => item.label === label);
    if (group) group.items.push(material);
    else result.push({ label, items: [material] });
    return result;
  }, []);

  return (
    <div className="study-material-groups">
      {groups.map((group) => (
        <section className="study-material-group" key={group.label}>
          <p className="kicker">Embedded {group.label}</p>
          <div className="study-material-stack">
            {group.items.map((material) => (
              <LessonStudyMaterialCard key={`${material.type}-${material.url}`} lesson={lesson} material={material} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function LessonStudyMaterialCard({ lesson, material }: { lesson: Lesson; material: NonNullable<Lesson["studyMaterial"]> }) {
  const [open, setOpen] = useState(false);
  const badge = material.type === "interactive" ? "Executable Python" : material.type === "pdf" ? "Lecture PDF" : "Lecture slides";
  const sourceLabel = material.sourceLabel ?? (material.type === "slides" ? "Open original ↗" : "View source on GitHub ↗");

  return (
    <section className="study-material">
      <div className="study-material-copy">
        <span className={`material-badge material-${material.type}`}>{badge}</span>
        <div>
          <h3>{material.label}</h3>
          <p>{material.description ?? (material.type === "interactive"
            ? "Step through Stanford's official Python lecture trace alongside the video, inspecting the code, explanations, and intermediate values in context."
            : "Read the course's official companion material for this topic without leaving your lesson notes and progress."
          )}</p>
        </div>
      </div>
      <div className="study-material-actions">
        <button onClick={() => setOpen((current) => !current)}>{open ? "Close material" : "Open inside lesson"}</button>
        <a href={material.sourceUrl} target="_blank" rel="noreferrer">{sourceLabel}</a>
      </div>
      {open && (
        <iframe
          className={`study-material-frame frame-${material.type}`}
          src={material.url}
          title={`${material.label}: ${lesson.title}`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </section>
  );
}

function formatPdfSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function LessonPdfNotes({ lesson }: { lesson: Lesson }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pdfs, setPdfs] = useState<UploadedLessonPdf[]>([]);
  const [activePdf, setActivePdf] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();

  async function refreshPdfs() {
    setLoading(true);
    try {
      const response = await fetch(`/api/lesson-pdfs?lessonId=${encodeURIComponent(lesson.id)}`, { cache: "no-store" });
      const payload = await response.json() as { pdfs?: UploadedLessonPdf[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not load your PDFs.");
      setPdfs(payload.pdfs ?? []);
      setError(undefined);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load your PDFs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshPdfs();
  }, [lesson.id]);

  async function uploadSelected(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(undefined);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 50 * 1024 * 1024) throw new Error(`${file.name} is larger than 50 MB.`);
        const form = new FormData();
        form.append("lessonId", lesson.id);
        form.append("file", file);
        const response = await fetch("/api/lesson-pdfs", { method: "POST", body: form });
        const payload = await response.json() as { error?: string };
        if (!response.ok) throw new Error(payload.error ?? `Could not upload ${file.name}.`);
      }
      await refreshPdfs();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload PDF.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removePdf(pdf: UploadedLessonPdf) {
    if (!window.confirm(`Remove ${pdf.fileName} from this lesson?`)) return;
    try {
      const response = await fetch(pdf.url, { method: "DELETE" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not remove PDF.");
      setPdfs((current) => current.filter((item) => item.id !== pdf.id));
      if (activePdf === pdf.id) setActivePdf(undefined);
      setError(undefined);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove PDF.");
    }
  }

  return (
    <section className="annotated-pdfs">
      <div className="annotated-pdfs-head">
        <div>
          <p className="kicker">Your annotated notes</p>
          <h3>Lesson PDF library</h3>
          <p>Upload one or more annotated PDFs for this lecture. They stay private to your signed-in account.</p>
        </div>
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={(event) => void uploadSelected(event.target.files)} />
        <button onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? "Uploading…" : "+ Upload PDFs"}</button>
      </div>

      {error && <p className="annotated-pdf-error" role="alert">{error}</p>}
      {loading ? (
        <p className="annotated-pdf-empty">Loading your PDFs…</p>
      ) : pdfs.length === 0 ? (
        <p className="annotated-pdf-empty">No annotated PDFs uploaded for this lesson yet.</p>
      ) : (
        <div className="annotated-pdf-list">
          {pdfs.map((pdf) => (
            <article className="annotated-pdf" key={pdf.id}>
              <div className="annotated-pdf-summary">
                <span className="annotated-pdf-icon">PDF</span>
                <div><strong>{pdf.fileName}</strong><small>{formatPdfSize(pdf.size)} · uploaded {new Date(pdf.createdAt).toLocaleDateString()}</small></div>
                <div className="annotated-pdf-actions">
                  <button onClick={() => setActivePdf((current) => current === pdf.id ? undefined : pdf.id)}>{activePdf === pdf.id ? "Close" : "Read here"}</button>
                  <a href={`${pdf.url}?download=1`}>Download</a>
                  <button className="danger" onClick={() => void removePdf(pdf)}>Remove</button>
                </div>
              </div>
              {activePdf === pdf.id && <iframe className="annotated-pdf-frame" src={`${pdf.url}#view=FitH`} title={`${pdf.fileName}: ${lesson.title}`} />}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function LocalBookReader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [readerOpen, setReaderOpen] = useState(false);
  const [message, setMessage] = useState("Select the PDF once to keep it available privately on this device.");

  useEffect(() => {
    let active = true;
    readStoredBook()
      .then((book) => {
        if (!active || !book) return;
        setPdfUrl(URL.createObjectURL(book.blob));
        setFileName(book.name);
        setMessage("Loaded from your private on-device library.");
      })
      .catch(() => {
        if (active) setMessage("Select the PDF to use it for this browser session.");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  }, [pdfUrl]);

  async function chooseBook(file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setMessage("Please select a PDF file.");
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPdfUrl(nextUrl);
    setFileName(file.name);
    setReaderOpen(true);
    setMessage("The book stays on this device and is never uploaded to the website.");
    try {
      await storeBook({ name: file.name, blob: file });
    } catch {
      setMessage("The reader works now, but this browser could not save the book between sessions.");
    }
  }

  async function removeBook() {
    try { await deleteStoredBook(); } catch { /* The active object URL can still be cleared. */ }
    setPdfUrl(undefined);
    setFileName(undefined);
    setReaderOpen(false);
    setMessage("Removed from this device's browser library.");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section id="aima-reader" className="book-reader">
      <div className="book-reader-header">
        <div className="book-monogram">AIMA</div>
        <div className="book-reader-copy">
          <p className="kicker">CS221 companion textbook</p>
          <h2>Artificial Intelligence: A Modern Approach</h2>
          <p>Use your local fourth-edition PDF alongside search, logic, uncertainty, learning, and responsible-AI lectures.</p>
          <small>{fileName ? `Attached: ${fileName}` : message}</small>
          {fileName && <small>{message}</small>}
        </div>
        <div className="book-reader-actions">
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={(event) => chooseBook(event.target.files?.[0])} />
          <button onClick={() => inputRef.current?.click()}>{pdfUrl ? "Replace PDF" : "Choose local PDF"}</button>
          {pdfUrl && <button className="secondary" onClick={() => setReaderOpen((current) => !current)}>{readerOpen ? "Close reader" : "Open reader"}</button>}
          {pdfUrl && <button className="text-button" onClick={removeBook}>Remove from device</button>}
        </div>
      </div>
      {pdfUrl && readerOpen && <iframe className="book-frame" src={`${pdfUrl}#view=FitH`} title="Artificial Intelligence: A Modern Approach, fourth edition" />}
    </section>
  );
}

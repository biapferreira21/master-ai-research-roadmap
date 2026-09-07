"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext dynamic routes require document navigation here. */

import { useEffect, useMemo, useRef, useState } from "react";
import { courses } from "./course-data";
import { dictionaryDomains, entropyCurriculum, informationTheoryStages, libraryCounts, libraryItems, librarySectionMeta, librarySectionOrder, type LibraryItem, type LibrarySection } from "./library";

type ItemState = { favourite: boolean; completed: boolean; notes: string; updatedAt?: string };
type StateMap = Record<string, ItemState>;
type Theme = "light" | "dark";
type Persistence = "checking" | "cloud" | "device";
type UploadedPdf = { id: string; lessonId: string; fileName: string; size: number; createdAt: string; url: string };

const stateStorageKey = "ai-research-library-state-v1";
const sourceStorageKey = "ai-research-custom-sources-v1";
const themeStorageKey = "ai-research-roadmap-theme";

function BrandMark({ small = false }: { small?: boolean }) {
  return <span className={`brand-mark ${small ? "brand-mark-small" : ""}`} aria-hidden="true"><span className="brand-letter">A</span><span className="brand-route"><i /><i /><i /></span></span>;
}

function defaultState(): ItemState { return { favourite: false, completed: false, notes: "" }; }

function safeRead<T>(key: string, fallback: T): T {
  try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) as T : fallback; } catch { return fallback; }
}

function saveLocal(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Keep the current session usable. */ }
}

function pdfKey(itemId: string) {
  let hash = 5381;
  for (let index = 0; index < itemId.length; index += 1) hash = ((hash << 5) + hash) ^ itemId.charCodeAt(index);
  return `library-${(hash >>> 0).toString(36)}`;
}

function embedUrl(item: LibraryItem) {
  try {
    const url = new URL(item.url);
    if (url.hostname.includes("youtube.com")) {
      const video = url.searchParams.get("v");
      const list = url.searchParams.get("list");
      if (video) return `https://www.youtube-nocookie.com/embed/${video}${list ? `?list=${list}` : ""}`;
      if (list) return `https://www.youtube-nocookie.com/embed/videoseries?list=${list}`;
    }
    if (url.hostname === "youtu.be") return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
  } catch { /* External link remains available. */ }
}

function isPdf(url: string) { return /\.pdf(?:$|[?#])/i.test(url) || /arxiv\.org\/pdf\//i.test(url); }

export function LibraryApp({ activeSection }: { activeSection: LibrarySection }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [format, setFormat] = useState("all");
  const [dictionaryLetter, setDictionaryLetter] = useState("all");
  const [limit, setLimit] = useState(80);
  const [selectedId, setSelectedId] = useState<string>();
  const [state, setState] = useState<StateMap>({});
  const [customSources, setCustomSources] = useState<LibraryItem[]>([]);
  const [theme, setTheme] = useState<Theme>("light");
  const [persistence, setPersistence] = useState<Persistence>("checking");
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  /* Browser-backed preferences are intentionally restored after hydration. */
  useEffect(() => {
    const savedTheme = safeRead<Theme>(themeStorageKey, "light");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme;
    setCoursesOpen(safeRead("ai-research-courses-open", false));
    const localState = safeRead<StateMap>(stateStorageKey, {});
    const localSources = safeRead<LibraryItem[]>(sourceStorageKey, []);
    setState(localState);
    setCustomSources(localSources);

    let active = true;
    Promise.all([fetch("/api/library-state", { cache: "no-store" }), fetch("/api/library-sources", { cache: "no-store" })])
      .then(async ([stateResponse, sourceResponse]) => {
        if (!active) return;
        if (stateResponse.status === 401 || sourceResponse.status === 401) { setPersistence("device"); return; }
        if (!stateResponse.ok || !sourceResponse.ok) throw new Error("Cloud library is unavailable.");
        const statePayload = await stateResponse.json() as { items?: StateMap };
        const sourcePayload = await sourceResponse.json() as { sources?: Array<{ id: string; title: string; url: string; section: Exclude<LibrarySection, "favourites">; description: string; tags: string[]; format: string }> };
        const cloudSources = (sourcePayload.sources ?? []).map((source) => ({
          id: `custom-${source.id}`, section: source.section, title: source.title, description: source.description || "A source added to your private research library.",
          url: source.url, sourceLabel: "Your library", category: "Custom sources", subcategory: "Personal research", tags: source.tags,
          difficulty: "intermediate" as const, format: source.format, custom: true,
        }));
        setState(statePayload.items ?? {});
        setCustomSources(cloudSources);
        saveLocal(stateStorageKey, statePayload.items ?? {});
        setPersistence("cloud");
      })
      .catch(() => { if (active) setPersistence("device"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key === "Escape") { setSelectedId(undefined); setAddOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setCategory("all"); setDifficulty("all"); setFormat("all"); setDictionaryLetter("all"); setLimit(80); setSelectedId(undefined); }, [activeSection]);

  const allItems = useMemo(() => [...customSources, ...libraryItems], [customSources]);
  const favouriteCount = Object.values(state).filter((value) => value.favourite).length;
  const completedCount = Object.values(state).filter((value) => value.completed).length;
  const normalizedQuery = query.trim().toLowerCase();
  const sectionItems = useMemo(() => {
    const base = normalizedQuery
      ? allItems
      : activeSection === "favourites"
        ? allItems.filter((item) => state[item.id]?.favourite)
        : allItems.filter((item) => item.section === activeSection);
    return base.filter((item) => {
      const searchable = `${item.title} ${item.description} ${item.category} ${item.subcategory} ${item.tags.join(" ")} ${(item.topics ?? []).join(" ")}`.toLowerCase();
      return (!normalizedQuery || searchable.includes(normalizedQuery))
        && (category === "all" || item.category === category)
        && (difficulty === "all" || item.difficulty === difficulty)
        && (format === "all" || item.format === format)
        && (activeSection !== "dictionary" || normalizedQuery || dictionaryLetter === "all" || item.letter === dictionaryLetter);
    }).sort((a, b) => activeSection === "information-theory" && !normalizedQuery ? (a.stage ?? 99) - (b.stage ?? 99) : activeSection === "dictionary" && !normalizedQuery ? a.title.localeCompare(b.title) : 0);
  }, [activeSection, allItems, category, dictionaryLetter, difficulty, format, normalizedQuery, state]);

  const unfilteredSection = useMemo(() => activeSection === "favourites" ? allItems.filter((item) => state[item.id]?.favourite) : allItems.filter((item) => item.section === activeSection), [activeSection, allItems, state]);
  const entropyCompleted = entropyCurriculum.filter((module) => state[`entropy-module-${module.id}`]?.completed).length;
  const categories = uniqueSorted(unfilteredSection.map((item) => item.category));
  const formats = uniqueSorted(unfilteredSection.map((item) => item.format));
  const selected = selectedId ? allItems.find((item) => item.id === selectedId) : undefined;
  const meta = librarySectionMeta[activeSection];

  async function updateItem(itemId: string, patch: Partial<ItemState>, sync = true) {
    const nextValue = { ...(state[itemId] ?? defaultState()), ...patch, updatedAt: new Date().toISOString() };
    const next = { ...state, [itemId]: nextValue };
    setState(next);
    saveLocal(stateStorageKey, next);
    if (persistence === "cloud" && sync) {
      try { await fetch("/api/library-state", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemId, ...patch }) }); } catch { /* Local backup is already updated. */ }
    }
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next); document.documentElement.dataset.theme = next; saveLocal(themeStorageKey, next);
  }

  function toggleCourses() {
    const next = !coursesOpen; setCoursesOpen(next); saveLocal("ai-research-courses-open", next);
  }

  async function addSource(source: { title: string; url: string; section: Exclude<LibrarySection, "favourites">; description: string; tags: string[]; format: string }) {
    if (persistence === "cloud") {
      const response = await fetch("/api/library-sources", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(source) });
      const payload = await response.json() as { source?: { id: string }; error?: string };
      if (!response.ok || !payload.source) throw new Error(payload.error ?? "Could not add source.");
      const item = customItem(payload.source.id, source);
      setCustomSources((current) => [item, ...current]);
      setSelectedId(item.id);
    } else {
      const item = customItem(crypto.randomUUID(), source);
      setCustomSources((current) => { const next = [item, ...current]; saveLocal(sourceStorageKey, next); return next; });
      setSelectedId(item.id);
    }
    setAddOpen(false);
  }

  async function deleteCustomSource(item: LibraryItem) {
    if (!item.custom || !window.confirm(`Remove ${item.title} from your research library?`)) return;
    const rawId = item.id.replace(/^custom-/, "");
    if (persistence === "cloud") {
      const response = await fetch(`/api/library-sources?id=${encodeURIComponent(rawId)}`, { method: "DELETE" });
      if (!response.ok) return;
    }
    setCustomSources((current) => {
      const next = current.filter((source) => source.id !== item.id);
      saveLocal(sourceStorageKey, next);
      return next;
    });
    setSelectedId(undefined);
  }

  return (
    <div className="app-shell library-shell" style={{ "--library-accent": meta.accent } as React.CSSProperties}>
      <aside className="sidebar library-sidebar">
        <a className="brand" href="/" aria-label="AI Research home"><BrandMark /><span><strong>AI Research</strong><small>Research workspace</small></span></a>
        <div className="library-mini-stats"><div><strong>{favouriteCount}</strong><span>saved</span></div><div><strong>{completedCount}</strong><span>reviewed</span></div><div><strong>{allItems.length.toLocaleString()}</strong><span>sources</span></div></div>
        <nav className="roadmap-nav research-nav" aria-label="Research workspace">
          <button className="nav-group-toggle" onClick={toggleCourses} aria-expanded={coursesOpen}><span>Courses</span><b>{courses.length}</b><i>{coursesOpen ? "−" : "+"}</i></button>
          {coursesOpen && <div className="collapsed-course-list">{courses.map((course, index) => <a key={course.slug} href={`/course/${course.slug}`} style={{ "--course-accent": course.accent } as React.CSSProperties}><i>{String(index + 1).padStart(2, "0")}</i><span><strong>{course.code}</strong><small>{course.title}</small></span></a>)}</div>}
          <span className="nav-label library-label">Research library</span>
          {librarySectionOrder.map((section) => {
            const itemMeta = librarySectionMeta[section];
            const count = section === "favourites" ? favouriteCount : libraryCounts[section];
            return <a key={section} className={`library-nav-item ${section === activeSection ? "is-active" : ""}`} href={`/library/${section}`} style={{ "--item-accent": itemMeta.accent } as React.CSSProperties}><span className="library-nav-icon">{itemMeta.icon}</span><span><strong>{itemMeta.title}</strong><small>{itemMeta.short}</small></span><b>{count.toLocaleString()}</b></a>;
          })}
        </nav>
        <div className="sidebar-foot"><span className="save-indicator"><i />{persistence === "cloud" ? "Synced to your account" : persistence === "device" ? "Saved on this device" : "Checking sync"}</span><small>Favourites, notes, review status, custom sources, and PDFs remain private.</small></div>
      </aside>

      <main className="main-content">
        <header className="topbar library-topbar">
          <a className="mobile-brand" href="/" aria-label="AI Research home"><BrandMark small /><span>AI Research</span></a>
          <label className="search-box library-search"><span aria-hidden="true">⌕</span><input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); setLimit(80); }} placeholder="Search the entire research library" aria-label="Search the research library" /><kbd>/</kbd></label>
          <button className="add-source-button" onClick={() => setAddOpen(true)}>+ Add source</button>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}><span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>{theme === "dark" ? "Light" : "Dark"}</button>
          <a className="bookmarks-link" href="/library/favourites"><span>★</span>{favouriteCount} saved</a>
        </header>

        <div className="library-page">
          <section className="library-hero">
            <div><p className="kicker">Research library · {meta.short}</p><h1>{normalizedQuery ? "Search results" : meta.title}</h1><p>{normalizedQuery ? `Results across every collection for “${query.trim()}”. Clear search to return to ${meta.title}.` : meta.description}</p></div>
            <div className="library-hero-count"><strong>{sectionItems.length.toLocaleString()}</strong><span>{normalizedQuery ? "matching items" : activeSection === "favourites" ? "saved items" : "curated items"}</span></div>
          </section>
          <nav className="mobile-library-nav" aria-label="Library collections">{librarySectionOrder.map((section) => <a key={section} className={section === activeSection ? "active" : ""} href={`/library/${section}`}>{librarySectionMeta[section].title}</a>)}</nav>

          {activeSection === "dictionary" && !normalizedQuery && <section className="dictionary-map" aria-labelledby="dictionary-map-title">
            <div className="dictionary-map-head"><div><p className="kicker">Course-aligned knowledge map</p><h2 id="dictionary-map-title">Find the concept, then open it directly</h2><p>Every learning link now opens at the exact glossary definition or the dedicated primer page for that concept. Start with a domain or browse alphabetically.</p></div><div><strong>{unfilteredSection.length.toLocaleString()}</strong><span>concepts with direct sources</span><small>Google · scikit-learn · Hugging Face · Aman.ai</small></div></div>
            <div className="dictionary-domain-grid">{dictionaryDomains.map((domain) => {
              const count = unfilteredSection.filter((item) => item.category === domain.title).length;
              return <button key={domain.title} className={category === domain.title ? "active" : ""} onClick={() => { setCategory(category === domain.title ? "all" : domain.title); setDictionaryLetter("all"); setLimit(80); }}><span>{domain.code}</span><div><h3>{domain.title}</h3><p>{domain.description}</p></div><b>{count}</b></button>;
            })}</div>
            <div className="dictionary-alphabet"><span>Browse A–Z</span><button className={dictionaryLetter === "all" ? "active" : ""} onClick={() => setDictionaryLetter("all")}>All</button>{"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => <button key={letter} className={dictionaryLetter === letter ? "active" : ""} onClick={() => { setDictionaryLetter(letter); setLimit(80); }}>{letter}</button>)}</div>
          </section>}

          {activeSection === "information-theory" && !normalizedQuery && <section className="information-path" aria-labelledby="information-path-title">
            <div className="information-path-intro"><div><p className="kicker">Complete learning order</p><h2 id="information-path-title">From first concepts to research frontiers</h2><p>Every level is included below. Follow the eight stages in order, or select one to focus the source list without losing access to the rest of the collection.</p></div><button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>View all levels</button></div>
            <div className="information-stage-grid">{informationTheoryStages.map((stage) => {
              const stageCategory = `${String(stage.number).padStart(2, "0")} · ${stage.title}`;
              const count = unfilteredSection.filter((item) => item.stage === stage.number).length;
              return <button key={stage.number} className={category === stageCategory ? "active" : ""} onClick={() => { setCategory(stageCategory); setLimit(80); }}>
                <span className="information-stage-number">{String(stage.number).padStart(2, "0")}</span><small>{stage.level}</small><h3>{stage.title}</h3><p>{stage.description}</p><div>{stage.concepts.slice(0, 4).map((concept) => <span key={concept}>{concept}</span>)}</div><b>{count} sources →</b>
              </button>;
            })}</div>
          </section>}

          {activeSection === "information-theory" && !normalizedQuery && <section className="entropy-focus" aria-labelledby="entropy-focus-title">
            <div className="entropy-focus-head"><div><p className="kicker">Foundation curriculum</p><h2 id="entropy-focus-title">Learn entropy properly, from the ground up</h2><p>This is a study sequence rather than a glossary. Each module tells you what to learn, which sources to use and in what order, what to practise, and the standard you should meet before continuing.</p></div><div className="entropy-progress"><span>{entropyCompleted}/{entropyCurriculum.length} complete</span><div><i style={{ width: `${(entropyCompleted / entropyCurriculum.length) * 100}%` }} /></div><small>Suggested pace: 2 modules per week</small></div></div>
            <div className="entropy-study-rule"><strong>Foundation rule</strong><p>Complete Modules 00–04 in order. Do not advance because a formula looks familiar—advance when you can calculate it on a small distribution and explain its meaning without notation.</p></div>
            <div className="entropy-curriculum">{entropyCurriculum.map((module, index) => {
              const moduleId = `entropy-module-${module.id}`;
              const complete = Boolean(state[moduleId]?.completed);
              return <details key={module.id} className={complete ? "is-complete" : ""} defaultOpen={index === 0}>
                <summary><span className="entropy-module-step">{module.step}</span><div><small>{module.level} · {module.duration}</small><h3>{module.title}</h3><p>{module.summary}</p></div><b>{complete ? "Completed" : "Open module"}<i>⌄</i></b></summary>
                <div className="entropy-module-body">
                  <section className="entropy-learning-map"><div><h4>Concepts to learn</h4><ul>{module.concepts.map((concept) => <li key={concept}>{concept}</li>)}</ul></div><div><h4>Learning outcomes</h4><ol>{module.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol></div><div><h4>Formula landmarks</h4>{module.formulas.map((formula) => <code key={formula}>{formula}</code>)}</div></section>
                  <section className="entropy-source-order"><div><h4>Source order</h4><p>Use the first source for understanding, then formalize and practise.</p></div><div>{module.sources.map((source, sourceIndex) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span>{sourceIndex + 1}</span><div><small>{source.role}</small><strong>{source.title}</strong><em>{source.source}</em></div><b>Open ↗</b></a>)}</div></section>
                  <section className="entropy-mastery"><div><small>Active practice</small><h4>Do this before moving on</h4><p>{module.practice}</p></div><div><small>Mastery check</small><h4>You understand the module when…</h4><p>{module.checkpoint}</p></div></section>
                  <button className={`entropy-complete-button ${complete ? "active" : ""}`} onClick={() => void updateItem(moduleId, { completed: !complete })}>{complete ? "✓ Module completed" : "Mark module as completed"}</button>
                </div>
              </details>;
            })}</div>
          </section>}

          <section className="library-controls" aria-label="Library filters">
            <label><span>Category</span><select value={category} onChange={(event) => { setCategory(event.target.value); setLimit(80); }}><option value="all">All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span>Level</span><select value={difficulty} onChange={(event) => { setDifficulty(event.target.value); setLimit(80); }}><option value="all">All levels</option><option value="foundation">Foundation</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="research">Research</option></select></label>
            <label><span>Format</span><select value={format} onChange={(event) => { setFormat(event.target.value); setLimit(80); }}><option value="all">All formats</option>{formats.map((value) => <option key={value}>{labelCase(value)}</option>)}</select></label>
            {(category !== "all" || difficulty !== "all" || format !== "all" || dictionaryLetter !== "all" || query) && <button className="clear-filters" onClick={() => { setQuery(""); setCategory("all"); setDifficulty("all"); setFormat("all"); setDictionaryLetter("all"); }}>Clear filters</button>}
          </section>

          <div className="library-results-head"><span>Showing {Math.min(limit, sectionItems.length).toLocaleString()} of {sectionItems.length.toLocaleString()}</span><small>Select an item for notes, PDFs, source details, and study controls.</small></div>
          {sectionItems.length === 0 ? <EmptyLibrary section={activeSection} hasFilters={Boolean(query || category !== "all" || difficulty !== "all" || format !== "all" || dictionaryLetter !== "all")} onAdd={() => setAddOpen(true)} /> : <div className="library-list">{sectionItems.slice(0, limit).map((item) => {
            const itemState = state[item.id] ?? defaultState();
            return <div key={item.id} className={`library-item ${itemState.completed ? "is-complete" : ""}`} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedId(item.id); }} onClick={() => setSelectedId(item.id)}>
              <button className={`library-check ${itemState.completed ? "active" : ""}`} onClick={(event) => { event.stopPropagation(); void updateItem(item.id, { completed: !itemState.completed }); }} aria-label={itemState.completed ? "Mark as not reviewed" : "Mark as reviewed"}>{itemState.completed ? "✓" : ""}</button>
              <div className="library-item-copy"><div className="library-item-meta"><span>{labelCase(item.format)}</span><i />{item.year && <><span>{item.year}</span><i /></>}<span>{item.category}</span>{item.custom && <b>Added by you</b>}</div><h2>{item.title}</h2><p>{item.description}</p><div className="tag-row">{item.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div></div>
              <div className="library-item-actions"><button className={`favourite-button ${itemState.favourite ? "active" : ""}`} onClick={(event) => { event.stopPropagation(); void updateItem(item.id, { favourite: !itemState.favourite }); }} aria-label={itemState.favourite ? "Remove from favourites" : "Save to favourites"}>★</button><span>{item.sourceLabel}</span><b>Open details →</b></div>
            </div>;
          })}</div>}
          {limit < sectionItems.length && <button className="load-more" onClick={() => setLimit((current) => current + 80)}>Load 80 more <span>{(sectionItems.length - limit).toLocaleString()} remaining</span></button>}
        </div>
      </main>

      {selected && <ItemDrawer key={selected.id} item={selected} state={state[selected.id] ?? defaultState()} onClose={() => setSelectedId(undefined)} onUpdate={updateItem} onDelete={deleteCustomSource} />}
      {addOpen && <AddSourceModal initialSection={activeSection === "favourites" ? "readings" : activeSection} onClose={() => setAddOpen(false)} onAdd={addSource} />}
    </div>
  );
}

function ItemDrawer({ item, state, onClose, onUpdate, onDelete }: { item: LibraryItem; state: ItemState; onClose: () => void; onUpdate: (itemId: string, patch: Partial<ItemState>, sync?: boolean) => Promise<void>; onDelete: (item: LibraryItem) => Promise<void> }) {
  const [notes, setNotes] = useState(state.notes);
  const [documentOpen, setDocumentOpen] = useState(false);
  const video = embedUrl(item);
  return <div className="drawer-backdrop" role="button" tabIndex={-1} onKeyDown={(event) => { if (event.key === "Escape") onClose(); }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="item-drawer" role="dialog" aria-modal="true" aria-label={item.title}>
    <div className="drawer-head"><div><span>{labelCase(item.format)} · {item.category}</span><h2>{item.title}</h2></div><button onClick={onClose} aria-label="Close details">×</button></div>
    <div className="drawer-body">
      <p className="drawer-description">{item.description}</p>
      <div className="drawer-study-actions"><button className={state.favourite ? "active" : ""} onClick={() => void onUpdate(item.id, { favourite: !state.favourite })}>★ {state.favourite ? "Saved to favourites" : "Save for later"}</button><button className={state.completed ? "active" : ""} onClick={() => void onUpdate(item.id, { completed: !state.completed })}>✓ {state.completed ? "Reviewed" : "Mark reviewed"}</button></div>
      <section className="source-panel"><div><small>Original source</small><strong>{item.sourceLabel}</strong></div>{item.custom && <button className="delete-custom-source" onClick={() => void onDelete(item)}>Remove</button>}<a href={item.url} target="_blank" rel="noreferrer">Open source ↗</a></section>
      {item.resources?.length ? <section className="drawer-learning-resources"><div className="drawer-section-title"><h3>Learn this concept</h3><span>{item.resources.length} direct {item.resources.length === 1 ? "source" : "sources"}</span></div><div>{item.resources.map((resource, index) => <a key={`${resource.url}-${index}`} href={resource.url} target="_blank" rel="noreferrer"><span>{index + 1}</span><div><small>{resource.kind}</small><strong>{resource.title}</strong><em>{resource.source}</em></div><b>Open exact concept ↗</b></a>)}</div></section> : null}
      {video && <section className="embedded-resource"><div className="drawer-section-title"><h3>Watch here</h3><span>YouTube</span></div><iframe src={video} title={item.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></section>}
      {isPdf(item.url) && <section className="embedded-resource"><div className="drawer-section-title"><h3>Read the paper</h3><button onClick={() => setDocumentOpen((current) => !current)}>{documentOpen ? "Close PDF" : "Open PDF here"}</button></div>{documentOpen && <iframe className="library-pdf-frame" src={`${item.url}#view=FitH`} title={`${item.title} PDF`} />}</section>}
      {item.topics?.length ? <section className="drawer-topics"><div className="drawer-section-title"><h3>Topics and concepts</h3><span>{item.topics.length} topics</span></div><div>{item.topics.map((topic) => <span key={topic}>{topic}</span>)}</div></section> : null}
      <section className="research-notes"><div className="drawer-section-title"><h3>Research notes</h3><span>Private</span></div><textarea value={notes} onChange={(event) => { setNotes(event.target.value); void onUpdate(item.id, { notes: event.target.value }, false); }} onBlur={() => void onUpdate(item.id, { notes })} placeholder="Questions, connections, experiments, citations, and follow-up ideas…" /><small>Notes save automatically when you leave this field.</small></section>
      <LibraryPdfNotes item={item} />
      <section className="drawer-metadata"><div><span>Level</span><strong>{labelCase(item.difficulty)}</strong></div><div><span>Format</span><strong>{labelCase(item.format)}</strong></div><div><span>Collection</span><strong>{item.subcategory}</strong></div></section>
    </div>
  </aside></div>;
}

function LibraryPdfNotes({ item }: { item: LibraryItem }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pdfs, setPdfs] = useState<UploadedPdf[]>([]);
  const [activePdf, setActivePdf] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const lessonId = pdfKey(item.id);
  async function refresh() {
    setLoading(true);
    try { const response = await fetch(`/api/lesson-pdfs?lessonId=${lessonId}`, { cache: "no-store" }); const payload = await safeResponseJson<{ pdfs?: UploadedPdf[]; error?: string }>(response); if (!response.ok) throw new Error(response.status === 401 ? "Sign in to use private PDF storage." : payload.error ?? "Private PDF storage is available on the published site."); setPdfs(payload.pdfs ?? []); setError(undefined); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load PDFs."); }
    finally { setLoading(false); }
  }
  // Loading the selected source's private files is an external synchronization.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { void refresh(); }, [lessonId]);
  async function upload(files: FileList | null) {
    if (!files?.length) return; setUploading(true); setError(undefined);
    try { for (const file of Array.from(files)) { if (file.size > 50 * 1024 * 1024) throw new Error(`${file.name} is larger than 50 MB.`); const form = new FormData(); form.append("lessonId", lessonId); form.append("file", file); const response = await fetch("/api/lesson-pdfs", { method: "POST", body: form }); const payload = await safeResponseJson<{ error?: string }>(response); if (!response.ok) throw new Error(payload.error ?? `Could not upload ${file.name}.`); } await refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not upload PDF."); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  }
  async function remove(pdf: UploadedPdf) { if (!window.confirm(`Remove ${pdf.fileName}?`)) return; const response = await fetch(pdf.url, { method: "DELETE" }); if (response.ok) { setPdfs((current) => current.filter((value) => value.id !== pdf.id)); setActivePdf(undefined); } }
  return <section className="library-pdf-notes"><div className="drawer-section-title"><div><h3>Your annotated PDFs</h3><span>Private account storage</span></div><><input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={(event) => void upload(event.target.files)} /><button onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? "Uploading…" : "+ Upload"}</button></></div>{error && <p className="library-pdf-error">{error}</p>}{loading ? <p className="library-pdf-empty">Loading your PDFs…</p> : pdfs.length === 0 ? <p className="library-pdf-empty">Add annotated papers, summaries, or handwritten notes for this source.</p> : pdfs.map((pdf) => <article className="library-uploaded-pdf" key={pdf.id}><div><b>PDF</b><span><strong>{pdf.fileName}</strong><small>{formatBytes(pdf.size)} · {new Date(pdf.createdAt).toLocaleDateString()}</small></span></div><div><button onClick={() => setActivePdf((current) => current === pdf.id ? undefined : pdf.id)}>{activePdf === pdf.id ? "Close" : "Read"}</button><a href={`${pdf.url}?download=1`}>Download</a><button onClick={() => void remove(pdf)}>Remove</button></div>{activePdf === pdf.id && <iframe src={`${pdf.url}#view=FitH`} title={pdf.fileName} />}</article>)}</section>;
}

function AddSourceModal({ initialSection, onClose, onAdd }: { initialSection: Exclude<LibrarySection, "favourites">; onClose: () => void; onAdd: (source: { title: string; url: string; section: Exclude<LibrarySection, "favourites">; description: string; tags: string[]; format: string }) => Promise<void> }) {
  const [title, setTitle] = useState(""); const [url, setUrl] = useState(""); const [section, setSection] = useState(initialSection); const [description, setDescription] = useState(""); const [tags, setTags] = useState(""); const [format, setFormat] = useState("reference"); const [saving, setSaving] = useState(false); const [error, setError] = useState<string>();
  async function submit(event: React.FormEvent) { event.preventDefault(); setSaving(true); setError(undefined); try { await onAdd({ title, url, section, description, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean), format }); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not add source."); } finally { setSaving(false); } }
  return <div className="modal-backdrop" role="button" tabIndex={-1} onKeyDown={(event) => { if (event.key === "Escape") onClose(); }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="add-source-modal" onSubmit={submit}><div className="modal-head"><div><p className="kicker">Grow your research library</p><h2>Add a source</h2></div><button type="button" onClick={onClose}>×</button></div><p>Add a paper, book, repository, lecture, dataset, or reference. It will join the same search, favourites, notes, and PDF workflow.</p><label><span>Title</span><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Source title" /></label><label><span>URL</span><input required type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" /></label><div className="modal-grid"><label><span>Section</span><select value={section} onChange={(event) => setSection(event.target.value as Exclude<LibrarySection, "favourites">)}>{librarySectionOrder.filter((value) => value !== "favourites").map((value) => <option key={value} value={value}>{librarySectionMeta[value].title}</option>)}</select></label><label><span>Format</span><select value={format} onChange={(event) => setFormat(event.target.value)}><option value="reference">Reference</option><option value="paper">Paper</option><option value="book">Book</option><option value="article">Article</option><option value="video">Video</option><option value="course">Course</option><option value="repository">Repository</option><option value="dataset">Dataset</option></select></label></div><label><span>Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Why this belongs in your research library…" /></label><label><span>Tags <small>comma-separated</small></span><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="interpretability, agents, evaluation" /></label>{error && <p className="modal-error">{error}</p>}<div className="modal-actions"><button type="button" onClick={onClose}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Adding…" : "Add to library"}</button></div></form></div>;
}

function EmptyLibrary({ section, hasFilters, onAdd }: { section: LibrarySection; hasFilters: boolean; onAdd: () => void }) { return <div className="library-empty"><span>{hasFilters ? "⌕" : librarySectionMeta[section].icon}</span><h2>{hasFilters ? "No matching sources" : "Your reading queue is ready"}</h2><p>{hasFilters ? "Try a broader search or clear one of the filters." : "Save any source with the star, or add your own research material."}</p><button onClick={onAdd}>+ Add a source</button></div>; }
function uniqueSorted(values: string[]) { return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b)); }
function labelCase(value: string) { return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }
async function safeResponseJson<T>(response: Response): Promise<T> { const text = await response.text(); if (!text) return {} as T; try { return JSON.parse(text) as T; } catch { return {} as T; } }
function customItem(id: string, source: { title: string; url: string; section: Exclude<LibrarySection, "favourites">; description: string; tags: string[]; format: string }): LibraryItem { return { id: `custom-${id}`, ...source, description: source.description || "A source added to your private research library.", sourceLabel: "Your library", category: "Custom sources", subcategory: "Personal research", difficulty: "intermediate", custom: true }; }

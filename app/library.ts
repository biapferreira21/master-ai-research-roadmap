import rawItems from "./library-data.json";

export type LibrarySection = "dictionary" | "primers" | "algorithms" | "data-structures" | "papers" | "readings" | "videos" | "information-theory" | "favourites";
export type LibraryItem = {
  id: string;
  section: Exclude<LibrarySection, "favourites">;
  title: string;
  description: string;
  url: string;
  sourceLabel: string;
  category: string;
  subcategory: string;
  tags: string[];
  topics?: string[];
  resources?: Array<{ kind: string; title: string; source: string; url: string }>;
  provenance?: string;
  letter?: string;
  stage?: number;
  entropyFocus?: boolean;
  difficulty: "foundation" | "intermediate" | "advanced" | "research";
  format: string;
  year?: string;
  featured?: boolean;
  custom?: boolean;
};

export const informationTheoryStages = [
  { number: 1, title: "Probability foundations", level: "Start here", description: "Build the probability language used by every later topic.", concepts: ["random variables", "distributions", "conditional probability", "expectation", "Bayes' rule"] },
  { number: 2, title: "Information measures", level: "Foundation", description: "Learn what information means mathematically and how its main quantities relate.", concepts: ["surprisal", "entropy", "cross-entropy", "KL divergence", "mutual information", "data processing"] },
  { number: 3, title: "Compression & source coding", level: "Foundation", description: "Turn entropy into operational limits and practical lossless codes.", concepts: ["prefix codes", "Kraft inequality", "Huffman coding", "typical sets", "arithmetic coding", "universal coding"] },
  { number: 4, title: "Channels & reliable communication", level: "Intermediate", description: "Understand noise, capacity, error correction, and Shannon's channel theorem.", concepts: ["channel capacity", "binary channels", "coding theorem", "Fano's inequality", "Gaussian channels", "error correction"] },
  { number: 5, title: "Lossy compression & learning", level: "Intermediate", description: "Connect rate-distortion, inference, description length, and generalization.", concepts: ["rate-distortion", "sufficient statistics", "MDL", "Bayesian inference", "generalization", "variational bounds"] },
  { number: 6, title: "Representations & bottlenecks", level: "Advanced", description: "Study how useful representations discard nuisance information while preserving signal.", concepts: ["information bottleneck", "sufficiency", "invariance", "disentanglement", "latent variables", "variational IB"] },
  { number: 7, title: "Estimating information in neural systems", level: "Advanced", description: "Learn practical estimators, contrastive bounds, and their failure modes.", concepts: ["MINE", "InfoNCE", "variational bounds", "contrastive learning", "bias and variance", "MI upper bounds"] },
  { number: 8, title: "Research frontiers", level: "Research", description: "Explore neural compression, learning theory, physical computation, and current debates.", concepts: ["neural codecs", "information-theoretic generalization", "semantic compression", "Landauer's principle", "compute limits", "open problems"] },
] as const;

export const dictionaryDomains = [
  { title: "AI Search, Reasoning & Planning", code: "AI", description: "Search, CSPs, logic, planning, games, and decision-making." },
  { title: "Probability, Statistics & Causality", code: "PS", description: "Probability language, estimation, uncertainty, tests, and causal reasoning." },
  { title: "Classical Machine Learning", code: "ML", description: "Regression, classification, clustering, kernels, trees, and core workflows." },
  { title: "Optimization & Training", code: "OP", description: "Losses, gradients, optimizers, regularization, tuning, and convergence." },
  { title: "Deep Learning Architectures", code: "DL", description: "Neural components, architectures, representation learning, and training mechanics." },
  { title: "Transformers & Language Models", code: "LM", description: "Attention, tokenization, pretraining, prompting, adaptation, and generation." },
  { title: "Natural Language Processing & Speech", code: "NL", description: "Linguistic representations, NLP tasks, speech, and language evaluation." },
  { title: "Reinforcement Learning", code: "RL", description: "MDPs, policies, values, exploration, control, and deep RL." },
  { title: "Agents, Retrieval & Tool Use", code: "AG", description: "Agent loops, memory, RAG, tools, planning, and self-improvement." },
  { title: "Information Theory", code: "IT", description: "Entropy, coding, information measures, compression, and learning connections." },
  { title: "Vision & Multimodality", code: "CV", description: "Images, video, convolution, detection, diffusion, and multimodal systems." },
  { title: "Algorithms & Data Structures", code: "DS", description: "Complexity, graphs, trees, indexing, dynamic programming, and core structures." },
  { title: "Parallel Computing & AI Systems", code: "PC", description: "GPUs, distributed execution, memory, communication, and performance." },
  { title: "Data & ML Engineering", code: "DE", description: "Datasets, pipelines, deployment, monitoring, MLOps, and production systems." },
  { title: "Responsible AI, Safety & Evaluation", code: "SE", description: "Evaluation, robustness, fairness, privacy, security, governance, and risk." },
] as const;

export const entropyCurriculum = [
  {
    id: "probability-language", step: "00", title: "The probability language entropy needs", level: "Prerequisite", duration: "2–4 hours",
    summary: "Make probability distributions feel concrete before introducing information measures.",
    concepts: ["events and outcomes", "probability mass functions", "random variables", "expectation", "conditional probability", "independence"],
    formulas: ["Σₓ p(x) = 1", "E[g(X)] = Σₓ p(x)g(x)", "p(x|y) = p(x,y) / p(y)"],
    objectives: ["Read a probability table without hesitation", "Compute an expectation from a finite distribution", "Explain conditioning and independence in words"],
    practice: "Create Bernoulli distributions with p = 0.1, 0.5, and 0.9. List their outcomes and probabilities, then predict which distribution should be most uncertain.",
    checkpoint: "You can distinguish an outcome, a random variable, and its distribution—and can calculate a simple expectation without looking up the rule.",
    sources: [
      { role: "Learn", title: "Harvard Stat 110 — probability foundations", source: "Harvard", url: "https://stat110.hsites.harvard.edu/" },
      { role: "Visualize", title: "Seeing Theory — probability and distributions", source: "Brown University", url: "https://seeing-theory.brown.edu/" },
      { role: "Practise", title: "MIT 6.041SC — worked probability problems", source: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/" },
    ],
  },
  {
    id: "surprise-bits", step: "01", title: "Surprise, bits, and why logarithms appear", level: "Foundation", duration: "1–2 hours",
    summary: "Build the intuition that information measures how unexpected an observation is.",
    concepts: ["self-information", "surprisal", "bits versus nats", "additivity", "logarithm base", "code length"],
    formulas: ["I(x) = −log₂ p(x)", "I(x,y) = I(x) + I(y) for independent events"],
    objectives: ["Convert an event probability into bits of surprise", "Explain why independent surprises must add", "Connect −log probability to optimal code length"],
    practice: "Compute the surprisal of events with probabilities 1, 1/2, 1/4, and 1/16. Then explain why halving probability adds exactly one bit.",
    checkpoint: "You can explain—in plain language—why a rare token has higher information content and why logs turn multiplied probabilities into added information.",
    sources: [
      { role: "Start here", title: "Visual Information Theory", source: "Christopher Olah", url: "https://colah.github.io/posts/2015-09-Visual-Information/" },
      { role: "Formalize", title: "EE376A notes — information and entropy", source: "Stanford", url: "https://web.stanford.edu/class/ee376a/files/lecture_notes.pdf" },
      { role: "Deepen", title: "Information Theory, Inference, and Learning Algorithms", source: "David MacKay", url: "https://www.inference.org.uk/mackay/itila/" },
    ],
  },
  {
    id: "shannon-entropy", step: "02", title: "Shannon entropy as average uncertainty", level: "Foundation core", duration: "3–5 hours",
    summary: "Move from the surprise of one outcome to the expected uncertainty of an entire distribution.",
    concepts: ["Shannon entropy", "binary entropy", "uniform maximum", "deterministic minimum", "concavity", "units"],
    formulas: ["H(X) = −Σₓ p(x) log₂ p(x)", "0 ≤ H(X) ≤ log₂ |X|", "H(Bernoulli(p)) = −p log₂p − (1−p)log₂(1−p)"],
    objectives: ["Calculate entropy for small discrete distributions", "Recognize maximum- and minimum-entropy cases", "Sketch and interpret the binary entropy curve"],
    practice: "Calculate H(X) for a fair coin, a 90/10 coin, and a deterministic coin. Plot binary entropy for p from 0 to 1 and explain its symmetry.",
    checkpoint: "Given any small probability table, you can calculate its entropy, state the units, and explain the result as uncertainty and average ideal code length.",
    sources: [
      { role: "Lecture", title: "Lectures 1–2 — entropy, mutual information, chain rule", source: "Stanford EE376A", url: "https://web.stanford.edu/class/ee376a/files/scribes/lecture1and2.pdf" },
      { role: "Reference", title: "Chapter 1 — entropy and divergence", source: "MIT 6.441", url: "https://ocw.mit.edu/courses/6-441-information-theory-spring-2016/pages/lecture-notes/" },
      { role: "Problems", title: "Information Theory problem sets", source: "MIT 6.441", url: "https://ocw.mit.edu/courses/6-441-information-theory-spring-2016/resources/assignments/" },
    ],
  },
  {
    id: "entropy-relations", step: "03", title: "Joint, conditional entropy, and the chain rule", level: "Foundation core", duration: "3–5 hours",
    summary: "Learn how uncertainty changes when variables interact and when new evidence is observed.",
    concepts: ["joint entropy", "conditional entropy", "chain rule", "independence", "mutual information", "information diagrams"],
    formulas: ["H(X,Y) = H(X) + H(Y|X)", "I(X;Y) = H(X) − H(X|Y)", "I(X;Y) = H(X) + H(Y) − H(X,Y)"],
    objectives: ["Build joint and conditional probability tables", "Apply the entropy chain rule", "Interpret mutual information as uncertainty removed"],
    practice: "Construct a joint table for two correlated binary variables. Calculate H(X), H(Y), H(X,Y), H(Y|X), and I(X;Y), then verify both identities above.",
    checkpoint: "You can explain the difference between H(X), H(X|Y), and I(X;Y), and verify the chain rule numerically from a joint table.",
    sources: [
      { role: "Core notes", title: "Lectures 1–3 — entropy, chain rule, relative entropy", source: "Stanford EE376A", url: "https://web.stanford.edu/~kedart/ee376a_winter1617/lectures.html" },
      { role: "Formal reference", title: "Chapter 2 — mutual information", source: "MIT 6.441", url: "https://ocw.mit.edu/courses/6-441-information-theory-spring-2016/pages/lecture-notes/" },
      { role: "Practise", title: "EE376A Homework 2", source: "Stanford", url: "https://web.stanford.edu/~kedart/ee376a_winter1617/hw2.pdf" },
    ],
  },
  {
    id: "cross-entropy-kl", step: "04", title: "Cross-entropy, KL divergence, and ML loss", level: "ML bridge", duration: "4–6 hours",
    summary: "Connect information measures directly to maximum likelihood, classification, language modelling, and variational learning.",
    concepts: ["cross-entropy", "relative entropy", "KL divergence", "Gibbs' inequality", "negative log-likelihood", "maximum likelihood"],
    formulas: ["H(p,q) = −Σₓ p(x) log q(x)", "Dₖₗ(p‖q) = H(p,q) − H(p)", "argmin H(p,q) = argmax Eₚ[log q(X)]"],
    objectives: ["Distinguish entropy, cross-entropy, and KL divergence", "Derive cross-entropy loss from likelihood", "Explain why KL is asymmetric and not a metric"],
    practice: "For a true label distribution p and two predictions q₁ and q₂, calculate cross-entropy and KL. Then derive binary cross-entropy from Bernoulli log-likelihood.",
    checkpoint: "You can derive the classification cross-entropy loss from maximum likelihood and explain exactly where the irreducible H(p) term disappears during optimization.",
    sources: [
      { role: "ML explanation", title: "Probability and Information Theory — Chapter 3", source: "Deep Learning Book", url: "https://www.deeplearningbook.org/contents/prob.html" },
      { role: "Formal proof", title: "Lecture 3 — relative entropy and non-negativity", source: "Stanford EE376A", url: "https://web.stanford.edu/class/ee376a/files/scribes/lecture3.pdf" },
      { role: "Advanced reference", title: "Divergence and mutual information", source: "MIT 6.441", url: "https://ocw.mit.edu/courses/6-441-information-theory-spring-2016/pages/lecture-notes/" },
    ],
  },
  {
    id: "entropy-coding", step: "05", title: "Entropy as the limit of compression", level: "Operational meaning", duration: "4–6 hours",
    summary: "Understand why entropy is not just a formula: it predicts the best achievable average lossless code length.",
    concepts: ["source coding theorem", "typical sets", "AEP", "prefix codes", "Kraft inequality", "Huffman coding", "entropy rate"],
    formulas: ["H(X) ≤ L* < H(X) + 1", "P(Xⁿ ∈ typical set) → 1", "typical set size ≈ 2ⁿᴴ"],
    objectives: ["Build a Huffman code", "Relate probability to codeword length", "Explain AEP and typical sequences intuitively"],
    practice: "Build a Huffman tree for a four-symbol distribution, calculate its average length, and compare it with H(X). Then repeat for blocks of two symbols.",
    checkpoint: "You can explain why entropy is a compression limit, construct a prefix code, and distinguish single-symbol entropy from the entropy rate of a sequence.",
    sources: [
      { role: "Origin", title: "A Mathematical Theory of Communication", source: "Claude Shannon", url: "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf" },
      { role: "Course sequence", title: "AEP, Huffman coding, and entropy rate", source: "Stanford EE376A", url: "https://web.stanford.edu/class/ee376a/outline.html" },
      { role: "Accessible text", title: "Information and Entropy open textbook", source: "MIT", url: "https://ocw.mit.edu/courses/6-050j-information-and-entropy-spring-2008/80c7258fd6bc5780797975eabb6fd747_MIT6_050JS08_textbook.pdf" },
    ],
  },
  {
    id: "advanced-entropy", step: "06", title: "Continuous, maximum, and generalized entropy", level: "Advanced after core", duration: "6–10 hours",
    summary: "Extend the discrete foundation carefully, learning which intuitions survive and which require qualification.",
    concepts: ["differential entropy", "Gaussian maximum entropy", "entropy rate", "maximum entropy principle", "exponential families", "Rényi entropy", "von Neumann entropy"],
    formulas: ["h(X) = −∫ f(x) log f(x)dx", "maximize H(p) subject to moment constraints", "Hᵅ(X) = (1/(1−α)) log Σ p(x)ᵅ"],
    objectives: ["Explain why differential entropy can be negative", "Derive a maximum-entropy distribution under simple constraints", "Know when generalized entropies are useful"],
    practice: "Calculate differential entropy for uniform and Gaussian variables, then verify how it changes under Y = aX. Derive the maximum-entropy distribution on a finite support with only normalization constrained.",
    checkpoint: "You can state the limitations of differential entropy, connect maximum entropy to exponential families, and identify when Shannon, Rényi, or quantum entropy is the relevant object.",
    sources: [
      { role: "Formal chapters", title: "Differential entropy and entropy rate", source: "MIT 6.441", url: "https://ocw.mit.edu/courses/6-441-information-theory-spring-2016/pages/lecture-notes/" },
      { role: "ML connection", title: "Continuous variables and maximum entropy — Lectures 14–19", source: "Stanford EE376A", url: "https://web.stanford.edu/~kedart/ee376a_winter1617/lectures.html" },
      { role: "Extension", title: "From Classical to Quantum Shannon Theory", source: "Mark Wilde", url: "https://arxiv.org/abs/1106.1445" },
    ],
  },
] as const;

export const libraryItems = rawItems as LibraryItem[];

export const librarySectionOrder: LibrarySection[] = [
  "dictionary", "primers", "algorithms", "data-structures", "papers", "readings", "videos", "information-theory", "favourites",
];

export const librarySectionMeta: Record<LibrarySection, { title: string; short: string; description: string; icon: string; accent: string }> = {
  dictionary: { title: "Dictionary", short: "1,000+ concepts", icon: "Aa", accent: "#79b9a7", description: "A course-aligned research vocabulary with concise definitions, difficulty levels, and authoritative paths for learning every concept properly." },
  primers: { title: "Primers", short: "Deep guides", icon: "P", accent: "#9a89c6", description: "Structured, topic-by-topic explanations from Aman.ai, reorganized for focused study and future expansion." },
  algorithms: { title: "Algorithms", short: "Patterns", icon: "ƒ", accent: "#e4a16f", description: "Reusable problem-solving patterns, complexity intuition, implementations, and coding references." },
  "data-structures": { title: "Data Structures", short: "Structures", icon: "⌘", accent: "#65a8c4", description: "Core representations for efficient computation, with operations, trade-offs, and implementation references." },
  papers: { title: "Papers", short: "Research", icon: "§", accent: "#d87989", description: "A broad research-paper catalogue spanning seminal work and current literature across AI subfields." },
  readings: { title: "Readings", short: "Books & essays", icon: "R", accent: "#9ca85e", description: "Course notes, books, technical essays, newsletters, repositories, and long-form research resources." },
  videos: { title: "Videos", short: "Watch list", icon: "▶", accent: "#c98ab4", description: "University lecture series, research talks, technical channels, and selected visual explanations." },
  "information-theory": { title: "Information Theory", short: "IT × AI", icon: "H", accent: "#7776c5", description: "A complete path, ordered from probability and entropy through compression, learning, neural representations, generalization, and physical computation." },
  favourites: { title: "Favourites", short: "Read later", icon: "★", accent: "#d5a83f", description: "Your saved papers, primers, readings, videos, references, and custom research sources in one queue." },
};

export const libraryCounts = Object.fromEntries(librarySectionOrder.map((section) => [
  section,
  section === "favourites" ? 0 : libraryItems.filter((item) => item.section === section).length,
])) as Record<LibrarySection, number>;

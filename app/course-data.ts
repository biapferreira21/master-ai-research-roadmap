import cs224nScheduleDataRaw from "./cs224n-schedule-data.json";
import cs224rTimelineDataRaw from "./cs224r-timeline-data.json";
import cs329aScheduleDataRaw from "./cs329a-schedule-data.json";
import cs25ScheduleDataRaw from "./cs25-schedule-data.json";
import newCourseDataRaw from "./new-course-data.json";

export type Resource = {
  label: string;
  url: string;
  kind: "course" | "slides" | "assignment" | "reading" | "project" | "video";
};

export type StudyMaterial = {
  type: "interactive" | "pdf" | "slides";
  label: string;
  url: string;
  sourceUrl: string;
  sourceLabel?: string;
  description?: string;
  group?: string;
};

export type ScheduleEntry = {
  date: string;
  description: string;
  lectureMaterials: Resource[];
  readings: Resource[];
  courseMaterialNote: string;
  eventText: string;
  eventResources: Resource[];
  deadline: string;
  deadlineResources: Resource[];
};

export type ClassContext = {
  eventLabel: string;
  date: string;
  inClassLecture: string[];
  onlineModules: string[];
  sections: Array<{
    label: string;
    title: string;
    url: string;
  }>;
};

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  videoId?: string;
  videos?: Array<{
    videoId: string;
    title: string;
    duration: string;
  }>;
  description: string;
  date?: string;
  topics?: string[];
  resources?: Resource[];
  studyMaterial?: StudyMaterial;
  studyMaterials?: StudyMaterial[];
  classContext?: ClassContext;
  scheduleEntries?: ScheduleEntry[];
};

export type Course = {
  slug: string;
  code: string;
  title: string;
  institution: string;
  edition: string;
  sourceNote: string;
  level: string;
  accent: string;
  description: string;
  prerequisites: string[];
  outcomes: string[];
  courseUrl: string;
  playlistUrl?: string;
  resources: Resource[];
  lessons: Lesson[];
  scheduleExtras?: ScheduleEntry[];
};

const newCourseData = newCourseDataRaw as {
  cs50x: Lesson[];
  cs61b: Lesson[];
  cs50ai: Lesson[];
  cs186: Lesson[];
  cs231n: Lesson[];
  mit61810: Lesson[];
  cs144: Lesson[];
};

function parseLessons(courseSlug: string, rows: string, courseUrl: string): Lesson[] {
  return rows
    .trim()
    .split("\n")
    .map((row, index) => {
      const [videoId, duration, title] = row.split("::");
      return {
        id: `${courseSlug}-${String(index + 1).padStart(2, "0")}`,
        title,
        duration,
        videoId,
        description: `Build a research-level understanding of ${title.toLowerCase()}. Use the lecture together with the official course materials, record your own synthesis, and mark the lesson complete when you can explain the central ideas without notes.`,
        resources: [
          { label: "Watch on YouTube", url: `https://www.youtube.com/watch?v=${videoId}`, kind: "video" },
          { label: "Official course materials", url: courseUrl, kind: "course" },
        ],
      };
    });
}

const cs221Url = "https://stanford-cs221.github.io/autumn2025/";
const cs221 = parseLessons("cs221-autumn-2025", `
yaLEGZuIIgE::1:06:27::Course Overview and AI Foundations
ypZJaTqrNdk::1:12:31::Learning I
Mbe5ICIUw5Q::1:12:48::Learning II
89NND-Ca0yY::1:11:46::Learning III
fPESauMaJYA::1:21:44::Search I
4Iu4KPVbnAY::1:19:52::Search II
2ZtF1j3n6XE::1:20:20::Markov Decision Processes
34Hk2v2kwg4::1:18:16::Reinforcement Learning
lOMNskWVeD8::1:14:02::Policy Gradient
SMOD_GiRzb8::1:13:25::Games I
9CKRoKFdS5Y::1:13:48::Games II
ec2rCf4iIqU::1:17:36::Bayesian Networks I
Dk7Kqqehzjk::1:15:54::Bayesian Networks and Gibbs Sampling
4d9V6Sxa6gU::1:20:31::Bayesian Networks and Learning
Q7V13XriJEc::1:13:26::Logic I
x9Mbqu06OVo::1:15:47::Logic II
3orP3u2-jcg::1:19:46::Language Models
071zJXhvNfM::1:12:10::AI & Society
lPx5PF1ttkc::1:14:36::AI Supply Chains
5u5I5jvWR5k::58:49::Fireside Chat and Conclusion
`, cs221Url);

const cs221LectureMaterials: StudyMaterial[][] = [
  [
    { type: "interactive", label: "Course welcome", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=welcome", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/welcome.py" },
    { type: "interactive", label: "History of AI", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=history", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/history.py" },
    { type: "interactive", label: "Tensor foundations", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=tensors", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/tensors.py" },
  ],
  [
    { type: "interactive", label: "Backpropagation", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=backpropagation", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/backpropagation.py" },
    { type: "interactive", label: "Linear regression", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=linear_regression", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/linear_regression.py" },
  ],
  [{ type: "interactive", label: "Linear classification", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=linear_classification", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/linear_classification.py" }],
  [{ type: "interactive", label: "Deep learning", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=deep_learning", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/deep_learning.py" }],
  [{ type: "interactive", label: "Search", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=search", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/search.py" }],
  [{ type: "interactive", label: "Uniform-cost and A* search", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=ucs_astar", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/ucs_astar.py" }],
  [{ type: "interactive", label: "Markov decision processes", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=mdp", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/mdp.py" }],
  [{ type: "interactive", label: "Reinforcement learning", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=reinforcement_learning", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/reinforcement_learning.py" }],
  [{ type: "interactive", label: "Policy gradient", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=policy_gradient", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/policy_gradient.py" }],
  [{ type: "interactive", label: "Games", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=games", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/games.py" }],
  [
    { type: "interactive", label: "Temporal-difference learning", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=td_learning", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/td_learning.py" },
    { type: "interactive", label: "Simultaneous games", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=simultaneous_games", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/simultaneous_games.py" },
  ],
  [{ type: "interactive", label: "Bayesian networks", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=bayes", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/bayes.py" }],
  [{ type: "interactive", label: "Gibbs sampling", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=gibbs_sampling", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/gibbs_sampling.py" }],
  [{ type: "interactive", label: "Bayesian learning", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=bayes_learning", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/bayes_learning.py" }],
  [{ type: "interactive", label: "Propositional logic", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=propositional_logic", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/propositional_logic.py" }],
  [{ type: "interactive", label: "First-order logic", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=first_order_logic", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/first_order_logic.py" }],
  [{ type: "pdf", label: "Language models slides", url: "https://stanford-cs221.github.io/autumn2025-lectures/language_models.pdf", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/language_models.pdf" }],
  [{ type: "interactive", label: "AI & Society", url: "https://stanford-cs221.github.io/autumn2025-lectures/?trace=society", sourceUrl: "https://github.com/stanford-cs221/autumn2025-lectures/blob/main/society.py" }],
  [{ type: "slides", label: "Economics of AI slides", url: "https://docs.google.com/presentation/d/1jCn1OV4H1HKzQ0PWzRn2_bfOWKw43eS33wyramBt2z8/embed?start=false&loop=false&delayms=3000", sourceUrl: "https://docs.google.com/presentation/d/1jCn1OV4H1HKzQ0PWzRn2_bfOWKw43eS33wyramBt2z8/edit" }],
  [],
];

cs221.forEach((lesson, index) => {
  const materials = cs221LectureMaterials[index];
  if (!materials?.length) return;
  lesson.studyMaterials = materials;
  materials.forEach((material) => {
    lesson.resources?.push({
      label: material.label,
      url: material.url,
      kind: material.type === "interactive" ? "project" : "slides",
    });
    lesson.resources?.push({
      label: material.type === "slides" ? "Open original Stanford slides" : `${material.label} source`,
      url: material.sourceUrl,
      kind: "course",
    });
  });
});

const cs229Url = "https://cs229.stanford.edu/index.html-spr26";
const cs229 = parseLessons("cs229-spring-2026", `
DATnpGoGhM8::36:59::Introduction
cmNIMjPYdgM::1:18:10::Supervised Learning Setup
uJF_gL3jhxI::1:02:14::Weighted Least Squares
8gVi4Rk21Eg::1:14:12::Exponential Family, GLMs, and Classification
zRdE8A4UZes::1:21:38::Gaussian Discriminant Analysis
llnEgyyuYkQ::1:18:27::Dataset Splits and Machine-Learning Advice
fRM41w9jzQo::1:20:28::Neural Networks I: Architecture
ne2ngVAoMG8::1:02:13::Neural Networks II: Backpropagation
bSmIGBCoffA::1:16:30::K-Means and Gaussian Mixture Models
sUS-eTa0l6s::1:20:06::Expectation-Maximization and PCA
dqUMCzWjZSI::1:22:31::Diffusion Models
_kREM2UAiJ8::1:15:57::Representation Learning
lNTajqxxOn4::1:00:42::LLMs and Next-Word Prediction
pwQ0l4hFCVI::1:17:32::Transformers and In-Context Learning
hHC-SF3utxg::1:13:19::Reinforcement-Learning Concepts and Policy Gradient
xveNBYVTrqw::1:16:25::Gaussian Mixture Models, EM, and PCA
J7CossjMvEg::1:18:56::Gaussian Mixture Models, EM, and PCA II
`, cs229Url);

const cs229NotesSource = "https://cs229.stanford.edu/main_notes.pdf";
const cs229SyllabusMap = "https://docs.google.com/spreadsheets/d/1X8OpCbt6SyJ3_qlj5LxvZFoOtbjBadBVRzdmY4s6vb4/edit?gid=0#gid=0";

function cs229Note(label: string, _filename: string): StudyMaterial {
  void _filename;
  return {
    type: "pdf",
    label,
    url: cs229NotesSource,
    sourceUrl: cs229NotesSource,
    sourceLabel: "Open full CS229 notes ↗",
    description: "Use the section named in this lesson within Stanford's official CS229 notes. The repository links to the original source instead of redistributing third-party PDFs.",
  };
}

const cs229NoteSections = {
  section1: cs229Note("Main notes · Section 1: Linear regression", "section-1-linear-regression.pdf"),
  section2: cs229Note("Main notes · Section 2: Classification and logistic regression", "section-2-classification-logistic-regression.pdf"),
  section3: cs229Note("Main notes · Section 3: Generalized linear models", "section-3-generalized-linear-models.pdf"),
  sections7_1_7_3: cs229Note("Main notes · Sections 7.1-7.3: Neural networks", "sections-7-1-to-7-3-neural-networks.pdf"),
  section7_4: cs229Note("Main notes · Section 7.4: Backpropagation", "section-7-4-backpropagation.pdf"),
  sections8_1_8_2: cs229Note("Main notes · Sections 8.1-8.2: Generalization", "sections-8-1-and-8-2-generalization.pdf"),
  sections9_1_9_3: cs229Note("Main notes · Sections 9.1 and 9.3: Regularization and model selection", "sections-9-1-and-9-3-model-selection.pdf"),
  section10: cs229Note("Main notes · Section 10: K-means", "section-10-k-means.pdf"),
  sections11_1_11_3: cs229Note("Main notes · Sections 11.1-11.3: Expectation-maximization", "sections-11-1-to-11-3-em.pdf"),
  sections12_13: cs229Note("Main notes · Sections 12-13: PCA and ICA", "sections-12-and-13-pca-ica.pdf"),
  section15: cs229Note("Main notes · Section 15: Reinforcement learning", "section-15-reinforcement-learning.pdf"),
  section17: cs229Note("Main notes · Section 17: Policy gradient", "section-17-policy-gradient.pdf"),
};

const cs229LectureMaterials: StudyMaterial[][] = [
  [cs229NoteSections.section1],
  [cs229NoteSections.section1],
  [cs229NoteSections.section1],
  [cs229NoteSections.section2, cs229NoteSections.section3],
  [],
  [cs229NoteSections.sections8_1_8_2, cs229NoteSections.sections9_1_9_3],
  [cs229NoteSections.sections7_1_7_3],
  [cs229NoteSections.section7_4],
  [cs229NoteSections.section10, cs229NoteSections.sections11_1_11_3],
  [cs229NoteSections.sections11_1_11_3, cs229NoteSections.sections12_13],
  [],
  [],
  [],
  [],
  [cs229NoteSections.section15, cs229NoteSections.section17],
  [cs229NoteSections.sections11_1_11_3, cs229NoteSections.sections12_13],
  [cs229NoteSections.sections11_1_11_3, cs229NoteSections.sections12_13],
];

cs229.forEach((lesson, index) => {
  const materials = cs229LectureMaterials[index];
  if (!materials?.length) return;
  lesson.studyMaterials = [...(lesson.studyMaterials ?? []), ...materials];
  materials.forEach((material) => {
    lesson.resources?.push({ label: material.label, url: material.url, kind: "reading" });
  });
});

const cs230Url = "https://cs230.stanford.edu/syllabus/";
const cs230 = parseLessons("cs230-autumn-2025", `
_NLHFoVNlbg::1:00:17::Introduction to deep learning
DNCn1BpCAUY::1:39:48::Supervised, self-supervised, and weakly supervised learning
MGqQuQEUXhk::1:07:05::The full cycle of a deep-learning project
aWlRtOlacYM::1:47:17::Adversarial robustness and generative models
4E27qlfYw0A::1:45:01::Deep reinforcement learning
s6JVGzABKho::1:15:18::AI project strategy
k1njvbBmfsw::1:49:54::Agents, prompts, and retrieval-augmented generation
AuZoDsNmG_s::1:45:09::Career advice in AI
Ozb1AR_F5MU::1:46:54::What is going on inside my model?
`, cs230Url);

function cs230Slide(label: string, url: string, description = "Official slide deck listed for this class in Stanford CS230's Fall 2025 syllabus."): StudyMaterial {
  return {
    type: "pdf",
    label,
    url,
    sourceUrl: url,
    sourceLabel: "Open original PDF ↗",
    description,
  };
}

const cs230ClassContexts: ClassContext[] = [
  {
    eventLabel: "Lecture 1",
    date: "September 23, 2025",
    inClassLecture: ["Class introduction", "Examples of deep learning projects", "Course details"],
    onlineModules: ["No online modules"],
    sections: [{ label: "Section 1 · Week 1", title: "Getting Started with Your Project", url: "https://cs230.stanford.edu/section/1/" }],
  },
  {
    eventLabel: "Lecture 2",
    date: "September 30, 2025",
    inClassLecture: ["Key AI Concepts Through Case Studies"],
    onlineModules: ["C1M1: Introduction to deep learning", "C1M2: Neural Network Basics", "Optional preparation: Batch Normalization videos from C2M3"],
    sections: [{ label: "Section 2 · Week 2", title: "Understanding Gradient Descent and Backpropagation", url: "https://cs230.stanford.edu/section/2/" }],
  },
  {
    eventLabel: "Lecture 3",
    date: "October 7, 2025",
    inClassLecture: ["Full Cycle of a Deep Learning Project"],
    onlineModules: ["C1M3: Shallow Neural Network", "C1M4: Deep Neural Networks"],
    sections: [{ label: "Section 3 · Week 3", title: "Implementation First Steps - Codebases, Baselines, and AWS", url: "https://cs230.stanford.edu/section/3/" }],
  },
  {
    eventLabel: "Lecture 4",
    date: "October 14, 2025",
    inClassLecture: ["Adversarial Robustness and Generative Models"],
    onlineModules: ["C2M1: Practical aspects of deep learning", "C2M2: Optimization algorithms"],
    sections: [{ label: "Section 4 · Week 4", title: "Xavier Initialization and Regularization", url: "https://cs230.stanford.edu/section/4/" }],
  },
  {
    eventLabel: "Lecture 5",
    date: "October 21, 2025",
    inClassLecture: ["Deep Reinforcement Learning"],
    onlineModules: ["C2M3: Hyperparameter Tuning and Batch Normalization", "C3M1: ML Strategy (1)", "C3M2: ML Strategy (2)"],
    sections: [{ label: "Section 5 · Week 5", title: "PyTorch/TensorFlow", url: "https://cs230.stanford.edu/section/5/" }],
  },
  {
    eventLabel: "Lecture 6",
    date: "October 28, 2025",
    inClassLecture: ["Career Advice", "Reading Research Papers", "AI and Healthcare guest lecture"],
    onlineModules: ["C4M1: Foundations of Convolutional Neural Networks", "C4M2: Deep Convolutional Models"],
    sections: [{ label: "Section 6 · Week 6", title: "Midterm Review Session", url: "https://cs230.stanford.edu/section/6/" }],
  },
  {
    eventLabel: "Lecture 8",
    date: "November 11, 2025",
    inClassLecture: ["Beyond the model: Enhancing LLM applications"],
    onlineModules: ["No-class week: C4M3 - ConvNets Applications (1)", "No-class week: C4M4 - ConvNets Applications (2)", "C5M1: Recurrent Neural Networks"],
    sections: [
      { label: "Section 7 · Week 7", title: "Debugging Deep Learning Projects", url: "https://cs230.stanford.edu/section/7/" },
      { label: "Section 8 · Week 8", title: "Advanced Evaluation Metrics", url: "https://cs230.stanford.edu/section/8/" },
    ],
  },
  {
    eventLabel: "Lecture 9",
    date: "November 18, 2025",
    inClassLecture: ["Career Advice", "Reading Research Papers", "Guest Lecture"],
    onlineModules: ["C5M2: Natural Language Processing and Word Embeddings", "C5M3: Sequence-to-Sequence Models"],
    sections: [{ label: "Section 9 · Week 9", title: "Writing Your Final Report", url: "https://cs230.stanford.edu/section/9/" }],
  },
  {
    eventLabel: "Lecture 10",
    date: "December 2, 2025",
    inClassLecture: ["What's Going On Inside My Model?", "Class Wrap"],
    onlineModules: ["C5M4: Transformer Network"],
    sections: [],
  },
];

const cs230LectureMaterials: StudyMaterial[][] = [
  [
    cs230Slide("Lecture 1 · Class introduction", "https://cs230.stanford.edu/syllabus/fall_2024/lecture_1.pdf"),
  ],
  [
    cs230Slide("Lecture 2 · Key AI Concepts Through Case Studies", "https://cs230.stanford.edu/syllabus/fall_2025/2/lecture_2.pdf"),
    cs230Slide("C1M1 · Introduction to deep learning", "https://cs230.stanford.edu/files/C1M1.pdf", "Official online-module slides assigned before this class."),
    cs230Slide("C1M2 · Neural Network Basics", "https://cs230.stanford.edu/files/C1M2.pdf", "Official online-module slides assigned before this class."),
  ],
  [
    cs230Slide("C1M3 · Shallow Neural Network", "https://cs230.stanford.edu/files/C1M3.pdf", "Official online-module slides assigned before this class."),
    cs230Slide("C1M4 · Deep Neural Networks", "https://cs230.stanford.edu/files/C1M4.pdf", "Official online-module slides assigned before this class."),
  ],
  [
    cs230Slide("Lecture 4 · Adversarial Robustness and Generative Models", "https://cs230.stanford.edu/syllabus/fall_2025/4/lecture_4.pdf"),
    cs230Slide("C2M1 · Practical aspects of deep learning", "https://cs230.stanford.edu/files/C2M1.pdf", "Official online-module slides assigned before this class."),
    cs230Slide("C2M2 · Optimization algorithms", "https://cs230.stanford.edu/files/C2M2.pdf", "Official online-module slides assigned before this class."),
  ],
  [
    cs230Slide("Lecture 5 · Deep Reinforcement Learning", "https://cs230.stanford.edu/syllabus/fall_2025/5/lecture_5.pdf"),
    cs230Slide("C2M3 · Hyperparameter Tuning and Batch Normalization", "https://cs230.stanford.edu/files/C2M3.pdf", "Official online-module slides assigned before this class."),
    cs230Slide("C3M1 · ML Strategy (1)", "https://cs230.stanford.edu/files/C3M1.pdf", "Official online-module slides assigned before this class."),
    cs230Slide("C3M2 · ML Strategy (2)", "https://cs230.stanford.edu/files/C3M2.pdf", "Official online-module slides assigned before this class."),
  ],
  [
    cs230Slide("Lecture 6 · AI and Healthcare guest slides", "https://cs230.stanford.edu/syllabus/fall_2024/lecture5_guest.pdf"),
    cs230Slide("Lecture 6 · Career Advice and Research Papers", "https://cs230.stanford.edu/syllabus/fall_2024/lecture_5.pdf"),
    cs230Slide("C4M1 · Foundations of Convolutional Neural Networks", "https://cs230.stanford.edu/files/C4M1.pdf", "Official online-module slides assigned before this class."),
    cs230Slide("C4M2 · Deep Convolutional Models", "https://cs230.stanford.edu/files/C4M2.pdf", "Official online-module slides assigned before this class."),
  ],
  [
    cs230Slide("Lecture 8 · Enhancing LLM Applications", "https://cs230.stanford.edu/syllabus/fall_2025/7/lecture_7.pdf"),
    cs230Slide("C4M3 · ConvNets Applications (1)", "https://cs230.stanford.edu/files/C4M3.pdf", "Official module slides assigned during the no-class week."),
    cs230Slide("C4M4 · ConvNets Applications (2)", "https://cs230.stanford.edu/files/C4M4.pdf", "Official module slides assigned during the no-class week."),
    cs230Slide("C5M1 · Recurrent Neural Networks", "https://cs230.stanford.edu/files/C5M1.pdf", "Official online-module slides assigned before this class."),
  ],
  [
    cs230Slide("Lecture 9 · Career Advice and Research Papers", "https://cs230.stanford.edu/syllabus/fall_2025/8/lecture_8.pdf"),
    cs230Slide("Lecture 9 · Guest Lecture", "https://cs230.stanford.edu/syllabus/fall_2025/8/lecture_8_guest.pdf"),
    cs230Slide("C5M2 · NLP and Word Embeddings", "https://cs230.stanford.edu/files/C5M2.pdf", "Official online-module slides assigned before this class."),
    cs230Slide("C5M3 · Sequence-to-Sequence Models", "https://cs230.stanford.edu/files/C5M3.pdf", "Official online-module slides assigned before this class."),
  ],
  [
    cs230Slide("Lecture 10 · Inside My Model and Class Wrap", "https://cs230.stanford.edu/syllabus/fall_2025/10/lecture_10.pdf"),
    cs230Slide("C5M4 · Transformer Network", "https://cs230.stanford.edu/syllabus/fall_2025/10/C5_W4.pdf", "Official online-module slides assigned before this class."),
  ],
];

cs230.forEach((lesson, index) => {
  lesson.classContext = cs230ClassContexts[index];
  const materials = cs230LectureMaterials[index] ?? [];
  lesson.studyMaterials = [...(lesson.studyMaterials ?? []), ...materials];
  materials.forEach((material) => lesson.resources?.push({ label: material.label, url: material.url, kind: "slides" }));
  lesson.classContext?.sections.forEach((section) => lesson.resources?.push({ label: `${section.label}: ${section.title}`, url: section.url, kind: "course" }));
});

const cs224nUrl = "https://web.stanford.edu/class/archive/cs/cs224n/cs224n.1246/";
const cs224n = parseLessons("cs224n-spring-2024", `
DzpHeXVSC5I::1:20:17::Introduction and word vectors
nBor4jfWetQ::1:19:12::Word vectors and language models
HnliVHU2g9U::1:13:27::Backpropagation and neural networks
KVKvde-_MYc::1:18:57::Dependency parsing
fyc0Jzr74y4::1:18:52::Recurrent neural networks
Ba6Fn1-Jsfw::1:17:09::Sequence-to-sequence models
J7ruSOIzhrE::1:17:44::Attention, final projects, and LLM introduction
LWMzyfvuehA::1:17:04::Self-attention and Transformers
DGfCRXuNA2w::1:18:46::Pretraining
N9L32bFieEY::1:18:25::Natural language generation
35X6zlhoCy4::1:19:42::Post-training
TO0CqzqiArM::1:24:24::Benchmarking language models
UVX7SYGCKkA::1:02:32::Efficient training
tfVgHsKpRC8::1:12:49::Brain-computer interfaces
I0tj4Y7xaOQ::1:03:42::Reasoning and agents
dnF463_Ar9I::1:08:57::After direct preference optimization
S8d-7v3f5MQ::1:11:56::Convolutional networks and TreeRNNs
NxH0Y78xcF4::1:16:27::NLP, linguistics, and philosophy
5vfIT5LOkR0::1:18:23::Multimodal deep learning
cd3pRpEtjLs::1:11:42::Model interpretability and editing
8j4wpU98Q74::47:14::Python tutorial
Uv0AIRr3ptg::47:01::PyTorch tutorial
b80by3Xk_A8::47:57::Hugging Face tutorial
`, cs224nUrl);

const cs224nScheduleData = cs224nScheduleDataRaw as {
  lessonEntries: ScheduleEntry[][];
  lessonStudyMaterials: StudyMaterial[][];
  courseExtras: ScheduleEntry[];
};

cs224n.forEach((lesson, index) => {
  lesson.scheduleEntries = cs224nScheduleData.lessonEntries[index] ?? [];
  const materials = cs224nScheduleData.lessonStudyMaterials[index] ?? [];
  lesson.studyMaterials = [...(lesson.studyMaterials ?? []), ...materials];
});

const cs149Url = "https://gfxcourses.stanford.edu/cs149/fall23/";
const cs149 = parseLessons("cs149", `
V1tINV2-9p4::1:12:22::Why parallelism? Why efficiency?
CKmNpAO5rS4::1:16:14::A modern multi-core processor
F4bVSyz_jxo::1:16:19::Multi-core architecture and ISPC abstractions
0-ztm8SKq70::1:17:14::Parallel programming basics
mmO2Ri_dJkk::1:17:39::Performance optimization: work distribution and scheduling
Mhdny2JNhmc::1:17:25::Performance optimization: locality, communication, and contention
qQTDF0CBoxE::1:18:47::GPU architecture and CUDA programming
Ba3TqxSgnTk::1:17:49::Data-parallel thinking
jaMWmLq422U::1:17:54::Distributed data-parallel computing with Spark
qbKtU0X6-WU::1:20:27::Efficiently evaluating DNNs on GPUs
lrCfG2CPDEw::1:20:37::Cache coherence
nFXWmo9MFiY::1:19:16::Memory consistency
GA1ObImqaMo::1:15:48::Fine-grained synchronization and lock-free programming
nHPKVtLz5Ko::1:13:13::Midterm review
sRuyBNxCkGQ::1:18:53::Domain-specific programming languages
rFFf3WIJ7BA::1:20:21::Transactional memory I
Tbk1vnYLQqI::1:18:34::Transactional memory II
2tAb3EgyjNw::1:11:48::Hardware specialization
J7v_ubArrno::1:08:19::Accessing memory and course wrap-up
`, cs149Url);

const cs149LecturePaths: Array<string | undefined> = [
  "whyparallelism", "multicore", "multicore2-ispc", "progbasics", "perfopt1", "perfopt2", "gpucuda", "dataparallel", "spark", "dnneval",
  "cachecoherence", "locksconsistency", "finegrained", undefined, "dsl", "transactions1", "transactions2", "hwaccel", "wrapup",
];

const cs149SlideUrls: Array<string | undefined> = [
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/whyparallelism/01_whyparallelism_huXfOJ4.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/multicore/02_basicarch_xX3ssOi.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/multicore2-ispc/03_multicore2-ispc.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/progbasics/04_progbasics.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/perfopt1/05_progperf1.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/perfopt2/06_progperf2.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/gpucuda/07_gpuarch.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/dataparallel/08_dataparallel.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/spark/09_spark.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/dnneval/10_dnneval.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/cachecoherence/11_coherence.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/locksconsistency/12_consistency.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/finegrained/13_lockfree.pdf",
  undefined,
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/dsl/14_dsl.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/transactions1/15_transactionalmem.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/transactions2/16_heterogeneity.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/hwaccel/17_heterogeneity_Spatial_wWfLWLq.pdf",
  "https://gfxcourses.stanford.edu/cs149/fall23content/media/wrapup/18_wrapup.pdf",
];

const cs149ScheduleRows = [
  ["Tuesday, September 26, 2023", "Challenges of parallelizing code, motivations for parallel chips, and processor basics."],
  ["Thursday, September 28, 2023", "Forms of parallelism: multi-core, SIMD, and multi-threading."],
  ["Tuesday, October 3, 2023", "Multi-threading, latency versus bandwidth, ISPC programming, and abstraction versus implementation."],
  ["Thursday, October 5, 2023", "Ways of thinking about parallel programs and parallelizing work in data-parallel and shared-address-space models."],
  ["Tuesday, October 10, 2023", "Achieving good work distribution while minimizing overhead, including Cilk work-stealing scheduling."],
  ["Thursday, October 12, 2023", "Message passing, asynchronous versus blocking communication, pipelining, arithmetic intensity, and contention."],
  ["Tuesday, October 17, 2023", "CUDA programming abstractions and their implementation on modern GPUs."],
  ["Thursday, October 19, 2023", "Data-parallel operations including map, reduce, scan, prefix sum, and groupByKey."],
  ["Tuesday, October 24, 2023", "Producer-consumer locality, the RDD abstraction, and Spark implementation and scheduling."],
  ["Thursday, October 26, 2023", "Efficient DNN layer scheduling, mapping convolutions to matrix multiplication, Transformers, and layer fusion."],
  ["Tuesday, October 31, 2023", "Memory coherence, invalidation-based coherence with MSI and MESI, and false sharing."],
  ["Thursday, November 2, 2023", "Relaxed consistency models, their motivation, and acquire/release semantics."],
  ["Thursday, November 9, 2023", "Fine-grained locking and lock-free programming: queues, stacks, the ABA problem, and hazard pointers."],
  ["Tuesday, November 14, 2023", "Midterm review. The evening midterm was scheduled for November 15."],
  ["Thursday, November 16, 2023", "Performance and productivity motivations for domain-specific languages, with several DSL case studies."],
  ["Tuesday, November 28, 2023", "Motivation for transactions and the design space of transactional-memory implementations."],
  ["Thursday, November 30, 2023", "Software and hardware transactional-memory implementations, completing the transactional-memory sequence."],
  ["Tuesday, December 5, 2023", "Energy-efficient and heterogeneous computing, fixed-function hardware, FPGAs, and mobile SoCs."],
  ["Thursday, December 7, 2023", "How DRAM works and directions for studying parallel computing after CS149."],
] as const;

type Cs149AssignedWork = { date: string; label: string; url: string; embed?: boolean };
const cs149AssignedWork: Cs149AssignedWork[][] = Array.from({ length: cs149.length }, () => []);
cs149AssignedWork[3].push({ date: "October 6", label: "Programming Assignment 1: Analyzing Parallel Program Performance on a Quad-Core CPU", url: "https://github.com/stanford-cs149/asst1" });
cs149AssignedWork[4].push({ date: "October 10", label: "Written Assignment 1", url: "https://gfxcourses.stanford.edu/cs149/fall23content/static/pdfs/written_asst1.pdf", embed: true });
cs149AssignedWork[7].push({ date: "October 20", label: "Programming Assignment 2: Scheduling Task Graphs on a Multi-Core CPU", url: "https://github.com/stanford-cs149/asst2" });
cs149AssignedWork[9].push({ date: "October 26", label: "Written Assignment 2", url: "https://gfxcourses.stanford.edu/cs149/fall23content/static/pdfs/written_asst2.pdf", embed: true });
cs149AssignedWork[11].push({ date: "November 3", label: "Written Assignment 3", url: "https://gfxcourses.stanford.edu/cs149/fall23content/static/pdfs/written_asst3.pdf", embed: true });
cs149AssignedWork[12].push(
  { date: "November 8", label: "Programming Assignment 3: A Simple Renderer in CUDA", url: "https://github.com/stanford-cs149/asst3" },
  { date: "November 11", label: "Written Assignment 4", url: "https://gfxcourses.stanford.edu/cs149/fall23content/static/pdfs/written_asst4.pdf", embed: true },
);
cs149AssignedWork[17].push(
  { date: "December 4", label: "Programming Assignment 4: Chat149 — A Flash Attention Transformer DNN", url: "https://github.com/stanford-cs149/cs149gpt" },
  { date: "December 6", label: "Written Assignment 5", url: "https://gfxcourses.stanford.edu/cs149/fall23content/static/pdfs/written_asst5.pdf", embed: true },
);
cs149AssignedWork[18].push({ date: "December 8", label: "Optional Programming Assignment 5: Big Graph Processing", url: "https://github.com/stanford-cs149/biggraphs-ec" });

cs149.forEach((lesson, index) => {
  const lecturePath = cs149LecturePaths[index];
  const slideUrl = cs149SlideUrls[index];
  const lecturePage = lecturePath ? `${cs149Url}lecture/${lecturePath}/` : undefined;
  const assignedWork = cs149AssignedWork[index];
  const lectureMaterials: Resource[] = [];
  if (lecturePage) lectureMaterials.push({ label: "Official lecture page", url: lecturePage, kind: "course" });
  if (slideUrl) lectureMaterials.push({ label: "Download lecture slides (PDF)", url: slideUrl, kind: "slides" });

  lesson.description = cs149ScheduleRows[index][1];
  lesson.scheduleEntries = [{
    date: cs149ScheduleRows[index][0],
    description: lesson.title,
    lectureMaterials,
    readings: [],
    courseMaterialNote: "",
    eventText: "",
    eventResources: [],
    deadline: assignedWork.map((item) => `${item.date}: ${item.label}`).join(" · "),
    deadlineResources: assignedWork.map((item) => ({ label: `${item.date} · ${item.label}`, url: item.url, kind: "assignment" })),
  }];

  const materials: StudyMaterial[] = [];
  if (slideUrl) materials.push({
    type: "pdf",
    label: `Official lecture slides · ${lesson.title}`,
    url: slideUrl,
    sourceUrl: slideUrl,
    sourceLabel: "Open original PDF ↗",
    description: "The complete Fall 2023 Stanford CS149 slide deck for this class.",
    group: "Lecture slides",
  });
  assignedWork.filter((item) => item.embed).forEach((item) => materials.push({
    type: "pdf",
    label: item.label,
    url: item.url,
    sourceUrl: item.url,
    sourceLabel: "Open original PDF ↗",
    description: `Official CS149 written assignment listed for ${item.date}.`,
    group: "Written assignments",
  }));
  lesson.studyMaterials = materials;
});

const cs149ScheduleExtras: ScheduleEntry[] = [
  {
    date: "Tuesday, November 7, 2023", description: "Democracy Day — no class", lectureMaterials: [], readings: [],
    courseMaterialNote: "", eventText: "Take time to volunteer, educate yourself, or take action.", eventResources: [], deadline: "", deadlineResources: [],
  },
  {
    date: "Thursday, December 14, 2023", description: "Final Exam", lectureMaterials: [], readings: [],
    courseMaterialNote: "", eventText: "", eventResources: [], deadline: "Held at 3:30pm; location was listed as TBD.", deadlineResources: [],
  },
];

const cs336Url = "https://cs336.stanford.edu/";
const cs336 = parseLessons("cs336", `
JuoVZkPBiKk::1:19:22::Overview and tokenization
kuYAsz7zspQ::1:17:25::PyTorch and einops
lVynu4bo1rY::1:29:14::Language-model architectures
cKSwj_qZ8Jg::1:26:21::Attention alternatives
izZba4UA7iY::1:18:39::GPUs and TPUs
xnDHaNUvHBg::1:26:41::Kernels, Triton, and XLA
SzpOcwdIL0Y::1:21:03::Parallelism basics
6-cXp-aOmdg::1:20:11::Advanced parallelism
Q15rhEWZPQ4::1:17:57::Scaling laws I
EfM546A79aM::1:25:30::Language-model inference
vTfEyOyzV9E::1:17:04::Scaling laws II
JpAxdTWQJxM::1:18:34::Evaluation
-qm0ln33G24::1:22:02::Data sources and datasets
5sxHosTLPF8::1:24:46::Data filtering and deduplication
2oH6PWPrYFo::1:19:55::Mid-training and post-training
dIFAi87Ws4E::1:15:51::Post-training with RLVR
26FtD08ZpOU::1:17:40::Alignment and multimodality
9EEm4iMAF5s::1:11:41::Guest lecture with Dan Fu
`, cs336Url);

const cs336InteractiveLectures = new Set([1, 2, 6, 7, 10, 12, 13, 14, 17]);
const cs336PdfLectures = new Set([3, 4, 5, 8, 9, 11, 15, 16]);

cs336.forEach((lesson, index) => {
  const lecture = index + 1;
  const lectureNumber = String(lecture).padStart(2, "0");
  const materials: StudyMaterial[] = [];

  if (cs336InteractiveLectures.has(lecture)) {
    const url = `https://cs336.stanford.edu/lectures/?trace=lecture_${lectureNumber}`;
    materials.push({
      type: "interactive",
      label: `Executable lecture ${lectureNumber}`,
      url,
      sourceUrl: url,
      sourceLabel: "Open original on Stanford ↗",
      group: "executable lecture",
    });
    lesson.resources?.push({ label: `Executable lecture ${lectureNumber}`, url, kind: "project" });
  }

  if (cs336PdfLectures.has(lecture)) {
    const url = `https://cs336.stanford.edu/lectures/lecture_${lectureNumber}.pdf`;
    materials.push({
      type: "pdf",
      label: `Official lecture ${lectureNumber} PDF`,
      url,
      sourceUrl: url,
      sourceLabel: "Open PDF on Stanford ↗",
      description: "Read the complete official Stanford lecture deck inside this lesson, alongside the video and your study notes.",
      group: "lecture PDF",
    });
    lesson.resources?.push({ label: `Lecture ${lectureNumber} PDF`, url, kind: "slides" });
  }

  lesson.studyMaterials = materials;
});

const cs224rUrl = "https://cs224r.stanford.edu/";
const cs224r = parseLessons("cs224r", `
EvHRQhMX7_w::52:59::Class introduction and MDPs
WxRDyObrm_M::1:07:05::Imitation learning
KCAOXd4IO9o::1:02:38::Policy gradients
oejFZShW9hU::1:03:30::Actor-critic methods
cRGKc-nAWho::1:09:22::Off-policy actor-critic methods
-7kv6jf0isQ::1:01:40::Q-learning
lRDaXnPIzks::1:07:51::Offline reinforcement learning
PDIxDhA9Z6Y::1:05:59::Reward learning
XKLGuwvSKvI::1:02:51::Reinforcement learning for language models
O2VpNnwB4lM::1:10:30::RL for language-model reasoning
PvqyGnOirgA::1:13:20::Model-based reinforcement learning
qNdsI_4AQJw::1:10:30::Multi-task reinforcement learning
wSiyEpvoGkA::1:09:11::Meta-reinforcement learning
4tlSKdi8teU::1:12:42::Exploration
iKWYLSVAtfM::1:09:33::Hierarchical reinforcement and imitation learning
rbaWQQLrzl0::1:05:44::Reinforcement learning for robots
Hp1WBWghrak::49:49::Advancing robot intelligence
FacJ_1tTSx4::1:10:49::Frontiers of deep reinforcement learning
`, cs224rUrl);

const cs224rTimelineData = cs224rTimelineDataRaw as {
  lessonEntries: ScheduleEntry[][];
  lessonStudyMaterials: StudyMaterial[][];
  courseExtras: ScheduleEntry[];
};

cs224r.forEach((lesson, index) => {
  lesson.scheduleEntries = cs224rTimelineData.lessonEntries[index] ?? [];
  lesson.studyMaterials = [
    ...(lesson.studyMaterials ?? []),
    ...(cs224rTimelineData.lessonStudyMaterials[index] ?? []),
  ];
});

const cs329aUrl = "https://cs329a.stanford.edu/";
const cs329a = parseLessons("cs329a", `
6YnLB0XbTnI::1:09:42::Course overview
-Ggc37xLj_Y::1:03:21::Test-time compute scaling
p7TdPUcPoik::1:12:59::Robust verification
Lxh9RF5S-K0::1:11:13::Learning from feedback with tools and code
Ml_fp9XkB8Y::1:14:56::Planning and multi-step reasoning
yVnmHSAy3ck::1:12:39::Train-time scaling and reinforcement learning
Uni9dqyuuDM::1:12:27::Self-improvement and deep-research agents
8JAqLnTaZu4::1:15:18::Agentic evaluations and long-horizon tasks
AyO6wyu4DEg::1:07:42::Future research areas
`, cs329aUrl);

const cs329aScheduleData = cs329aScheduleDataRaw as {
  lessonEntries: ScheduleEntry[][];
  lessonStudyMaterials: StudyMaterial[][];
  courseExtras: ScheduleEntry[];
};

cs329a.forEach((lesson, index) => {
  lesson.scheduleEntries = cs329aScheduleData.lessonEntries[index] ?? [];
  lesson.studyMaterials = [
    ...(lesson.studyMaterials ?? []),
    ...(cs329aScheduleData.lessonStudyMaterials[index] ?? []),
  ];
});

const cs25Url = "https://web.stanford.edu/class/cs25/";
const cs25 = parseLessons("cs25-transformers-collection", `
NDdc39KYqDU::1:04:40::From language models to native multimodal intelligence
ZUdIsRZhWXI::1:22:31::Serving Transformers in production
jFdH7n6BAl0::1:06:33::Collaborative AI agents for science and medicine
dJtHauhRasc::1:12:30::Generalization from parameters and context
e_H_tkpCAK4::57:57::From next-token prediction to next-generation intelligence
I5BKi32IEa8::1:01:48::Scaling training to thousands of GPUs
OyimE74UMF8::1:17:08::Tradeoffs of state-space models and Transformers
GBd7iuJkW08::1:11:03::From representation learning to world modeling
bHSDPgZYie0::1:16:46::Overview of Transformers
YGHF8_tf--g::1:13:35::Transformers for Video Generation
vXtapCFctTI::1:14:32::Transformers in Diffusion Models for Image Generation
JKbtWimlzAE::1:01:28::Overview of Transformers: V5
orDKvo8h71o::36:31::Hyung Won Chung of OpenAI
LWMzyfvuehA::1:17:04::Self-Attention and Transformers
XfpMkf4rD6E::1:11:41::Introduction to Transformers with Andrej Karpathy
P127jhj-8-Y::22:44::Transformers United: Models That Revolutionized NLP, CV, and RL
`, cs25Url);

const cs25ScheduleData = cs25ScheduleDataRaw as {
  lessonEntries: ScheduleEntry[][];
  lessonStudyMaterials: StudyMaterial[][];
};

cs25.forEach((lesson, index) => {
  lesson.scheduleEntries = cs25ScheduleData.lessonEntries[index] ?? [];
  lesson.studyMaterials = [
    ...(lesson.studyMaterials ?? []),
    ...(cs25ScheduleData.lessonStudyMaterials[index] ?? []),
  ];
});

const cme295Url = "https://cme295.stanford.edu/";
const cme295PlaylistUrl = "https://www.youtube.com/playlist?list=PLoROMvodv4rOCXd21gf0CF4xr35yINeOy";
const cme295CheatsheetPdf = "https://raw.githubusercontent.com/afshinea/stanford-cme-295-transformers-large-language-models/main/en/cheatsheet-transformers-large-language-models.pdf";
const cme295 = parseLessons("cme295", `
Ub3GoFaUcds::1:41:59::Transformer
yT84Y5zCnaA::1:47:20::Transformer-Based Models & Tricks
Q5baLehv5So::1:48:45::Large Language Models
VlA_jt_3Qc4::1:47:27::LLM Training
PmW_TMQ3l0I::1:47:42::LLM Tuning
k5Fh-UgTuCo::1:47:10::LLM Reasoning
h-7S6HNq0Vg::1:49:23::Agentic LLMs
8fNP4N46RRo::1:49:25::LLM Evaluation
Q86qzJ1K1Ss::1:51:31::Recap & Current Trends
`, cme295Url);

const cme295Dates = [
  "September 26, 2025",
  "October 3, 2025",
  "October 10, 2025",
  "October 17, 2025",
  "October 31, 2025",
  "November 7, 2025",
  "November 14, 2025",
  "November 21, 2025",
  "December 5, 2025",
];

const cme295Topics = [
  ["Background on NLP and tasks", "Tokenization", "Embeddings", "Word2vec, RNNs, and LSTMs", "Attention mechanism", "Transformer architecture"],
  ["Attention approximation", "Multi-head, multi-query, and grouped-query attention", "Regular and learned position embeddings", "Rotary position embeddings and applications", "Transformer-based architectures", "BERT and its derivatives"],
  ["LLM definitions and architectures", "Mixture of experts", "Context length and temperature", "Sampling strategies", "Prompting and in-context learning", "Chain of thought", "Self-consistency"],
  ["Pretraining", "Quantization", "Hardware optimization", "Supervised fine-tuning", "Parameter-efficient fine-tuning and LoRA"],
  ["Preference tuning", "RLHF overview", "Reward modeling", "PPO and related reinforcement-learning approaches", "Direct Preference Optimization"],
  ["Reasoning models", "Reinforcement learning for reasoning", "Group Relative Policy Optimization", "Reasoning-time and training-time scaling"],
  ["Retrieval-augmented generation", "Advanced RAG techniques", "Function calling", "LLM agents", "The ReAct framework"],
  ["LLM-as-a-judge", "Evaluation best practices and benefits", "Biases and pitfalls"],
  ["Course recap", "Current Transformer and LLM trends", "Closing research directions"],
];

cme295.forEach((lesson, index) => {
  const lectureNumber = index + 1;
  const slideUrl = `${cme295Url}slides/fall25-cme295-lecture${lectureNumber}.pdf`;
  const embeddedSlideUrl = `/api/course-pdf?document=cme295-lecture-${lectureNumber}`;
  lesson.description = `Official Autumn 2025 CME 295 lecture covering ${cme295Topics[index].join(", ")}. Use the recording with the complete slide deck, then summarize the main design tradeoffs in your own notes.`;
  lesson.date = cme295Dates[index];
  lesson.topics = cme295Topics[index];
  lesson.resources?.push(
    { label: `Lecture ${lectureNumber} slides`, url: slideUrl, kind: "slides" },
    { label: "Transformers & LLMs cheatsheet", url: cme295CheatsheetPdf, kind: "reading" },
  );
  lesson.studyMaterials = [{
    type: "pdf",
    label: `Lecture ${lectureNumber} slides — ${lesson.title}`,
    url: embeddedSlideUrl,
    sourceUrl: slideUrl,
    sourceLabel: "Open slides on Stanford ↗",
    description: `Read the complete official CME 295 slide deck for the ${cme295Dates[index]} class inside this lesson.`,
    group: "official lecture slides",
  }];

  if (index === cme295.length - 1) {
    lesson.studyMaterials.push({
      type: "pdf",
      label: "Transformers & Large Language Models cheatsheet",
      url: "/api/course-pdf?document=cme295-cheatsheet",
      sourceUrl: "https://github.com/afshinea/stanford-cme-295-transformers-large-language-models/tree/main/en",
      sourceLabel: "Open cheatsheet repository ↗",
      description: "Use the official visual cheatsheet as a compact review of Transformers, LLM training, tuning, reasoning, RAG, agents, and evaluation.",
      group: "course review",
    });
  }
});

const cme295ScheduleExtras: ScheduleEntry[] = [
  {
    date: "October 24, 2025",
    description: "Midterm examination",
    lectureMaterials: [],
    readings: [],
    courseMaterialNote: "",
    eventText: "Official CME 295 midterm and worked solutions.",
    eventResources: [
      { label: "Midterm exam", url: `${cme295Url}exams/midterm.pdf`, kind: "assignment" },
      { label: "Midterm solutions", url: `${cme295Url}exams/midterm-solutions.pdf`, kind: "assignment" },
    ],
    deadline: "",
    deadlineResources: [],
  },
  {
    date: "December 10, 2025",
    description: "Final examination",
    lectureMaterials: [],
    readings: [],
    courseMaterialNote: "",
    eventText: "Official CME 295 final examination and worked solutions.",
    eventResources: [
      { label: "Final exam", url: `${cme295Url}exams/final.pdf`, kind: "assignment" },
      { label: "Final solutions", url: `${cme295Url}exams/final-solutions.pdf`, kind: "assignment" },
    ],
    deadline: "",
    deadlineResources: [],
  },
];

const mit6s191Url = "https://introtodeeplearning.com/";
const mit6s191PlaylistUrl = "https://www.youtube.com/playlist?list=PLtBw6njQRU-rwp5__7C0oIVt26ZgjG9NI";
const mit6s191RepositoryUrl = "https://github.com/MITDeepLearning/introtodeeplearning";
const mit6s191Lab2PaperUrl = "https://introtodeeplearning.com/AAAI_MitigatingAlgorithmicBias.pdf";
const mit6s191 = parseLessons("mit-6s191", `
II4giR4vOOo::56:16::Introduction to Deep Learning
d02VkQ9MP44::57:34::Recurrent Neural Networks, Transformers, and Attention
pqIcoskUuWs::56:45::Convolutional Neural Networks
R8V8CbuxryI::49:35::Deep Generative Modeling
1ij3dweHu-0::59:18::Reinforcement Learning
ev7cLSd-ySE::56:17::Language Models and New Frontiers
XKOpA7iaJvg::51:48::The Three Laws of AI
rZACoZD8AG8::59:10::AI for Science
UZZD9d9YqnQ::52:40::Secrets of Massively Parallel Training
`, mit6s191Url);

const mit6s191Dates = [
  "March 30, 2026", "April 6, 2026", "April 13, 2026",
  "April 20, 2026", "April 27, 2026", "May 4, 2026",
  "May 11, 2026", "May 18, 2026", "May 25, 2026",
];

const mit6s191Topics = [
  ["Neural-network foundations", "Perceptrons and activation functions", "Loss functions", "Gradient descent and backpropagation", "Regularization", "Practical training workflow"],
  ["Sequence modeling", "Recurrent neural networks", "Long short-term memory", "Attention", "Transformer architecture", "Autoregressive generation"],
  ["Convolution and feature maps", "Convolutional neural networks", "Image classification", "Representation learning", "Transfer learning", "Modern vision systems"],
  ["Generative modeling", "Autoencoders and variational autoencoders", "Latent-variable models", "Generative adversarial networks", "Diffusion models", "Sampling and generation"],
  ["Sequential decision-making", "Rewards and value functions", "Q-learning", "Policy gradients", "Actor-critic methods", "Exploration in deep reinforcement learning"],
  ["Language-model foundations", "Tokens and embeddings", "Transformers and large language models", "Prompting and fine-tuning", "Generative AI systems", "Emerging research frontiers"],
  ["Asimov's laws of robotics", "AI safety and alignment", "Safety protocols for modern deep learning", "Model limitations", "Ethical principles", "Hands-on system evaluation"],
  ["Scientific discovery with AI", "Deep-learning emulators", "Inductive bias", "Quantum chemistry and density functional theory", "Protein dynamics and biology", "Generalization in scientific models"],
  ["Accelerators and distributed training", "Scaling laws", "Data, tensor, pipeline, and sequence parallelism", "Activation checkpointing and offloading", "ZeRO and FSDP sharding", "Mixture-of-experts parallelism"],
];

mit6s191.forEach((lesson, index) => {
  const lectureNumber = index + 1;
  const slideUrl = `${mit6s191Url}slides/6S191_MIT_DeepLearning_L${lectureNumber}.pdf`;
  lesson.date = mit6s191Dates[index];
  lesson.topics = mit6s191Topics[index];
  lesson.description = `Official MIT 6.S191 2026 lecture covering ${mit6s191Topics[index].join(", ")}. Study the recording with the complete slide deck, reproduce the central ideas in your own notes, and connect the techniques to the course labs.`;
  lesson.resources?.push({ label: `Lecture ${lectureNumber} slides`, url: slideUrl, kind: "slides" });
  lesson.studyMaterials = [{
    type: "pdf",
    label: `Lecture ${lectureNumber} slides — ${lesson.title}`,
    url: `/api/course-pdf?document=mit6s191-lecture-${lectureNumber}`,
    sourceUrl: slideUrl,
    sourceLabel: "Open slides on MIT ↗",
    description: `Read the complete official MIT 6.S191 slide deck for the ${mit6s191Dates[index]} lecture inside this lesson.`,
    group: "official lecture slides",
  }];

  if (index === 1) {
    lesson.resources?.push({ label: "Lab 1: Deep Learning in Python & Music Generation", url: `${mit6s191RepositoryUrl}/tree/master/lab1`, kind: "assignment" });
  }
  if (index === 3) {
    lesson.resources?.push(
      { label: "Lab 2: Facial Detection Systems", url: `${mit6s191RepositoryUrl}/tree/master/lab2`, kind: "assignment" },
      { label: "Algorithmic-bias paper", url: mit6s191Lab2PaperUrl, kind: "reading" },
    );
    lesson.studyMaterials.push({
      type: "pdf",
      label: "Uncovering and Mitigating Algorithmic Bias through Learned Latent Structure",
      url: "/api/course-pdf?document=mit6s191-lab2-paper",
      sourceUrl: mit6s191Lab2PaperUrl,
      sourceLabel: "Open paper on MIT ↗",
      description: "Read the paper behind the facial-detection lab alongside the lecture on latent generative models.",
      group: "lab 2 paper",
    });
  }
  if (index === 5) {
    lesson.resources?.push({ label: "Lab 3: Fine-Tune an LLM, You Must!", url: `${mit6s191RepositoryUrl}/tree/master/lab3`, kind: "assignment" });
  }
});

const mit6s191ScheduleExtras: ScheduleEntry[] = [
  {
    date: "After Lecture 2", description: "Lab 1 — Deep Learning in Python; Music Generation",
    lectureMaterials: [], readings: [], courseMaterialNote: "",
    eventText: "Implement deep-learning fundamentals in TensorFlow and PyTorch, then train a character-level recurrent neural network to generate music in ABC notation.",
    eventResources: [{ label: "Open Lab 1", url: `${mit6s191RepositoryUrl}/tree/master/lab1`, kind: "assignment" }],
    deadline: "", deadlineResources: [],
  },
  {
    date: "After Lecture 4", description: "Lab 2 — Facial Detection Systems", lectureMaterials: [],
    readings: [{ label: "Algorithmic-bias paper", url: mit6s191Lab2PaperUrl, kind: "reading" }], courseMaterialNote: "",
    eventText: "Build a facial-detection system and study how learned latent structure can uncover and mitigate algorithmic bias.",
    eventResources: [{ label: "Open Lab 2", url: `${mit6s191RepositoryUrl}/tree/master/lab2`, kind: "assignment" }],
    deadline: "", deadlineResources: [],
  },
  {
    date: "After Lecture 6", description: "Lab 3 — Fine-Tune an LLM, You Must!",
    lectureMaterials: [], readings: [], courseMaterialNote: "",
    eventText: "Apply the language-model lecture by fine-tuning an LLM in the official course notebook.",
    eventResources: [{ label: "Open Lab 3", url: `${mit6s191RepositoryUrl}/tree/master/lab3`, kind: "assignment" }],
    deadline: "", deadlineResources: [],
  },
  {
    date: "May 2026", description: "Final project work and presentations",
    lectureMaterials: [], readings: [], courseMaterialNote: "",
    eventText: "Develop a project proposal, iterate on the final system, and present the result at the end-of-course showcase.",
    eventResources: [{ label: "Course project timeline", url: mit6s191Url, kind: "project" }],
    deadline: "", deadlineResources: [],
  },
];

const cs109Url = "https://web.stanford.edu/class/archive/cs/cs109/cs109.1232/";
const cs109ScheduleUrl = `${cs109Url}schedule.html`;
const cs109ReaderUrl = "https://chrispiech.github.io/probabilityForComputerScientists/en/ProbabilityForComputerScientists.pdf";
const cs109PlaylistUrl = "https://www.youtube.com/playlist?list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg";
const cs109 = parseLessons("cs109-fall-2022", `
2MuDZIAzBMY::1:14:11::Counting
ag4Ei15CG0c::1:08:55::Combinatorics
EGgMCE2AgyU::1:14:45::What Is Probability?
NHRoXvPaZqY::1:14:37::Conditional Probability and Bayes
zTJDZ2wmaRU::1:17:40::Independence
8QCg2ur-3fo::1:08:27::Random Variables and Expectation
I2UBspTNAG0::1:13:59::Variance, Bernoulli, and Binomial
QV3IRiG6dVs::1:12:59::Poisson Distribution
OFgBn4rQkqc::1:15:57::Continuous Random Variables
rpB_NNXiWlM::1:14:32::Normal Distribution
8Il2M7kbQSc::1:12:04::Joint Distributions
fvgQBAsg5Zo::1:20:33::Inference I
d0ImA7m4BEg::1:11:08::Inference II
q9lk8l8P-E4::1:16:42::Probabilistic Modelling
c0QGjtu9GZg::1:16:09::General Inference
aOhk9mFrHdU::1:08:19::Beta Distribution
UEyHbI9FRtM::1:16:51::Adding Random Variables
6Q9wT6JGMMM::49:26::Central Limit Theorem
NXJwyPT1vsc::1:17:33::Bootstrapping and P-Values
Ht9yUPtppwY::1:17:42::Algorithmic Analysis
utFEufMXHgw::1:17:49::Maximum Likelihood Estimation
sL1zOr-P4xc::1:18:07::Maximum A Posteriori Estimation
yqF3DvDVpvw::1:17:59::Naive Bayes
ILqZWvDWKEc::1:19:17::Logistic Regression
MSfI6TTgyl4::1:21:29::Deep Learning
cbzwbr5H_LA::1:09:58::Fairness
BquE8Z9htws::1:20:31::Advanced Probability, DALL-E, and GPT
SoXygq5LtiM::1:06:59::The Future of Probability
yyKSsjRt42o::50:43::Counting - Alternate Playlist Recording
`, cs109ScheduleUrl);

const cs109LectureSlugs = [
  "1-Welcome", "2-Combinatorics", "3-IntroProbability", "4-ConditioningAndBayes", "5-Independence",
  "6-RandomVariables", "7-BernoulliBinomial", "8-Poisson", "9-Continuous", "10-Gaussian",
  "11-ProbabilisticModels", "12-Inference", "13-Inference2", "14-Modeling", "15-GeneralInference",
  "16-Beta", "17-Adding", "18-Sampling", "19-Bootstrapping", "20-AlgorithmAnalysis",
  "21-MaximumLikelihoodEstimation", "22-MaximumAPosteriori", "23-NaiveBayes", "24-LogisticRegression",
  "25-DeepLearning", "26-Ethics", "27-DallEGPT", "28-Future",
];
const cs109Dates = [
  "September 26, 2022", "September 28, 2022", "September 30, 2022", "October 3, 2022",
  "October 5, 2022", "October 7, 2022", "October 10, 2022", "October 12, 2022",
  "October 14, 2022", "October 17, 2022", "October 19, 2022", "October 21, 2022",
  "October 24, 2022", "October 26, 2022", "October 28, 2022", "November 2, 2022",
  "November 4, 2022", "November 7, 2022", "November 9, 2022", "November 11, 2022",
  "November 14, 2022", "November 16, 2022", "November 18, 2022", "November 28, 2022",
  "November 30, 2022", "December 2, 2022", "December 5, 2022", "December 7, 2022",
  "Supplemental playlist recording",
];
const cs109ReaderPages = [21, 26, 33, 42, 45, 75, 83, 90, 96, 103, 146, 159, 163, 146, 170, 209, 213, 217, 222, 224, 242, 246, 249, 251, 248, 173, 255, 226, 21];
const cs109Topics = [
  ["sum and product rules", "counting", "sample spaces"],
  ["factorials", "permutations", "combinations"],
  ["probability axioms", "equally likely outcomes", "events"],
  ["conditional probability", "law of total probability", "Bayes theorem"],
  ["independence", "conditional independence", "probability of intersections"],
  ["random variables", "probability mass functions", "expectation"],
  ["variance", "Bernoulli variables", "binomial distribution"],
  ["Poisson distribution", "rare-event modelling", "Poisson approximation"],
  ["probability density functions", "continuous variables", "uniform and exponential distributions"],
  ["Gaussian distribution", "standardization", "binomial approximation"],
  ["joint distributions", "marginalization", "covariance and correlation"],
  ["Bayesian inference", "belief updates", "conditional evidence"],
  ["Bayesian networks", "variable independence", "multi-variable inference"],
  ["probabilistic modelling", "generative processes", "model assumptions"],
  ["general inference", "latent variables", "posterior reasoning"],
  ["Beta distribution", "conjugate priors", "uncertain probabilities"],
  ["sums of random variables", "linearity of expectation", "variance of sums"],
  ["central limit theorem", "sampling distributions", "normal approximation"],
  ["bootstrap", "p-values", "simulation-based uncertainty"],
  ["randomized algorithm analysis", "expected runtime", "probabilistic bounds"],
  ["parameter estimation", "likelihood", "maximum likelihood"],
  ["priors", "posterior optimization", "maximum a posteriori"],
  ["Naive Bayes", "conditional independence", "classification"],
  ["logistic regression", "cross-entropy", "probabilistic classification"],
  ["neural networks", "learned representations", "probabilistic prediction"],
  ["fairness in AI", "measurement", "differential privacy"],
  ["diffusion models", "information theory", "generative AI"],
  ["future applications", "uncertainty-aware computing", "research directions"],
  ["counting review", "sum and product rules", "supplemental practice"],
];

function cs109ProblemSet(index: number): Resource {
  const number = index < 2 ? 1 : index < 5 ? 2 : index < 10 ? 3 : index < 15 ? 4 : index < 20 ? 5 : 6;
  const labels = ["", "Counting", "Core Probability", "Random Variables", "Probabilistic Models", "Uncertainty Theory", "Machine Learning"];
  return { label: `Problem Set ${number}: ${labels[number]}`, url: `https://cs109psets.netlify.app/fall22/pset${number}/`, kind: "assignment" };
}

cs109.forEach((lesson, index) => {
  const lectureNumber = index < 28 ? index + 1 : 1;
  const slug = cs109LectureSlugs[lectureNumber - 1];
  const lectureUrl = `${cs109Url}lectures/${slug}/`;
  const slideUrl = `${lectureUrl}${slug}.pdf`;
  const readerPage = cs109ReaderPages[index];
  const readerPageUrl = `${cs109ReaderUrl}#page=${readerPage}`;
  const questionUrl = `https://cs109psets.netlify.app/fall22/lecture${lectureNumber}/`;
  const problemSet = cs109ProblemSet(index);
  lesson.date = cs109Dates[index];
  lesson.topics = cs109Topics[index];
  lesson.description = index < 28
    ? `Official Stanford CS109 lecture on ${cs109Topics[index].join(", ")}. Study the video with the lecture deck, worked lecture questions, the matching course-reader chapter, and its connected problem set.`
    : "A supplemental counting recording retained because it appears in the supplied official playlist. Use it as a second explanation and retrieval-practice session for the opening material.";
  const slideMaterial: StudyMaterial[] = index === 26 ? [] : [{
      type: "pdf", label: `Lecture ${lectureNumber} slide deck`,
      url: `/api/course-pdf?document=cs109-lecture-${lectureNumber}`,
      sourceUrl: slideUrl, sourceLabel: "Open original Stanford PDF ↗",
      description: `The complete official slide deck for ${lesson.title}.`, group: "lecture slides",
    }];
  lesson.studyMaterials = [
    ...slideMaterial,
    {
      type: "pdf", label: `Course reader - relevant chapter from page ${readerPage}`,
      url: `/api/course-pdf?document=cs109-reader#page=${readerPage}`,
      sourceUrl: readerPageUrl, sourceLabel: "Open full course reader ↗",
      description: "The supplied Probability for Computer Scientists reader opens at the chapter aligned to this lecture.", group: "course reader",
    },
  ];
  lesson.resources?.push(
    { label: `Lecture ${lectureNumber} course page`, url: lectureUrl, kind: "course" },
    ...(index === 26 ? [] : [{ label: `Lecture ${lectureNumber} slides`, url: slideUrl, kind: "slides" } as Resource]),
    { label: `Lecture ${lectureNumber} questions`, url: questionUrl, kind: "assignment" },
    { label: `Course reader from page ${readerPage}`, url: readerPageUrl, kind: "reading" },
    problemSet,
  );
  lesson.scheduleEntries = [{
    date: cs109Dates[index], description: lesson.title,
    lectureMaterials: [
      { label: `Official lecture ${lectureNumber} page`, url: lectureUrl, kind: "course" },
      ...(index === 26 ? [] : [{ label: "Slide deck", url: slideUrl, kind: "slides" } as Resource]),
      { label: "Worked lecture questions", url: questionUrl, kind: "assignment" },
    ],
    readings: [{ label: `Probability for Computer Scientists - page ${readerPage}`, url: readerPageUrl, kind: "reading" }],
    courseMaterialNote: "The embedded reader is positioned at the chapter that supports this lecture.",
    eventText: "Use the matched problem set for retrieval practice after the lecture and reading.", eventResources: [problemSet],
    deadline: "", deadlineResources: [],
  }];
});

const ee274Url = "https://stanforddatacompressionclass.github.io/Fall23/";
const ee274LecturesUrl = `${ee274Url}lectures/`;
const ee274NotesUrl = "https://stanforddatacompressionclass.github.io/notes/contents.html";
const ee274PlaylistUrl = "https://www.youtube.com/playlist?list=PLoROMvodv4rPj4uhbgUAaEKwNNak8xgkz";
const ee274 = parseLessons("ee274-fall-2023", `
FF7DRogZZdY::1:02:40::Course Introduction and Lossless Compression Basics
EKdlz3vae04::1:16:36::Prefix-Free Codes
kbAif7XhlTI::1:17:02::Kraft Inequality, Entropy, and the Stanford Compression Library
975qcAxZCG0::1:15:09::Huffman Codes
yeKngztLcBs::1:20:03::Asymptotic Equipartition Property
L4n2u1TTkO4::1:17:34::Arithmetic Coding
5Hp4bnvSjng::1:20:03::Asymmetric Numeral Systems
tGPF2nw5Exc::1:16:25::Beyond IID Sources and Conditional Entropy
B8ucNShRwjQ::1:19:52::Context-Based Arithmetic Coding and LLM Compression
amv9LiGyY5s::1:24:38::Lempel-Ziv and Universal Compression
YEF0iCiQlOg::1:24:27::Lossy Compression Basics and Quantization
9Fv8PlpPUCI::1:24:50::Mutual Information and the Rate-Distortion Function
9ZcYlFYqAhU::1:21:23::Gaussian Rate-Distortion, Water Filling, and Transform Coding
eaMrplHvxlg::1:28:03::Transform Coding for Images and Audio
pMNVQIZa-G8::1:24:15::Image Compression: JPEG and BPG
H7dvh35xNuE::1:21:18::Learned Image Compression
LE6GLWv63wc::1:18:39::Humans and Compression
uKnEZKpZKVA::1:08:39::Video Compression and Course Conclusions
`, ee274LecturesUrl);

type Ee274LessonData = {
  date: string;
  topics: string[];
  notes: Array<[string, string]>;
  slides: Array<[string, string]>;
  extras: Array<[string, string, Resource["kind"]]>;
};

const ee274LessonData: Ee274LessonData[] = [
  { date: "September 27, 2023", topics: ["lossless compression", "codes", "entropy models"], notes: [["Lossless compression introduction", "https://stanforddatacompressionclass.github.io/notes/lossless_iid/intro.html"]], slides: [["1-part1", "Lecture 1 slides - part 1"], ["1-part2", "Lecture 1 slides - part 2"], ["1-part2-annotated", "Lecture 1 annotated slides - part 2"]], extras: [["Lecture 1 Keynote deck", `${ee274Url}static_files/L1_part1.key`, "slides"], ["Quiz 1", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-1-lossless-data-compression-basics", "assignment"]] },
  { date: "October 2, 2023", topics: ["prefix-free codes", "unique decodability", "code trees"], notes: [["Prefix-free codes notes", "https://stanforddatacompressionclass.github.io/notes/lossless_iid/prefix_free_codes.html"]], slides: [["2", "Lecture 2 annotated slides"]], extras: [["Prefix-free compressor code", "https://github.com/kedartatwawadi/stanford_compression_library/blob/main/scl/compressors/prefix_free_compressors.py", "project"], ["Quiz 2", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-2-prefix-free-codes", "assignment"]] },
  { date: "October 4, 2023", topics: ["Kraft inequality", "entropy", "negative log-likelihood", "SCL"], notes: [["Kraft inequality and optimality", "https://stanforddatacompressionclass.github.io/notes/lossless_iid/kraft_ineq_and_optimality.html"], ["Entropy notes", "https://stanforddatacompressionclass.github.io/notes/lossless_iid/entropy.html"]], slides: [["3", "Lecture 3 annotated slides"]], extras: [["Quiz 3", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-3-kraft-inequality-entropy", "assignment"]] },
  { date: "October 9, 2023", topics: ["Huffman coding", "optimal prefix codes", "expected code length"], notes: [["Huffman coding notes", "https://stanforddatacompressionclass.github.io/notes/lossless_iid/huffman.html"]], slides: [["4", "Lecture 4 annotated slides"]], extras: [["Huffman coder implementation", "https://github.com/kedartatwawadi/stanford_compression_library/blob/main/scl/compressors/huffman_coder.py", "project"], ["Quiz 4", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-4-huffman-codes", "assignment"]] },
  { date: "October 11, 2023", topics: ["AEP", "typical sets", "block coding"], notes: [["Asymptotic equipartition property notes", "https://stanforddatacompressionclass.github.io/notes/lossless_iid/aep.html"]], slides: [["5", "Extended Huffman and AEP slides"]], extras: [["Typical-set coder", "https://github.com/kedartatwawadi/stanford_compression_library/blob/main/scl/compressors/typical_set_coder.py", "project"], ["Block-coding Colab", "https://colab.research.google.com/drive/16ZVLXaExecJWL5lxvtv5JV0HAjNjcmKY?usp=sharing", "project"], ["Quiz 5", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-5-asymptotic-equipartition-property", "assignment"]] },
  { date: "October 16, 2023", topics: ["arithmetic coding", "interval refinement", "entropy coding"], notes: [["Arithmetic coding notes", "https://stanforddatacompressionclass.github.io/notes/lossless_iid/arithmetic_coding.html"]], slides: [["6", "Lecture 6 annotated slides"]], extras: [["Arithmetic entropy coder", "https://github.com/kedartatwawadi/stanford_compression_library/blob/main/scl/compressors/arithmetic_coding.py", "project"], ["Quiz 6", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-6-arithmetic-coding", "assignment"]] },
  { date: "October 18, 2023", topics: ["ANS", "rANS", "tANS", "finite-state entropy coding"], notes: [["Asymmetric numeral systems notes", "https://stanforddatacompressionclass.github.io/notes/lossless_iid/ans.html"]], slides: [["7", "Lecture 7 slides"], ["7-annotated", "Lecture 7 annotated slides"]], extras: [["rANS implementation", "https://github.com/kedartatwawadi/stanford_compression_library/blob/main/scl/compressors/rANS.py", "project"], ["tANS implementation", "https://github.com/kedartatwawadi/stanford_compression_library/blob/main/scl/compressors/tANS.py", "project"], ["Quiz 7", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-7-asymmetric-numeral-systems", "assignment"]] },
  { date: "October 23, 2023", topics: ["non-IID sources", "conditional entropy", "entropy rate"], notes: [["Non-IID sources and entropy-rate notes", "https://stanforddatacompressionclass.github.io/notes/lossless_iid/non_iid_sources.html"]], slides: [["8", "Lecture 8 slides"]], extras: [["Quiz 8", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-8-beyond-iid-distributions-conditional-entropy", "assignment"]] },
  { date: "October 25, 2023", topics: ["context models", "arithmetic coding", "language-model compression"], notes: [["Context-based coding notes", "https://stanforddatacompressionclass.github.io/notes/lossless_iid/context_based_coding.html"]], slides: [["9", "Lecture 9 annotated slides"]], extras: [["Probability-model code", "https://github.com/kedartatwawadi/stanford_compression_library/blob/main/scl/compressors/probability_models.py", "project"], ["Arithmetic-coding code", "https://github.com/kedartatwawadi/stanford_compression_library/blob/main/scl/compressors/arithmetic_coding.py", "project"], ["Quiz 9", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-9-context-based-ac--llm-compression", "assignment"]] },
  { date: "October 30, 2023", topics: ["LZ77", "universal compression", "sliding windows", "practical compressors"], notes: [["LZ77 notes", "https://stanforddatacompressionclass.github.io/notes/lossless_iid/lz77.html"], ["Practical lossless-compression tips", "https://stanforddatacompressionclass.github.io/notes/lossless_iid/practical_tips.html"]], slides: [["10", "Lecture 10 slides"], ["10-annotated", "Lecture 10 annotated slides"]], extras: [["LZ77 compressor", "https://github.com/kedartatwawadi/stanford_compression_library/blob/main/scl/compressors/lz77.py", "project"], ["LZ77 sliding-window implementation", "https://github.com/kedartatwawadi/stanford_compression_library/blob/main/scl/compressors/lz77_sliding_window.py", "project"], ["Quiz 10", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-10-lz-and-universal-compression", "assignment"]] },
  { date: "November 1, 2023", topics: ["lossy compression", "scalar quantization", "distortion"], notes: [["Quantization notes", "https://stanforddatacompressionclass.github.io/notes/lossy/quant.html"]], slides: [["11", "Lecture 11 slides"], ["11-annotated", "Lecture 11 annotated slides"]], extras: [["Quantization Colab", "https://colab.research.google.com/drive/16dYjBEc499HgHoZRxcyeg0YmNAb5AwAW?usp=sharing", "project"], ["Quiz 11", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-11-lossy-compression-basics-quantization", "assignment"]] },
  { date: "November 6, 2023", topics: ["mutual information", "rate-distortion theory", "optimal lossy codes"], notes: [["Rate-distortion notes", "https://stanforddatacompressionclass.github.io/notes/lossy/rd.html"]], slides: [["12", "Lecture 12 slides"]], extras: [["Quiz 12", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-12-mutual-information-rate-distortion-function", "assignment"]] },
  { date: "November 8, 2023", topics: ["Gaussian rate-distortion", "water filling", "transform coding"], notes: [["Transform-coding theory notes", "https://stanforddatacompressionclass.github.io/notes/lossy/transform_coding_theory.html"]], slides: [["13", "Lecture 13 slides"], ["13-annotated", "Lecture 13 annotated slides"]], extras: [["Quiz 13", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-13-gaussian-rd-water-filling-intuition-transform-coding", "assignment"]] },
  { date: "November 13, 2023", topics: ["transform coding", "image transforms", "audio compression"], notes: [], slides: [["14", "Lecture 14 slides"], ["14-annotated", "Lecture 14 annotated slides"]], extras: [["Transform-coding Colab", "https://colab.research.google.com/drive/1Zcnjlco0HEbiTQWvcpiPYA9HbtfB829x#scrollTo=u2mT08CIzvuw", "project"], ["Audio-compression Colab", "https://colab.research.google.com/drive/13e81Rgv5KNbT1P_fcguPvldtedogkEJZ#scrollTo=McjXr-nVIII1", "project"], ["Quiz 14", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-14-transform-coding-in-real-life-image-audio-etc", "assignment"]] },
  { date: "November 15, 2023", topics: ["JPEG", "BPG", "image codecs", "perceptual quality"], notes: [], slides: [["15", "Lecture 15 slides"], ["15-annotated", "Lecture 15 annotated slides"]], extras: [["Quiz 15", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-15-image-compression-jpeg-bpg", "assignment"]] },
  { date: "November 27, 2023", topics: ["learned image compression", "neural codecs", "entropy models"], notes: [], slides: [["16", "Lecture 16 slides"]], extras: [["Learned-compression Colab", "https://colab.research.google.com/drive/1O3eQAaxlyLYI1HO7K1b12eJQsQKxjWwx?usp=sharing", "project"], ["Quiz 16", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-16-learnt-image-compression", "assignment"]] },
  { date: "November 29, 2023", topics: ["human perception", "perceptual compression", "rate-distortion-perception"], notes: [], slides: [["17", "Lecture 17 slides"]], extras: [["Quiz 17", "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html#quiz-17-humans-and-compression", "assignment"]] },
  { date: "December 4, 2023", topics: ["video codecs", "temporal prediction", "motion compensation", "course synthesis"], notes: [], slides: [["18", "Video-compression slides"], ["18-conclusion", "Course-conclusion slides"]], extras: [] },
];

ee274.forEach((lesson, index) => {
  const data = ee274LessonData[index];
  const slideResources: Resource[] = data.slides.map(([id, label]) => ({ label, url: `https://stanforddatacompressionclass.github.io/Fall23/static_files/${({
    "1-part1": "L1_part1.pdf", "1-part2": "L1_part2.pdf", "1-part2-annotated": "L1_part2_ann.pdf", "2": "L2_ann.pdf", "3": "L3_ann.pdf", "4": "L4_ann.pdf", "5": "L4_extended.pdf", "6": "L6_ann.pdf", "7": "L7.pdf", "7-annotated": "L7_ann.pdf", "8": "L8.pdf", "9": "L9_ann.pdf", "10": "L10.pdf", "10-annotated": "L10_ann.pdf", "11": "slide_11_2023.pdf", "11-annotated": "slide_11_2023_ann.pdf", "12": "slide_12_2023.pdf", "13": "slide_13_2023.pdf", "13-annotated": "slide_13_2023_ann.pdf", "14": "L14_ann.pdf", "14-annotated": "L14.pdf", "15": "L15.pdf", "15-annotated": "L15_ann.pdf", "16": "slide_16_2023.pdf", "17": "slide_17_2023.pdf", "18": "L18.pdf", "18-conclusion": "L18_conclusion.pdf",
  } as Record<string, string>)[id]}`, kind: "slides" }));
  const noteResources: Resource[] = data.notes.map(([label, url]) => ({ label, url, kind: "reading" }));
  const extraResources: Resource[] = data.extras.map(([label, url, kind]) => ({ label, url, kind }));
  lesson.date = data.date;
  lesson.topics = data.topics;
  lesson.description = `Official Stanford EE274 lecture covering ${data.topics.join(", ")}. Work through the recording with every published slide deck, note chapter, quiz, implementation, and notebook attached to this class.`;
  lesson.studyMaterials = data.slides.map(([id, label], slideIndex) => ({
    type: "pdf", label, url: `/api/course-pdf?document=ee274-${id}`,
    sourceUrl: slideResources[slideIndex].url, sourceLabel: "Open original Stanford PDF ↗",
    description: `The complete official ${label.toLowerCase()} for ${lesson.title}.`, group: "lecture slides",
  }));
  lesson.resources?.push(...slideResources, ...noteResources, ...extraResources);
  lesson.scheduleEntries = [{
    date: data.date, description: lesson.title, lectureMaterials: slideResources,
    readings: noteResources, courseMaterialNote: noteResources.length ? "Official EE274 notes aligned directly to this lecture." : "No separate note chapter was published for this lecture.",
    eventText: extraResources.length ? "Practice with the official quiz, code, or notebook resources published for this class." : "",
    eventResources: extraResources, deadline: "", deadlineResources: [],
  }];
});

const ee274ScheduleExtras: ScheduleEntry[] = [{
  date: "December 6, 2023", description: "Student presentations", lectureMaterials: [], readings: [], courseMaterialNote: "",
  eventText: "The official course timeline concludes with student presentations; no public recording or separate materials were published.",
  eventResources: [{ label: "Lecture 19 schedule entry", url: ee274LecturesUrl, kind: "project" }], deadline: "", deadlineResources: [],
}];

const coursePastelAccents: Record<string, string> = {
  cs50x: "#b87948",
  cs61b: "#5f8a70",
  cs186: "#b6607e",
  "cs50-ai": "#7562a5",
  cs221: "#5574b8",
  cs109: "#6c86bd",
  cs229: "#8266ad",
  "mit-6s191": "#7f8545",
  cs230: "#c77a50",
  ee274: "#a87342",
  cme295: "#507fa0",
  cs224n: "#3f988c",
  cs231n: "#cf7b55",
  "mit-61810": "#557e89",
  cs144: "#507fae",
  cs149: "#b95f62",
  cs336: "#659b63",
  cs224r: "#b28a32",
  cs329a: "#9b735f",
  cs25: "#b45d9b",
};

const roadmapOrder = [
  "cs50x", "cs61b", "cs186", "cs109", "cs50-ai", "cs221", "cs229", "ee274", "mit-6s191", "cs230",
  "cs231n", "cme295", "cs224n", "mit-61810", "cs144", "cs149", "cs336", "cs224r", "cs329a", "cs25",
];

export const courses: Course[] = [
  {
    slug: "cs50x", code: "CS50x", title: "Introduction to Computer Science", institution: "Harvard University", edition: "2026 OpenCourseWare · 12 complete lecture modules", sourceNote: "Every current CS50x lecture is paired with its public notes, slides, source code, transcript, sections, shorts, and problem-set hub. The AI special lecture is retained between SQL and web development, matching Harvard's official week sequence.", level: "Starting point", accent: "#b87948", description: "Learn computational thinking and practical programming from scratch, progressing through C, memory, algorithms, data structures, Python, SQL, web development, and a final project.", prerequisites: ["No previous programming experience required"], outcomes: ["Program confidently in C and Python", "Reason about algorithms, memory, and data structures", "Build database-backed web applications"], courseUrl: "https://cs50.harvard.edu/x/", playlistUrl: "https://www.youtube.com/playlist?list=PLhQjrBD2T380hlTqAU8HfvVepCcjCqTg6", resources: [
      { label: "CS50x 2026 OpenCourseWare", url: "https://cs50.harvard.edu/x/", kind: "course" },
      { label: "Complete week sequence", url: "https://cs50.harvard.edu/x/weeks/", kind: "course" },
      { label: "Problem sets", url: "https://cs50.harvard.edu/x/psets/", kind: "assignment" },
      { label: "Final project", url: "https://cs50.harvard.edu/x/project/", kind: "project" },
      { label: "Official YouTube playlist", url: "https://www.youtube.com/playlist?list=PLhQjrBD2T380hlTqAU8HfvVepCcjCqTg6", kind: "video" },
    ], lessons: newCourseData.cs50x,
  },
  {
    slug: "cs61b", code: "CS61B", title: "Data Structures", institution: "University of California, Berkeley", edition: "Spring 2025 · 40 class sections · 39 public recordings", sourceNote: "The complete Spring 2025 sequence is retained with its exact decks, readings, code, discussions, labs, homework, and projects. Lecture 12 is a resource-led midterm-preparation class because no public recording was published.", level: "Programming foundation", accent: "#5f8a70", description: "Develop the programming maturity required for serious AI and systems work through Java, software design, asymptotic analysis, trees, hashing, graphs, sorting, compression, and computational complexity.", prerequisites: ["CS50x or equivalent programming background", "Comfort with functions, recursion, and debugging"], outcomes: ["Implement core data structures", "Analyze time and space complexity", "Design larger, testable software systems"], courseUrl: "https://sp25.datastructur.es/", resources: [
      { label: "Spring 2025 schedule", url: "https://sp25.datastructur.es/", kind: "course" },
      { label: "Lecture code", url: "https://github.com/Berkeley-CS61B/lectureCode-sp25", kind: "course" },
      { label: "CS61B online textbook", url: "https://cs61b-2.gitbook.io/cs61b-textbook/", kind: "reading" },
      { label: "Labs", url: "https://sp25.datastructur.es/labs/", kind: "assignment" },
      { label: "Projects", url: "https://sp25.datastructur.es/projects/", kind: "project" },
    ], lessons: newCourseData.cs61b,
  },
  {
    slug: "cs186", code: "CS186", title: "Introduction to Database Systems", institution: "University of California, Berkeley", edition: "Spring 2025 materials · 181 mapped topic videos", sourceNote: "All 27 Spring 2025 classes retain their public decks, discussions, worksheets, solutions, and projects. The supplied 217-video library is organized inside the corresponding classes; 181 directly matching topic clips are used, while unrelated archive topics are excluded. Classes without a reliable video match remain resource-led.", level: "Data and systems foundation", accent: "#b6607e", description: "Understand how database systems store, index, query, optimize, coordinate, recover, distribute, and scale data—from SQL and B+ trees to parallel execution, transactions, NoSQL, MapReduce, and Spark.", prerequisites: ["CS61B-level Java and data structures", "Computer architecture such as CS61C is expected or should be taken concurrently"], outcomes: ["Implement database internals", "Optimize relational queries", "Reason about transactions, recovery, and distributed data systems"], courseUrl: "https://cs186berkeley.net/sp25/", playlistUrl: "https://www.youtube.com/playlist?list=PLYp4IGUhNFmw8USiYMJvCUjZe79fvyYge", resources: [
      { label: "Spring 2025 schedule", url: "https://cs186berkeley.net/sp25/", kind: "course" },
      { label: "Public course notes", url: "https://cs186berkeley.net/notes/", kind: "reading" },
      { label: "Database projects", url: "https://cs186.gitbook.io/project/", kind: "project" },
      { label: "Topic-video library", url: "https://www.youtube.com/playlist?list=PLYp4IGUhNFmw8USiYMJvCUjZe79fvyYge", kind: "video" },
      { label: "Join animations", url: "https://cs186berkeley.net/resources/join-animations/", kind: "assignment" },
    ], lessons: newCourseData.cs186,
  },
  {
    slug: "cs50-ai", code: "CS50 AI", title: "Introduction to Artificial Intelligence with Python", institution: "Harvard University", edition: "Current OpenCourseWare · 7 complete modules", sourceNote: "All seven current modules use Harvard's official public lecture, notes, PDF slides, source code, transcript, quiz, and project materials. The recordings are the versions Harvard currently publishes on the course pages.", level: "AI bridge", accent: "#7562a5", description: "Build an intuitive, project-driven introduction to search, knowledge representation, uncertainty, optimization, machine learning, neural networks, and language before moving into the more mathematical Stanford AI sequence.", prerequisites: ["CS50x or equivalent", "At least one year of Python experience is an accepted alternative"], outcomes: ["Implement classical AI algorithms", "Build probabilistic and learning systems", "Complete seven substantial Python AI projects"], courseUrl: "https://cs50.harvard.edu/ai/", playlistUrl: "https://www.youtube.com/playlist?list=PLhQjrBD2T381PopUTYtMSstgk-hsTGkVm", resources: [
      { label: "CS50 AI OpenCourseWare", url: "https://cs50.harvard.edu/ai/", kind: "course" },
      { label: "Seven-week curriculum", url: "https://cs50.harvard.edu/ai/weeks/", kind: "course" },
      { label: "Projects", url: "https://cs50.harvard.edu/ai/projects/", kind: "project" },
      { label: "Official YouTube playlist", url: "https://www.youtube.com/playlist?list=PLhQjrBD2T381PopUTYtMSstgk-hsTGkVm", kind: "video" },
    ], lessons: newCourseData.cs50ai,
  },
  {
    slug: "cs231n", code: "CS231n", title: "Deep Learning for Computer Vision", institution: "Stanford University", edition: "Spring 2025 · 18 complete official recordings", sourceNote: "The supplied playlist is the complete Spring 2025 Stanford series—not an older edition. All 18 recordings are paired with the corresponding 2025 slide PDFs, syllabus topics, and suggested readings.", level: "Deep-learning specialization", accent: "#cf7b55", description: "Develop research-level computer-vision depth across linear classifiers, convolutional and recurrent networks, Transformers, detection, segmentation, video, self-supervision, generative models, 3D vision, multimodality, robotics, and human-centered AI.", prerequisites: ["Python and NumPy", "Calculus and linear algebra", "CS109-level probability", "CS229/CS230-level machine learning and deep learning recommended"], outcomes: ["Train modern vision architectures", "Read and reproduce computer-vision research", "Design multimodal and embodied visual systems"], courseUrl: "https://cs231n.stanford.edu/2025/", playlistUrl: "https://www.youtube.com/playlist?list=PLoROMvodv4rOmsNzYBMe0gJY2XS8AQg16", resources: [
      { label: "Spring 2025 schedule", url: "https://cs231n.stanford.edu/2025/schedule.html", kind: "course" },
      { label: "Assignments", url: "https://cs231n.stanford.edu/2025/assignments.html", kind: "assignment" },
      { label: "Useful course notes", url: "https://cs231n.github.io/", kind: "reading" },
      { label: "Final project", url: "https://cs231n.stanford.edu/2025/project.html", kind: "project" },
      { label: "Official Spring 2025 playlist", url: "https://www.youtube.com/playlist?list=PLoROMvodv4rOmsNzYBMe0gJY2XS8AQg16", kind: "video" },
    ], lessons: newCourseData.cs231n,
  },
  {
    slug: "mit-61810", code: "MIT 6.1810", title: "Operating System Engineering", institution: "Massachusetts Institute of Technology", edition: "Fall 2025 · 23 resource-led lectures", sourceNote: "MIT does not publish the 2025 recordings publicly, so this course intentionally contains no substitute videos. Every lecture retains its official notes, xv6 source references, preparation, homework, papers, and corresponding lab materials.", level: "Systems foundation", accent: "#557e89", description: "Learn operating-system design by extending xv6: system calls, virtual memory, drivers, synchronization, scheduling, networking, file systems, recovery, multi-core scalability, virtualization, extensibility, and security.", prerequisites: ["Strong C programming", "Computer architecture such as MIT 6.1910/6.004", "Data structures and debugging"], outcomes: ["Read and modify a real teaching kernel", "Implement core operating-system mechanisms", "Reason about performance, concurrency, isolation, and recovery"], courseUrl: "https://pdos.csail.mit.edu/6.1810/2025/schedule.html", resources: [
      { label: "Fall 2025 schedule", url: "https://pdos.csail.mit.edu/6.1810/2025/schedule.html", kind: "course" },
      { label: "xv6 source", url: "https://github.com/mit-pdos/xv6-riscv", kind: "course" },
      { label: "xv6 book", url: "https://github.com/mit-pdos/xv6-riscv-book", kind: "reading" },
      { label: "Laboratory sequence", url: "https://pdos.csail.mit.edu/6.1810/2025/tools.html", kind: "assignment" },
      { label: "Course overview", url: "https://pdos.csail.mit.edu/6.1810/2025/overview.html", kind: "course" },
    ], lessons: newCourseData.mit61810,
  },
  {
    slug: "cs144", code: "CS144", title: "Introduction to Computer Networking", institution: "Stanford University", edition: "Current materials · complete 145-video Stanford archive", sourceNote: "The current recordings are restricted to Stanford Canvas. Instead of substituting another university, this course uses Stanford's own complete public CS144 archive: all 145 working topic videos are organized into nine units and paired with the current public notes, handouts, labs, and checkpoints.", level: "Systems foundation", accent: "#507fae", description: "Understand the Internet end-to-end and implement its core mechanisms through IP, transport, packet switching, congestion control, applications, routing, physical/link layers, and network security.", prerequisites: ["Operating-systems fundamentals such as MIT 6.1810", "Strong C/C++ programming", "Stanford formally lists CS111 or equivalent"], outcomes: ["Explain the Internet architecture precisely", "Implement reliable transport and an IP router", "Analyze routing, congestion, link layers, and network security"], courseUrl: "https://cs144.github.io/", playlistUrl: "https://www.youtube.com/playlist?list=PL6RdenZrxrw9inR-IJv-erlOKRHjymxMN", resources: [
      { label: "Current CS144 course", url: "https://cs144.github.io/", kind: "course" },
      { label: "Complete 145-video archive", url: "https://www.youtube.com/playlist?list=PL6RdenZrxrw9inR-IJv-erlOKRHjymxMN", kind: "video" },
      { label: "Checkpoint 0: networking warmup", url: "https://cs144.github.io/assignments/check0.pdf", kind: "assignment" },
      { label: "Checkpoint 1: byte stream", url: "https://cs144.github.io/assignments/check1.pdf", kind: "assignment" },
      { label: "Checkpoint 2: TCP receiver", url: "https://cs144.github.io/assignments/check2.pdf", kind: "assignment" },
      { label: "Checkpoint 3: TCP sender", url: "https://cs144.github.io/assignments/check3.pdf", kind: "assignment" },
      { label: "Checkpoint 5: network interface", url: "https://cs144.github.io/assignments/check5.pdf", kind: "assignment" },
      { label: "Checkpoint 6: IP router", url: "https://cs144.github.io/assignments/check6.pdf", kind: "assignment" },
      { label: "Computer Networks: A Systems Approach", url: "https://book.systemsapproach.org/", kind: "reading" },
    ], lessons: newCourseData.cs144,
  },
  {
    slug: "cs221", code: "CS221", title: "Artificial Intelligence: Principles and Techniques", institution: "Stanford University", edition: "Autumn 2025 · 20 official lectures", sourceNote: "The Autumn 2025 syllabus is paired with Stanford Online's complete official Autumn 2025 lecture playlist.", level: "Foundation", accent: "#3157d5", description: "A rigorous foundation in modern artificial intelligence: learning, search, decision-making, uncertainty, logic, games, language models, and the societal consequences of AI systems.", prerequisites: ["Programming", "Discrete mathematics", "Probability", "Linear algebra"], outcomes: ["Implement core AI algorithms", "Model uncertainty and sequential decisions", "Reason about logic, search, and responsible AI"], courseUrl: cs221Url, playlistUrl: "https://www.youtube.com/playlist?list=PLoROMvodv4rMeDqwS1yFl3j3sR_-MQNEN", resources: [
      { label: "Autumn 2025 syllabus", url: cs221Url, kind: "course" },
      { label: "Autumn 2025 executable lectures", url: "https://github.com/stanford-cs221/autumn2025-lectures", kind: "slides" },
      { label: "Coursework", url: `${cs221Url}#coursework`, kind: "assignment" },
      { label: "AIMA textbook", url: "https://aima.cs.berkeley.edu/", kind: "reading" },
      { label: "RL textbook", url: "http://incompleteideas.net/book/the-book-2nd.html", kind: "reading" },
    ], lessons: cs221,
  },
  {
    slug: "cs109", code: "CS109", title: "Probability for Computer Scientists", institution: "Stanford University", edition: "Fall 2022 · 29-video official playlist", sourceNote: "All 29 supplied playlist videos are retained in order. The 28 scheduled classes are matched to their exact lecture pages, complete slide PDFs, questions, problem sets, dates, and the relevant pages of the 264-page course reader; the final duplicate counting recording is clearly marked as supplemental.", level: "Mathematical foundation", accent: "#6c86bd", description: "Build the probability foundation required for machine learning and AI research, from counting, conditioning, random variables, and inference to estimation, probabilistic classifiers, fairness, and generative models.", prerequisites: ["High-school algebra", "Comfort with functions and sums", "Basic programming is helpful"], outcomes: ["Model uncertainty rigorously", "Derive and use common probability distributions", "Apply inference and estimation to machine learning"], courseUrl: cs109ScheduleUrl, playlistUrl: cs109PlaylistUrl, resources: [
      { label: "Fall 2022 schedule", url: cs109ScheduleUrl, kind: "course" },
      { label: "Official YouTube playlist", url: cs109PlaylistUrl, kind: "video" },
      { label: "Probability for Computer Scientists reader", url: cs109ReaderUrl, kind: "reading" },
      { label: "Interactive course reader", url: "https://chrispiech.github.io/probabilityForComputerScientists/en/", kind: "reading" },
      { label: "Problem Set 1: Counting", url: "https://cs109psets.netlify.app/fall22/pset1/", kind: "assignment" },
      { label: "Problem Set 2: Core Probability", url: "https://cs109psets.netlify.app/fall22/pset2/", kind: "assignment" },
      { label: "Problem Set 3: Random Variables", url: "https://cs109psets.netlify.app/fall22/pset3/", kind: "assignment" },
      { label: "Problem Set 4: Probabilistic Models", url: "https://cs109psets.netlify.app/fall22/pset4/", kind: "assignment" },
      { label: "Problem Set 5: Uncertainty Theory", url: "https://cs109psets.netlify.app/fall22/pset5/", kind: "assignment" },
      { label: "Problem Set 6: Machine Learning", url: "https://cs109psets.netlify.app/fall22/pset6/", kind: "assignment" },
      ...Array.from({ length: 9 }, (_, index) => ({ label: `Section ${index + 1} handout and solution`, url: `${cs109Url}section/${index + 1}/`, kind: "assignment" as const })),
    ], lessons: cs109,
  },
  {
    slug: "cs229", code: "CS229", title: "Machine Learning", institution: "Stanford University", edition: "Spring 2026 · 17 official videos", sourceNote: "The Spring 2026 course hub is paired with Stanford Online's current public lecture playlist.", level: "Core", accent: "#7c3aed", description: "The mathematical and algorithmic core of machine learning, from generalized linear models and neural networks to diffusion models, Transformers, representation learning, and reinforcement learning.", prerequisites: ["Python and NumPy", "Probability", "Multivariable calculus", "Linear algebra"], outcomes: ["Derive major ML algorithms", "Diagnose generalization errors", "Choose and evaluate models rigorously"], courseUrl: cs229Url, playlistUrl: "https://www.youtube.com/playlist?list=PLaqpC4kq8Gpw", resources: [
      { label: "Spring 2026 course hub", url: cs229Url, kind: "course" },
      { label: "Course notes", url: "https://cs229.stanford.edu/main_notes.pdf", kind: "reading" },
      { label: "Summer 2026 lecture-to-notes map", url: cs229SyllabusMap, kind: "course" },
      { label: "Course materials", url: "https://cs229.stanford.edu/", kind: "assignment" },
    ], lessons: cs229,
  },
  {
    slug: "mit-6s191", code: "MIT 6.S191", title: "Introduction to Deep Learning", institution: "Massachusetts Institute of Technology", edition: "2026 · 9 official lectures", sourceNote: "All nine current 2026 recordings are matched to the official schedule and complete slide decks, with three coding labs, the Lab 2 research paper, and final-project milestones integrated in context.", level: "Core bridge", accent: "#7f8545", description: "A fast, practical bridge from machine-learning foundations to modern deep learning, spanning neural networks, sequence and vision models, generative modeling, reinforcement learning, LLMs, AI safety, science, and large-scale training.", prerequisites: ["Elementary linear algebra", "Calculus and the chain rule", "Python is helpful but not required", "CS229-level ML recommended for this roadmap"], outcomes: ["Build and train core neural-network architectures", "Implement sequence, vision, generative, and reinforcement-learning systems", "Connect fundamentals to LLMs, scientific AI, and distributed training"], courseUrl: mit6s191Url, playlistUrl: mit6s191PlaylistUrl, resources: [
      { label: "Official 2026 course and schedule", url: mit6s191Url, kind: "course" },
      { label: "Official YouTube playlist", url: mit6s191PlaylistUrl, kind: "video" },
      { label: "Course code and notebooks", url: mit6s191RepositoryUrl, kind: "course" },
      { label: "Lab 1: Python & Music Generation", url: `${mit6s191RepositoryUrl}/tree/master/lab1`, kind: "assignment" },
      { label: "Lab 2: Facial Detection Systems", url: `${mit6s191RepositoryUrl}/tree/master/lab2`, kind: "assignment" },
      { label: "Lab 3: Fine-Tune an LLM", url: `${mit6s191RepositoryUrl}/tree/master/lab3`, kind: "assignment" },
      { label: "Lab 2 algorithmic-bias paper", url: mit6s191Lab2PaperUrl, kind: "reading" },
      { label: "Course MIT license", url: `${mit6s191RepositoryUrl}/blob/master/LICENSE.md`, kind: "course" },
    ], lessons: mit6s191, scheduleExtras: mit6s191ScheduleExtras,
  },
  {
    slug: "cs230", code: "CS230", title: "Deep Learning", institution: "Stanford University", edition: "Autumn 2025 · 9 official videos", sourceNote: "Every video in Stanford Online's official Autumn 2025 playlist is included in its published order.", level: "Core", accent: "#c2410c", description: "Design, train, debug, and ship deep-learning systems while learning how to structure ambitious AI projects and read the research literature.", prerequisites: ["Machine learning fundamentals", "Python", "Linear algebra", "Probability"], outcomes: ["Build robust deep networks", "Plan full-cycle AI projects", "Evaluate generative and agentic systems"], courseUrl: cs230Url, playlistUrl: "https://www.youtube.com/playlist?list=PLoROMvodv4rNRRGdS0rBbXOUGA0wjdh1X", resources: [
      { label: "Full syllabus", url: cs230Url, kind: "course" },
      { label: "Lecture archive", url: "https://cs230.stanford.edu/lecture/", kind: "slides" },
      { label: "Sections", url: "https://cs230.stanford.edu/section/", kind: "slides" },
      { label: "Project guide", url: "https://cs230.stanford.edu/project/", kind: "project" },
      { label: "Deep Learning Specialization", url: "https://www.coursera.org/specializations/deep-learning", kind: "assignment" },
    ], lessons: cs230,
  },
  {
    slug: "ee274", code: "EE274", title: "Data Compression: Theory and Applications", institution: "Stanford University", edition: "Fall 2023 · 18 official recordings", sourceNote: "Every public playlist video is matched to the official date, topic, slide decks, annotated decks, note chapters, quizzes, implementations, and Colab notebooks. The unrecorded student-presentation class is preserved as a schedule event.", level: "Theory and systems specialization", accent: "#a87342", description: "Connect information theory to real compression systems: lossless coding, entropy, arithmetic coding, ANS, Lempel-Ziv, quantization, rate-distortion theory, transform codecs, learned image compression, perception, and video.", prerequisites: ["CS109-level probability", "Linear algebra", "Programming", "CS229 and CS230 recommended for learned compression"], outcomes: ["Derive limits for lossless and lossy compression", "Implement practical entropy and universal coders", "Analyze classical and learned image, audio, and video codecs"], courseUrl: ee274LecturesUrl, playlistUrl: ee274PlaylistUrl, resources: [
      { label: "Fall 2023 lecture schedule", url: ee274LecturesUrl, kind: "course" },
      { label: "Official YouTube playlist", url: ee274PlaylistUrl, kind: "video" },
      { label: "Complete course notes", url: ee274NotesUrl, kind: "reading" },
      { label: "Lossless-compression notes", url: "https://stanforddatacompressionclass.github.io/notes/lossless_iid/coverpage.html", kind: "reading" },
      { label: "Lossy-compression notes", url: "https://stanforddatacompressionclass.github.io/notes/lossy/coverpage.html", kind: "reading" },
      { label: "Stanford Compression Library tutorial", url: "https://stanforddatacompressionclass.github.io/notes/scl_tutorial/SCL_tutorial.html", kind: "project" },
      { label: "Stanford Compression Library repository", url: "https://github.com/kedartatwawadi/stanford_compression_library", kind: "project" },
      { label: "Assignments", url: `${ee274Url}assignments/`, kind: "assignment" },
      { label: "2023 quiz problems", url: "https://stanforddatacompressionclass.github.io/notes/quiz_problems_2023.html", kind: "assignment" },
    ], lessons: ee274, scheduleExtras: ee274ScheduleExtras,
  },
  {
    slug: "cme295", code: "CME 295", title: "Transformers & Large Language Models", institution: "Stanford University", edition: "Autumn 2025 · 9 official lectures", sourceNote: "All nine official Autumn 2025 recordings are matched to their Stanford syllabus topics and complete slide decks, with the public cheatsheet, textbook, midterm, final, and solutions included.", level: "Core bridge", accent: "#507fa0", description: "A focused bridge from deep-learning fundamentals to modern Transformer and LLM research, covering architecture, efficient attention, training, preference tuning, reasoning, agents, RAG, and evaluation.", prerequisites: ["CS229-level machine learning", "Deep-learning fundamentals", "Linear algebra", "Calculus"], outcomes: ["Explain Transformer and LLM architectures", "Compare modern training and tuning methods", "Design agentic and evaluation pipelines"], courseUrl: cme295Url, playlistUrl: cme295PlaylistUrl, resources: [
      { label: "Autumn 2025 syllabus", url: `${cme295Url}syllabus/`, kind: "course" },
      { label: "Official YouTube playlist", url: cme295PlaylistUrl, kind: "video" },
      { label: "Official visual cheatsheet", url: cme295CheatsheetPdf, kind: "reading" },
      { label: "Cheatsheet source repository", url: "https://github.com/afshinea/stanford-cme-295-transformers-large-language-models", kind: "course" },
      { label: "Super Study Guide textbook", url: "https://superstudy.guide/transformers-large-language-models/", kind: "reading" },
      { label: "Course FAQ", url: `${cme295Url}faq/`, kind: "course" },
    ], lessons: cme295, scheduleExtras: cme295ScheduleExtras,
  },
  {
    slug: "cs224n", code: "CS224N", title: "Natural Language Processing with Deep Learning", institution: "Stanford University", edition: "Spring 2024 · 23 official videos", sourceNote: "Every video in the official playlist is included in its published order, including the companion lectures and tutorials.", level: "Specialization", accent: "#0f766e", description: "From word vectors and sequence models to Transformers, post-training, language-model evaluation, reasoning, multimodality, and interpretability.", prerequisites: ["Python", "Calculus and linear algebra", "Probability", "Machine learning foundations"], outcomes: ["Build neural NLP models", "Understand modern LLM training", "Design and evaluate NLP research"], courseUrl: cs224nUrl, playlistUrl: "https://www.youtube.com/playlist?list=PLoROMvodv4rOaMFbaqxPDoLWjDaRAdP9D", resources: [
      { label: "Course syllabus", url: cs224nUrl, kind: "course" },
      { label: "Schedule and slides", url: `${cs224nUrl}#schedule`, kind: "slides" },
      { label: "Assignments", url: `${cs224nUrl}#coursework`, kind: "assignment" },
      { label: "Project reports", url: "https://web.stanford.edu/class/archive/cs/cs224n/cs224n.1246/project.html", kind: "project" },
      { label: "Speech and Language Processing", url: "https://web.stanford.edu/~jurafsky/slp3/", kind: "reading" },
    ], lessons: cs224n, scheduleExtras: cs224nScheduleData.courseExtras,
  },
  {
    slug: "cs149", code: "CS149", title: "Parallel Computing", institution: "Stanford University", edition: "Fall 2023 · 19-video playlist", sourceNote: "All 19 videos in the supplied Stanford playlist are included in order, with the Fall 2023 schedule, lecture pages, slide decks, and assignment materials matched by topic and date.", level: "Systems", accent: "#b91c1c", description: "Understand the hardware–software tradeoffs behind modern parallel systems, then learn to program multi-core CPUs, GPUs, distributed data systems, and specialized accelerators efficiently.", prerequisites: ["Strong systems programming", "Computer architecture", "C/C++", "Performance analysis"], outcomes: ["Reason about parallel performance", "Program GPUs and multi-core CPUs", "Optimize memory, locality, and scheduling"], courseUrl: cs149Url, playlistUrl: "https://www.youtube.com/playlist?list=PLoROMvodv4rMp7MTFr4hQsDEcX7Bx6Odp", resources: [
      { label: "Course schedule", url: cs149Url, kind: "course" },
      { label: "All lecture materials", url: "https://gfxcourses.stanford.edu/cs149/fall23/lecture/", kind: "slides" },
      { label: "Programming assignment 1", url: "https://github.com/stanford-cs149/asst1", kind: "assignment" },
      { label: "Programming assignment 2", url: "https://github.com/stanford-cs149/asst2", kind: "assignment" },
      { label: "CUDA renderer assignment", url: "https://github.com/stanford-cs149/asst3", kind: "assignment" },
      { label: "Flash Attention assignment", url: "https://github.com/stanford-cs149/cs149gpt", kind: "assignment" },
      { label: "Optional graph assignment", url: "https://github.com/stanford-cs149/biggraphs-ec", kind: "assignment" },
    ], lessons: cs149, scheduleExtras: cs149ScheduleExtras,
  },
  {
    slug: "cs336", code: "CS336", title: "Language Modeling from Scratch", institution: "Stanford University", edition: "Spring 2026", sourceNote: "The complete Spring 2026 public lecture series includes all nine executable lectures and all eight official lecture PDFs, each embedded in its matching lesson.", level: "Advanced", accent: "#0369a1", description: "Build a language model end-to-end: tokenization, architecture, kernels, distributed training, scaling laws, inference, data, evaluation, alignment, and reasoning RL.", prerequisites: ["Excellent Python", "Deep learning", "Systems optimization", "Probability and linear algebra"], outcomes: ["Implement a Transformer stack", "Train efficiently across accelerators", "Build data, evaluation, and post-training pipelines"], courseUrl: cs336Url, playlistUrl: "https://www.youtube.com/playlist?list=PLoROMvodv4rMqXOcazWaTUHhq-yembLCV", resources: [
      { label: "Course schedule", url: `${cs336Url}#schedule`, kind: "course" },
      { label: "Assignment 1: Basics", url: "https://github.com/stanford-cs336/assignment1-basics", kind: "assignment" },
      { label: "Assignment 2: Systems", url: "https://github.com/stanford-cs336/assignment2-systems", kind: "assignment" },
      { label: "Assignment 3: Scaling", url: "https://github.com/stanford-cs336/assignment3-scaling", kind: "assignment" },
      { label: "Assignment 4: Data", url: "https://github.com/stanford-cs336/assignment4-data", kind: "assignment" },
      { label: "Assignment 5: Alignment", url: "https://github.com/stanford-cs336/assignment5-alignment", kind: "assignment" },
      { label: "Executable lectures and PDFs", url: "https://cs336.stanford.edu/lectures/", kind: "slides" },
      { label: "Lecture source repository", url: "https://github.com/stanford-cs336/lectures/tree/main", kind: "course" },
    ], lessons: cs336,
  },
  {
    slug: "cs224r", code: "CS224R", title: "Deep Reinforcement Learning", institution: "Stanford University", edition: "Spring 2025 videos · Spring 2026 timeline", sourceNote: "All 18 public Spring 2025 videos remain in playlist order and are matched by topic to the complete current Spring 2026 timeline, slides, deadlines, notes, and optional readings.", level: "Advanced", accent: "#a16207", description: "Practical deep reinforcement learning for robotics and language models, spanning imitation, policy optimization, offline RL, preference learning, model-based RL, and hierarchical behavior.", prerequisites: ["CS229-level machine learning", "Deep learning and PyTorch", "Basic reinforcement learning", "Probability and calculus"], outcomes: ["Implement modern deep-RL algorithms", "Learn from demonstrations and feedback", "Design research in robotics and LLM reasoning"], courseUrl: cs224rUrl, playlistUrl: "https://www.youtube.com/playlist?list=PLma5Mp2OM6lvhjZfbjql4MNwhBJVxEu5a", resources: [
      { label: "Spring 2026 syllabus and timeline", url: cs224rUrl, kind: "course" },
      { label: "Spring 2026 timeline materials", url: `${cs224rUrl}#timeline`, kind: "slides" },
      { label: "Homework and templates", url: `${cs224rUrl}#timeline`, kind: "assignment" },
      { label: "2025 project reports", url: "https://cs224r.stanford.edu/spring_2025/projects/cs224r_final_projects.html", kind: "project" },
      { label: "2026 project reports", url: "https://cs224r.stanford.edu/projects/cs224r_final_projects.html", kind: "project" },
      { label: "Sutton & Barto", url: "http://incompleteideas.net/book/the-book-2nd.html", kind: "reading" },
    ], lessons: cs224r, scheduleExtras: cs224rTimelineData.courseExtras,
  },
  {
    slug: "cs329a", code: "CS329A", title: "Self-Improving AI Agents", institution: "Stanford University", edition: "Autumn 2025 · 9 official parts", sourceNote: "Every public video is matched by topic to the official Autumn 2025 classes and paper readings; the remaining guest lectures, presentations, holidays, and project events are preserved separately.", level: "Frontier", accent: "#9333ea", description: "A research seminar on AI systems that improve through verification, feedback, search, reinforcement learning, tools, memory, planning, and robust long-horizon evaluation.", prerequisites: ["Modern LLMs", "Reinforcement learning", "Research-paper fluency", "Strong implementation skills"], outcomes: ["Analyze self-improvement loops", "Design agent evaluation protocols", "Identify original research directions"], courseUrl: cs329aUrl, playlistUrl: "https://www.youtube.com/playlist?list=PLQee6_HxjShg", resources: [
      { label: "Complete schedule and paper list", url: `${cs329aUrl}index.html#schedule`, kind: "course" },
      { label: "Past projects", url: "https://cs329a.stanford.edu/pastprojects.html", kind: "project" },
      { label: "Large Language Monkeys", url: "https://arxiv.org/abs/2407.21787", kind: "reading" },
      { label: "ReAct", url: "https://arxiv.org/abs/2210.03629", kind: "reading" },
      { label: "STaR", url: "https://arxiv.org/abs/2203.14465", kind: "reading" },
      { label: "MemGPT", url: "https://arxiv.org/abs/2310.08560", kind: "reading" },
      { label: "Long-task evaluation", url: "https://arxiv.org/abs/2503.14499", kind: "reading" },
    ], lessons: cs329a, scheduleExtras: cs329aScheduleData.courseExtras,
  },
  {
    slug: "cs25", code: "CS25", title: "Transformers United", institution: "Stanford University", edition: "Spring 2026 V6 · 16-video official collection", sourceNote: "All nine Spring 2026 V6 talks are matched to every field in Stanford's official table, including speakers, full descriptions, papers, and all seven published slide links. The final seven videos are clearly retained as earlier-edition archive talks.", level: "Frontier seminar", accent: "#be185d", description: "A living seminar on the frontier of Transformer research: world models, state-space models, ultra-scale training, pretraining, generalization, collaborative agents, multimodality, and production inference.", prerequisites: ["Transformer fundamentals", "Deep learning", "Research-paper literacy"], outcomes: ["Track current Transformer research", "Connect systems and modeling tradeoffs", "Formulate frontier research questions"], courseUrl: cs25Url, playlistUrl: "https://www.youtube.com/playlist?list=PLoROMvodv4rPZxxeUFvQHCkZJsaEBdDZj", resources: [
      { label: "V6 seminar schedule", url: cs25Url, kind: "course" },
      { label: "Recording archive", url: "https://web.stanford.edu/class/cs25/recordings/", kind: "video" },
      { label: "Overview slides", url: "https://drive.google.com/file/d/153Gu4BIfpnn6jj6WmXlsyD7kv702zcrB/view", kind: "slides" },
      { label: "Discord community", url: "https://discord.gg/eKu6RNr3aG", kind: "course" },
    ], lessons: cs25,
  },
]
  .map((course) => ({ ...course, accent: coursePastelAccents[course.slug] ?? course.accent }))
  .sort((first, second) => roadmapOrder.indexOf(first.slug) - roadmapOrder.indexOf(second.slug));

export const courseBySlug = Object.fromEntries(courses.map((course) => [course.slug, course]));
export const totalLessons = courses.reduce((total, course) => total + course.lessons.length, 0);

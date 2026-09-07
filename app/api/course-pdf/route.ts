export const dynamic = "force-dynamic";

type CoursePdf = { url: string; fileName: string };

const cs109BaseUrl = "https://web.stanford.edu/class/archive/cs/cs109/cs109.1232/";
const cs109LectureSlugs = [
  "1-Welcome", "2-Combinatorics", "3-IntroProbability", "4-ConditioningAndBayes", "5-Independence",
  "6-RandomVariables", "7-BernoulliBinomial", "8-Poisson", "9-Continuous", "10-Gaussian",
  "11-ProbabilisticModels", "12-Inference", "13-Inference2", "14-Modeling", "15-GeneralInference",
  "16-Beta", "17-Adding", "18-Sampling", "19-Bootstrapping", "20-AlgorithmAnalysis",
  "21-MaximumLikelihoodEstimation", "22-MaximumAPosteriori", "23-NaiveBayes", "24-LogisticRegression",
  "25-DeepLearning", "26-Ethics", "27-DallEGPT", "28-Future",
];

const ee274PdfFiles: Record<string, string> = {
  "1-part1": "L1_part1.pdf", "1-part2": "L1_part2.pdf", "1-part2-annotated": "L1_part2_ann.pdf",
  "2": "L2_ann.pdf", "3": "L3_ann.pdf", "4": "L4_ann.pdf", "5": "L4_extended.pdf",
  "6": "L6_ann.pdf", "7": "L7.pdf", "7-annotated": "L7_ann.pdf", "8": "L8.pdf",
  "9": "L9_ann.pdf", "10": "L10.pdf", "10-annotated": "L10_ann.pdf",
  "11": "slide_11_2023.pdf", "11-annotated": "slide_11_2023_ann.pdf", "12": "slide_12_2023.pdf",
  "13": "slide_13_2023.pdf", "13-annotated": "slide_13_2023_ann.pdf",
  "14": "L14_ann.pdf", "14-annotated": "L14.pdf", "15": "L15.pdf", "15-annotated": "L15_ann.pdf",
  "16": "slide_16_2023.pdf", "17": "slide_17_2023.pdf", "18": "L18.pdf", "18-conclusion": "L18_conclusion.pdf",
};

const documents: Record<string, CoursePdf> = Object.fromEntries([
  ...Array.from({ length: 9 }, (_, index) => {
    const lecture = index + 1;
    return [
      `cme295-lecture-${lecture}`,
      {
        url: `https://cme295.stanford.edu/slides/fall25-cme295-lecture${lecture}.pdf`,
        fileName: `cme295-lecture-${lecture}.pdf`,
      },
    ];
  }),
  ...cs109LectureSlugs.flatMap((slug, index) => index === 26 ? [] : [[
      `cs109-lecture-${index + 1}`,
      {
        url: `${cs109BaseUrl}lectures/${slug}/${slug}.pdf`,
        fileName: `cs109-lecture-${index + 1}.pdf`,
      },
    ]]),
  ...Object.entries(ee274PdfFiles).map(([id, fileName]) => [
    `ee274-${id}`,
    {
      url: `https://stanforddatacompressionclass.github.io/Fall23/static_files/${fileName}`,
      fileName: `ee274-${fileName}`,
    },
  ]),
  [
    "cs109-reader",
    {
      url: "https://chrispiech.github.io/probabilityForComputerScientists/en/ProbabilityForComputerScientists.pdf",
      fileName: "ProbabilityForComputerScientists.pdf",
    },
  ],
  ...Array.from({ length: 9 }, (_, index) => {
    const lecture = index + 1;
    return [
      `mit6s191-lecture-${lecture}`,
      {
        url: `https://introtodeeplearning.com/slides/6S191_MIT_DeepLearning_L${lecture}.pdf`,
        fileName: `mit-6s191-lecture-${lecture}.pdf`,
      },
    ];
  }),
  [
    "cme295-cheatsheet",
    {
      url: "https://raw.githubusercontent.com/afshinea/stanford-cme-295-transformers-large-language-models/main/en/cheatsheet-transformers-large-language-models.pdf",
      fileName: "cme295-transformers-llms-cheatsheet.pdf",
    },
  ],
  [
    "mit6s191-lab2-paper",
    {
      url: "https://introtodeeplearning.com/AAAI_MitigatingAlgorithmicBias.pdf",
      fileName: "mit-6s191-lab2-algorithmic-bias.pdf",
    },
  ],
]);

export async function GET(request: Request) {
  const documentId = new URL(request.url).searchParams.get("document") ?? "";
  const document = documents[documentId];

  if (!document) return new Response("PDF not found.", { status: 404 });

  try {
    const range = request.headers.get("range");
    const upstream = await fetch(document.url, {
      headers: { Accept: "application/pdf", ...(range ? { Range: range } : {}) },
      redirect: "follow",
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("The course PDF is temporarily unavailable.", { status: 502 });
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${document.fileName}"`,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "X-Content-Type-Options": "nosniff",
        "Accept-Ranges": upstream.headers.get("accept-ranges") ?? "bytes",
      };
    for (const name of ["content-range", "content-length"]) {
      const value = upstream.headers.get(name);
      if (value) headers[name] = value;
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch {
    return new Response("The course PDF is temporarily unavailable.", { status: 502 });
  }
}

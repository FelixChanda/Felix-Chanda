var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var geminiClient = null;
function getGeminiClient() {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return geminiClient;
}
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/generate-summary", async (req, res) => {
  try {
    const { resource } = req.body;
    if (!resource || !resource.title) {
      return res.status(400).json({ error: "Valid resource object is required." });
    }
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        summary: [
          `Title: ${resource.title}`,
          `Category: ${resource.category}`,
          `Description: ${resource.description}`,
          `Please configure GEMINI_API_KEY for AI-powered summaries.`
        ]
      });
    }
    let resourceContentDigest = `Title: ${resource.title}
Description: ${resource.description}
`;
    if (resource.highYieldKeyPoints) {
      resourceContentDigest += `Key Points: ${resource.highYieldKeyPoints.join("; ")}
`;
    }
    if (resource.sections) {
      resourceContentDigest += `Sections: ${resource.sections.map((s) => s.title).join(", ")}
`;
    }
    const prompt = `Please provide a brief, high-level bulleted summary (3-5 concise bullet points) for this nursing resource to help with rapid revision:
${resourceContentDigest}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a concise nursing educator providing quick revision summaries. Return a JSON array of strings containing 3-5 high-yield bullet points.",
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.ARRAY,
          items: { type: import_genai.Type.STRING }
        }
      }
    });
    const summaryData = JSON.parse(response.text?.trim() || "[]");
    res.json({ summary: summaryData });
  } catch (error) {
    console.warn("Summary generation error:", error?.message || error);
    res.json({
      summary: [
        `${req.body.resource.title}`,
        `${req.body.resource.description}`,
        "Detailed AI summary currently unavailable. Please review the main document."
      ]
    });
  }
});
app.post("/api/generate-flashcards", async (req, res) => {
  try {
    const { resource, count = 8, focusMode = "all" } = req.body;
    if (!resource || !resource.title) {
      return res.status(400).json({ error: "Valid resource object is required." });
    }
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        source: "local_fallback_no_key",
        cards: [],
        message: "No GEMINI_API_KEY configured. Utilizing standardized clinical curriculum generator."
      });
    }
    let resourceContentDigest = `Title: ${resource.title}
`;
    resourceContentDigest += `Category: ${resource.category}
`;
    resourceContentDigest += `Domain / Specialty: ${resource.domain}
`;
    resourceContentDigest += `Academic Year Level: ${resource.yearLevel}
`;
    resourceContentDigest += `Description: ${resource.description}
`;
    if (resource.moduleCode) resourceContentDigest += `Module Code: ${resource.moduleCode}
`;
    if (resource.learningOutcomes?.length) {
      resourceContentDigest += `Learning Outcomes:
- ${resource.learningOutcomes.join("\n- ")}
`;
    }
    if (resource.syllabus?.length) {
      resourceContentDigest += `Syllabus Units:
`;
      resource.syllabus.forEach((u) => {
        resourceContentDigest += `  * Unit ${u.unitNumber}: ${u.title} (Topics: ${u.topics?.join(", ")}; Competencies: ${u.keyCompetencies?.join(", ")})
`;
      });
    }
    if (resource.questions?.length) {
      resourceContentDigest += `Past Exam Questions:
`;
      resource.questions.forEach((q) => {
        resourceContentDigest += `  * Q${q.number}: ${q.questionText}
    Marking Scheme: ${q.markingScheme}
    Rationale: ${q.clinicalRationale}
`;
      });
    }
    if (resource.tableOfContents?.length) {
      resourceContentDigest += `Textbook Chapters:
`;
      resource.tableOfContents.forEach((ch) => {
        resourceContentDigest += `  * Ch ${ch.chapterNumber}: ${ch.title} - ${ch.summary}
    Pearls: ${ch.keyPearls?.join("; ")}
`;
      });
    }
    if (resource.highYieldKeyPoints?.length) {
      resourceContentDigest += `High-Yield Points:
- ${resource.highYieldKeyPoints.join("\n- ")}
`;
    }
    if (resource.sections?.length) {
      resource.sections.forEach((s) => {
        resourceContentDigest += `Section "${s.title}": ${s.content}
`;
        if (s.callout) resourceContentDigest += `Alert (${s.callout.type}): ${s.callout.text}
`;
      });
    }
    const focusInstructions = focusMode === "nclex" ? "Focus specifically on NCLEX-RN high-yield scenario questions, priority nursing action questions (who to see first, airway/breathing/circulation priority), and safety alerts." : focusMode === "pharmacology" ? "Focus specifically on drug mechanisms, high-alert administration rules, toxicities, contraindications, antidote pairings, and patient education." : focusMode === "rationales" ? "Focus specifically on differentiating signs, pathophysiology rationales, and clinical diagnostic interpretations." : "Provide a balanced mix of Priority Actions, NCLEX Scenarios, Diagnostic Signs, and Core Recall questions.";
    const systemInstruction = `You are a Senior Nurse Educator and NCLEX-RN exam board specialist creating high-yield active-recall quiz cards for nursing students from the DATANURSE nursing database.
You must construct exactly ${count} quiz cards directly based on the provided nursing resource.
Every flashcard must have:
- question: Clear, challenging, clinically accurate nursing question (e.g., patient presentation, clinical priority, or medication alert).
- answer: Direct, unambiguous target clinical answer.
- category: One of 'Priority Action', 'NCLEX Case', 'Clinical Rationale', 'Drug & Pharmacology', 'Diagnostic Sign', or 'Core Recall'.
- explanation: Clear, evidence-based nursing rationale explaining WHY this answer is correct and why other assumptions fail.
- keyPearl: High-yield memory pearl, NCLEX tip, or critical patient safety warning.
- difficulty: 'Standard', 'Clinical Challenge', or 'NCLEX High-Yield'.

Ensure 100% clinical accuracy, professional nursing terminology (e.g., ADPIE, ABCs, NANDA guidelines), and clear distinction between subjective and objective signs.`;
    const prompt = `Resource Information:
${resourceContentDigest}

Task:
Generate ${count} flashcards adhering to focus: ${focusInstructions}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              id: { type: import_genai.Type.STRING },
              question: { type: import_genai.Type.STRING },
              answer: { type: import_genai.Type.STRING },
              category: {
                type: import_genai.Type.STRING,
                enum: [
                  "Priority Action",
                  "NCLEX Case",
                  "Clinical Rationale",
                  "Drug & Pharmacology",
                  "Diagnostic Sign",
                  "Core Recall"
                ]
              },
              explanation: { type: import_genai.Type.STRING },
              keyPearl: { type: import_genai.Type.STRING },
              difficulty: {
                type: import_genai.Type.STRING,
                enum: ["Standard", "Clinical Challenge", "NCLEX High-Yield"]
              }
            },
            required: ["question", "answer", "category", "explanation", "keyPearl"]
          }
        }
      }
    });
    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error("Empty response from Gemini model");
    }
    const cards = JSON.parse(responseText);
    const sanitizedCards = cards.map((c, index) => ({
      ...c,
      id: c.id || `ai-card-${resource.id}-${index + 1}`
    }));
    return res.json({
      source: "gemini_api",
      cards: sanitizedCards
    });
  } catch (error) {
    console.warn("Gemini generation unavailable, generating structured clinical cards:", error?.message || error);
    const fallbackCards = buildServerClinicalCards(req.body.resource, req.body.count || 8);
    return res.json({
      source: "clinical_curriculum_engine",
      cards: fallbackCards,
      note: "Generated via structured clinical engine (Gemini model experiencing temporary high demand)."
    });
  }
});
function buildServerClinicalCards(resource, targetCount = 8) {
  const list = [];
  let idx = 1;
  if (resource.questions && Array.isArray(resource.questions)) {
    resource.questions.forEach((q) => {
      let ans = q.markingScheme;
      if (q.options && q.correctOptionIndex !== void 0) {
        ans = `${q.options[q.correctOptionIndex]} (Option ${String.fromCharCode(65 + q.correctOptionIndex)})`;
      }
      list.push({
        id: `card-${resource.id}-${idx++}`,
        question: q.questionText,
        answer: ans,
        category: q.type === "scenario_case" ? "NCLEX Case" : "Clinical Rationale",
        explanation: q.clinicalRationale || q.markingScheme,
        keyPearl: q.highYieldTip || "Priority rule: Assess physiological stability before delegating.",
        difficulty: "NCLEX High-Yield"
      });
    });
  }
  if (resource.syllabus && Array.isArray(resource.syllabus)) {
    resource.syllabus.forEach((u) => {
      if (u.keyCompetencies) {
        u.keyCompetencies.forEach((comp) => {
          list.push({
            id: `card-${resource.id}-${idx++}`,
            question: `In "${resource.title}", Unit ${u.unitNumber} (${u.title}): What clinical protocol demonstrates "${comp}"?`,
            answer: `Adhere strictly to evidence-based nursing procedures covering: ${u.topics?.slice(0, 3).join(", ")}.`,
            category: "Priority Action",
            explanation: `Unit ${u.unitNumber} core competencies emphasize ${u.title}.`,
            keyPearl: "Competency Check: Verify patient identity using 2 identifiers prior to any bedside procedure.",
            difficulty: "Standard"
          });
        });
      }
    });
  }
  if (resource.tableOfContents && Array.isArray(resource.tableOfContents)) {
    resource.tableOfContents.forEach((ch) => {
      if (ch.keyPearls) {
        ch.keyPearls.forEach((p) => {
          list.push({
            id: `card-${resource.id}-${idx++}`,
            question: `Chapter ${ch.chapterNumber} ("${ch.title}") Key Pearl: What is the essential clinical guideline?`,
            answer: p,
            category: "Clinical Rationale",
            explanation: ch.summary,
            keyPearl: `High-yield takeaway from ${resource.title}.`,
            difficulty: "NCLEX High-Yield"
          });
        });
      }
    });
  }
  if (resource.highYieldKeyPoints && Array.isArray(resource.highYieldKeyPoints)) {
    resource.highYieldKeyPoints.forEach((pt) => {
      list.push({
        id: `card-${resource.id}-${idx++}`,
        question: `Clinical High-Yield Alert for ${resource.title}: What must the nurse prioritize?`,
        answer: pt,
        category: "Priority Action",
        explanation: `Essential safety recommendation for ${resource.domain}.`,
        keyPearl: "Safety Alert: Never bypass independent double-check for high-alert medications.",
        difficulty: "NCLEX High-Yield"
      });
    });
  }
  if (list.length === 0) {
    list.push({
      id: `card-${resource.id}-default-1`,
      question: `What are the primary clinical objectives of ${resource.title}?`,
      answer: resource.description || "Mastery of specialized nursing assessment, evidence-based care, and patient safety protocols.",
      category: "Core Recall",
      explanation: `Core domain: ${resource.domain} (${resource.yearLevel}).`,
      keyPearl: "Remember the ADPIE nursing process framework.",
      difficulty: "Standard"
    });
  }
  return list.slice(0, Math.max(targetCount, 5));
}
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DATANURSE Server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

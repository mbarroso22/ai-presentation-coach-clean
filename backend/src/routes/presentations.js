const express = require("express");
const router = express.Router();

const dotenv = require("dotenv");
dotenv.config();

const OpenAI = require("openai");

const {
  createPresentation,
  listPresentations,
  getPresentation,
  updatePresentation,
} = require("../data/presentationsStore");

// ---------------- Azure OpenAI client setup ----------------

const azureClient = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL:
    process.env.AZURE_OPENAI_ENDPOINT +
    "openai/deployments/" +
    process.env.AZURE_OPENAI_DEPLOYMENT,
  defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
});

// ---------------- REST routes ----------------

// POST /api/presentations
// Body: { title: string, slides: [{ title, content }] }
router.post("/", (req, res) => {
  const { title, slides } = req.body;
  if (!title || !Array.isArray(slides)) {
    return res.status(400).json({ error: "title and slides[] are required" });
  }

  const pres = createPresentation({ title, slides });
  res.status(201).json(pres);
});

// GET /api/presentations
router.get("/", (req, res) => {
  res.json(listPresentations());
});

// GET /api/presentations/:id
router.get("/:id", (req, res) => {
  const pres = getPresentation(req.params.id);
  if (!pres) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(pres);
});

// POST /api/presentations/:id/analyze
// Now uses Azure OpenAI instead of mock analysis
router.post("/:id/analyze", async (req, res) => {
  const pres = getPresentation(req.params.id);
  if (!pres) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    // Build summary text of slides for the prompt
    const slidesText = pres.slides
      .map(
        (slide, index) =>
          `Slide ${index} (slideIndex=${index})\nTitle: ${slide.title}\nContent: ${
            slide.content || ""
          }`
      )
      .join("\n\n");

    const userPrompt = `
You are an expert presentation coach.

Analyze the following slides and return a JSON array.
Each element of the array should have:

- "slideIndex": the 0-based slide index (integer)
- "importance": one of "low", "medium", or "high"
- "expectedTimeSeconds": integer between 20 and 120
- "speakerNotes": 2–4 helpful sentences with guidance on how to present the slide
- "keyPoints": an array of 1–3 short bullet phrases (strings)
- "speakingScript": a short paragraph (3–6 sentences) that the presenter could almost read word-for-word while on this slide
- "transitionToNext": 1–2 sentences that smoothly connect this slide to the next slide. If this is the last slide, write a closing line instead.

Slides:
${slidesText}

Return ONLY valid JSON (a JSON array). Do not include any extra commentary or text, no markdown, and no code fences.
`;

    const completion = await azureClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT,
      messages: [
        {
          role: "system",
          content:
            "You are a concise and structured presentation analysis assistant.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const rawContent = completion.choices[0].message.content.trim();

    // ---- strip ```json ... ``` fences if the model added them ----
    let cleaned = rawContent;
    const fenceMatch = cleaned.match(/```(?:json)?([\s\S]*?)```/i);
    if (fenceMatch) {
      cleaned = fenceMatch[1].trim();
    }

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse AI JSON.");
      console.error("Raw content:", rawContent);
      console.error("Cleaned content:", cleaned);
      return res
        .status(500)
        .json({ error: "AI returned invalid JSON.", raw: rawContent });
    }

    // Attach analysis to the presentation
    pres.analyzed = true;
    pres.analysis = analysis;
    updatePresentation(pres.id, pres);

    return res.json({
      message: "Analysis complete (Azure OpenAI)",
      presentation: pres,
    });
  } catch (err) {
    console.error("Error during AI analysis:", err);
    return res.status(500).json({ error: "Failed to analyze presentation" });
  }
});

// PUT /api/presentations/:id
// Allows updating analysis (edited notes, timing, etc.)
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const existing = getPresentation(id);

  if (!existing) {
    return res.status(404).json({ error: "Not found" });
  }

  // Partial update: merge existing with incoming fields
  const updated = {
    ...existing,
    ...req.body,
  };

  updatePresentation(existing.id, updated);

  return res.json(updated);
});

module.exports = router;

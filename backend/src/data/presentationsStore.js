// backend/data/presentationsStore.js

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "presentations.json");

let presentations = [];
let nextId = 1;

// Load from disk on startup (if file exists)
function loadFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8").trim();
      if (raw.length > 0) {
        const parsed = JSON.parse(raw);
        presentations = parsed.presentations || [];
        nextId = parsed.nextId || computeNextId();
        console.log(
          `[presentationsStore] Loaded ${presentations.length} presentations from disk.`
        );
        return;
      }
    }
    console.log("[presentationsStore] No existing data file, starting fresh.");
  } catch (err) {
    console.error("[presentationsStore] Failed to load data from disk:", err);
  }
}

// Compute nextId from existing presentations if needed
function computeNextId() {
  if (presentations.length === 0) return 1;
  return (
    Math.max(
      ...presentations.map((p) =>
        typeof p.id === "number" ? p.id : Number(p.id)
      )
    ) + 1
  );
}

// Save current state to disk
function saveToDisk() {
  try {
    const payload = {
      presentations,
      nextId,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
    // console.log("[presentationsStore] Saved presentations to disk.");
  } catch (err) {
    console.error("[presentationsStore] Failed to save data to disk:", err);
  }
}

// Initialize from file when module loads
loadFromDisk();

// ---- Public API functions ----

function createPresentation({ title, slides }) {
  const pres = {
    id: nextId++,
    title,
    slides,
    createdAt: new Date().toISOString(),
    analyzed: false,
    analysis: [],
  };
  presentations.push(pres);
  saveToDisk();
  return pres;
}

function listPresentations() {
  return presentations;
}

function getPresentation(id) {
  const numericId = Number(id);
  return presentations.find((p) => Number(p.id) === numericId) || null;
}

function updatePresentation(id, updatedData) {
  const numericId = Number(id);
  const index = presentations.findIndex((p) => Number(p.id) === numericId);
  if (index === -1) return null;

  presentations[index] = {
    ...presentations[index],
    ...updatedData,
  };

  saveToDisk();
  return presentations[index];
}

module.exports = {
  createPresentation,
  listPresentations,
  getPresentation,
  updatePresentation,
};

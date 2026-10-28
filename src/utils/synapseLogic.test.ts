import test from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_MODULES,
  INITIAL_STUDY_COUNTS,
  INITIAL_GOALS,
  getNeglectedModule,
  incrementStudyCount,
  generateSchedule,
  getFallbackFlashcards,
  getFallbackQuiz,
  getFallbackCheatSheet,
  calculateGoalProgress,
  didJustAchieveGoal,
  extractFrequentConcepts,
  parseCheatSheetContent,
  renameModuleData,
  deleteModuleData,
} from "./synapseLogic";

test("identifies Physics / Mechanics as initial neglected module with 0 sessions", () => {
  const result = getNeglectedModule(INITIAL_MODULES, INITIAL_STUDY_COUNTS);
  assert.equal(result.module, "Physics / Mechanics");
  assert.equal(result.count, 0);
});

test("dynamically shifts neglected module when counts change", () => {
  // If Physics / Mechanics is studied 2 times, Algorithms & Data Structures (count 1) becomes neglected
  let counts = { ...INITIAL_STUDY_COUNTS };
  counts = incrementStudyCount(counts, "Physics / Mechanics");
  counts = incrementStudyCount(counts, "Physics / Mechanics");

  assert.equal(counts["Physics / Mechanics"], 2);
  assert.equal(counts["Algorithms & Data Structures"], 1);

  const updated = getNeglectedModule(INITIAL_MODULES, counts);
  assert.equal(updated.module, "Algorithms & Data Structures");
  assert.equal(updated.count, 1);
});

test("schedule generator contains requested 08:00-12:00 and 14:00-18:00 partitions with dynamic 18:00 revision slot", () => {
  const schedule = generateSchedule("Physics / Mechanics");
  assert.equal(schedule.length, 7);

  // Check 08:00 - 10:00 and 10:00 - 12:00 (Morning 08:00 to 12:00)
  assert.equal(schedule[0].time, "08:00 - 10:00");
  assert.ok(schedule[0].monday.includes("Calculus"));
  assert.equal(schedule[1].time, "10:00 - 12:00");

  // Check 12:00 - 14:00 Lunch
  assert.equal(schedule[2].time, "12:00 - 14:00");

  // Check 14:00 - 16:00 and 16:00 - 18:00 (Afternoon 14:00 to 18:00)
  assert.equal(schedule[3].time, "14:00 - 16:00");
  assert.equal(schedule[4].time, "16:00 - 18:00");

  // Check dynamic 18:00 - 19:00 revision slot
  const dynamicSlot = schedule.find((s) => s.isDynamicSlot);
  assert.ok(dynamicSlot);
  assert.equal(dynamicSlot?.time, "18:00 - 19:00 ⚡");
  assert.equal(dynamicSlot?.monday, "⚡ REVISION: Physics / Mechanics");
});

test("schedule generator allows custom lecture modifications via overrides", () => {
  const overrides = {
    "08:00 - 10:00": {
      monday: "Advanced Robotics (Hall B)",
    },
  };
  const schedule = generateSchedule("Physics / Mechanics", overrides);
  assert.equal(schedule[0].monday, "Advanced Robotics (Hall B)");
  // Tuesday remains original
  assert.equal(schedule[0].tuesday, "Algorithms & Data Structures");
});

test("fallback flashcards return exactly 3 cards with question and answer", () => {
  const cards = getFallbackFlashcards("Physics / Mechanics");
  assert.equal(cards.length, 3);
  cards.forEach((card) => {
    assert.ok(card.q && card.q.length > 5);
    assert.ok(card.a && card.a.length > 5);
  });
});

test("fallback quiz returns 2 multiple-choice questions with 4 options and explanation", () => {
  const quiz = getFallbackQuiz("Calculus & Analysis");
  assert.equal(quiz.length, 2);
  quiz.forEach((q) => {
    assert.equal(q.options.length, 4);
    assert.ok(q.options.includes(q.answer));
    assert.ok(q.explanation.length > 5);
  });
});

test("fallback cheat sheet extracts markdown equations and sections", () => {
  const cheatSheet = getFallbackCheatSheet("Physics / Mechanics");
  assert.ok(cheatSheet.includes("Newton"));
  assert.ok(cheatSheet.includes("Energy"));
});

test("calculateGoalProgress correctly computes percentage, remaining, and completion", () => {
  // Calculus: count 4, target 5 -> 80%
  const prog1 = calculateGoalProgress(4, 5);
  assert.equal(prog1.percentage, 80);
  assert.equal(prog1.isCompleted, false);
  assert.equal(prog1.remaining, 1);

  // Physics: count 0, target 3 -> 0%
  const prog2 = calculateGoalProgress(0, 3);
  assert.equal(prog2.percentage, 0);
  assert.equal(prog2.isCompleted, false);
  assert.equal(prog2.remaining, 3);

  // Completed goal: count 5, target 5 -> 100%
  const prog3 = calculateGoalProgress(5, 5);
  assert.equal(prog3.percentage, 100);
  assert.equal(prog3.isCompleted, true);
  assert.equal(prog3.remaining, 0);

  // Exceeded goal: count 7, target 5 -> 100%
  const prog4 = calculateGoalProgress(7, 5);
  assert.equal(prog4.percentage, 100);
  assert.equal(prog4.isCompleted, true);
  assert.equal(prog4.remaining, 0);
});

test("didJustAchieveGoal triggers only when reaching or crossing target", () => {
  assert.equal(didJustAchieveGoal(4, 5, 5), true); // reached target
  assert.equal(didJustAchieveGoal(3, 4, 5), false); // still under target
  assert.equal(didJustAchieveGoal(5, 6, 5), false); // was already completed
});

test("extractFrequentConcepts identifies recurring key concepts and laws from notes", () => {
  const sampleNotes = `### Unit 2: Newton's Laws of Motion & Energy Conservation
- **Newton's First Law**: Inertia principle.
- **Newton's Second Law**: F = m*a rate of momentum.
- **Newton's Third Law**: Action-Reaction pairs.
- **Conservation of Mechanical Energy**: E = K + U.
- We repeatedly apply Newton's Second Law and Conservation of Energy in problem sets.`;

  const concepts = extractFrequentConcepts(sampleNotes);
  assert.ok(concepts.length >= 3);
  const terms = concepts.map((c) => c.term);
  assert.ok(terms.some((t) => t.includes("Newton")));
  assert.ok(terms.some((t) => t.includes("Energy") || t.includes("Conservation")));
});

test("renameModuleData successfully updates module name across modules, counts, goals, and notes", () => {
  const initialMods = ["Calculus & Analysis", "Physics / Mechanics"];
  const initialCounts = { "Calculus & Analysis": 4, "Physics / Mechanics": 0 };
  const initialGoals = {
    "Calculus & Analysis": { target: 5, timeframe: "weekly" as const },
    "Physics / Mechanics": { target: 3, timeframe: "weekly" as const },
  };
  const initialNotes = {
    "Calculus & Analysis": "Calc notes",
    "Physics / Mechanics": "Physics notes",
  };

  const res = renameModuleData(
    "Physics / Mechanics",
    "AP Physics C",
    initialMods,
    initialCounts,
    initialGoals,
    initialNotes
  );

  assert.deepEqual(res.modules, ["Calculus & Analysis", "AP Physics C"]);
  assert.equal(res.studyCounts["AP Physics C"], 0);
  assert.equal(res.studyCounts["Physics / Mechanics"], undefined);
  assert.equal(res.goals["AP Physics C"]?.target, 3);
  assert.equal(res.notes["AP Physics C"], "Physics notes");
});

test("deleteModuleData removes module and cleans up all related collections", () => {
  const initialMods = ["Calculus & Analysis", "Algorithms", "Physics"];
  const initialCounts = { "Calculus & Analysis": 4, "Algorithms": 1, "Physics": 0 };
  const initialGoals = {
    "Calculus & Analysis": { target: 5, timeframe: "weekly" as const },
    "Algorithms": { target: 4, timeframe: "weekly" as const },
    "Physics": { target: 3, timeframe: "weekly" as const },
  };
  const initialNotes = { "Calculus & Analysis": "C", "Algorithms": "A", "Physics": "P" };

  const res = deleteModuleData("Physics", initialMods, initialCounts, initialGoals, initialNotes);
  assert.deepEqual(res.modules, ["Calculus & Analysis", "Algorithms"]);
  assert.equal(res.studyCounts["Physics"], undefined);
  assert.equal(res.goals["Physics"], undefined);
  assert.equal(res.notes["Physics"], undefined);
});

test("parseCheatSheetContent extracts structured sections, titles, and formulas", () => {
  const rawMarkdown = `### 📐 Physics Cheat Sheet
#### 1. Fundamental Laws
- **Newton 1st (Inertia)**: $\\sum \\vec{F} = 0 \\implies \\vec{a} = 0$
- **Newton 2nd (Dynamics)**: $\\sum \\vec{F} = m \\vec{a}$
#### 2. Energy Relations
- **Work-Energy Theorem**: $W = \\Delta K$`;

  const sections = parseCheatSheetContent(rawMarkdown);
  assert.ok(sections.length >= 2);
  assert.ok(sections[0].title.includes("Fundamental Laws"));
  assert.equal(sections[0].items.length, 2);
  assert.equal(sections[0].items[0].term, "Newton 1st (Inertia)");
  assert.ok(sections[0].items[0].formula?.includes("vec{F}"));
});

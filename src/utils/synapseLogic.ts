/**
 * Pure business logic for Synapse Adaptive AI Study System
 * Decoupled from UI to enable rigorous unit testing and high performance.
 */

export interface Flashcard {
  q: string;
  a: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface ScheduleSlot {
  time: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  isDynamicSlot?: boolean;
}

export type GoalTimeframe = "weekly" | "monthly";

export interface ModuleGoal {
  target: number;
  timeframe: GoalTimeframe;
}

export const INITIAL_MODULES = [
  "Calculus & Analysis",
  "Algorithms & Data Structures",
  "Physics / Mechanics",
];

export const INITIAL_STUDY_COUNTS: Record<string, number> = {
  "Calculus & Analysis": 4,
  "Algorithms & Data Structures": 1,
  "Physics / Mechanics": 0,
};

export const INITIAL_GOALS: Record<string, ModuleGoal> = {
  "Calculus & Analysis": { target: 5, timeframe: "weekly" },
  "Algorithms & Data Structures": { target: 4, timeframe: "weekly" },
  "Physics / Mechanics": { target: 3, timeframe: "weekly" },
};

export interface GoalProgress {
  percentage: number;
  isCompleted: boolean;
  remaining: number;
}

export function calculateGoalProgress(count: number, target: number): GoalProgress {
  if (target <= 0) {
    return { percentage: 100, isCompleted: true, remaining: 0 };
  }
  const percentage = Math.min(100, Math.round((count / target) * 100));
  const isCompleted = count >= target;
  const remaining = Math.max(0, target - count);
  return { percentage, isCompleted, remaining };
}

export function didJustAchieveGoal(
  prevCount: number,
  newCount: number,
  target: number
): boolean {
  return prevCount < target && newCount >= target;
}

export const INITIAL_NOTES: Record<string, string> = {
  "Calculus & Analysis": `### Chapter 4: Integration by Parts & Taylor Series
- Integration by Parts formula:
  ∫ u dv = u*v - ∫ v du
  Memory rule: LIATE (Logarithmic, Inverse trig, Algebraic, Trig, Exponential).
- Fundamental Theorem of Calculus (Part 1):
  If F(x) = ∫[a to x] f(t) dt, then F'(x) = f(x).
- Fundamental Theorem of Calculus (Part 2):
  ∫[a to b] f(x) dx = F(b) - F(a) where F' = f.
- Taylor Series centered at x = a:
  f(x) = ∑ [f^(n)(a) / n!] * (x - a)^n
- Maclaurin Series (Taylor series at a = 0):
  e^x = 1 + x + x^2/2! + x^3/3! + ...
  sin(x) = x - x^3/3! + x^5/5! - ...
  cos(x) = 1 - x^2/2! + x^4/4! - ...`,

  "Algorithms & Data Structures": `### Topic 6: Graph Algorithms & Dynamic Programming
- Dijkstra's Single Source Shortest Path:
  Time complexity with min-heap priority queue: O((V + E) log V).
  Condition: Non-negative edge weights only.
- Bellman-Ford Algorithm:
  Handles negative edge weights, detects negative cycles in O(V * E) time.
- Dynamic Programming Core Properties:
  1. Optimal Substructure (solution of problem contains optimal solutions to subproblems)
  2. Overlapping Subproblems (memoization / tabulation).
- 0/1 Knapsack recurrence:
  dp[i][w] = max(dp[i-1][w], dp[i-1][w - wt[i-1]] + val[i-1]) if wt[i-1] <= w else dp[i-1][w]
- Master Theorem for divide and conquer:
  T(n) = a*T(n/b) + f(n). Compare f(n) with n^(log_b(a)).`,

  "Physics / Mechanics": `### Unit 2: Newton's Laws of Motion & Energy Conservation
- Newton's First Law (Inertia):
  An object continues in uniform motion or rest unless acted upon by a net external force (∑F = 0 => a = 0).
- Newton's Second Law:
  Net force is proportional to rate of change of momentum:
  ∑F = d(p)/dt = m*a (for constant mass).
- Newton's Third Law (Action-Reaction):
  For every action force F_AB, there is an equal and opposite reaction force F_BA = -F_AB.
- Work-Energy Theorem:
  W_net = ΔK = (1/2)*m*v_f^2 - (1/2)*m*v_i^2.
- Conservation of Mechanical Energy:
  E_total = K + U = constant (in the absence of non-conservative forces like friction).
- Gravitational Potential Energy near Earth surface: U_g = m*g*h.
- Spring Potential Energy (Hooke's Law F = -k*x): U_s = (1/2)*k*x^2.`
};

/**
 * Finds the neglected module (lowest study count).
 * If multiple have the same lowest count, preserves priority order.
 */
export function getNeglectedModule(
  modules: string[],
  studyCounts: Record<string, number>
): { module: string; count: number } {
  if (!modules || modules.length === 0) {
    return { module: "None", count: 0 };
  }

  let minMod = modules[0];
  let minCount = studyCounts[minMod] ?? 0;

  for (let i = 1; i < modules.length; i++) {
    const mod = modules[i];
    const cnt = studyCounts[mod] ?? 0;
    if (cnt < minCount) {
      minCount = cnt;
      minMod = mod;
    }
  }

  return { module: minMod, count: minCount };
}

/**
 * Increments study count for a module.
 */
export function incrementStudyCount(
  studyCounts: Record<string, number>,
  module: string
): Record<string, number> {
  const current = studyCounts[module] ?? 0;
  return {
    ...studyCounts,
    [module]: current + 1,
  };
}

/**
 * Generates the full weekly academic timetable with the requested time partitions:
 * 08:00 to 12:00 (Morning) and 14:00 to 18:00 (Afternoon),
 * plus the dynamic 18:00 - 19:00 evening revision block targeting the neglected course.
 */
export function generateSchedule(
  neglectedModule: string,
  customOverrides?: Record<string, Partial<Record<string, string>>>
): ScheduleSlot[] {
  const baseSlots: ScheduleSlot[] = [
    {
      time: "08:00 - 10:00",
      monday: "Calculus & Analysis (Lecture)",
      tuesday: "Algorithms & Data Structures",
      wednesday: "Physics / Mechanics (Lecture)",
      thursday: "Algorithms & Data Structures",
      friday: "Calculus & Analysis (Seminar)",
    },
    {
      time: "10:00 - 12:00",
      monday: "Physics / Mechanics (Lecture)",
      tuesday: "Calculus Recitation",
      wednesday: "Calculus & Analysis (Lecture)",
      thursday: "Engineering Mathematics",
      friday: "Physics Weekly Colloquium",
    },
    {
      time: "12:00 - 14:00",
      monday: "🍱 Lunch & Campus Break",
      tuesday: "🍱 Lunch & Campus Break",
      wednesday: "🍱 Lunch & Campus Break",
      thursday: "🍱 Lunch & Campus Break",
      friday: "🍱 Lunch & Campus Break",
    },
    {
      time: "14:00 - 16:00",
      monday: "Algorithms Lab (Session A)",
      tuesday: "Physics Lab (Mechanics)",
      wednesday: "Algorithms Seminar",
      thursday: "Physics Problem Workshop",
      friday: "Data Structures Code Review",
    },
    {
      time: "16:00 - 18:00",
      monday: "Free / Athletic Time",
      tuesday: "Group Project Sync",
      wednesday: "Office Hours & Study",
      thursday: "Campus Societies",
      friday: "Free / Social Time",
    },
    {
      time: "18:00 - 19:00 ⚡",
      monday: `⚡ REVISION: ${neglectedModule}`,
      tuesday: `⚡ REVISION: ${neglectedModule}`,
      wednesday: `⚡ REVISION: ${neglectedModule}`,
      thursday: `⚡ REVISION: ${neglectedModule}`,
      friday: `⚡ REVISION: ${neglectedModule}`,
      isDynamicSlot: true,
    },
    {
      time: "19:00 - 21:00",
      monday: "Dinner & Downtime",
      tuesday: "Personal Time",
      wednesday: "Dinner & Reading",
      thursday: "Personal Time",
      friday: "Weekend Kickoff",
    },
  ];

  if (!customOverrides) return baseSlots;

  return baseSlots.map((slot) => {
    if (slot.isDynamicSlot) {
      return slot;
    }
    const overrides = customOverrides[slot.time];
    if (!overrides) return slot;

    return {
      ...slot,
      monday: overrides.monday ?? slot.monday,
      tuesday: overrides.tuesday ?? slot.tuesday,
      wednesday: overrides.wednesday ?? slot.wednesday,
      thursday: overrides.thursday ?? slot.thursday,
      friday: overrides.friday ?? slot.friday,
    };
  });
}

export interface CheatSheetSection {
  title: string;
  icon?: string;
  items: {
    term: string;
    details: string;
    formula?: string;
    isKeyFormula?: boolean;
  }[];
}

/**
 * Parses markdown cheat sheet text into structured, styled sections with
 * rendered formulas and badges, eliminating raw markdown display bugs.
 */
export function parseCheatSheetContent(content: string): CheatSheetSection[] {
  if (!content) return [];

  const sections: CheatSheetSection[] = [];
  let currentSection: CheatSheetSection = { title: "Core Principles", items: [] };

  const lines = content.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Check for major heading (### or ####)
    if (line.startsWith("### ") || line.startsWith("#### ")) {
      const heading = line.replace(/^#{1,4}\s+/, "").replace(/^[0-9]+\.\s*/, "").trim();
      if (currentSection.items.length > 0 || currentSection.title !== "Core Principles") {
        if (currentSection.items.length > 0) {
          sections.push(currentSection);
        }
      }
      currentSection = { title: heading, items: [] };
      continue;
    }

    // Bullet points: - **Term**: details or - Term: details
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const cleanLine = line.replace(/^[-*]\s+/, "").trim();
      let term = "";
      let details = "";
      let formula = "";

      if (cleanLine.includes("**")) {
        const boldMatch = cleanLine.match(/\*\*([^*]+)\*\*[:\s-]*(.*)/);
        if (boldMatch) {
          term = boldMatch[1].trim();
          details = boldMatch[2].trim();
        }
      }

      if (!term && cleanLine.includes(":")) {
        const parts = cleanLine.split(":");
        term = parts[0].trim();
        details = parts.slice(1).join(":").trim();
      }

      if (!term) {
        term = cleanLine.length > 30 ? cleanLine.substring(0, 27) + "..." : cleanLine;
        details = cleanLine;
      }

      // Check for math formulas ($...$ or mathematical characters)
      if (details.includes("$")) {
        const mathMatches = details.match(/\$([^$]+)\$/g);
        if (mathMatches && mathMatches.length > 0) {
          formula = mathMatches.join(" • ").replace(/\$/g, "");
          details = details.replace(/\$([^$]+)\$/g, "").trim();
        }
      } else if (details.includes("=") || details.includes("∫") || details.includes("∑") || details.includes("O(")) {
        formula = details;
      }

      currentSection.items.push({
        term: term.replace(/\*\*/g, ""),
        details: details.replace(/\*\*/g, ""),
        formula: formula ? formula.replace(/\$\$/g, "").replace(/\$/g, "") : undefined,
      });
    }
  }

  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  // Fallback if no sections detected
  if (sections.length === 0 && content.trim().length > 0) {
    sections.push({
      title: "Extracted Reference",
      items: [
        {
          term: "Summary",
          details: content.replace(/[#*`]/g, "").trim(),
        },
      ],
    });
  }

  return sections;
}

/**
 * Renames a module across all storage collections safely.
 */
export function renameModuleData(
  oldName: string,
  newName: string,
  modules: string[],
  studyCounts: Record<string, number>,
  goals: Record<string, ModuleGoal>,
  notes: Record<string, string>
) {
  const cleanNewName = newName.trim();
  if (!cleanNewName || oldName === cleanNewName) {
    return { modules, studyCounts, goals, notes };
  }

  const updatedModules = modules.map((m) => (m === oldName ? cleanNewName : m));

  const updatedCounts = { ...studyCounts };
  if (oldName in updatedCounts) {
    updatedCounts[cleanNewName] = updatedCounts[oldName];
    delete updatedCounts[oldName];
  }

  const updatedGoals = { ...goals };
  if (oldName in updatedGoals) {
    updatedGoals[cleanNewName] = updatedGoals[oldName];
    delete updatedGoals[oldName];
  }

  const updatedNotes = { ...notes };
  if (oldName in updatedNotes) {
    updatedNotes[cleanNewName] = updatedNotes[oldName];
    delete updatedNotes[oldName];
  }

  return {
    modules: updatedModules,
    studyCounts: updatedCounts,
    goals: updatedGoals,
    notes: updatedNotes,
  };
}

/**
 * Deletes a module and cleans up all related data safely.
 */
export function deleteModuleData(
  moduleToDelete: string,
  modules: string[],
  studyCounts: Record<string, number>,
  goals: Record<string, ModuleGoal>,
  notes: Record<string, string>
) {
  if (modules.length <= 1) {
    // Keep at least one module
    return { modules, studyCounts, goals, notes };
  }

  const updatedModules = modules.filter((m) => m !== moduleToDelete);

  const updatedCounts = { ...studyCounts };
  delete updatedCounts[moduleToDelete];

  const updatedGoals = { ...goals };
  delete updatedGoals[moduleToDelete];

  const updatedNotes = { ...notes };
  delete updatedNotes[moduleToDelete];

  return {
    modules: updatedModules,
    studyCounts: updatedCounts,
    goals: updatedGoals,
    notes: updatedNotes,
  };
}

export interface FrequentConcept {
  term: string;
  count: number;
  snippet: string;
}

/**
 * Extracts high-frequency concepts, recurring theorems, and emphasized definitions
 * from notes to focus the AI Cram Station on what the user frequently studies.
 */
export function extractFrequentConcepts(notes: string): FrequentConcept[] {
  if (!notes || notes.trim().length === 0) return [];

  const candidates = new Map<string, { count: number; snippet: string }>();

  // 1. Markdown bold or headers: **Term** or ### Concept
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let match;
  while ((match = boldRegex.exec(notes)) !== null) {
    const term = match[1].trim();
    if (term.length > 2 && term.length < 50 && !term.includes("\n")) {
      const existing = candidates.get(term) || { count: 0, snippet: term };
      candidates.set(term, { count: existing.count + 2, snippet: term });
    }
  }

  // 2. Headings: ### Topic
  const headerRegex = /#{1,4}\s+([^\n]+)/g;
  while ((match = headerRegex.exec(notes)) !== null) {
    const term = match[1].trim().replace(/^Chapter\s+\d+:\s*/i, "").replace(/^Topic\s+\d+:\s*/i, "").replace(/^Unit\s+\d+:\s*/i, "");
    if (term.length > 2 && term.length < 50) {
      const existing = candidates.get(term) || { count: 0, snippet: term };
      candidates.set(term, { count: existing.count + 3, snippet: term });
    }
  }

  // 3. Mathematical laws & formulas (lines starting with - or containing =)
  const lines = notes.split("\n");
  for (const line of lines) {
    const trimmed = line.replace(/^[-*]\s*/, "").trim();
    if (trimmed.includes(":") && trimmed.length < 70) {
      const parts = trimmed.split(":");
      const name = parts[0].trim().replace(/\*\*/g, "");
      if (name.length > 3 && name.length < 45) {
        const existing = candidates.get(name) || { count: 0, snippet: trimmed };
        candidates.set(name, { count: existing.count + 2, snippet: trimmed });
      }
    }
  }

  // Convert to array and count raw word frequency across the text for each candidate
  const lowerNotes = notes.toLowerCase();
  const results: FrequentConcept[] = [];

  for (const [term, data] of candidates.entries()) {
    // Count occurrences of the key term in the text
    const cleanTerm = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${cleanTerm}\\b`, "gi");
    const occurrences = (lowerNotes.match(regex) || []).length;
    const totalScore = occurrences + data.count;

    results.push({
      term,
      count: Math.max(1, totalScore),
      snippet: data.snippet,
    });
  }

  // Sort descending by frequency count
  results.sort((a, b) => b.count - a.count);

  // Return top 8 most frequent concepts
  return results.slice(0, 8);
}

/**
 * High-yield dummy outputs for demo resilience
 */
export function getFallbackCheatSheet(moduleName: string): string {
  if (moduleName.includes("Physics")) {
    return `### 📐 Physics / Mechanics Cheat Sheet
#### 1. Fundamental Laws
- **Newton 1st (Inertia)**: $\\sum \\vec{F} = 0 \\implies \\vec{a} = 0$
- **Newton 2nd (Dynamics)**: $\\sum \\vec{F} = \\frac{d\\vec{p}}{dt} = m \\vec{a}$ (constant mass)
- **Newton 3rd (Interaction)**: $\\vec{F}_{AB} = -\\vec{F}_{BA}$

#### 2. Energy & Work Relations
- **Work Definition**: $W = \\int \\vec{F} \\cdot d\\vec{r} = F d \\cos(\\theta)$
- **Work-Energy Theorem**: $W_{\\text{net}} = \\Delta K = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2$
- **Conservation of Mechanical Energy**: $E_{\\text{mech}} = K + U = \\text{constant}$

#### 3. Key Potential Functions
- **Gravitational Potential**: $U_g = m g h$
- **Elastic Potential (Hooke's Law)**: $U_s = \\frac{1}{2} k x^2$ where $F_s = -k x$`;
  } else if (moduleName.includes("Calculus")) {
    return `### 📐 Calculus & Analysis Cheat Sheet
#### 1. Core Integration Formulas
- **Integration by Parts**: $\\int u \\, dv = uv - \\int v \\, du$ (Heuristic: LIATE priority)
- **Fundamental Theorem of Calculus (FTC)**:
  - $\\frac{d}{dx}\\left[\\int_{a}^{x} f(t)\\,dt\\right] = f(x)$
  - $\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)$

#### 2. Essential Series Expansions
- **General Taylor Series**: $f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n$
- **Maclaurin Series ($a=0$)**:
  - $e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\dots$
  - $\\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\dots$
  - $\\cos(x) = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\dots$`;
  }
  return `### 📐 ${moduleName} Cheat Sheet & Formulas
- **Core Principle**: Formulated directly from saved lecture notes.
- **Master Theorem**: $T(n) = a T(n/b) + f(n)$
- **Optimal Substructure**: $S_{optimal} = \\bigcup_{i} s_i$
- **Constraint Condition**: Non-negative edge weights $w(u,v) \\ge 0$ for greedy convergence.`;
}

export function getFallbackFlashcards(moduleName: string): Flashcard[] {
  if (moduleName.includes("Physics")) {
    return [
      {
        q: "What condition must be satisfied for mechanical energy to remain strictly conserved?",
        a: "All forces doing work on the system must be conservative forces (e.g. gravity, ideal springs). Non-conservative forces like friction or air drag must do zero net work."
      },
      {
        q: "State the relationship between a net conservative force and its potential energy function.",
        a: "Force is the negative gradient of potential energy: F = -dU/dx (in 1D) or F = -∇U."
      },
      {
        q: "Explain why Newton's Third Law forces do not cancel each other out on a single object.",
        a: "Because the action and reaction forces act on two completely different objects, never on the same body."
      }
    ];
  } else if (moduleName.includes("Calculus")) {
    return [
      {
        q: "What is the LIATE rule in integration by parts?",
        a: "A priority heuristic for choosing u: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential."
      },
      {
        q: "What does Part 1 of the Fundamental Theorem of Calculus state?",
        a: "If F(x) = ∫[a to x] f(t) dt, then F'(x) = f(x). Differentiation and integration are inverse operations."
      },
      {
        q: "What distinguishes a Maclaurin series from a general Taylor series?",
        a: "A Maclaurin series is a Taylor series specifically centered at point a = 0."
      }
    ];
  }
  return [
    {
      q: `What is the primary governing theorem in ${moduleName}?`,
      a: "The core asymptotic boundary relations established in the foundational lecture notes."
    },
    {
      q: "When does the primary algorithm or formulation fail to converge?",
      a: "When negative cycle feedback loops are present or when preconditions are violated."
    },
    {
      q: "How can you verify solutions rapidly?",
      a: "By inspecting boundary condition invariants and asymptotic complexity."
    }
  ];
}

export function getFallbackQuiz(moduleName: string): QuizQuestion[] {
  if (moduleName.includes("Physics")) {
    return [
      {
        question: "A 2 kg block slides down a frictionless incline of height 5 m. What is its kinetic energy at the bottom? (Assume g = 9.8 m/s²)",
        options: ["49.0 J", "98.0 J", "19.6 J", "196.0 J"],
        answer: "98.0 J",
        explanation: "By conservation of mechanical energy: K_bottom = U_top = m * g * h = 2 kg * 9.8 m/s² * 5 m = 98.0 J."
      },
      {
        question: "A rocket accelerates upwards in deep space by expelling gas backwards. Which law fundamentally explains the forward propulsion force on the rocket?",
        options: ["Newton's First Law", "Newton's Second Law only", "Newton's Third Law (Action-Reaction)", "Kepler's Second Law"],
        answer: "Newton's Third Law (Action-Reaction)",
        explanation: "The rocket exerts a backward force on the expelled exhaust gases; by Newton's Third Law, the gas exerts an equal and opposite forward reaction thrust force on the rocket."
      }
    ];
  } else if (moduleName.includes("Calculus")) {
    return [
      {
        question: "Using integration by parts on ∫ x * e^x dx, which choice of u and dv leads to the simplest solution?",
        options: ["u = e^x, dv = x dx", "u = x, dv = e^x dx", "u = x^2, dv = dx", "u = 1, dv = x e^x dx"],
        answer: "u = x, dv = e^x dx",
        explanation: "By LIATE, Algebraic (x) takes priority for u because du = dx reduces the degree, while dv = e^x dx is trivially integrated to v = e^x."
      },
      {
        question: "What is the Maclaurin series expansion of cos(x)?",
        options: ["∑ (-1)^n * x^(2n) / (2n)!", "∑ (-1)^n * x^(2n+1) / (2n+1)!", "∑ x^n / n!", "∑ (-1)^n * x^n / n"],
        answer: "∑ (-1)^n * x^(2n) / (2n)!",
        explanation: "Since cos(x) is an even function, its Maclaurin series consists only of even powers of x with alternating signs."
      }
    ];
  }
  return [
    {
      question: `In ${moduleName}, which property is required for greedy optimal substructure?`,
      options: ["Non-negative weights and optimal subproblem hierarchy", "Unbounded recursive cycles", "Exponential state space", "Random permutations"],
      answer: "Non-negative weights and optimal subproblem hierarchy",
      explanation: "Ensures that locally optimal choices lead to globally optimal solutions without subversion by negative weights."
    },
    {
      question: "What is the tightest upper bound when using a binary min-heap for graph search?",
      options: ["O((V + E) log V)", "O(V^3)", "O(E * V)", "O(log log V)"],
      answer: "O((V + E) log V)",
      explanation: "Each vertex extraction takes O(log V) and each edge relaxation takes O(log V) in a binary heap."
    }
  ];
}

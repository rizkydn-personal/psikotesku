import {
  abilityQuestions,
  personalityQuestions,
  stages,
  traitLabels,
  type Ability,
  type Question,
  type Trait,
} from "@/data/psychotestQuestions";
import { shuffle } from "./psychotest";
import { createResultId } from "./resultId";
import { KORAN_COLUMNS, KORAN_PAIRS_PER_COLUMN } from "@/data/testConfig";

export type KoranColumn = {
  digits: number[];
  answers: (number | null)[];
  elapsedMs?: number;
};
export type StageTiming = { seconds: number; timedOut: boolean };
export type Session = {
  koranStartedAt?: number;
  questions: Record<Ability, Question[]>;
  personalityOrder: string[];
  answers: Record<string, string>;
  personality: Record<string, number>;
  projective: Record<string, string>;
  koran: KoranColumn[];
  timings: Record<string, StageTiming>;
};
export type AbilityScore = {
  total: number;
  correct: number;
  wrong: number;
  omitted: number;
  percent: number;
  accuracy: number | null;
  seconds: number;
  timedOut: boolean;
  skills: { name: string; correct: number; total: number }[];
};
export type KoranScore = {
  durationSeconds?: number;
  totalPairs?: number;
  unanswered?: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number | null;
  perMinute: number;
  columns: {
    seconds?: number;
    attempted: number;
    correct: number;
    wrong: number;
    skipped: number;
  }[];
  spread: number;
};
export type AssessmentResult = {
  id: string;
  testId: "komprehensif";
  testTitle: string;
  createdAt: string;
  ownerId: string | null;
  version: 2;
  abilities: Record<Ability, AbilityScore>;
  personality: Record<Trait, number>;
  koran: KoranScore;
  responses: Record<string, string>;
  projective: Record<string, string>;
  quality: string[];
  durationSeconds: number;
};
export function createSession(): Session {
  const prepare = (domain: Ability) =>
    shuffle(abilityQuestions.filter((q) => q.domain === domain)).map((q) => ({
      ...q,
      options: shuffle(q.options),
    }));
  return {
    questions: {
      verbal: prepare("verbal"),
      numeric: prepare("numeric"),
      spatial: prepare("spatial"),
    },
    personalityOrder: shuffle(personalityQuestions.map((q) => q.id)),
    answers: {},
    personality: {},
    projective: {},
    timings: {},
    koran: Array.from({ length: KORAN_COLUMNS }, () => ({
      digits: Array.from({ length: KORAN_PAIRS_PER_COLUMN + 1 }, () =>
        Math.floor(Math.random() * 10),
      ),
      answers: [],
    })),
  };
}
export function secondsRemaining(deadline: number, now = Date.now()) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
export function koranColumnAt(startedAt: number, now = Date.now()) {
  return Math.min(4, Math.max(0, Math.floor((now - startedAt) / 45000)));
}
export function appendKoranAnswer(
  session: Session,
  column: number,
  value: number | null,
): Session {
  if (
    column < 0 ||
    column >= 4 ||
    (value !== null && (!Number.isInteger(value) || value < 0 || value > 9))
  )
    return session;
  const current = session.koran[column];
  if (
    current.answers.length >=
    Math.min(KORAN_PAIRS_PER_COLUMN, current.digits.length - 1)
  )
    return session;
  return {
    ...session,
    koran: session.koran.map((c, i) =>
      i === column ? { ...c, answers: [...c.answers, value] } : c,
    ),
  };
}
export function scoreKoran(columns: KoranColumn[]): KoranScore {
  const durationSeconds = columns.reduce(
    (sum, c) => sum + (c.elapsedMs ?? 45000) / 1000,
    0,
  );
  const scores = columns.map((c) => {
    let correct = 0,
      wrong = 0,
      skipped = 0;
    c.answers.forEach((answer, i) => {
      if (answer === null) skipped++;
      else if (answer === (c.digits[i] + c.digits[i + 1]) % 10) correct++;
      else wrong++;
    });
    return {
      attempted: correct + wrong,
      correct,
      wrong,
      skipped,
      seconds: (c.elapsedMs ?? 45000) / 1000,
    };
  });
  const total = scores.reduce(
    (a, c) => ({
      attempted: a.attempted + c.attempted,
      correct: a.correct + c.correct,
      wrong: a.wrong + c.wrong,
      skipped: a.skipped + c.skipped,
    }),
    { attempted: 0, correct: 0, wrong: 0, skipped: 0 },
  );
  return {
    ...total,
    totalPairs: columns.reduce((sum, c) => sum + c.digits.length - 1, 0),
    unanswered: columns.reduce(
      (sum, c) => sum + Math.max(0, c.digits.length - 1 - c.answers.length),
      0,
    ),
    accuracy: total.attempted
      ? Math.round((total.correct / total.attempted) * 100)
      : null,
    durationSeconds,
    perMinute:
      durationSeconds > 0
        ? Math.round(((total.attempted * 60) / durationSeconds) * 10) / 10
        : 0,
    columns: scores,
    spread:
      Math.max(...scores.map((c) => c.attempted)) -
      Math.min(...scores.map((c) => c.attempted)),
  };
}

export function koranProgress(session: Session) {
  const index = session.koran.findIndex((c) => c.elapsedMs === undefined);
  const column = index < 0 ? session.koran.length : index;
  const start =
    (session.koranStartedAt ?? 0) +
    session.koran
      .slice(0, column)
      .reduce((sum, c) => sum + (c.elapsedMs ?? 0), 0);
  return { column, deadline: start + 45000, start };
}

/** Advance deadlines even when browser ticks are delayed; never move a stale input into a new column. */
export function advanceKoran(
  session: Session,
  now: number,
  input?: { column: number; value: number | null },
): Session {
  if (session.koranStartedAt === undefined) return session;
  let next = session;
  let progress = koranProgress(next);
  while (progress.column < next.koran.length && now >= progress.deadline) {
    next = {
      ...next,
      koran: next.koran.map((c, i) =>
        i === progress.column ? { ...c, elapsedMs: 45000 } : c,
      ),
    };
    progress = koranProgress(next);
  }
  if (
    !input ||
    input.column !== progress.column ||
    progress.column >= next.koran.length
  )
    return next;
  next = appendKoranAnswer(next, progress.column, input.value);
  const current = next.koran[progress.column];
  if (
    current.answers.length >=
    Math.min(KORAN_PAIRS_PER_COLUMN, current.digits.length - 1)
  ) {
    next = {
      ...next,
      koran: next.koran.map((c, i) =>
        i === progress.column
          ? { ...c, elapsedMs: Math.max(1, now - progress.start) }
          : c,
      ),
    };
  }
  return next;
}
export function scoreAbility(
  domain: Ability,
  answers: Record<string, string>,
  timing: StageTiming,
): AbilityScore {
  const questions = abilityQuestions.filter((q) => q.domain === domain);
  let correct = 0,
    wrong = 0,
    omitted = 0;
  const skillMap: Record<
    string,
    { name: string; correct: number; total: number }
  > = {};
  for (const q of questions) {
    if (!skillMap[q.skill])
      skillMap[q.skill] = { name: q.skill, correct: 0, total: 0 };
    skillMap[q.skill].total++;
    const answer = answers[q.id];
    if (!answer) omitted++;
    else if (!q.options.some((o) => o.id === answer))
      throw new Error("Pilihan jawaban tidak valid.");
    else if (answer === q.correctId) {
      correct++;
      skillMap[q.skill].correct++;
    } else wrong++;
  }
  return {
    total: questions.length,
    correct,
    wrong,
    omitted,
    percent: Math.round((correct / questions.length) * 100),
    accuracy:
      correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : null,
    ...timing,
    skills: Object.values(skillMap),
  };
}
export function finishAssessment(
  session: Session,
  ownerId: string | null,
): AssessmentResult {
  for (const stage of stages)
    if (!session.timings[stage.id])
      throw new Error("Selesaikan kelima tahap sebelum melihat hasil.");
  const traitSums = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    emotional: 0,
  };
  for (const q of personalityQuestions) {
    const answer = session.personality[q.id];
    if (!Number.isInteger(answer) || answer < 1 || answer > 5)
      throw new Error("Lengkapi seluruh pernyataan kepribadian.");
    traitSums[q.trait] += q.reverse ? 6 - answer : answer;
  }
  const personality = Object.fromEntries(
    (Object.keys(traitLabels) as Trait[]).map((trait) => [
      trait,
      Math.round((traitSums[trait] / 5) * 10) / 10,
    ]),
  ) as Record<Trait, number>;
  const abilities = Object.fromEntries(
    (["verbal", "numeric", "spatial"] as Ability[]).map((domain) => [
      domain,
      scoreAbility(domain, session.answers, session.timings[domain]),
    ]),
  ) as Record<Ability, AbilityScore>;
  const quality: string[] = [];
  if (new Set(Object.values(session.personality)).size === 1)
    quality.push(
      "Semua pernyataan kepribadian diberi respons yang sama. Tinjau apakah jawaban benar-benar menggambarkan kebiasaan Anda; ini bukan bukti ketidakjujuran.",
    );
  if (session.timings.personality.seconds < 50)
    quality.push(
      "Bagian kepribadian diselesaikan sangat singkat (kurang dari 50 detik). Ini catatan durasi, bukan batas validitas yang tervalidasi.",
    );
  const omitted = Object.values(abilities).reduce((n, s) => n + s.omitted, 0);
  if (omitted)
    quality.push(
      `${omitted} soal kemampuan tidak dijawab. Skor dihitung terhadap seluruh soal, termasuk yang kosong.`,
    );
  if (!session.koran.some((c) => c.answers.some((a) => a !== null)))
    quality.push(
      "Tidak ada jawaban angka pada tes koran. Kecepatan dan ketelitian belum dapat ditafsirkan.",
    );
  return {
    id: createResultId(),
    testId: "komprehensif",
    testTitle: "Psikotes Komprehensif",
    createdAt: new Date().toISOString(),
    ownerId,
    version: 2,
    abilities,
    personality,
    koran: scoreKoran(session.koran),
    responses: { ...session.answers },
    projective: Object.fromEntries(
      Object.entries(session.projective).map(([k, v]) => [
        k,
        v.trim().slice(0, 1500),
      ]),
    ),
    quality,
    durationSeconds: Object.values(session.timings).reduce(
      (n, t) => n + t.seconds,
      0,
    ),
  };
}

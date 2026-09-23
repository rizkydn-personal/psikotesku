import { createResultId } from "./resultId";
import {
  dimensions,
  getTest,
  type Dimension,
  type Question,
} from "@/data/legacyQuestions";
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function prepareQuestions(questions: readonly Question[]) {
  return shuffle(questions).map((q) => ({ ...q, options: shuffle(q.options) }));
}
export type LegacyResult = {
  id: string;
  testId: string;
  testTitle: string;
  createdAt: string;
  scores: Record<Dimension, number>;
  ownerId: string | null;
  version: 1;
};
export type Result = LegacyResult | import("./assessment").AssessmentResult;
export function calculateResult(
  testId: string,
  answers: Record<string, string>,
  ownerId: string | null,
): LegacyResult {
  const test = getTest(testId);
  if (!test) throw new Error("Tes tidak ditemukan.");
  const totals = { connection: 0, exploration: 0, structure: 0 };
  const counts = { ...totals };
  for (const q of test.questions) {
    const option = q.options.find((o) => o.id === answers[q.id]);
    if (!option) throw new Error("Jawab seluruh pertanyaan terlebih dahulu.");
    totals[q.dimension] += option.value - 1;
    counts[q.dimension] += 3;
  }
  const scores = Object.fromEntries(
    Object.keys(dimensions).map((d) => [
      d,
      Math.round((totals[d as Dimension] / counts[d as Dimension]) * 100),
    ]),
  ) as Record<Dimension, number>;
  return {
    id: createResultId(),
    testId,
    testTitle: test.title,
    createdAt: new Date().toISOString(),
    scores,
    ownerId,
    version: 1,
  };
}

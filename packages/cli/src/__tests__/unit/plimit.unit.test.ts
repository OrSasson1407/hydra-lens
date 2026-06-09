import { describe, it, expect } from "vitest";

async function pLimit<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;
  async function worker(): Promise<void> {
    while (nextIndex < tasks.length) {
      const i = nextIndex++;
      results[i] = await tasks[i]();
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

describe("pLimit", () => {
  it("pLimit(tasks, 1) runs all tasks in series", async () => {
    const order: number[] = [];
    const tasks = [0, 1, 2].map(i => async () => { order.push(i); return i; });
    const results = await pLimit(tasks, 1);
    expect(results).toEqual([0, 1, 2]);
    expect(order).toEqual([0, 1, 2]);
  });
  it("pLimit(tasks, N) runs at most N tasks concurrently", async () => {
    let concurrent = 0; let maxConcurrent = 0;
    const tasks = Array.from({ length: 6 }, (_, i) => async () => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise(r => setTimeout(r, 10));
      concurrent--;
      return i;
    });
    await pLimit(tasks, 2);
    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });
  it("results are returned in original task order", async () => {
    const tasks = [3, 1, 4, 1, 5].map(v => async () => v);
    const results = await pLimit(tasks, 3);
    expect(results).toEqual([3, 1, 4, 1, 5]);
  });
  it("rejected task propagates the error", async () => {
    const tasks = [async () => { throw new Error("boom"); }];
    await expect(pLimit(tasks, 1)).rejects.toThrow("boom");
  });
  it("limit larger than task count ? all run in parallel", async () => {
    const tasks = [0, 1, 2].map(i => async () => i * 2);
    const results = await pLimit(tasks, 100);
    expect(results).toEqual([0, 2, 4]);
  });
});

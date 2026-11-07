// Weighted loading progress built from real events. A task that fails still settles, so a
// missing optional asset can never hold the page behind the loader.

interface Task {
  weight: number;
  value: number;
  settled: boolean;
}

export class LoadProgress {
  private readonly tasks = new Map<string, Task>();

  add(name: string, weight: number): this {
    if (weight <= 0) throw new Error('weight must be positive');
    this.tasks.set(name, { weight, value: 0, settled: false });
    return this;
  }

  /** Partial progress for a task, between 0 and 1. Never moves backwards. */
  report(name: string, value: number): void {
    const task = this.tasks.get(name);
    if (!task || task.settled) return;
    task.value = Math.max(task.value, Math.min(1, Math.max(0, value)));
  }

  settle(name: string): void {
    const task = this.tasks.get(name);
    if (!task) return;
    task.value = 1;
    task.settled = true;
  }

  get value(): number {
    let total = 0;
    let done = 0;
    for (const task of this.tasks.values()) {
      total += task.weight;
      done += task.weight * task.value;
    }
    return total === 0 ? 1 : done / total;
  }

  get complete(): boolean {
    for (const task of this.tasks.values()) if (!task.settled) return false;
    return true;
  }
}

/**
 * The number shown on the counter. It stays below 100 until every task has settled, so
 * "100" always means the tracked assets really are ready.
 */
export function displayPercent(progress: LoadProgress): number {
  if (progress.complete) return 100;
  return Math.min(99, Math.floor(progress.value * 100));
}

/** Which morph stage of the mark matches a progress value, given the number of stages. */
export function stageFor(value: number, stages: number, complete: boolean): number {
  if (complete) return stages - 1;
  return Math.min(stages - 2, Math.floor(value * (stages - 1)));
}

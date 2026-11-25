export class HistoryManager<T> {
  private undoStack: T[] = [];
  private redoStack: T[] = [];

  private readonly maxHistory: number;

  constructor(maxHistory = 50) {
    this.maxHistory = maxHistory;
  }

  save(state: T): void {
    this.undoStack.push(structuredClone(state));

    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    // A new action invalidates the redo history
    this.redoStack = [];
  }

  undo(currentState: T): T | null {
    // Keep at least one previous state
    if (this.undoStack.length <= 1) {
      return null;
    }

    // Save current state for redo
    this.redoStack.push(structuredClone(currentState));

    // Remove current snapshot
    this.undoStack.pop();

    // Return previous snapshot
    const previousState =
      this.undoStack[this.undoStack.length - 1];

    return structuredClone(previousState);
  }

  redo(currentState: T): T | null {
    if (this.redoStack.length === 0) {
      return null;
    }

    const nextState = this.redoStack.pop()!;

    this.undoStack.push(structuredClone(nextState));

    return structuredClone(nextState);
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}
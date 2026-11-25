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

    this.redoStack = [];
  }

  undo(currentState: T): T | null {
    if (this.undoStack.length === 0) {
      return null;
    }

    const previousState = this.undoStack.pop()!;

    this.redoStack.push(structuredClone(currentState));

    return structuredClone(previousState);
  }

  redo(currentState: T): T | null {
    if (this.redoStack.length === 0) {
      return null;
    }

    const nextState = this.redoStack.pop()!;

    this.undoStack.push(structuredClone(currentState));

    return structuredClone(nextState);
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}
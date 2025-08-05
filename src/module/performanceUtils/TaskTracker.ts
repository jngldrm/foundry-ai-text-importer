class Task {
  name: string;
  description: string;
  isActive = false;
  isComplete = false;
  isError = false;
  errorMessage: string | null = null;
  startTime: number | null = null;
  completionTime = 0;

  constructor(name, description, taskPromise) {
    this.name = name;
    this.description = description;
    taskPromise
      .then(() => {
        this.isComplete = true;
        this.stopTimer();
      })
      .catch((e: Error) => {
        this.isError = true;
        this.errorMessage = e.message;
        this.isComplete = true;
        this.stopTimer();
        console.error(`Task ${this.name} failed: ${e.message}`);
      });
  }

  startTimer(): void {
    if (this.startTime === null) {
      // Prevent restarting if already started
      this.startTime = Date.now();
    }
  }

  stopTimer(): void {
    this.completionTime = this.timeElapsed();
    this.startTime = null;
  }

  timeElapsed(): number {
    if (this.startTime !== null) {
      return Math.round((Date.now() - this.startTime) / 1000);
    }
    return this.completionTime;
  }

  timeElapsedString(): string {
    return `${this.timeElapsed()}s`;
  }
}

export default class TaskTracker {
  private static instance: TaskTracker;
  private tasks: Task[];
  private isError = false;

  private constructor(initialTasks = []) {
    this.tasks = initialTasks;
  }

  // Static method to get the singleton instance
  public static getInstance(): TaskTracker {
    if (!TaskTracker.instance) {
      TaskTracker.instance = new TaskTracker();
    }
    return TaskTracker.instance;
  }

  static startNewTask(name: string, description: string, promise: Promise<any>) {
    TaskTracker.getInstance().startTask(name, description, promise);
  }

  static clear() {
    TaskTracker.getInstance().clearTasks();
  }

  static get tasks() {
    return TaskTracker.getInstance().tasks;
  }

  private startTask(name: string, description: string, promise: Promise<any>) {
    const newTask = new Task(name, description, promise);
    newTask.startTimer();
    this.tasks.push(newTask);
  }

  private clearTasks() {
    this.tasks = [];
  }
}

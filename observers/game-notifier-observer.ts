import chalk from "chalk";

export interface GameObserver {
  onLog(message: string): void;
  onHealthChanged(entityName: string, currentHealth: number): void;
  onDeath(entityName: string): void;
}

export class GameEventNotifier {
  private static instance: GameEventNotifier | null = null;
  private observers: Set<GameObserver> = new Set<GameObserver>();

  private constructor() {}

  public static getInstance(): GameEventNotifier {
    if (!GameEventNotifier.instance) {
      GameEventNotifier.instance = new GameEventNotifier();
    }
    return GameEventNotifier.instance;
  }

  public subscribe(observer: GameObserver): void {
    this.observers.add(observer);
  }

  public unsubscribe(observer: GameObserver): void {
    this.observers.delete(observer);
  }

  public notifyLog(message: string): void {
    this.observers.forEach((observer) => observer.onLog(message));
  }

  public notifyHealthChanged(entityName: string, currentHealth: number): void {
    this.observers.forEach((observer) => observer.onHealthChanged(entityName, currentHealth));
  }

  public notifyDeath(entityName: string): void {
    this.observers.forEach((observer) => observer.onDeath(entityName));
  }
}


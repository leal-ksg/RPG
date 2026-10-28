import { GameEventNotifier } from "../observers/game-notifier-observer.ts";
import { AttackStrategy, MountainBossAttackStrategy, SwampBossAttackStrategy } from "../strategies/attack-strategy.ts";
import { Player } from "./player.ts";

export abstract class Boss {
  private _name: string;
  private _health: number;
  private _attackStrategy: AttackStrategy;
  private _distanceAdvantage: boolean = false;
  private _isStunned: boolean = false;

  constructor(name: string, health: number, strategy: AttackStrategy) {
    this._name = name;
    this._health = health;
    this._attackStrategy = strategy;
  }

  public takeDamage(amount: number): void {
    this._health = Math.max(0, this._health - amount);
    GameEventNotifier.getInstance().notifyHealthChanged(this._name, this._health);
    if (this._health === 0) {
      GameEventNotifier.getInstance().notifyDeath(this._name);
    }
  }

  public executeBossTurn(player: Player): void {
    if (!this.isAlive()) return;

    this._attackStrategy.execute(this, player);
  }

  public isAlive(): boolean { return this._health > 0; }
  public getName(): string { return this._name; }
  public getHealth(): number { return this._health; }
  public hasDistanceAdvantage(): boolean { return this._distanceAdvantage; }
  public setDistanceAdvantage(advantage: boolean): void { this._distanceAdvantage = advantage; }
  public isStunned(): boolean { return this._isStunned }
  public setStunned(isStunned: boolean): void { this._isStunned = isStunned; }
}

export class FungalGolem extends Boss {
  constructor() {
    super("Golem Fúngico", 150, new SwampBossAttackStrategy());
  }
}

export class GiantGorilla extends Boss {
  constructor() {
    super("Gorila Gigante", 220, new MountainBossAttackStrategy());
  }
}

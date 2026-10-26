import { GameEventNotifier } from "../observers/game-notifier-observer.ts";
import { Weapon } from "./weapons.ts";

export class Player {
  private _health: number = 0;
  private _baseHealth: number = 0;
  private _name: string = "";
  private _primaryWeapon: Weapon | null = null;
  private _secondaryWeapon: Weapon | null = null;

  constructor(name: string, baseHealth: number) {
    this._name = name;
    this._health = baseHealth;
    this._baseHealth = baseHealth;
  }

  public setWeapons(primary: Weapon, secondary: Weapon): void {
    this._primaryWeapon = primary;
    this._secondaryWeapon = secondary;
  }

  public setPrimaryWeapon(weapon: Weapon): void {
    this._primaryWeapon = weapon;
  }

  public setSecondaryWeapon(weapon: Weapon): void {
    this._secondaryWeapon = weapon;
  }

  public takeDamage(amount: number): void {
    this._health = Math.max(0, this._health - amount);
    GameEventNotifier.getInstance().notifyHealthChanged(
      this._name,
      this._health,
    );
    if (this._health === 0) {
      GameEventNotifier.getInstance().notifyDeath(this._name);
    }
  }

  public isAlive(): boolean {
    return this._health > 0;
  }

  public restoreHealth() {
    this._health = this._baseHealth;
  }

  public getName(): string {
    return this._name;
  }

  public getHealth(): number {
    return this._health;
  }

  public getPrimaryWeapon(): Weapon | null {
    return this._primaryWeapon;
  }

  public getSecondaryWeapon(): Weapon | null {
    return this._secondaryWeapon;
  }
}

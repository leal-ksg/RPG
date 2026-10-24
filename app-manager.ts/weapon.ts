enum WeaponRange {
  SHORT,
  MEDIUM,
  LONG,
}

export abstract class Weapon {
  private _damagePoints: number;
  private _range: WeaponRange;

  constructor(damage: number, range: WeaponRange) {
    this._damagePoints = damage;
    this._range = range;
  }

  public setDamagePoints(damage: number): void {
    this._damagePoints = damage;
  }

  public getDamagePoints(): number {
    return this._damagePoints;
  }

  public setRange(range: WeaponRange): void {
    this._range = range;
  }

  public getRange(): number {
    return this._range;
  }
}

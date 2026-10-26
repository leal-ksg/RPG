export enum WeaponRange {
  SHORT,
  MEDIUM,
  LONG,
}

export abstract class Weapon {
  private _damagePoints: number;
  private _range: WeaponRange;
  private _name: string;

  constructor(name: string, damage: number, range: WeaponRange) {
    this._damagePoints = damage;
    this._range = range;
    this._name = name;
  }

  public getDamagePoints(): number {
    return this._damagePoints;
  }

  public getRange(): number {
    return this._range;
  }

  public getName(): string {
    return this._name;
  }
}

export class HeavySword extends Weapon {
  constructor() {
    super("Espada pesada", 25, WeaponRange.MEDIUM);
  }
}

export class BowAndArrow extends Weapon {
  constructor() {
    super("Arco e flecha", 20, WeaponRange.LONG);
  }
}

export class MagicStaff extends Weapon {
  constructor() {
    super("Cajado mágico", 20, WeaponRange.LONG);
  }
}

export class ShortDagger extends Weapon {
  constructor() {
    super("Adaga curta", 17, WeaponRange.SHORT);
  }
}

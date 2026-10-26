import { Weapon } from "../app-manager.ts/weapons.ts";

export abstract class RuneDecorator extends Weapon {
  protected _wrappedWeapon: Weapon;

  constructor(weapon: Weapon) {
    super(weapon.getName(), weapon.getDamagePoints(), weapon.getRange());
    this._wrappedWeapon = weapon;
  }
}

export class FireRuneDecorator extends RuneDecorator {
  constructor(weapon: Weapon) {
    super(weapon);
  }

  public override getDamagePoints(): number {
    return this._wrappedWeapon.getDamagePoints() + 4;
  }
}

export class EletricRuneDecorator extends RuneDecorator {
  constructor(weapon: Weapon) {
    super(weapon);
  }

  public override getDamagePoints(): number {
    return this._wrappedWeapon.getDamagePoints() + 2;
  }
}

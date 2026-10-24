import { Weapon } from "./weapon.ts";

export class Player {
  private _health: number = 0;
  private _name: string = "";
  private _primaryWeapon: Weapon | null = null;
  private _secondaryWeapon: Weapon | null = null;

  public setWeapons(primary: Weapon, secondary: Weapon): void {
    this._primaryWeapon = primary;
    this._secondaryWeapon = secondary;
  }
}

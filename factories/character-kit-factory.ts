import {
  BowAndArrow,
  HeavySword,
  MagicStaff,
  ShortDagger,
  Weapon,
} from "../app-manager.ts/weapons.ts";

export interface CharacterKitFactory {
  createPrimaryWeapon(): Weapon;
  createSecondaryWeapon(): Weapon;
  getBaseHealthPoints(): number;
  getClassName(): string;
}

export class WarriorKitFactory implements CharacterKitFactory {
  createPrimaryWeapon(): Weapon {
    return new HeavySword();
  }

  createSecondaryWeapon(): Weapon {
    return new BowAndArrow();
  }

  getBaseHealthPoints(): number {
    return 200;
  }

  getClassName(): string {
    return "GUERREIRO";
  }
}

export class MageKitFactory implements CharacterKitFactory {
  createPrimaryWeapon(): Weapon {
    return new MagicStaff();
  }

  createSecondaryWeapon(): Weapon {
    return new ShortDagger();
  }

  getBaseHealthPoints(): number {
    return 120;
  }

  getClassName(): string {
    return "MAGO";
  }
}

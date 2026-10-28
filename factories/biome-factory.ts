import { Boss, FungalGolem, GiantGorilla } from "../core/boss.ts";

export interface Biome {
  getName(): string;
  getDescription(): string;
  createBoss(): Boss;
}

export class GloomySwampBiome implements Biome {
  public getName(): string {
    return "Pântano Sombrio";
  }

  public getDescription(): string {
    return "Um pântano envolto em névoa espessa, lama movediça e esporos venenosos.";
  }

  public createBoss(): Boss {
    return new FungalGolem();
  }
}

export class SnowyMountainBiome implements Biome {
  public getName(): string {
    return "Monte Nevado";
  }

  public getDescription(): string {
    return "Picos congelantes fustigados por nevascas cortantes e ventanias ensurdecedoras.";
  }

  public createBoss(): Boss {
    return new GiantGorilla();
  }
}

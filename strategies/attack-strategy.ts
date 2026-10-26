import { Weapon, WeaponRange } from "../app-manager.ts/weapons.ts";
import { Boss } from "../app-manager.ts/boss.ts";
import { Player } from "../app-manager.ts/player.ts";
import { GameEventNotifier } from "../observers/game-notifier-observer.ts";
import chalk from "chalk";

export interface AttackStrategy {
  execute(attacker: any, defender: any, weapon?: Weapon): void;
}

export class PlayerAttackStrategy implements AttackStrategy {
  execute(player: Player, boss: Boss, weapon: Weapon): void {
    let damage = weapon.getDamagePoints();

    if (boss.hasDistanceAdvantage() && weapon.getRange() !== WeaponRange.LONG) {
      damage = Math.floor(damage * 0.5);

      GameEventNotifier.getInstance().notifyLog(
        `⚠️ ${player.getName()} está muito longe! O ataque de curto/médio alcance perdeu força e causou apenas ${damage} de dano.`,
      );
    } else {
      GameEventNotifier.getInstance().notifyLog(
        `⚔️  ${player.getName()} atacou com ${weapon.getName()} causando ${damage} de dano!`,
      );
    }

    boss.takeDamage(damage);
  }
}

export class SwampBossAttackStrategy implements AttackStrategy {
  execute(player: Player): void {
    const damage = 30;
    GameEventNotifier.getInstance().notifyLog(
      `🍄 Golem Fúngico golpeia o solo! Esporos sobem no ar. ${player.getName()} recebe ${damage} de dano e fica atordoado!`,
    );
    player.takeDamage(damage);
  }
}

export class MountainBossAttackStrategy implements AttackStrategy {
  execute(boss: Boss, player: Player): void {
    const chance = Math.random();

    if (chance < 0.5) {
      const damage = 40;

      GameEventNotifier.getInstance().notifyLog(
        `🦍 ${chalk.bold.red("ATAQUE PESADO!")} O Gorila Gigante bate no peito com fúria e arremessa ${player.getName()} para longe!\n` +
          `   Dano recebido: ${chalk.bold.red(damage + " HP")}.`,
      );

      player.takeDamage(damage);
      boss.setDistanceAdvantage(true);
    } else {
      const damage = 20;

      GameEventNotifier.getInstance().notifyLog(
        `🦍 O Gorila Gigante desfere um soco rápido em ${player.getName()}!\n` +
          `   Dano recebido: ${chalk.bold.yellow(damage + " HP")}.`,
      );

      player.takeDamage(damage);
    }
  }
}

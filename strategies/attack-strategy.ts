import { Weapon, WeaponRange } from "../core/weapons.ts";
import { Boss } from "../core/boss.ts";
import { Player } from "../core/player.ts";
import { GameEventNotifier } from "../observers/game-notifier-observer.ts";
import chalk from "chalk";
import {
  ElectricRuneDecorator,
  FireRuneDecorator,
} from "../decorators/runes.ts";

export interface AttackStrategy {
  execute(player: any, boss: any, weapon?: Weapon): void;
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
      const chance = Math.random();

      if (chance < 0.38) {
        if (weapon instanceof ElectricRuneDecorator) {
          boss.setStunned(true);
          GameEventNotifier.getInstance().notifyLog(
            chalk.bold.blue(
              `\n⚡ A runa elétrica foi ativada e aplicou efeito paralisante em ${boss.getName()}!`,
            ),
          );
        }

        if (weapon instanceof FireRuneDecorator) {
          if (weapon.getCurrentFireDamage() === 0) {
            weapon.setFireDamage();
          }
        }
      }

      if (weapon.getCurrentFireDamage() > 0) {
        weapon.decreaseFireDamage();

        damage = damage + weapon.getBaseFireDamage();

        GameEventNotifier.getInstance().notifyLog(
          chalk.bold.red(
            `\n🔥 A runa de fogo causou queimaduras em ${boss.getName()}, adicionando 2 de dano!`,
          ),
        );
      }

      GameEventNotifier.getInstance().notifyLog(
        `⚔️  ${player.getName()} atacou com ${weapon.getName()} causando ${damage} de dano!`,
      );
    }

    boss.takeDamage(damage);
  }
}

export class SwampBossAttackStrategy implements AttackStrategy {
  execute(boss: Boss, player: Player): void {
    let damage: number;
    const chance = Math.random();  

    if (chance < 0.25) {
      damage = 30;

      GameEventNotifier.getInstance().notifyLog(
        `🍄 ${chalk.bold.red("ATAQUE PESADO!")} Golem Fúngico dispara uma nuvem de esporos. ${player.getName()} recebe ${damage} de dano e fica atordoado!`,
      );

      player.setStunned(true)
    } else {
      damage = 20

      GameEventNotifier.getInstance().notifyLog(
        `🍄 Golem Fúngico golpeia o solo e ataca com raízes. ${player.getName()} recebe ${damage} de dano!`,
      );
    }

    player.takeDamage(damage);
  }
}

export class MountainBossAttackStrategy implements AttackStrategy {
  execute(boss: Boss, player: Player): void {
    const chance = Math.random();
    let damage: number;

    if (chance < 0.25) {
      damage = 30
      GameEventNotifier.getInstance().notifyLog(
        `🦍 ${chalk.bold.red("ATAQUE PESADO!")} O Gorila Gigante arremessa ${player.getName()} para longe!\n` +
          `   Dano recebido: ${chalk.bold.red(damage + " HP")}.`,
      );

      boss.setDistanceAdvantage(true);
    } else {
      damage = 20;

      GameEventNotifier.getInstance().notifyLog(
        `🦍 O Gorila Gigante desfere um soco leve em ${player.getName()}!\n` +
          `   Dano recebido: ${chalk.bold.yellow(damage + " HP")}.`,
      );

    }

    player.takeDamage(damage);
  }
}

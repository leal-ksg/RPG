import chalk from "chalk";
import { prompt } from "../utils/prompt.ts";
import { Player } from "./player.ts";
import {
  CharacterKitFactory,
  MageKitFactory,
  WarriorKitFactory,
} from "../factories/character-kit-factory.ts";
import { sleep } from "../utils/sleep.ts";
import { Boss } from "./boss.ts";
import { Weapon, WeaponRange } from "./weapons.ts";
import {
  AttackStrategy,
  PlayerAttackStrategy,
} from "../strategies/attack-strategy.ts";
import { GameEventNotifier } from "../observers/game-notifier-observer.ts";
import { CliRenderer } from "../observers/cli-renderer.ts";
import {
  Biome,
  GloomySwampBiome,
  SnowyMountainBiome,
} from "../factories/biome-factory.ts";
import { clearLastLines } from "../utils/clear-last-lines.ts";
import {
  EletricRuneDecorator,
  FireRuneDecorator,
} from "../decorators/runes.ts";

export class AppManager {
  private static _instante: AppManager | null;
  private _player: Player | null = null;
  private _playerAttackStrategy: AttackStrategy = new PlayerAttackStrategy();

  private constructor() {
    GameEventNotifier.getInstance().subscribe(new CliRenderer());
  }

  public static getInstance(): AppManager {
    if (!AppManager._instante) {
      AppManager._instante = new AppManager();
    }

    return AppManager._instante;
  }

  private configAppStop(): void {
    process.on("SIGINT", () => {
      console.clear();
      GameEventNotifier.getInstance().notifyLog(
        `\n${chalk.yellow("👋 Obrigado por jogar o RPG!")}`,
      );
      process.exit(0);
    });
  }

  private presentCaracterClasses(): void {
    console.clear();

    GameEventNotifier.getInstance().notifyLog(`
 ${chalk.bold.cyan("──────────────────────────────────────────────────────────────────────────")}
 ${chalk.bold.yellow("                        SELECIONE SUA CLASSE   ")}
 ${chalk.bold.cyan("──────────────────────────────────────────────────────────────────────────")}
  Você deve escolher o seu caminho.
  Cada classe possui uma quantidade de pontos de vida e um arsenal de combate próprio.

  ${chalk.bold.red("⚔️  [1] GUERREIRO")}
  ------------------------------------------------------------------------
  • ${chalk.bold("Vida Máxima:")}      ${chalk.green.bold("200 HP")}
  • ${chalk.bold("Arma Primária:")}    ${chalk.red("Espada Pesada")} (Dano: 25 | Alcance: Curto)
  • ${chalk.bold("Arma Secundária:")}  ${chalk.red("Arco e flecha")} (Dano: 20 | Alcance: Longo)

  ${chalk.bold.blue("🔮  [2] MAGO")}
  ------------------------------------------------------------------------
  • ${chalk.bold("Vida Máxima:")}      ${chalk.yellow.bold("120 HP")}
  • ${chalk.bold("Arma Primária:")}    ${chalk.blue("Cajado Mágico")} (Dano: 20 | Alcance: Longo)
  • ${chalk.bold("Arma Secundária:")}  ${chalk.blue("Adaga Curta")}   (Dano: 17 | Alcance: Curto)

 ${chalk.bold.cyan("──────────────────────────────────────────────────────────────────────────")}
`);
  }

  private async setupCharacter() {
    let name: string | null = null;

    name = prompt(
      chalk.bold.yellow("    -> Como seu personagem vai se chamar? "),
    );

    name = name.toUpperCase().trim();

    this.presentCaracterClasses();
    let characterClass: number = Number(
      prompt(chalk.bold.yellow(" -> Qual será sua classe? [1 ou 2]: ")),
    );

    if (!characterClass) characterClass = 1;

    const factories: Record<number, CharacterKitFactory> = {
      1: new WarriorKitFactory(),
      2: new MageKitFactory(),
    };

    const factory: CharacterKitFactory =
      factories[characterClass] ?? new WarriorKitFactory();

    this._player = new Player(name, factory.getBaseHealthPoints());
    this._player.setWeapons(
      factory.createPrimaryWeapon(),
      factory.createSecondaryWeapon(),
    );

    GameEventNotifier.getInstance().notifyLog(
      chalk.green(`
  Herói criado com sucesso!
  Nome: ${chalk.bold(name)}
  Classe: ${chalk.bold(factory.getClassName())}
  Vida Inicial: ${chalk.bold(`${factory.getBaseHealthPoints()} HP`)} 
`),
    );

    await sleep(2500);
  }

  public async runGame() {
    this.configAppStop();
    console.clear();

    GameEventNotifier.getInstance().notifyLog(`
    ────────────────────────────────────────────────────────────────────────
                             ${chalk.bold.yellow("BEM VINDO AO RPG!")}
    ────────────────────────────────────────────────────────────────────────
    
    `);

    await this.setupCharacter();

    const campaign: Biome[] = [
      new GloomySwampBiome(),
      new SnowyMountainBiome(),
    ];

    for (let i = 0; i < campaign.length; i++) {
      const currentBiome = campaign[i];

      this._player?.restoreHealth();

      console.clear();
      GameEventNotifier.getInstance().notifyLog(
        `\n${chalk.bold.cyan("==========================================================================")}\n` +
          `  ${chalk.bold.yellow(`FASE ${i + 1}: ${currentBiome?.getName().toUpperCase()}`)}\n` +
          `  ${chalk.gray(`"${currentBiome?.getDescription()}"`)}\n\n` +
          `  ${chalk.green(`Vida totalmente restaurada para ${this._player?.getHealth()} HP.`)}\n` +
          `${chalk.bold.cyan("==========================================================================")}\n`,
      );
      await sleep(5000);

      const boss = currentBiome?.createBoss();
      const survived = await this.runCombatLoop(boss!);

      if (!survived) {
        GameEventNotifier.getInstance().notifyLog(
          chalk.bold.red(`\n FIM DA JORNADA.\n`),
        );
        return;
      }

      if (i < campaign.length - 1) {
        GameEventNotifier.getInstance().notifyLog(
          chalk.bold.green(
            `\n🎉 Vitória! Você superou o guardião do ${currentBiome?.getName()} e está pronto para avançar!`,
          ),
        );

        if (i === 0) {
          await this.setupRunes();
        }

        await sleep(2500);
      }
    }

    console.clear();
    GameEventNotifier.getInstance().notifyLog(
      `\n${chalk.bold.magenta("──────────────────────────────────────────────────────────────────────────")}\n` +
        `  Você superou todos os biomas e provou ser o mestre supremo do RPG!\n` +
        `${chalk.bold.magenta("──────────────────────────────────────────────────────────────────────────")}\n`,
    );
  }

  private async setupRunes(): Promise<void> {
    if (!this._player) return;

    const primaryWeapon = this._player.getPrimaryWeapon();
    if (!primaryWeapon) return;

    console.clear();
    GameEventNotifier.getInstance().notifyLog(`
 ${chalk.bold.magenta("══════════════════════════════════════════════════════════════════")}
 ${chalk.bold.yellow("                 RECOMPENSA ANCESTRAL: FORJA DE RUNAS ")}
 ${chalk.bold.magenta("══════════════════════════════════════════════════════════════════")}
  Nas ruínas do monstro derrotado, você encontra essências elementais místicas!
  As runas concedem habilidades especiais e aumentam o poder de sua arma ${chalk.bold.red(primaryWeapon.getName())}.

  ${chalk.bold.red("[1] RUNA DE FOGO")}
  • Efeito: Queima o oponente tirando vida contínua.
  • Bônus: +4 Ponto de dano permanente.

  ${chalk.bold.blue("[2] RUNA ELÉTRICA")}
  • Efeito: Conduz descargas que paralisam o inimigo temporariamente.
  • Bônus: +2 Pontos de dano permanente.

  ${chalk.bold.gray("[3] NÃO EQUIPAR RUNA")}
 ${chalk.bold.magenta("══════════════════════════════════════════════════════════════════")}
    `);

    GameEventNotifier.getInstance().notifyLog(
      chalk.bold.yellow(
        " Escolha qual runa encrustar em sua arma primária [1, 2 ou 3]: ",
      ),
    );

    const runeChoice = prompt("");
    clearLastLines(2);

    let decoratedWeapon: Weapon | null = null;

    if (runeChoice === "1") {
      decoratedWeapon = new FireRuneDecorator(primaryWeapon);
      GameEventNotifier.getInstance().notifyLog(
        chalk.bold.red(
          `\n🔥 Você fundiu a RUNA DE FOGO em sua arma primária! Dano aumentado para ${decoratedWeapon.getDamagePoints()}.`,
        ),
      );
    } else if (runeChoice === "2") {
      // Decorator Elétrico em ação
      decoratedWeapon = new EletricRuneDecorator(primaryWeapon);
      GameEventNotifier.getInstance().notifyLog(
        chalk.bold.blue(
          `\n⚡ Você fundiu a RUNA ELÉTRICA em sua arma primária! Dano aumentado para ${decoratedWeapon.getDamagePoints()}.`,
        ),
      );
    } else {
      GameEventNotifier.getInstance().notifyLog(
        chalk.gray(
          "\n Você decidiu manter sua arma como está, sem runas elementais.",
        ),
      );
    }

    if (decoratedWeapon) {
      this._player.setPrimaryWeapon(decoratedWeapon);
    }

    await sleep(3500);
  }

  public async runCombatLoop(boss: Boss): Promise<boolean> {
    if (!this._player) return false;

    GameEventNotifier.getInstance().notifyLog(
      chalk.bold.red(
        `\n⚠️  UM DESAFIO SE APROXIMA: ${boss.getName().toUpperCase()}!`,
      ),
    );
    await sleep(4000);

    let round = 1;

    while (this._player.isAlive() && boss.isAlive()) {
      console.clear();
      GameEventNotifier.getInstance().notifyLog(
        chalk.bold.gray(
          `\n─────────────────── RODADA ${round} ───────────────────`,
        ),
      );

      GameEventNotifier.getInstance().notifyHealthChanged(
        this._player.getName(),
        this._player.getHealth(),
      );
      GameEventNotifier.getInstance().notifyHealthChanged(
        boss.getName(),
        boss.getHealth(),
      );
      GameEventNotifier.getInstance().notifyLog(
        chalk.bold.gray(
          `─────────────────────────────────────────────────────────────\n`,
        ),
      );

      this.executePlayerTurn(boss);
      await sleep(2000);

      if (!boss.isAlive()) {
        break;
      }

      await this.executeBossTurn(boss);
      await sleep(2500);

      round++;
    }

    return this._player.isAlive();
  }

  private async executeBossTurn(boss: Boss): Promise<void> {
    GameEventNotifier.getInstance().notifyLog(
      `------ Turno do oponente ------`,
    );
    await sleep(1500);

    GameEventNotifier.getInstance().notifyLog("");
    boss.executeBossTurn(this._player!);
    await sleep(1500);
  }

  private executePlayerTurn(boss: Boss): void {
    if (!this._player) return;

    GameEventNotifier.getInstance().notifyLog(
      chalk.bold.yellow(`
    -> Escolha sua ação de ataque:
       [1] Atacar com ${this._player.getPrimaryWeapon()?.getName()} (Dano: ${this._player.getPrimaryWeapon()?.getDamagePoints()})
       [2] Atacar com ${this._player.getSecondaryWeapon()?.getName()} (Dano: ${this._player.getSecondaryWeapon()?.getDamagePoints()})
    `),
    );

    const chosenWeapon = prompt("");

    clearLastLines(2);

    const equippedWeapon =
      chosenWeapon === "2"
        ? this._player.getSecondaryWeapon()
        : this._player.getPrimaryWeapon();

    GameEventNotifier.getInstance().notifyLog("");
    this._playerAttackStrategy?.execute(this._player, boss, equippedWeapon!);

    GameEventNotifier.getInstance().notifyLog("");
    if (equippedWeapon?.getRange() === WeaponRange.LONG) {
      boss.setDistanceAdvantage(false);
    }
  }
}

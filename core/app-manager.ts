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
  ElectricRuneDecorator,
  FireRuneDecorator,
} from "../decorators/runes.ts";

export class AppManager {
  private static _instance: AppManager | null;
  private _player: Player | null = null;
  private _playerAttackStrategy: AttackStrategy = new PlayerAttackStrategy();
  private _notifier: GameEventNotifier;

  private constructor() {
    this._notifier = GameEventNotifier.getInstance();
    this._notifier.subscribe(new CliRenderer());
  }

  public static getInstance(): AppManager {
    if (!AppManager._instance) {
      AppManager._instance = new AppManager();
    }

    return AppManager._instance;
  }

  private configAppStop(): void {
    process.on("SIGINT", () => {
      console.clear();
      this._notifier.notifyLog(
        `\n${chalk.yellow("👋 Obrigado por jogar o RPG!")}`,
      );
      process.exit(0);
    });
  }

  private presentCharacterClasses(): void {
    console.clear();

    this._notifier.notifyLog(`
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
  • ${chalk.bold("Vida Máxima:")}      ${chalk.yellow.bold("150 HP")}
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

    if (!name) {
      name = "Jogador 1"
    }
  
    name = name.toUpperCase().trim();

    this.presentCharacterClasses();
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

    this._notifier.notifyLog(
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

    this._notifier.notifyLog(`
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
      this._notifier.notifyLog(
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
        this._notifier.notifyLog(chalk.bold.red(`\n FIM DA JORNADA.\n`));
        return;
      }

      if (i < campaign.length - 1) {
        this._notifier.notifyLog(
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
    this._notifier.notifyLog(
      `\n${chalk.bold.magenta("══════════════════════════════════════════════════════════════════════════")}\n` +
        `  Você superou todos os biomas e provou ser o mestre supremo do RPG!\n` +
        `${chalk.bold.magenta("══════════════════════════════════════════════════════════════════════════")}\n`,
    );
  }

  private async setupRunes(): Promise<void> {
    if (!this._player) return;

    const primaryWeapon = this._player.getPrimaryWeapon();
    if (!primaryWeapon) return;

    console.clear();
    this._notifier.notifyLog(`
 ${chalk.bold.magenta("══════════════════════════════════════════════════════════════════")}
 ${chalk.bold.yellow("                 RECOMPENSA ANCESTRAL: FORJA DE RUNAS ")}
 ${chalk.bold.magenta("══════════════════════════════════════════════════════════════════")}
  Nas ruínas do monstro derrotado, você encontra essências elementais místicas!
  As runas concedem chance de 38% de acerto de habilidades especiais e aumentam o poder de sua arma ${chalk.bold.red(primaryWeapon.getName())}.

  ${chalk.bold.red("[1] RUNA DE FOGO")}
  • Efeito: Queima o oponente tirando 2 pontos de vida por 2 rodadas.
  • Bônus: +4 Ponto de dano permanente.

  ${chalk.bold.blue("[2] RUNA ELÉTRICA")}
  • Efeito: Conduz descargas que paralisam o inimigo na rodada atual.
  • Bônus: +2 Pontos de dano permanente.

  ${chalk.bold.gray("[3] NÃO EQUIPAR RUNA")}
 ${chalk.bold.magenta("══════════════════════════════════════════════════════════════════")}
    `);

    this._notifier.notifyLog(
      chalk.bold.yellow(
        " -> Escolha qual runa encrustar em sua arma primária [1, 2 ou 3]: ",
      ),
    );

    const runeChoice = prompt("");
    clearLastLines(2);

    let decoratedWeapon: Weapon | null = null;

    if (runeChoice === "1") {
      decoratedWeapon = new FireRuneDecorator(primaryWeapon);
      this._notifier.notifyLog(
        chalk.bold.red(
          `\n🔥 Você fundiu a RUNA DE FOGO em sua arma primária! Dano aumentado para ${decoratedWeapon.getDamagePoints()}.`,
        ),
      );
    } else if (runeChoice === "2") {

      decoratedWeapon = new ElectricRuneDecorator(primaryWeapon);
      this._notifier.notifyLog(
        chalk.bold.blue(
          `\n⚡ Você fundiu a RUNA ELÉTRICA em sua arma primária! Dano aumentado para ${decoratedWeapon.getDamagePoints()}.`,
        ),
      );
    } else {
      this._notifier.notifyLog(
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

    this._notifier.notifyLog(
      chalk.bold.red(
        `\n⚠️  UM DESAFIO SE APROXIMA: ${boss.getName().toUpperCase()}!`,
      ),
    );
    await sleep(4000);

    let round = 1;

    while (this._player.isAlive() && boss.isAlive()) {
      console.clear();
      this._notifier.notifyLog(
        chalk.bold.gray(
          `\n   ──────────────────── RODADA ${round} ────────────────────`,
        ),
      );

      this._notifier.notifyHealthChanged(
        this._player.getName(),
        this._player.getHealth(),
      );
      this._notifier.notifyHealthChanged(boss.getName(), boss.getHealth());
      this._notifier.notifyLog(
        chalk.bold.gray(
          `──────────────────────────────────────────────────\n`,
        ),
      );

      if (this._player.isStunned()) {
        this._notifier.notifyLog(
          chalk.bold.magenta(
            `${this._player.getName()} está paralisado e não poderá atacar nesse turno!\n`,
          ),
        );
        await sleep(800);
        this._player.setStunned(false);
      } else {
        this.executePlayerTurn(boss);
      }
      
      await sleep(2000);

      if (!boss.isAlive()) {
        break;
      }

      if (boss.isStunned()) {
        this._notifier.notifyLog(
          chalk.bold.magenta(
            `${boss.getName()} está paralisado e não poderá atacar nesse turno!`,
          ),
        );
        await sleep(800);
        boss.setStunned(false);
      } else {
        await this.executeBossTurn(boss);
      }

      await sleep(2500);

      round++;
    }

    return this._player.isAlive();
  }

  private async executeBossTurn(boss: Boss): Promise<void> {
    this._notifier.notifyLog(`------ Turno do oponente ------`);
    await sleep(1500);

    this._notifier.notifyLog("");
    boss.executeBossTurn(this._player!);
    await sleep(1500);
  }

  private executePlayerTurn(boss: Boss): void {
    if (!this._player) return;

    this._notifier.notifyLog(
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

    this._notifier.notifyLog("");
    this._playerAttackStrategy?.execute(this._player, boss, equippedWeapon!);

    this._notifier.notifyLog("");
    if (equippedWeapon?.getRange() === WeaponRange.LONG) {
      boss.setDistanceAdvantage(false);
    }
  }
}

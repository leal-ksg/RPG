import chalk from "chalk";
import { GameObserver } from "./game-notifier-observer.ts";

export class CliRenderer implements GameObserver {
  public onLog(message: string): void {
    console.log(`   ${message}`);
  }

  public onHealthChanged(entityName: string, currentHealth: number): void {
    let healthBar = "";
    const totalBars = 10;
    
    let barColor = chalk.green;
    if (currentHealth < 40) {
      barColor = chalk.red.bold;
    } else if (currentHealth < 100) {
      barColor = chalk.yellow;
    }

    // Cria representação visual da vida
    const numBars = Math.max(0, Math.ceil(currentHealth / 20));
    healthBar = "█".repeat(Math.min(totalBars, numBars)) + "░".repeat(Math.max(0, totalBars - numBars));

    console.log(
      `   [${chalk.bold(entityName)}] ${barColor(healthBar)} (${barColor(currentHealth + " HP")})`
    );
  }

  public onDeath(entityName: string): void {
    console.log(`\n   💀 ${chalk.red.bold(` ${entityName.toUpperCase()} FOI DERROTADO(A)!`)}\n`);
  }
}
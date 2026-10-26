import readline from "node:readline";

export function clearLastLines(count: number = 1): void {
  for (let i = 0; i < count; i++) {
    readline.moveCursor(process.stdout, 0, -1);
    readline.clearLine(process.stdout, 0);
  }
}

const enabled = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

function wrap(open: number, close: number, value: string): string {
  if (!enabled) return value;
  return `\u001b[${open}m${value}\u001b[${close}m`;
}

export const color = {
  bold: (value: string) => wrap(1, 22, value),
  dim: (value: string) => wrap(2, 22, value),
  red: (value: string) => wrap(31, 39, value),
  green: (value: string) => wrap(32, 39, value),
  yellow: (value: string) => wrap(33, 39, value),
  cyan: (value: string) => wrap(36, 39, value),
  white: (value: string) => wrap(37, 39, value),
  bgBlack: (value: string) => wrap(40, 49, value),
  inverse: (value: string) => wrap(7, 27, value),
};

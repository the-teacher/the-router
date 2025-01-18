#!/usr/bin/env node
/* eslint-disable no-console */

export const parseArgs = (args: string[]) => {
  const options: Record<string, string> = {};

  args.slice(2).forEach((arg) => {
    if (arg.includes("=")) {
      const [key, value] = arg.split("=");
      options[key] = value;
    }
  });

  return options;
};

export const sync = (options: Record<string, string>) => {
  console.log("Hello World!");
  console.log("Provided options:", options);
};

if (require.main === module) {
  const command = process.argv[2];
  const options = parseArgs(process.argv);

  if (command === "sync") {
    sync(options);
  } else {
    console.log("Unknown command. Available commands: sync");
    process.exit(1);
  }
}

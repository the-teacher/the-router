#!/usr/bin/env node
/* eslint-disable no-console */

import path from "path";
import { getRouter, resetRouter } from "../index";

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

export const sync = async (options: Record<string, string>) => {
  if (!options.routesFile) {
    console.error("Error: routesFile parameter is required");
    process.exit(1);
  }

  try {
    resetRouter();

    const routesFilePath = path.resolve(process.cwd(), options.routesFile);

    await import(routesFilePath);

    const router = getRouter();

    console.log("\nRouter configuration:");
    console.log(router);

    console.log("\nConfigured Routes:");
    router.stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .join(", ")
          .toUpperCase();
        console.log(`${methods} ${layer.route.path}`);
      }
    });
  } catch (error) {
    console.error("Error loading routes file:", error);
    process.exit(1);
  }
};

const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const command = process.argv[2];
  const options = parseArgs(process.argv);

  if (command === "sync") {
    sync(options);
  } else {
    console.log("Unknown command. Available commands: sync");
    process.exit(1);
  }
}

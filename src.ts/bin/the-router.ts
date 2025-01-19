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
  try {
    if (!options.routesFile) {
      throw new Error("routesFile parameter is required");
    }

    resetRouter();

    const routesFilePath = path.resolve(process.cwd(), options.routesFile);
    console.log("Loading routes from:", routesFilePath);

    await import(routesFilePath);

    const router = getRouter();

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
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

// Проверяем, запущен ли файл напрямую
const isMainModule = import.meta.url.startsWith("file:");

if (isMainModule) {
  const command = process.argv[2];
  const options = parseArgs(process.argv);

  if (!command) {
    console.error("Error: Command is required. Available commands: sync");
    process.exit(1);
  }

  if (command === "sync") {
    sync(options).catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
  } else {
    console.error("Unknown command. Available commands: sync");
    process.exit(1);
  }
}

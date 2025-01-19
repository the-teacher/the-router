#!/usr/bin/env node
/* eslint-disable no-console */

import path from "path";
import { getRouter, resetRouter } from "../index";

type RouteLayer = {
  route?: {
    path: string;
    methods: Record<string, boolean>;
  };
};

export const parseArgs = (args: string[]): Record<string, string> => {
  const options: Record<string, string> = {};

  args.slice(2).forEach((arg) => {
    if (arg.includes("=")) {
      const [key, value] = arg.split("=");
      const cleanKey = key.replace(/^--/, "");
      options[cleanKey] = value;
    }
  });

  return options;
};

export const sync = async (options: Record<string, string>): Promise<void> => {
  console.log("options.routesFile", options.routesFile);

  if (!options.routesFile) {
    console.error("Error:", "routesFile parameter is required");
    process.exit(1);
  }

  console.log("CONTINUE >>>>>");

  try {
    resetRouter();

    const routesFilePath = path.resolve(process.cwd(), options.routesFile);
    console.log("Loading routes from:", routesFilePath);

    await import(routesFilePath);

    const router = getRouter();

    console.log("\nConfigured Routes:");
    (router.stack as RouteLayer[]).forEach((layer) => {
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

export const runCli = () => {
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
};

// Run CLI only if this file is executed directly
if (process.argv[1].endsWith("the-router.js")) {
  runCli();
}

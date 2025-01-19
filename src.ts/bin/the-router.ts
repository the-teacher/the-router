#!/usr/bin/env node
/**
 * CLI tool for managing and displaying Express routes
 *
 * Features:
 * - Loads routes from a specified file
 * - Displays configured routes with their HTTP methods and paths
 * - Supports dynamic route parameters
 *
 * Usage:
 *   node the-router.js sync --routesFile=path/to/routes.ts
 *
 * Options:
 *   --routesFile  Path to the routes configuration file (required)
 */

/* eslint-disable no-console */

import path from "path";
import { resetRouter } from "../index";
import { getRoutesMap } from "../base";

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
  if (!options.routesFile) {
    console.error("Error:", "routesFile parameter is required");
    process.exit(1);
  }

  try {
    resetRouter();

    const routesFilePath = path.resolve(process.cwd(), options.routesFile);
    console.log("Loading routes from:", routesFilePath);

    await import(routesFilePath);

    // EXAMPLE OF ROUTES MAP
    //
    // Map(3) {
    //   'GET:/' => {
    //     method: 'GET',
    //     path: '/',
    //     action: 'home/index',
    //     middlewares: [ [AsyncFunction (anonymous)] ]
    //   },
    //   'GET:/api/products' => {
    //     method: 'GET',
    //     path: '/api/products',
    //     action: 'products/list',
    //     middlewares: [ [AsyncFunction (anonymous)] ]
    //   },
    //   'POST:/api/orders' => {
    //     method: 'POST',
    //     path: '/api/orders',
    //     action: 'orders/create',
    //     middlewares: [ [AsyncFunction (anonymous)] ]
    //   }
    // }
    //
    const routesMap = getRoutesMap();

    console.log("\nConfigured Routes:");

    routesMap.forEach((route, key) => {
      const [method, path] = key.split(":");
      console.log(`${method} | ${path} | ${route.action}`);
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

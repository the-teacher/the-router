#!/usr/bin/env node
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src.ts/bin/the-router.ts
var the_router_exports = {};
__export(the_router_exports, {
  parseArgs: () => parseArgs,
  sync: () => sync
});
module.exports = __toCommonJS(the_router_exports);
var parseArgs = (args) => {
  const options = {};
  args.slice(2).forEach((arg) => {
    if (arg.includes("=")) {
      const [key, value] = arg.split("=");
      options[key] = value;
    }
  });
  return options;
};
var sync = (options) => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseArgs,
  sync
});
//# sourceMappingURL=the-router.js.map

import esbuild from "esbuild";

// Check if watch flag is present in command line arguments
const isWatch = process.argv.includes("--watch");

/** @type {import('esbuild').BuildOptions} */
const config = {
  entryPoints: ["src.ts/index.ts"],
  bundle: true,
  outdir: "src",
  platform: "node",
  target: "node18",
  format: "esm", // Changed from 'cjs' to 'esm'
  sourcemap: true,
  external: ["express"] // Exclude express from bundle
};

if (isWatch) {
  // Start watch mode for development
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  // Run single build
  await esbuild.build(config);
  console.log("Build complete");
}

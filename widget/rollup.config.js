import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "@rollup/plugin-terser";
import pkg from "./package.json";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig([
  // UMD build for browser usage (with global fallback)
  {
    input: "src/VaunticoTrustWidget.ts",
    output: {
      file: pkg.main,
      format: "umd",
      name: "VaunticoTrustWidget",
      sourcemap: !isProduction,
      exports: "named",
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "dist",
        rootDir: "src",
      }),
      isProduction &&
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          format: {
            comments: false,
          },
        }),
    ].filter(Boolean),
  },

  // ES Module build for modern bundlers
  {
    input: "src/VaunticoTrustWidget.ts",
    output: {
      file: pkg.module,
      format: "es",
      sourcemap: !isProduction,
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false, // Already generated in UMD build
      }),
      isProduction &&
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          format: {
            comments: false,
          },
        }),
    ].filter(Boolean),
  },

  // Minified UMD build for CDN usage
  {
    input: "src/VaunticoTrustWidget.ts",
    output: {
      file: "dist/vauntico-trust-widget.min.js",
      format: "umd",
      name: "VaunticoTrustWidget",
      sourcemap: true,
      exports: "named",
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
      }),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
        mangle: {
          toplevel: true,
        },
      }),
    ],
  },
]);

import * as esbuild from 'esbuild';
import SpglslPlugin from 'esbuild-plugin-spglsl';
import { DEFINITIONS } from './constants.mjs';

esbuild.build({
  entryPoints: ["src/ts/app.ts"],
  bundle: true,
  format: 'iife',
  write: false,
  define: {
    "DEBUG": 'false',
    "DISABLE_WEB_WORKER": 'false',
    ...DEFINITIONS
  },
  loader: {
    ".webp": "dataurl"
  },
  plugins: [
    SpglslPlugin({
      compileMode: 'Optimize',
      minify: true
    }),
  ]
}).then(result =>
{
  for (let out of result.outputFiles)
  {
    console.log(out.text);
  }
});

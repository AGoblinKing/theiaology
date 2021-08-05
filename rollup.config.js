
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

import glslify from 'rollup-plugin-glslify'

import json from '@rollup/plugin-json'

import path from 'path'
import ts from '@rollup/plugin-typescript'
import fs from 'fs'

import serve from 'rollup-plugin-serve'

const production = !process.env.ROLLUP_WATCH

const trydep = (rootPath) => {
  const absPath = path.resolve(__dirname, rootPath)
  return fs.existsSync(absPath) ? absPath : null
}

const rootImport = (options) => ({
  resolveId: (importee) => {
    if (importee.substr(0, 3) === 'src' || importee.substr(0, 6) === 'public') {
      let result
      let i = 0
      while (!result && i < options.extensions.length) {
        const ext = options.extensions[i]
        result = trydep(`${options.root}${importee}${ext}`)
        i++
      }

      return result
    }

    return null
  },
})

const config = (input) => {
  return {
    input: `src/${input}.ts`,

    output: {
      format: 'es',
 
      chunkFileNames: '[name].js',
      sourcemap: true,

      name: 'app',
      dir: `public/build/`,
    },
    plugins: [
      json(),
      glslify({
        compress: false,
      }),
      ts(),
      rootImport({
        extensions: ['.ts', '', '.json', '.js'],
        root: `${__dirname}/`,
      }),

      resolve({
        browser: true,
        preferBuiltins: false,
        extensions: ['.js', '.ts'],
      }),

      commonjs(),
      !production && serve({
        historyApiFallback: true,
        contentBase: 'public',
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        }
      }), // index.html should be in root of project

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),
    ],
    watch: {
      clearScreen: false,
    },
  }
}

export default [config('main'), config('system/physics'), config('system/fuzz'), config('system/cardinal')]

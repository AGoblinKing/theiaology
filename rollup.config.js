
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import css from 'rollup-plugin-css-only'
import glslify from 'rollup-plugin-glslify'

import svelte from 'rollup-plugin-svelte'
import autoPreprocess from 'svelte-preprocess'
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

let once = true
const config = (input, dst = "", importThree = false) => {

  const o = {
    input: `src/${input}.ts`,

    external: ["three"],
    output: {
      globals: {
        three: "THREE"
      },
      format: 'iife',
      chunkFileNames: '[name].js',
      sourcemap: true,

      name: 'app',
      dir: `public/build/${dst}`,
    },
    plugins: [
      css(),
      resolve({
        browser: true,
        moduleDirectories: ['node_modules'],
        dedupe: ['svelte'],
        extensions: ['.js', '.ts'],
      }),
      svelte({
        onwarn: (warning, handler) => {
          switch (warning.code) {
            case "missing-declaration":
            case 'a11y-mouse-events-have-key-events':
            case 'a11y-autofocus':
            case 'module-script-reactive-declaration':
            case 'unused-export-let':
            case 'a11y-distracting-elements':
              return
            default:
              console.log(warning.code)
          }
          handler(warning)
        },
        extensions: ['.svelte'],
        preprocess: autoPreprocess({
          typescript: {
            compilerOptions: {
              checkJs: false,
            },
          },
        }),
      }),

      json(),
      glslify({
        compress: false,
      }),
      ts({
        
      }),
      rootImport({
        extensions: ['.ts', '.svelte', '', '.json', '.js'],
        root: `${__dirname}/`,
      }),


      commonjs({
     
      }),
      !production && once && serve({
        historyApiFallback: true,
        contentBase: 'public',
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        }
      }), 

      production && terser(),

      {
        renderChunk(code) {
          return {
            code: `${importThree ? `if(typeof importScripts === "function") { importScripts("/three.js") }\r\n`: ''}${code}`,
            map: null
          }
        }

      }
    ],
    watch: {
      clearScreen: false,
    },
    
  }
  once = false
  return o 
}

export default [ config('main'), config('service', ".."), config('system/physics', "",  true), config('system/fuzz',"", true), config('system/cardinal',"", true), config('system/weather', "", true)]

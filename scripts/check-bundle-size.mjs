#!/usr/bin/env node
/**
 * Bundle size budget checker.
 *
 * Measures gzipped sizes of the built library artifacts in `dist/` and
 * fails (exit 1) if any file exceeds its declared gzipped budget.
 *
 * This replaces `size-limit` because the standard `size-limit` package
 * (11.x and 12.x) does not work with pnpm 11's symlinked layout: its
 * dynamic-import plugin loader fails to resolve @size-limit/* from the
 * pnpm store link. Implementing the gzipped-size check directly avoids
 * that issue and keeps the dependency surface small.
 *
 * Gzipped size is the standard metric for HTTP delivery; raw size is
 * informational only and not gated by the budget.
 *
 * Keep this script's output stable so it can be parsed in CI logs.
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSize } from 'gzip-size'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

/**
 * Per-format gzipped budget in bytes. The gzipped budget is the only
 * thing the CI gate enforces; raw size is reported for context.
 *
 * The values were captured after the v4.0.0-beta.10 build (see PR
 * description) and include a small headroom so that minor refactors
 * do not need to renegotiate the budget on every PR.
 */
const KILOBYTE = 1024
/** @type {{ file: string; budget: number }[]} */
const budgets = [
  { file: 'index.modern.js', budget: 56 * KILOBYTE },
  { file: 'index.es.js', budget: 56 * KILOBYTE },
  { file: 'index.cjs', budget: 56 * KILOBYTE },
]

function fmt(bytes) {
  return `${(bytes / KILOBYTE).toFixed(2)} kB`
}

async function exists(file) {
  try {
    await stat(file)
    return true
  } catch {
    return false
  }
}

async function main() {
  if (!(await exists(distDir))) {
    console.error(`dist/ not found at ${distDir}. Run pnpm build:dist first.`)
    process.exit(2)
  }

  const entries = await readdir(distDir)
  console.log(
    `File                        Raw           Gzipped        Budget       Status`
  )
  console.log('-'.repeat(86))

  let failed = 0
  for (const { file, budget } of budgets) {
    const filePath = path.join(distDir, file)
    if (!(await exists(filePath))) {
      console.error(`Missing artifact: ${file}`)
      failed += 1
      continue
    }
    const raw = await readFile(filePath, 'utf-8')
    const gz = await gzipSize(raw)
    const ok = gz <= budget
    if (!ok) failed += 1
    console.log(
      `${file.padEnd(28)}${fmt(raw.length).padStart(8)}     ${fmt(gz).padStart(8)}     ${fmt(budget).padStart(8)}     ${ok ? 'OK' : 'OVER BUDGET'}`
    )
  }

  console.log('')
  if (failed > 0) {
    console.error(
      `Bundle size check FAILED: ${failed} file(s) over gzipped budget. ` +
        `Bump the budget in scripts/check-bundle-size.mjs only after reviewing the diff.`
    )
    process.exit(1)
  }
  console.log('Bundle size check passed.')
}

main().catch((err) => {
  console.error(err)
  process.exit(2)
})

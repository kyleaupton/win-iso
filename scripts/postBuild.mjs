import { writeFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const _filename = fileURLToPath(import.meta.url)
const _dirname = dirname(_filename)

await writeFile(resolve(_dirname, '..', 'dist', 'cjs', 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2))
await writeFile(resolve(_dirname, '..', 'dist', 'esm', 'package.json'), JSON.stringify({ type: 'module' }, null, 2))

// Make dist/cjs/cli.js && dist/esm/cli.js executable
if (process.platform !== 'win32') {
  execSync('chmod +x dist/cjs/cli.js')
  execSync('chmod +x dist/esm/cli.js')
}

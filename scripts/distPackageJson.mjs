import { writeFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const _filename = fileURLToPath(import.meta.url)
const _dirname = dirname(_filename)

await writeFile(resolve(_dirname, '..', 'dist', 'cjs', 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2))
await writeFile(resolve(_dirname, '..', 'dist', 'esm', 'package.json'), JSON.stringify({ type: 'module' }, null, 2))

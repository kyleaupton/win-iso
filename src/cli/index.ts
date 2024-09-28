#!/usr/bin/env node

import { interactive } from './interactive.js'
import { nonInteractive } from './non-interactive.js'

if (process.argv.length <= 2) {
  await interactive()
} else {
  await nonInteractive()
}

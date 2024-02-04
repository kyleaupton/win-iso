#!/usr/bin/env node

import { program, Option } from 'commander'
import chalk from 'chalk'
import { logger } from './utils/log.js'
import { getDownloadOptions } from './index.js'

program
  .command('list')
  .description('List all available download options')
  .action(() => {
    console.log('Available download options:\n')

    // Header
    console.log(`${chalk.bold.underline('Key')}\t\t${chalk.bold.underline('Display Name')}`)

    // Data
    console.log(
      getDownloadOptions()
        .map(x => `${x.key}\t${x.displayName}`)
        .join('\n')
    )
  })

program
  .command('download')
  .argument('<key>', 'The key of the windows version to download')
  .addOption(new Option('-d, --directory <path>', 'The directory to save the downloaded file in'))
  .addOption(new Option('-n, --name <name>', 'The output name for the downloaded file').conflicts('-d, --directory'))
  .addOption(new Option('--debug', 'Enable debug mode'))
  .description('Download the specified windows version')
  .action(async (key, { name, directory, debug }) => {
    const options = getDownloadOptions()
    const option = options.find(x => x.key === key)

    if (!option) {
      console.error(`Invalid key: ${key}. Use 'list' command to see available options.`)
      process.exit(1)
    }

    logger.info(`Downloading ${option.displayName}...`)
    await option.download({ directory: directory || process.cwd(), name, debug })
  })

program.parse()

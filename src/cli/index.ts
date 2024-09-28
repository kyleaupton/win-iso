#!/usr/bin/env node

import fs from 'node:fs'
import { Command, Option } from 'commander'
import { select, input } from '@inquirer/prompts'
import chalk from 'chalk'
import ora from 'ora'
import { logger } from '../utils/log.js'
import { getDownloadOptions } from '../index.js'
import { getDownloadLocationChoices } from './utils.js'

const packageJson = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'))

const program = new Command()

program
  .name('win-iso')
  .description('A CLI tool to download Windows ISO files')
  .version(packageJson.version, '-v, --version', 'Display version number')
  .helpOption(undefined, 'Display help')
  .helpCommand('help [command]', 'Display help for command')

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
  .addOption(new Option('-d, --directory <path>', 'The directory to save the downloaded ISO in'))
  .addOption(new Option('-n, --name <name>', 'The output name for the downloaded file').conflicts('-d, --directory'))
  .addOption(new Option('--debug', 'Enable debug mode'))
  .addOption(new Option('--log', 'Enable logging'))
  .description('Download the specified windows version')
  .action(async (key, { name, directory, debug, log }) => {
    const options = getDownloadOptions()
    const option = options.find(x => x.key === key)

    if (!option) {
      console.error(`Invalid key: ${key}. Use 'list' command to see available options.`)
      process.exit(1)
    }

    logger.info(`Downloading ${option.displayName}...`)
    await option.download({ directory: directory || process.cwd(), name, debug, log })
  })

if (process.argv.length <= 2) {
  // Interactive
  const downloadOptions = getDownloadOptions()

  const chosenKey = await select({
    message: 'Select a version of Windows to download',
    choices: downloadOptions.map(x => ({ name: x.displayName, value: x.key }))
  })

  const chosenVersion = downloadOptions.find(x => x.key === chosenKey)
  if (!chosenVersion) {
    console.error(`Invalid key: ${chosenKey}. Use 'list' command to see available options.`)
    process.exit(1)
  }

  let downloadLocation = await select({
    message: 'Select where to save the downloaded ISO file',
    choices: getDownloadLocationChoices()
  })

  if (downloadLocation === 'custom') {
    const customLocation = await input({
      message: 'Enter the custom directory to save the downloaded ISO file'
    })
    downloadLocation = customLocation
  }

  // Validate the download location
  if (!fs.existsSync(downloadLocation)) {
    console.error(`Error: Download location ${downloadLocation} does not exist`)
    process.exit(1)
  }

  const downloadSpinner = ora(`Downloading ${chosenVersion.displayName} to ${downloadLocation}...`).start()

  const debug = process.env.DEBUG === 'true'
  const log = process.env.LOG === 'true'

  const path = await chosenVersion.download({ directory: downloadLocation, debug, log })

  downloadSpinner.succeed(`Downloaded ${chosenVersion.displayName} to ${path}`)
} else {
  // Non-interactive
  program.parse()
}

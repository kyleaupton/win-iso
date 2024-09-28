import fs from 'node:fs'
import { Command, Option } from 'commander'
import chalk from 'chalk'
import { getDownloadChoices } from '../index.js'
import ProgressBar from './ProgressBar.js'

export const nonInteractive = async () => {
  const packageJson = JSON.parse(
    fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
  )
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
        getDownloadChoices()
          .map(x => `${x.key}\t${x.displayName}`)
          .join('\n')
      )
    })

  program
    .command('download')
    .argument('<key>', 'The key of the windows version to download')
    .addOption(new Option('-d, --directory <path>', 'The directory to save the downloaded ISO in'))
    .addOption(new Option('-n, --name <name>', 'The output name for the downloaded file').conflicts('-d, --directory'))
    .description('Download the specified windows version')
    .action(async (key, { name, directory }) => {
      // Validate location exists if provided
      if (directory && !fs.existsSync(directory)) {
        console.error(`Error: Download location ${directory} does not exist`)
        process.exit(1)
      }

      const options = getDownloadChoices()
      const option = options.find(x => x.key === key)
      if (!option) {
        console.error(`Invalid key: ${key}. Use 'list' command to see available options.`)
        process.exit(1)
      }

      console.log('Downloading...')
      const progressBar = new ProgressBar()

      const path = await option.download({
        directory: directory || process.cwd(),
        name,
        log: process.env.WIN_ISO_DEBUG === 'true',
        onProgress: (progress) => { progressBar.update(progress) }
      })

      console.log(`Downloaded: ${path}`)
    })

  program.parse()
}

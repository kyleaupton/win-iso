import fs from 'node:fs'
import { select, input } from '@inquirer/prompts'
import cliProgress from 'cli-progress'
import prettyBytes from 'pretty-bytes'
import { getDownloadChoices } from '../index.js'
import { getDownloadLocationChoices } from './utils.js'

export const interactive = async () => {
  const downloadChoices = getDownloadChoices()

  const chosenKey = await select({
    message: 'Select a version of Windows to download',
    choices: downloadChoices.map(x => ({ name: x.displayName, value: x.key }))
  })

  const chosenVersion = downloadChoices.find(x => x.key === chosenKey)
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

  // const debug = process.env.DEBUG === 'true'
  // const log = process.env.LOG === 'true'
  const debug = true
  const log = false

  console.log('\nDownloading...')

  const progressBar = new cliProgress.SingleBar({
    format: '{bar} {percentage}% | ETA: {eta} | Speed: {speed} | {progress}'
  }, cliProgress.Presets.shades_classic)

  progressBar.start(100, 0, {
    eta: 'N/A',
    speed: 'N/A',
    progress: '0 / 0'
  })

  const path = await chosenVersion.download({
    directory: downloadLocation,
    debug,
    log,
    onProgress: (progress) => {
      progressBar.update(progress.percentage, {
        eta: progress.formattedEta,
        speed: prettyBytes(progress.speed),
        progress: `${prettyBytes(progress.downloaded)} / ${prettyBytes(progress.total)}`
      })

      if (progress.percentage === 100) {
        progressBar.stop()
      }
    }
  })

  console.log(`\nDownloaded: ${path}`)
}

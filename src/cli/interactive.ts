import fs from 'node:fs'
import { select, input } from '@inquirer/prompts'
import { getDownloadChoices } from '../index.js'
import ProgressBar from './ProgressBar.js'
import { getDownloadLocationChoices } from './utils.js'

export const interactive = async () => {
  if (process.env.WIN_ISO_DEV === 'true') {
    console.log('Dev mode enabled')
  }

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

  console.log('\nDownloading...')
  const progressBar = new ProgressBar()

  const path = await chosenVersion.download({
    directory: downloadLocation,
    log: process.env.WIN_ISO_DEBUG === 'true',
    onProgress: (progress) => { progressBar.update(progress) }
  })

  console.log(`\nDownloaded: ${path}`)
}

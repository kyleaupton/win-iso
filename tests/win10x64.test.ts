import fs from 'node:fs'
import path from 'node:path'
import { describe, test, beforeAll } from 'vitest'
import { WindowsIsoDownloader } from '../src/index.js'

describe('Win10x64', () => {
  const directory = path.join(process.cwd(), 'test-downloads')

  // Ensure the test-downloads directory exists
  beforeAll(() => {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory)
    }
  })

  test('download', async () => {
    const downloader = new WindowsIsoDownloader({
      key: 'win10x64',
      directory,
      log: true
    })

    downloader.on('progress', (progress) => {
      console.log(progress)
    })

    await downloader.download()
  })
})

import { type Media } from './index.js'
import consumerDownload from '../utils/consumerDownload.js'

const win10x64: Media = {
  displayName: 'Windows 10 (64-bit)',
  download: async (options) => {
    return await consumerDownload({ version: 10, ...options })
  }
}

export default win10x64

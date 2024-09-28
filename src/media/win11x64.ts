import { type Media } from './index.js'
import consumerDownload from '../utils/consumerDownload.js'

const win11x64: Media = {
  displayName: 'Windows 11 (64-bit)',
  download: async (options) => {
    return await consumerDownload({ version: 11, ...options })
  }
}

export default win11x64

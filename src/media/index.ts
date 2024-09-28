import win10x64 from './win10x64.js'
import win11x64 from './win11x64.js'

export interface MediaDownloadProgress {
  percentage: number
  downloaded: number
  total: number
  speed: number
  eta: number
  formattedEta: string
}

export interface MediaDownloadOptions {
  /**
   * Whre the file should be saved to
   */
  directory: string
  /**
   * The name of the file to save as. If not
   * provided, the name will be whatever Microsoft sets it as.
   */
  name?: string
  /**
   * Enable debug mode. If enabled, this library will not actually
   * make any requests to Microsoft's servers, but will instead
   * use the sample data provided in the `samples-res` directory.
   * This also means that a ISO file will not be downloaded.
   */
  debug?: boolean
  /**
   * Enable logging. If enabled, this library will log various
   * information to stdio.
   */
  log?: boolean
  /**
   * A callback that is called when progress is made on the download.
   */
  onProgress?: (progress: MediaDownloadProgress) => void
}

export type MediaDownloadResult = string

export interface Media {
  displayName: string
  download: (options: MediaDownloadOptions) => Promise<MediaDownloadResult>
}

const media = (<T extends Record<keyof T, Media>>(m: T) => m)({
  win10x64,
  win11x64
})

export type MediaKeys = keyof typeof media

export default media

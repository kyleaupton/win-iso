import win10x64 from './win10x64.js'
import win11x64 from './win11x64.js'

export interface MediaDownloadOptions {
  directory: string
  name?: string
  debug?: boolean
  log?: boolean
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

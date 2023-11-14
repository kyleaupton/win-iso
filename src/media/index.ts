import win10x64 from './win10x64.js'
import win11x64 from './win11x64.js'

export interface Media {
  key: string
  displayName: string
  download: ({ directory }: { directory: string }) => Promise<void>
}

export enum MediaKeys {
  'win10x64',
  'win11x64'
}

const media: Record<keyof typeof MediaKeys, Media> = {
  win10x64: {
    key: 'win10x64',
    displayName: 'Windows 10 (64-bit)',
    download: win10x64
  },
  win11x64: {
    key: 'win11x64',
    displayName: 'Windows 11 (64-bit)',
    download: win11x64
  }
}

export default media

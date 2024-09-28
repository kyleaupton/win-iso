import { TypedEmitter } from 'tiny-typed-emitter'
import media, { type Media, type MediaKeys, type MediaDownloadOptions } from './media/index.js'
import { type DownloadProgress } from './types.js'

type DownloadChoice = Media & { key: MediaKeys }

/**
 * getDownloadChoices
 * @returns {DownloadOption[]} An array of download choices
 */
export const getDownloadChoices = (): DownloadChoice[] => {
  const payload: DownloadChoice[] = []

  for (const key in media) {
    const _key = key as MediaKeys
    payload.push({ key: _key, ...media[_key] })
  }

  return payload
}

type DownloadOptions = Omit<MediaDownloadOptions, 'onProgress'> & { key: MediaKeys }

interface WindowsIsoDownloaderEvents {
  'progress': (progress: DownloadProgress) => void
}

export class WindowsIsoDownloader extends TypedEmitter<WindowsIsoDownloaderEvents> {
  options: DownloadOptions
  media: Media

  constructor(options: DownloadOptions) {
    super()

    const targetMedia = media[options.key]
    if (!targetMedia) {
      throw Error(`Invalid media key: ${options.key}`)
    }

    this.options = options
    this.media = targetMedia
  }

  async download() {
    return await this.media.download({
      ...this.options,
      onProgress: (progress) => {
        this.emit('progress', progress)
      }
    })
  }
}

import media, { type Media, type MediaKeys, type MediaDownloadOptions, type MediaDownloadResult } from './media/index.js'

type DownloadOption = Media & { key: MediaKeys }

/**
 * getDownloadOptions
 * @returns {DownloadOption[]} An array of download options
 */
export const getDownloadOptions = (): DownloadOption[] => {
  const payload: DownloadOption[] = []

  for (const key in media) {
    const _key = key as MediaKeys
    payload.push({ key: _key, ...media[_key] })
  }

  return payload
}

type DownloadOptions = MediaDownloadOptions & { key: MediaKeys }

/**
 * Download a specific Windows ISO
 * @param {DownloadOptions} options
 * @returns {Promise<MediaDownloadResult>}
 *
 * @example
 * ```typescript
 * const isoPath = await download({
 *   key: 'win10x64',
 *   directory: '/path/to/save',
 *   name: 'win10.iso',
 * })
 * ```
 */
export const download = async (options: DownloadOptions): Promise<MediaDownloadResult> => {
  const targetMedia = media[options.key]

  if (!targetMedia) {
    throw Error(`Invalid media key: ${options.key}`)
  }

  return await targetMedia.download(options)
}

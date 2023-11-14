import media, { type Media } from './media/index.js'

export const getDownloadOptions = () => {
  const payload: Media[] = []

  for (const key in media) {
    const _key = key as keyof typeof media
    payload.push(media[_key])
  }

  return payload
}

export const download = async ({
  mediaKey,
  directory
}: {
  mediaKey: keyof typeof media
  directory: string
}) => {
  const targetMedia = media[mediaKey]

  if (!targetMedia) {
    throw Error(`Invalid media key: ${mediaKey}`)
  }

  await targetMedia.download({ directory })
}

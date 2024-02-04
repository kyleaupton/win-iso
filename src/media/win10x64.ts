import consumerDownload from '../utils/consumerDownload.js'

export default async function win10x64 ({ directory }: { directory: string }) {
  await consumerDownload({ directory, version: 10 })
}

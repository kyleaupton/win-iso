import consumerDownload from '../utils/consumerDownload.js'

export default async function win10x64({ directory, name, debug }: { directory: string, name?: string, debug?: boolean }) {
  await consumerDownload({ directory, version: 10, name, debug })
}

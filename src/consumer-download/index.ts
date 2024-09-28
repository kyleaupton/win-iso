import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'
import { type DownloadProgress } from '../types.js'
import { downloadFile } from '../utils/download.js'
import { request } from '../utils/request.js'
import { logger } from '../utils/log.js'
import DataStore from './DataStore.js'

const getLogString = (s: string) => {
  return `consumerDownload - ${s}`
}

interface ConsumerDownloadOptions {
  version: 10 | 11
  directory: string
  name?: string
  debug?: boolean
  log?: boolean
  onProgress?: (progress: DownloadProgress) => void
}

const consumerDownload = async ({
  version,
  directory,
  name,
  debug = false,
  log,
  onProgress
}: ConsumerDownloadOptions): Promise<string> => {
  if (!log) {
    logger.transports.forEach(t => (t.silent = true))
  }

  // Date source
  const data = new DataStore(debug)

  let url = `https://www.microsoft.com/en-us/software-download/windows${version}`
  if (version === 10) url = `${url}ISO`

  const downloadPage = await data.mainDownloadPage({ url })

  logger.info(getLogString('Retrieved main download page'))

  const productEditionId =
    downloadPage
      // Grab all option elements
      .querySelectorAll('option')
      // Find the options that starts with 'Windows' and return it's value
      .find(item => item.innerHTML.startsWith('Windows'))?.attributes.value

  if (!productEditionId) {
    const message = 'Product Edition ID was not found when parsing download page'
    logger.error(getLogString(message))
    throw Error(message)
  }

  logger.info(getLogString(`Parsed product edition ID from download page - ${productEditionId}`))

  // Arbitrary session ID
  const sessionId = uuidv4()

  // Create new session (I think...)
  if (!debug) {
    await request({
      url: `https://vlscppe.microsoft.com/tags?org_id=y6jn8c31&session_id=${sessionId}`
    })
  }

  logger.info(getLogString(`Requested new session with ID ${sessionId}`))

  // Extract everything after the last slash
  const urlSegmentParameter = url.split('/').pop() as string

  // Get language -> skuID association table
  // SKU ID: This specifies the language of the ISO. We always use "English (United States)", however, the SKU for this changes with each Windows release
  // We must make this request so our next one will be allowed
  const languageSkuIdTable = await data.languageSkuIdTable({
    sessionId,
    urlSegmentParameter,
    productEditionId
  })

  logger.info(getLogString('Retrieved language to SKU ID association table'))

  // The skuID is held inside a JSON object that is stringified as the value to an option element
  const skuId = JSON.parse(
    (languageSkuIdTable
      // Get all option elements from the table HTML
      .querySelectorAll('option')
      // Find the option that corresponds to english and grab it's value attribute
      .find(item => item.innerHTML.includes('English (United States)'))?.attributes.value) ?? '{}'
  ).id

  if (!skuId) {
    const message = 'SKU ID was not found when parsing '
    logger.error(message)
    throw Error(message)
  }

  logger.info(getLogString(`Parsed SKU ID - ${skuId}`))

  // Get ISO download link
  // If any request is going to be blocked by Microsoft it's always this last one (the previous requests always seem to succeed)
  // --referer: Required by Microsoft servers to allow request
  const isoDownloadPage = await data.isoDownloadPage({
    sessionId,
    urlSegmentParameter,
    skuId,
    url
  })

  logger.info(getLogString('Retrieved page with ISO download link'))

  const downloadUrl =
    isoDownloadPage
      // Get all inputs with the class .product-download-hidden
      .querySelectorAll('input.product-download-hidden')
      // Parse value JSON and map
      .map(x => {
        let { value } = x.attributes
        const match = value.match(/"DownloadType": (Iso.+) }/)

        if (match) {
          const type = match[1]
          value = value.replace(type, `"${type}"`)
        }

        try {
          return JSON.parse(value)
        } catch (e) {
          return {}
        }
      })
      // Get what we want
      .find(x => x.DownloadType === 'IsoX64')?.Uri

  if (!downloadUrl) {
    const message = 'Failed to parse ISO download URL'
    logger.error(message)
    throw Error(message)
  }

  const { pathname } = new URL(downloadUrl)
  const filename = name ?? path.basename(pathname)
  const filePath = path.resolve(directory, filename)

  await downloadFile({
    url: downloadUrl,
    filePath,
    debug,
    onProgress
  })

  return filePath
}

export default consumerDownload

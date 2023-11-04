import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import { v4 as uuidv4 } from 'uuid'
import { parse as parseHtml } from 'node-html-parser'

import { request } from '@/utils/request.js'
import { logger } from '@/utils/log.js'

const DEBUG = true

const getLogString = (s: string) => {
  return `consumerDownload - ${s}`
}

const getSampleDataPath = (name: string) => {
  const dirname = url.fileURLToPath(path.dirname(import.meta.url))

  return path.resolve(
    dirname,
    '..',
    '..',
    'tests',
    'sample-res',
    name
  )
}

const getMainDownloadPage = async ({ url }: { url: string }) => {
  let html

  if (DEBUG) {
    html = await fs.readFile(getSampleDataPath('mainDownloadPage.html'), { encoding: 'utf-8' })
  } else {
    html = (await request({
      url,
      method: 'GET'
    })).data
  }

  return parseHtml(html)
}

const getLanguageSkuIdTable = async ({
  sessionId,
  urlSegmentParameter,
  productEditionId
}: {
  sessionId: string
  urlSegmentParameter: string
  productEditionId: string
}) => {
  let html

  if (DEBUG) {
    html = await fs.readFile(getSampleDataPath('skuId.html'), { encoding: 'utf-8' })
  } else {
    html = (await request({
      url: `https://www.microsoft.com/en-US/api/controls/contentinclude/html?pageId=a8f8f489-4c7f-463a-9ca6-5cff94d8d041&host=www.microsoft.com&segments=software-download,${urlSegmentParameter}&query=&action=getskuinformationbyproductedition&sessionId=${sessionId}&productEditionId=${productEditionId}&sdVersion=2`,
      method: 'POST'
    })).data
  }

  return parseHtml(html)
}

const getIsoDownloadPage = async ({
  sessionId,
  urlSegmentParameter,
  skuId,
  url
}: {
  sessionId: string
  urlSegmentParameter: string
  skuId: string
  url: string
}) => {
  let html

  if (DEBUG) {
    html = await fs.readFile(getSampleDataPath('isoDownloadPage.html'), { encoding: 'utf-8' })
  } else {
    html = (await request({
      url: `https://www.microsoft.com/en-US/api/controls/contentinclude/html?pageId=6e2a1789-ef16-4f27-a296-74ef7ef5d96b&host=www.microsoft.com&segments=software-download,${urlSegmentParameter}&query=&action=GetProductDownloadLinksBySku&sessionId=${sessionId}&skuId=${skuId}&language=English&sdVersion=2`,
      method: 'POST',
      headers: {
        Referer: url
      }
    })).data
  }

  return parseHtml(html)
}

const consumerDownload = async ({ version }: { version: 10 | 11 }): Promise<void> => {
  let url = `https://www.microsoft.com/en-us/software-download/windows${version}`
  if (version === 10) url = `${url}ISO`

  const downloadPage = await getMainDownloadPage({ url })

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
  if (!DEBUG) {
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
  const languageSkuIdTable = await getLanguageSkuIdTable({
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
  const isoDownloadPage = await getIsoDownloadPage({
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

  // TODO: handle !isoDownloadLinkHtml
  //   if ! [ "$iso_download_link_html" ]; then
  //   # This should only happen if there's been some change to how this API works
  //   echo_err "Microsoft servers gave us an empty response to our request for an automated download. Please manually download this ISO in a web browser: $url"
  //   manual_verification="true"
  //   return 1
  // fi

  // if echo "$iso_download_link_html" | grep -q "We are unable to complete your request at this time."; then
  //   echo_err "Microsoft blocked the automated download request based on your IP address. Please manually download this ISO in a web browser here: $url"
  //   manual_verification="true"
  //   return 1
  // fi

  console.log('Link valid for 24 hours', downloadUrl)
}

export default consumerDownload

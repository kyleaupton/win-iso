import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import { parse as parseHtml } from 'node-html-parser'

import { request } from '@/utils/request.js'
import { logger } from '@/utils/log.js'

const getLogString = (s: string) => {
  return `consumerDownload - ${s}`
}

const consumerDownload = async ({ version }: { version: 10 | 11 }): Promise<void> => {
  let url = `https://www.microsoft.com/en-us/software-download/windows${version}`
  if (version === 10) url = `${url}ISO`

  const downloadPage = parseHtml(
    (await request({
      url,
      method: 'GET'
    })).data)

  logger.info(getLogString('Retrieved and parsed download page'))

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
  await request({
    url: `https://vlscppe.microsoft.com/tags?org_id=y6jn8c31&session_id=${sessionId}`
  })

  logger.info(getLogString(`Requested new session with ID ${sessionId}`))

  // Extract everything after the last slash
  const urlSegmentParameter = url.split('/').pop()

  // Get language -> skuID association table
  // SKU ID: This specifies the language of the ISO. We always use "English (United States)", however, the SKU for this changes with each Windows release
  // We must make this request so our next one will be allowed
  const languageSkuIdTable = parseHtml(
    (await request({
      url: `https://www.microsoft.com/en-US/api/controls/contentinclude/html?pageId=a8f8f489-4c7f-463a-9ca6-5cff94d8d041&host=www.microsoft.com&segments=software-download,${urlSegmentParameter}&query=&action=getskuinformationbyproductedition&sessionId=${sessionId}&productEditionId=${productEditionId}&sdVersion=2`,
      method: 'POST'
    })).data
  )

  logger.info(getLogString('Retrieved language to SKU ID association table'))

  // The skuID is held inside a JSON object that is stringified as the value to an option element
  const skuId = JSON.parse(
    (languageSkuIdTable
      // Get all option elements from the table HTML
      .querySelectorAll('option')
      // Find the option that corresponds to english and grab it's value attribute
      .find(item => item.innerHTML === 'English (United States)')?.attributes.value) ?? ''
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
  const string = (await request({
    url: `https://www.microsoft.com/en-US/api/controls/contentinclude/html?pageId=6e2a1789-ef16-4f27-a296-74ef7ef5d96b&host=www.microsoft.com&segments=software-download,${urlSegmentParameter}&query=&action=GetProductDownloadLinksBySku&sessionId=${sessionId}&skuId=${skuId}&language=English&sdVersion=2`,
    method: 'POST',
    headers: {
      Referer: url
    }
  })).data

  await fs.writeFile('./tests/sample-res/download.html', string)
  const isoDownloadHtml = parseHtml(
    string
  )

  logger.info(getLogString('Retrieved page with ISO download link'))

  const inputs = isoDownloadHtml.querySelectorAll('input.product-download-hidden')
  console.log(inputs)

  const downloadUrl = isoDownloadHtml.querySelectorAll('input.product-download-hidden').find(item => {
    const data = JSON.parse(item.attributes.value)
    console.log(data)
    return true
  })

  console.log(downloadUrl)

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

  // const { stdout: isoDownloadLink } = await exec(`echo "${isoDownloadLinkHtml}" | grep -o "https://software.download.prss.microsoft.com.*IsoX64" | cut -d '"' -f 1 | sed 's/&amp;/\\&/g' | tr -cd '[:alnum:][:punct:]' | head -c 512`)

  // TODO: handle !isoDownloadLink
  // if ! [ "$iso_download_link" ]; then
  //       # This should only happen if there's been some change to the download endpoint web address
  //       echo_err "Microsoft servers gave us no download link to our request for an automated download. Please manually download this ISO in a web browser: $url"
  //       manual_verification="true"
  //       return 1
  //   fi

  // console.log('Link valid for 24 hours', isoDownloadLink)
}

export default consumerDownload

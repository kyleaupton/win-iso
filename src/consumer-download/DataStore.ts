import fs from 'node:fs/promises'
import path from 'node:path'
import { parse as parseHtml } from 'node-html-parser'
import { request } from '../utils/request.js'

export default class DataStore {
  debug: boolean

  constructor(debug: boolean) {
    this.debug = debug
  }

  _getSampleDataPath(name: string) {
    return path.resolve('src', 'sample-res', name)
  }

  // Step 1
  async mainDownloadPage({ url }: { url: string }) {
    let html: string

    if (this.debug) {
      html = await fs.readFile(this._getSampleDataPath('mainDownloadPage.html'), { encoding: 'utf-8' })
    } else {
      html = (await request({ url, method: 'GET' })).data
    }

    return parseHtml(html)
  }

  // Step 2
  async languageSkuIdTable({ sessionId, urlSegmentParameter, productEditionId }: { sessionId: string, urlSegmentParameter: string, productEditionId: string }) {
    let html: string

    if (this.debug) {
      html = await fs.readFile(this._getSampleDataPath('skuId.html'), { encoding: 'utf-8' })
    } else {
      html = (await request({
        url: `https://www.microsoft.com/en-US/api/controls/contentinclude/html?pageId=a8f8f489-4c7f-463a-9ca6-5cff94d8d041&host=www.microsoft.com&segments=software-download,${urlSegmentParameter}&query=&action=getskuinformationbyproductedition&sessionId=${sessionId}&productEditionId=${productEditionId}&sdVersion=2`,
        method: 'POST'
      })).data
    }

    return parseHtml(html)
  }

  // Step 3
  async isoDownloadPage({ sessionId, urlSegmentParameter, skuId, url }: { sessionId: string, urlSegmentParameter: string, skuId: string, url: string }) {
    let html: string

    if (this.debug) {
      html = await fs.readFile(this._getSampleDataPath('isoDownloadPage.html'), { encoding: 'utf-8' })
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
}

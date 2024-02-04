import axios, { type AxiosRequestConfig } from 'axios'
import { logger } from '../utils/log.js'

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64; rv:100.0) Gecko/20100101 Firefox/100.0'

export const request = async (options: AxiosRequestConfig) => {
  try {
    logger.http(`${options.method ?? 'GET'} ${options.url}`)

    // Set user agent
    if (!options.headers) {
      options.headers = {}
    }

    options.headers['User-Agent'] = USER_AGENT
    options.headers.Accept = ''

    const res = await axios(options)

    logger.http(res.data)

    return res
  } catch (e) {
    logger.error(e)
    throw e
  }
}

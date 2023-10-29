import axios, { type AxiosRequestConfig } from 'axios'

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64; rv:100.0) Gecko/20100101 Firefox/100.0'

export const request = async (options: AxiosRequestConfig) => {
  // Set user agent
  if (!options.headers) {
    options.headers = {}
  }

  options.headers['User-Agent'] = USER_AGENT
  options.headers.Accept = ''

  return await axios(options)
}

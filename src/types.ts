export interface DownloadProgress {
  percentage: number
  downloaded: number
  total: number
  speed: number
  eta: number
  formattedEta: string
}

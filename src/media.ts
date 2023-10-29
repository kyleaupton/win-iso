export interface t_media {
  type: 'consumer'
  version: '10' | '11'
}

const media: Record<string, t_media> = {
  win10: {
    type: 'consumer',
    version: '10'
  },
  win11: {
    type: 'consumer',
    version: '11'
  }
}

export default media

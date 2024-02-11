# win-iso

[![Node version](https://img.shields.io/npm/v/@kyleupton/glob-copy.svg?style=flat)](https://www.npmjs.com/package/@kyleupton/win-iso)

## Overview

This repo is both a CLI tool and Nodejs API to download Windows ISO images from the official source. The motivation behind making this tool comes from [os-install-maker](https://github.com/kyleaupton/os-install-maker).

## Inspiration

This library was heavily influenced by [Mido](https://github.com/ElliotKillick/Mido), a Microsoft image download client written in bash.

## CLI Example

```bash
# Install globally
npm i -g @kyleupton/win-iso

# List available download options
win-iso list

# Download a specified version
win-iso download win10x64
```

## API Example

```typescript
import { getDownloadOptions, download } from '@kyleupton/win-iso'

const options = getDownloadOptions() // [ { key: 'win10x64', displayName: 'Windows 10 (64-bit)' }... ]

await download({ key: 'win10x64', directory: '~/Downloads' })
```

## Constraints

Please be aware that Microsoft has implemented measures to discourage the automated downloading of Windows ISO images. This tool, as a result, is subject to these restrictions. Excessive use may result in a temporary IP ban lasting 24 hours.

It's worth noting that most conventional VPN services may not provide a workaround to this restriction, as their IP ranges could potentially be pre-emptively banned. A less common VPN service or a self-hosted solution may be more successful in circumventing these limitations.

For the facilitation of development, a debug mode has been created. When activated, this mode ensures that the tool does not establish communication with Microsoft's servers. Instead, it operates using sample HTML files.

## Todo

- [x] CLI Interface
- [x] Logging
- [x] Dev mode
- [ ] More version support
- [ ] Full API + CLI documentation
- [ ] Download progress
- [ ] Checksum verification

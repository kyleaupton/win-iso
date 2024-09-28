# win-iso

[![Node version](https://img.shields.io/npm/v/@kyleupton/glob-copy.svg?style=flat)](https://www.npmjs.com/package/@kyleupton/win-iso)

## Overview

<!-- This repo is both a CLI tool and Nodejs API to download Windows ISO images from the official source. -->

This library provides a simple way to download Windows ISO images from Microsoft. It is designed to be used as a CLI tool or as a Node.js API.

## Inspiration

This library was heavily influenced by [Mido](https://github.com/ElliotKillick/Mido), a Microsoft image download client written in bash.

## CLI

### Installation

For CLI usage, install the package globally:

```bash
npm i -g @kyleupton/win-iso
```

### CLI Usage

You can use the CLI tool interactively or non-interactively by passing arguments.

#### Interactive

Simply run the following command to start the interactive CLI:

```bash
win-iso
```

#### Non-Interactive

First list the available download options:

```bash
win-iso list
```

Then download a specified version:

```bash
win-iso download win10x64
```

### API

### Installation

For API usage, install the package as a dependency:

```bash
npm i @kyleupton/win-iso
```

### API Usage

```typescript
import { getDownloadOptions, WindowsIsoDownloader } from '@kyleupton/win-iso'

// Get the available download options
// [
//   {
//     key: 'win10x64',
//     displayName: 'Windows 10 (64-bit)'
//   },
//   {
//     key: 'win11x64',
//     displayName: 'Windows 11 (64-bit)'
//   }
//   ...
// ]
const options = getDownloadOptions()

// Download a specific version
const downloader = new WindowsIsoDownloader({
  version: 'win10x64',
  directory: '/path/to/save',
})

downloader.on('progress', (progress) => {
  console.log(`Downloaded ${progress.percentage}%`)
})

await downloader.download()
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

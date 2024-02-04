# windows-iso-downloader

## Overview

This repo is both an API and ~~CLI tool~~ (TODO: make CLI interface) to download Windows ISO images from the official source. The motivation behind making this tool comes from [os-install-maker](https://github.com/kyleaupton/os-install-maker).

## Inspiration

This library was heavily influenced by [Mido](https://github.com/ElliotKillick/Mido), a Microsoft image download client written in bash.

## Constraints

Please be aware that Microsoft has implemented measures to discourage the automated downloading of Windows ISO images. This tool, as a result, is subject to these restrictions. Excessive use may result in a temporary IP ban lasting 24 hours.

It's worth noting that most conventional VPN services may not provide a workaround to this restriction, as their IP ranges could potentially be pre-emptively banned. A less common VPN service or a self-hosted solution may be more successful in circumventing these limitations.

## Todo

- [ ] CLI Interface
- [ ] Logging
- [x] Dev mode
- [ ] More version support

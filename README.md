# windows-iso-downloader

## Overview

This repo is both an API and a CLI tool to download Windows ISO images from the official source. The motivation behind making this tool comes from [os-install-maker](https://github.com/kyleaupton/os-install-maker).

## Inspiration

This library was heavily influenced by [Mido](https://github.com/ElliotKillick/Mido), a Microsoft image download client written in bash.

## Limitations

Microsoft doesn't like when people programmatically download Windows ISO images. They have designed their download mechanism to limit any efforts by tools like this library. Because of that, running this tool too many times will get your IP banned for 24 hours.

Usually a VPN won't even circumvent the detection, unless you use a niche VPN service or something self-hosted. A popular VPN service will likely have it's IPs already banned.

## Todo

- [ ] Logging
- [ ] Dev mode
- [ ] More version support

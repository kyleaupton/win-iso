import { program } from 'commander'
import { getDownloadOptions } from './index.js'

program
  .command('list')
  .description('List all available download options')
  .action(() => { console.log(getDownloadOptions()) })

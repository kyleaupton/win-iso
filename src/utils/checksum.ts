import fs from 'node:fs'
import crypto from 'node:crypto'

// Function to calculate the file hash
export const getFileHash = async (filePath: string, algorithm = 'sha256'): Promise<string> => {
  return await new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash(algorithm) // Create hash with the desired algorithm (e.g., SHA-256)
    const stream = fs.createReadStream(filePath) // Read the file as a stream

    stream.on('data', (chunk) => {
      hash.update(chunk) // Update hash with each chunk of data
    })

    stream.on('end', () => {
      resolve(hash.digest('hex')) // Resolve the hash in hexadecimal format when done
    })

    stream.on('error', (err) => {
      reject(err) // Reject the promise in case of any error
    })
  })
}

#!/usr/bin/env node
/**
 * Compute Chrome extension ID from path
 * 
 * Chrome generates extension IDs for unpacked extensions using:
 * Base32 encoding of SHA256 hash of the absolute path
 */

import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateExtensionId(extensionPath) {
  // Normalize path
  const absolutePath = path.resolve(extensionPath);
  
  // Chrome uses SHA256 hash of the path
  const hash = crypto.createHash('sha256').update(absolutePath).digest();
  
  // Convert to base32 (Chrome uses lowercase a-p, which is base16)
  // Actually, Chrome uses first 128 bits (16 bytes) and converts to base16 with a-p alphabet
  const base16 = hash.slice(0, 16);
  
  // Convert each byte to lowercase letters a-p (representing 0-15)
  let extensionId = '';
  for (const byte of base16) {
    const high = (byte >> 4) & 0x0F;
    const low = byte & 0x0F;
    extensionId += String.fromCharCode(97 + high); // 'a' = 97
    extensionId += String.fromCharCode(97 + low);
  }
  
  return extensionId;
}

const extensionPath = path.join(__dirname, '../../build');
const computedId = generateExtensionId(extensionPath);

console.log('Extension path:', extensionPath);
console.log('Computed extension ID:', computedId);

// Save to file
const savedIdPath = path.join(__dirname, '.extension-id');
fs.writeFileSync(savedIdPath, computedId);
console.log('✅ Saved to:', savedIdPath);
console.log('\nNote: This ID is computed and may not match the actual Chrome-generated ID.');
console.log('If tests fail, get the real ID from chrome://extensions');


import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const sourceDir = [
  {
    path: './src/',
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
];

/**
 * Recursively get all .ts, .tsx, .js and .jsx entrypoints from the directory
 *
 * @param dir Directory path to scan
 * @returns {Promise<string[]>} The entrypoints
 */
async function getFiles(
  dir: string,
  validFileExtensions: string[],
): Promise<string[]> {
  const dirEntries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirEntries.map((dirent) => {
      const res = join(dir, dirent.name);
      if (dirent.isDirectory()) {
        return getFiles(res, validFileExtensions);
      }
      return Promise.resolve(res);
    }),
  );

  // Flatten the array and filter only .ts, .tsx, .js and .jsx files
  const filteredFiles: string[] = (
    Array.prototype.concat(...files) as string[]
  ).filter((file) => validFileExtensions.includes(extname(file)));
  return filteredFiles;
}

/**
 * Get all entrypoints from the src directory
 *
 * @returns {Promise<string[]>} The entrypoints
 */
export default async function entryPoints(): Promise<string[]> {
  const files: string[] = [];
  for (const { path, extensions } of sourceDir) {
    files.push(...(await getFiles(path, extensions)));
  }
  return files;
}

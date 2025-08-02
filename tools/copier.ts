import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Copy the contents of a directory to another.
 * Retains the directory structure.
 *
 * @param sourceDir Source directory
 * @param targetDir Target directory
 */
export default async function copyContents(
  sourceDir: string,
  targetDir: string,
): Promise<void> {
  const entries = await readdir(sourceDir);

  for (const entry of entries) {
    const curSource = join(sourceDir, entry);
    const curTarget = join(targetDir, entry);
    if ((await stat(curSource)).isDirectory()) {
      await mkdir(curTarget, { recursive: true });
      await copyContents(curSource, curTarget);
    } else {
      await copyFile(curSource, curTarget);
    }
  }
}

/**
 * Copies a file or creates a directory at the specified location.
 * More efficient and cheap than copyContents() method.
 *
 * @param path - The source file or directory path.
 * @param targetPath - The destination path for the copied file or directory.
 *
 * @remarks
 * If the source path points to a directory, an empty directory is created at the target location.
 * Otherwise, the file at the specified path is copied into the target location.
 *
 * @throws Will log an error if the source path cannot be accessed or if the file copy fails.
 */
export async function copyFileOrDirectory(path: string, targetPath: string) {
  try {
    const stats = await stat(path);
    if (stats.isDirectory()) {
      await mkdir(targetPath, { recursive: true });
      return;
    }
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: build script output for development
    console.error(`Error statting path:${err}`);
    return;
  }

  const targetDir = join(targetPath, '..');

  try {
    await mkdir(targetDir, { recursive: true });
    await copyFile(path, targetPath);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: build script output for development
    console.error(`Error:${error}`);
  }
}

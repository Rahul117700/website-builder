import esbuild from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export async function bundleReactFiles(files: Record<string, string>) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'react-bundle-'));
  // Write all files to tempDir
  for (const [filename, content] of Object.entries(files)) {
    await fs.outputFile(path.join(tempDir, filename), content);
  }
  // Bundle with esbuild
  const result = await esbuild.build({
    entryPoints: [path.join(tempDir, '/App.js')],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    loader: { '.js': 'jsx', '.css': 'css' },
  });
  // Clean up tempDir if you want
  // await fs.remove(tempDir);
  return result.outputFiles[0].text; // JS bundle as string
} 
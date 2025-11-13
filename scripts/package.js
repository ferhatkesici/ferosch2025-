import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function createPackage() {
  try {
    // Create package directory
    const packageDir = path.join(rootDir, 'package');
    await fs.emptyDir(packageDir);
    
    // Copy necessary files
    await fs.copy(path.join(rootDir, 'CSXS'), path.join(packageDir, 'CSXS'));
    await fs.copy(path.join(rootDir, 'jsx'), path.join(packageDir, 'jsx'));
    await fs.copy(path.join(rootDir, 'dist'), path.join(packageDir));
    await fs.copy(path.join(rootDir, '.debug'), path.join(packageDir, '.debug'));
    
    // Create dist directory if it doesn't exist
    const distDir = path.join(rootDir, 'dist');
    await fs.ensureDir(distDir);
    
    // Run the signing script based on platform
    const isWindows = process.platform === 'win32';
    const signScript = isWindows ? 'sign.bat' : './sign.sh';
    
    console.log('Signing and creating ZXP package...');
    await execAsync(signScript, { cwd: path.join(rootDir, 'scripts') });
    
    console.log('Package created successfully!');
    console.log('ZXP file is ready at: dist/ferosch.zxp');
    
  } catch (err) {
    console.error('Error creating package:', err);
    process.exit(1);
  }
}

createPackage();
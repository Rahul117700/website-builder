const path = require('path');
const processCwd = process.cwd();

console.log('CWD:', processCwd);

const uploadsDir = path.join(processCwd, 'public', 'uploads', 'products');
console.log('Uploads Dir:', uploadsDir);

const fileName = 'test.mp4';
const localPath = path.join(uploadsDir, fileName);
console.log('Local Path:', localPath);

// Simulate s3.ts logic
let relativePath = localPath.replace(processCwd, '').replace(/\\/g, '/');
console.log('Relative Path 1:', relativePath);

if (relativePath.startsWith('/public')) {
    relativePath = relativePath.replace('/public', '');
}
const url = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
console.log('Final URL:', url);

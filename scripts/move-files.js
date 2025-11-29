const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../dist/lifestyle-adapter/browser');
const destDir = path.join(__dirname, '../docs');

// Function to copy directory recursively
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    // 1. Remove existing docs folder
    if (fs.existsSync(destDir)) {
        fs.rmSync(destDir, { recursive: true, force: true });
        console.log('Cleaned existing docs folder.');
    }

    // 2. Check if source exists
    if (!fs.existsSync(sourceDir)) {
        console.error(`Source directory not found: ${sourceDir}`);
        // Check if dist exists (maybe it's not in browser subfolder)
        const distDir = path.join(__dirname, '../dist');
        if (fs.existsSync(distDir)) {
            console.log(`Found dist folder at ${distDir}, checking contents...`);
            const contents = fs.readdirSync(distDir);
            console.log('Contents of dist:', contents);
            // If dist/browser doesn't exist, maybe the build output is directly in dist?
            // But user requested dist/browser.
        }
        process.exit(1);
    }

    // 3. Move files (Rename)
    // We use renameSync for efficiency. If it fails (e.g. cross-device), we can fallback to copy.
    try {
        fs.renameSync(sourceDir, destDir);
        console.log(`Successfully moved files from ${sourceDir} to ${destDir}`);
    } catch (renameErr) {
        if (renameErr.code === 'EXDEV') {
            console.log('Cross-device link detected, falling back to copy...');
            copyDir(sourceDir, destDir);
            fs.rmSync(sourceDir, { recursive: true, force: true });
            console.log(`Successfully copied files from ${sourceDir} to ${destDir}`);
        } else {
            throw renameErr;
        }
    }

} catch (err) {
    console.error('Error moving files:', err);
    process.exit(1);
}

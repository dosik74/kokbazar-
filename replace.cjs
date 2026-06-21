const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = content.replace(/@\/lib\/firebase/g, '@/src/lib/firebase');
            modified = modified.replace(/@\/store/g, '@/src/store');
            if (content !== modified) {
                fs.writeFileSync(fullPath, modified, 'utf8');
                console.log('Fixed', fullPath);
            }
        }
    }
}
processDir(path.join(__dirname, 'src'));

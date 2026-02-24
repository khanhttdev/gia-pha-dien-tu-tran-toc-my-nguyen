const fs = require('fs');
const glob = require('glob'); // Need to use fs/path if glob is not available, but let's try reading files directly.

// We will use standard node to find files
const path = require('path');
function walk(dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walk(dirFile, filelist);
        } else {
            if (file.endsWith('.tsx')) {
                filelist.push(dirFile);
            }
        }
    });
    return filelist;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;

    // Replace <Button size="icon" ...> missing aria-label
    // Match <Button... size="icon"...> and if it doesn't have aria-label, add aria-label="Action"
    content = content.replace(/<Button\s+([^>]*?)size="icon"([^>]*?)>/g, (match, p1, p2) => {
        if (!match.includes('aria-label=')) {
            return `<Button aria-label="Action Button" ${p1}size="icon"${p2}>`;
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        changedCount++;
        console.log(`Updated ${f}`);
    }
});

console.log(`Added aria-label to ${changedCount} files.`);

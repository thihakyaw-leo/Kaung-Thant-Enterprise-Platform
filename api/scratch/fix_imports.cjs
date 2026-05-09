const fs = require('fs');
const path = require('path');

function processDir(dir, replacements) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath, replacements);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            for (const [search, replace] of replacements) {
                content = content.replaceAll(search, replace);
            }
            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log(`Fixed: ${fullPath}`);
            }
        }
    }
}

// Replacements for modules (went 1 level deeper)
const moduleReplacements = [
    ["from '../db/tenant'", "from '../../db/tenant.schema'"],
    ["from '../db/master'", "from '../../db/master.schema'"],
    ["from '../schemas/", "from '../../shared/schemas/"],
    ["from '../middleware/", "from '../../shared/middleware/"],
    ["from '../lib/", "from '../../shared/lib/"],
    ["from '../services/", "from '../../shared/services/"],
    ["from '../worker-configuration'", "from '../../../worker-configuration'"],
    ["from '../api/", "from '../"] // some api-to-api imports maybe?
];

// Replacements for shared (went 1 level deeper, but relative to each other they are the same)
const sharedReplacements = [
    ["from '../db/tenant'", "from '../../db/tenant.schema'"],
    ["from '../db/master'", "from '../../db/master.schema'"],
    ["from '../worker-configuration'", "from '../../../worker-configuration'"]
];

console.log("Fixing modules...");
processDir(path.join(__dirname, '../src/modules'), moduleReplacements);

console.log("Fixing shared...");
processDir(path.join(__dirname, '../src/shared'), sharedReplacements);

console.log("Fixing db...");
// For db files, just update worker-configuration
processDir(path.join(__dirname, '../src/db'), [
    ["from '../worker-configuration'", "from '../../worker-configuration'"]
]);

console.log("Done.");

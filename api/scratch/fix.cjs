const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Fix uuid
            if (content.includes("import { v4 as uuidv4 } from 'uuid';")) {
                content = content.replace("import { v4 as uuidv4 } from 'uuid';", "");
                content = content.replace(/uuidv4\(\)/g, "crypto.randomUUID()");
                modified = true;
            }

            // Fix catch (error: any)
            if (content.includes("catch (error: any)")) {
                content = content.replace(/catch\s*\(\s*error\s*:\s*any\s*\)\s*\{/g, "catch (error: unknown) {\n    const message = error instanceof Error ? error.message : 'Unknown error';");
                content = content.replace(/error\.message/g, "message");
                // The above might replace the newly added error.message, let's be careful.
                // Revert the error instanceof Error ? message : 'Unknown message'
                content = content.replace(/message instanceof Error \? message : 'Unknown error'/g, "error instanceof Error ? error.message : 'Unknown error'");
                modified = true;
            }

            // Fix Bindings to Env in Hono
            if (content.includes("new Hono<{ Bindings: { DB_TENANT: D1Database } }>()") || content.includes("new Hono<{ Bindings: { DB_TENANT: D1Database, DB_MASTER?: D1Database } }>()")) {
                content = content.replace(/new Hono<\{ Bindings: \{[^}]+\} \}>\(\)/g, "new Hono<{ Bindings: Env }>()");
                if (!content.includes("import { Env }")) {
                     content = "import { Env } from '../../worker-configuration';\n" + content;
                }
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, '..', 'src'));

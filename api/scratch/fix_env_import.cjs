const fs = require('fs');

const files = [
    'src/index.ts',
    'src/modules/master/crud.route.ts',
    'src/modules/tenant/crud.route.ts',
    'src/shared/factory/crudFactory.ts'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import\s+{\s*Env\s*}\s+from\s+['"](?:\.\.\/)+worker-configuration['"];?\n?/g, '');
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
}

const testFile = 'src/test_tx.ts';
if (fs.existsSync(testFile)) {
    let testContent = fs.readFileSync(testFile, 'utf8');
    testContent = testContent.replace(/from '\.\/db\/tenant'/g, "from './db/tenant.schema'");
    fs.writeFileSync(testFile, testContent);
    console.log(`Fixed ${testFile}`);
}

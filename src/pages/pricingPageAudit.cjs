const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'PricingPage.jsx'); // same folder

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) return console.error('❌ Error reading PricingPage.jsx:', err);

  const imports = ['VaultCard', 'PricingTable', 'CTAButton'];
  const missingImports = imports.filter(comp => !data.includes(`import ${comp}`));
  const missingUsage = imports.filter(comp => !data.includes(`<${comp}`));

  console.log('🔍 PricingPage Audit Results:');
  if (missingImports.length === 0) console.log('✅ All components are imported.');
  else console.log('⚠️ Missing imports:', missingImports);

  if (missingUsage.length === 0) console.log('✅ All components are rendered.');
  else console.log('⚠️ Missing render usage:', missingUsage);

  const envCheck = data.includes('process.env');
  console.log(envCheck ? '✅ .env variables are referenced.' : '⚠️ No .env usage detected.');
});
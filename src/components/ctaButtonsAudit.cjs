const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'CTAButton.jsx');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) return console.error('❌ Error reading CTAButton.jsx:', err);

  const hasOnClick = data.includes('onClick');
  const hasVaultRef = /vault|pass|checkout|trigger|navigate|router/.test(data);
  const hasEnv = data.includes('process.env');

  console.log('🔍 CTAButton Audit Results:');
  console.log(hasOnClick ? '✅ Has onClick handler.' : '⚠️ No onClick detected.');
  console.log(hasVaultRef ? '✅ References vault/pass/checkout logic.' : '⚠️ No vault-related logic found.');
  console.log(hasEnv ? '✅ Uses environment variables.' : '⚠️ No .env usage detected.');
});
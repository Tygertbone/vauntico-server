// vaunticoAudit.js
const fs = require('fs');
const path = require('path');

const requiredPages = [
  'Homepage.jsx',
  'PricingPage.jsx',
  'OnboardingPage.jsx',
  'DemoPage.jsx',
  'DelegationPage.jsx'
];

const requiredComponents = [
  'VaultCard.jsx',
  'PricingTable.jsx',
  'CTAButton.jsx',
  'PromptVaultPage.jsx',
  'VaultsPage.jsx',
  'CreatorPassPage.jsx',
  'VaultSuccessPage.jsx'
];

const pagesDir = path.join(__dirname, 'src', 'pages');
const componentsDir = path.join(__dirname, 'src', 'components');

function checkFiles(dir, required) {
  const existing = fs.readdirSync(dir);
  return required.map(file => ({
    file,
    exists: existing.includes(file)
  }));
}

console.log('\n🔍 Scanning Vauntico MVP Structure...\n');

const pageResults = checkFiles(pagesDir, requiredPages);
const componentResults = checkFiles(componentsDir, requiredComponents);

console.log('📄 Pages:');
pageResults.forEach(({ file, exists }) => {
  console.log(`- ${file}: ${exists ? '✅ Found' : '❌ Missing'}`);
});

console.log('\n🧩 Components:');
componentResults.forEach(({ file, exists }) => {
  console.log(`- ${file}: ${exists ? '✅ Found' : '❌ Missing'}`);
});

console.log('\n🧠 Suggested Next Steps:');
if (pageResults.some(p => !p.exists)) {
  console.log('- Scaffold missing pages to complete routing.');
}
if (componentResults.some(c => !c.exists)) {
  console.log('- Build missing components to support vaults and pricing.');
}
console.log('- Verify routing in App.jsx and test all paths.');
console.log('- Add CTA wiring, vault unlock logic, and checkout flow.');
console.log('- Polish UI/UX with icons, spacing, and emotional copy.\n');
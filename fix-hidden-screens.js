// Quick script to fix all hidden screens
const fs = require('fs');

const filePath = 'nannyradar-mobile-ui.html';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of 'class="screen hidden"' with 'class="screen"'
content = content.replace(/class="screen hidden"/g, 'class="screen"');

fs.writeFileSync(filePath, content);
console.log('✅ Fixed all hidden screens');

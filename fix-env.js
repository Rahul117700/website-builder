const fs = require('fs');

// Read the current .env file
const envContent = fs.readFileSync('.env', 'utf8');

// Replace the NextAuth secret with the proper one
const updatedContent = envContent.replace(
  /NEXTAUTH_SECRET=.*/,
  'NEXTAUTH_SECRET="03199ea0f07542f1ae89745da7dcd55b8cb1e82e68d7239cf28f06bd269b94da"'
);

// Also update the NextAuth URL to use your server IP
const finalContent = updatedContent.replace(
  /NEXTAUTH_URL=.*/,
  'NEXTAUTH_URL="http://31.97.233.221:3000"'
);

// Write the updated content back to .env
fs.writeFileSync('.env', finalContent);

console.log('✅ .env file updated successfully!');
console.log('✅ NextAuth secret has been set to a proper value');
console.log('✅ NextAuth URL has been updated to your server IP');


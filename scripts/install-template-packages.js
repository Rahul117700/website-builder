const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const templatesDir = path.join(__dirname, '..', 'templates_start_bootstrap');

const installPackagesInFolder = (folderPath) => {
  const packageJsonPath = path.join(folderPath, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      console.log(`📦 Installing packages in: ${path.basename(folderPath)}`);
      
      // Change to the template directory
      process.chdir(folderPath);
      
      // Install packages
      execSync('npm install', { stdio: 'inherit' });
      
      console.log(`✅ Successfully installed packages in: ${path.basename(folderPath)}`);
      
      // Go back to the root directory
      process.chdir(path.join(__dirname, '..'));
      
    } catch (error) {
      console.error(`❌ Error installing packages in ${path.basename(folderPath)}:`, error.message);
    }
  }
};

const processDirectory = (dirPath) => {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Check if this directory has a package.json
        if (fs.existsSync(path.join(itemPath, 'package.json'))) {
          installPackagesInFolder(itemPath);
        } else {
          // Recursively check subdirectories
          processDirectory(itemPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
  }
};

const main = async () => {
  try {
    console.log('🚀 Starting package installation for all templates...\n');
    
    if (!fs.existsSync(templatesDir)) {
      console.error('❌ Templates directory not found:', templatesDir);
      return;
    }
    
    console.log(`📁 Processing templates directory: ${templatesDir}\n`);
    
    // Process all template directories
    processDirectory(templatesDir);
    
    console.log('\n🎉 Package installation completed for all templates!');
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
  }
};

main();

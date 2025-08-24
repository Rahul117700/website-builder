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
      
      // Try npm install with retry logic
      let retries = 3;
      while (retries > 0) {
        try {
          execSync('npm install', { stdio: 'inherit' });
          console.log(`✅ Successfully installed packages in: ${path.basename(folderPath)}`);
          break;
        } catch (error) {
          retries--;
          if (retries > 0) {
            console.log(`⚠️  Retrying... (${retries} attempts left)`);
            // Wait a bit before retrying
            setTimeout(() => {}, 2000);
          } else {
            throw error;
          }
        }
      }
      
      // Go back to the root directory
      process.chdir(path.join(__dirname, '..'));
      
    } catch (error) {
      console.error(`❌ Error installing packages in ${path.basename(folderPath)}:`, error.message);
      console.log(`⚠️  Skipping this template and continuing with others...`);
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
          // Skip problematic templates
          const templateName = path.basename(itemPath);
          if (['sb-admin-angular', 'sb-clean-blog-angular'].includes(templateName)) {
            console.log(`⏭️  Skipping problematic template: ${templateName}`);
            continue;
          }
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
    
    // List of templates to skip (problematic ones)
    const skipTemplates = [
      'sb-admin-angular', // Has complex Angular dependencies
      'sb-clean-blog-angular' // Another Angular template
    ];
    
    console.log(`⚠️  Skipping problematic templates: ${skipTemplates.join(', ')}\n`);
    
    // Process all template directories
    processDirectory(templatesDir);
    
    console.log('\n🎉 Package installation completed for all templates!');
    console.log('💡 Note: Some templates may have been skipped due to errors.');
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
  }
};

main();

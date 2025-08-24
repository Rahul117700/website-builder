const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Template pricing based on complexity and features
const getTemplatePrice = (templateName, description, keywords = []) => {
  const name = templateName.toLowerCase();
  const desc = description.toLowerCase();
  const allText = `${name} ${desc} ${keywords.join(' ')}`.toLowerCase();
  
  // Premium templates (complex, feature-rich)
  if (allText.includes('admin') || allText.includes('dashboard') || allText.includes('sb-admin')) {
    return 89.99;
  }
  
  // Business templates (professional, corporate)
  if (allText.includes('business') || allText.includes('agency') || allText.includes('corporate') || allText.includes('modern-business')) {
    return 69.99;
  }
  
  // Portfolio templates (creative, showcase)
  if (allText.includes('portfolio') || allText.includes('freelancer') || allText.includes('creative') || allText.includes('resume')) {
    return 59.99;
  }
  
  // E-commerce templates
  if (allText.includes('shop') || allText.includes('ecommerce') || allText.includes('store')) {
    return 79.99;
  }
  
  // Blog templates
  if (allText.includes('blog') || allText.includes('clean-blog')) {
    return 49.99;
  }
  
  // Landing page templates
  if (allText.includes('landing') || allText.includes('heroic') || allText.includes('one-page')) {
    return 54.99;
  }
  
  // Basic templates
  return 39.99;
};

const getTemplateCategory = (templateName, description, keywords = []) => {
  const name = templateName.toLowerCase();
  const desc = description.toLowerCase();
  const allText = `${name} ${desc} ${keywords.join(' ')}`.toLowerCase();
  
  if (allText.includes('admin') || allText.includes('dashboard')) return 'Admin';
  if (allText.includes('business') || allText.includes('agency') || allText.includes('corporate')) return 'Business';
  if (allText.includes('portfolio') || allText.includes('freelancer') || allText.includes('creative')) return 'Portfolio';
  if (allText.includes('shop') || allText.includes('ecommerce')) return 'E-commerce';
  if (allText.includes('blog')) return 'Blog';
  if (allText.includes('landing') || allText.includes('heroic')) return 'Landing Page';
  if (allText.includes('resume')) return 'Resume';
  if (allText.includes('personal')) return 'Personal';
  
  return 'General';
};

const scanTemplates = async () => {
  const templatesDir = path.join(__dirname, '..', 'templates_start_bootstrap');
  const templates = [];
  
  try {
    const items = fs.readdirSync(templatesDir);
    
    for (const item of items) {
      const itemPath = path.join(templatesDir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        const packageJsonPath = path.join(itemPath, 'package.json');
        const readmePath = path.join(itemPath, 'README.md');
        const distPath = path.join(itemPath, 'dist', 'index.html');
        
        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : '';
            
            // Extract description from README
            let description = packageJson.description || '';
            if (readme) {
              const lines = readme.split('\n');
              for (const line of lines) {
                if (line.trim() && !line.startsWith('#') && !line.startsWith('[') && !line.startsWith('!')) {
                  description = line.trim();
                  break;
                }
              }
            }
            
            // Generate slug from name
            const slug = packageJson.name.replace('startbootstrap-', '');
            
            // Determine price based on template complexity
            const price = getTemplatePrice(packageJson.title, description, packageJson.keywords || []);
            
            // Determine category
            const category = getTemplateCategory(packageJson.title, description, packageJson.keywords || []);
            
            // Check if dist/index.html exists for preview
            const hasPreview = fs.existsSync(distPath);
            
            templates.push({
              name: packageJson.title,
              slug,
              price,
              category,
              description: description || `Professional ${packageJson.title} template built with Bootstrap`,
              keywords: packageJson.keywords || [],
              version: packageJson.version,
              author: packageJson.author || 'Start Bootstrap',
              homepage: packageJson.homepage,
              license: packageJson.license,
              hasPreview,
              packageJson: packageJson
            });
            
            console.log(`✅ Scanned: ${packageJson.title} - $${price} - ${category}`);
          } catch (error) {
            console.error(`❌ Error reading ${item}:`, error.message);
          }
        }
      }
    }
    
    return templates;
  } catch (error) {
    console.error('Error scanning templates directory:', error);
    return [];
  }
};

const populateDatabase = async (templates) => {
  console.log('\n🔄 Populating database...\n');
  
  for (const template of templates) {
    try {
      // Check if template already exists
      const existing = await prisma.template.findUnique({
        where: { slug: template.slug }
      });
      
      if (existing) {
        console.log(`⏭️  Template ${template.name} already exists, updating...`);
        await prisma.template.update({
          where: { slug: template.slug },
          data: {
            name: template.name,
            price: template.price,
            category: template.category,
            description: template.description,
            approved: true,
            updatedAt: new Date()
          }
        });
      } else {
        console.log(`➕ Creating template: ${template.name}`);
        await prisma.template.create({
          data: {
            name: template.name,
            slug: template.slug,
            price: template.price,
            category: template.category,
            description: template.description,
            approved: true,
            createdBy: 'system', // System-created templates
            preview: template.hasPreview ? `/templates/${template.slug}/preview` : null
          }
        });
      }
    } catch (error) {
      console.error(`❌ Error creating/updating template ${template.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Database population completed!');
};

const main = async () => {
  try {
    console.log('🔍 Scanning Bootstrap templates...\n');
    const templates = await scanTemplates();
    
    console.log(`\n📊 Found ${templates.length} templates:`);
    templates.forEach(t => {
      console.log(`  • ${t.name} - $${t.price} (${t.category})`);
    });
    
    await populateDatabase(templates);
    
    console.log('\n🎉 Template scanning and database population completed successfully!');
  } catch (error) {
    console.error('❌ Error in main process:', error);
  } finally {
    await prisma.$disconnect();
  }
};

main();

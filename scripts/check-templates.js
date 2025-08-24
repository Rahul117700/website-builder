const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const checkTemplates = async () => {
  try {
    console.log('🔍 Checking templates in database...\n');
    
    // Get all templates
    const templates = await prisma.template.findMany({
      include: {
        _count: {
          select: {
            purchases: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${templates.length} templates:\n`);
    
    let issuesFound = 0;
    
    templates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name}`);
      console.log(`   ID: ${template.id}`);
      console.log(`   Slug: ${template.slug}`);
      console.log(`   Price: $${template.price}`);
      console.log(`   Category: ${template.category || 'NULL'}`);
      console.log(`   Description: ${template.description ? 'Present' : 'NULL'}`);
      console.log(`   Approved: ${template.approved}`);
      console.log(`   Created By: ${template.createdBy}`);
      console.log(`   Preview: ${template.preview || 'NULL'}`);
      console.log(`   Purchase Count: ${template._count.purchases}`);
      
      // Check for issues
      if (!template.category || !template.description || !template.approved) {
        issuesFound++;
        console.log(`   ⚠️  ISSUES FOUND:`);
        if (!template.category) console.log(`      - Missing category`);
        if (!template.description) console.log(`      - Missing description`);
        if (!template.approved) console.log(`      - Not approved`);
      }
      
      console.log('');
    });
    
    if (issuesFound > 0) {
      console.log(`❌ Found ${issuesFound} templates with issues that need fixing`);
    } else {
      console.log('✅ All templates look good!');
    }
    
    // Check API response
    console.log('\n🔍 Testing API response...');
    try {
      const response = await fetch('http://localhost:3000/api/templates');
      const data = await response.json();
      console.log(`API Status: ${response.status}`);
      console.log(`Templates returned: ${data.templates?.length || 0}`);
      console.log(`Categories returned: ${data.categories?.length || 0}`);
      
      if (data.templates && data.templates.length > 0) {
        console.log('First template from API:');
        console.log(JSON.stringify(data.templates[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Error testing API:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking templates:', error);
  } finally {
    await prisma.$disconnect();
  }
};

checkTemplates();

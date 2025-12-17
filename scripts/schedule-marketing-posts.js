/**
 * Marketing Post Scheduler
 * 
 * This script runs continuously and posts content at scheduled intervals
 * Use with PM2 or as a cron job for automatic posting
 */

const { publishContent, contentTemplates } = require('./auto-post-marketing');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Configuration
const INTERVAL_HOURS = parseInt(process.env.POST_INTERVAL_HOURS) || 24;
const INTERVAL_MS = INTERVAL_HOURS * 60 * 60 * 1000;

console.log('⚙️  Configuration loaded:');
console.log(`   Interval: ${INTERVAL_HOURS} hours`);
console.log(`   Platforms: ${process.env.ENABLED_PLATFORMS || 'medium,devto,hashnode'}\n`);

// Track which articles have been posted
const POSTED_ARTICLES_FILE = path.join(__dirname, 'posted-articles.json');

function getPostedArticles() {
  if (fs.existsSync(POSTED_ARTICLES_FILE)) {
    return JSON.parse(fs.readFileSync(POSTED_ARTICLES_FILE, 'utf8'));
  }
  return [];
}

function markArticleAsPosted(articleTitle) {
  const posted = getPostedArticles();
  posted.push({
    title: articleTitle,
    postedAt: new Date().toISOString()
  });
  fs.writeFileSync(POSTED_ARTICLES_FILE, JSON.stringify(posted, null, 2));
}

function getNextArticle() {
  const posted = getPostedArticles();
  const postedTitles = posted.map(p => p.title);
  
  // Find unposted articles
  const unposted = contentTemplates.filter(
    article => !postedTitles.includes(article.title)
  );
  
  // If all posted, reset and start over
  if (unposted.length === 0) {
    console.log('📝 All articles have been posted. Resetting cycle...');
    fs.writeFileSync(POSTED_ARTICLES_FILE, JSON.stringify([], null, 2));
    return contentTemplates[0];
  }
  
  return unposted[0];
}

async function schedulePost() {
  console.log('\n' + '='.repeat(60));
  console.log('⏰ Scheduled Post Runner');
  console.log('='.repeat(60));
  console.log(`Current time: ${new Date().toLocaleString()}`);
  console.log(`Interval: Every ${INTERVAL_HOURS} hours`);
  console.log('='.repeat(60) + '\n');

  // Get next article to post
  const article = getNextArticle();
  console.log(`📤 Next article: "${article.title}"\n`);

  try {
    // Publish content
    await publishContent();
    
    // Mark as posted
    markArticleAsPosted(article.title);
    
    console.log('\n✅ Post published successfully!');
    console.log(`⏭️  Next post in ${INTERVAL_HOURS} hours (${new Date(Date.now() + INTERVAL_MS).toLocaleString()})\n`);
  } catch (error) {
    console.error('\n❌ Error publishing post:', error);
  }
}

// Run immediately on start
schedulePost();

// Then run at intervals
setInterval(schedulePost, INTERVAL_MS);

console.log(`🚀 Marketing post scheduler started!`);
console.log(`📅 Posts will be published every ${INTERVAL_HOURS} hours`);
console.log(`⏸️  Press Ctrl+C to stop\n`);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping scheduler...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Stopping scheduler...');
  process.exit(0);
});


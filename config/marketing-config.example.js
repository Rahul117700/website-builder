/**
 * Marketing Automation Configuration
 * 
 * Copy this file to config/marketing-config.js and fill in your API keys
 */

module.exports = {
  // Medium
  // Get your token from: https://medium.com/me/settings/security
  MEDIUM_API_KEY: 'your_medium_integration_token',

  // LinkedIn
  // Create app at: https://www.linkedin.com/developers/apps
  LINKEDIN_ACCESS_TOKEN: 'your_linkedin_access_token',

  // Dev.to
  // Get API key from: https://dev.to/settings/extensions
  DEVTO_API_KEY: 'your_devto_api_key',

  // Hashnode
  // Get API key from: https://hashnode.com/settings/developer
  HASHNODE_API_KEY: 'your_hashnode_api_key',
  HASHNODE_PUBLICATION_ID: 'your_publication_id',

  // WordPress
  WORDPRESS_URL: 'https://yourblog.wordpress.com',
  WORDPRESS_USERNAME: 'your_username',
  WORDPRESS_APP_PASSWORD: 'your_app_password',

  // Twitter/X (Optional)
  TWITTER_API_KEY: 'your_twitter_api_key',
  TWITTER_API_SECRET: 'your_twitter_api_secret',
  TWITTER_ACCESS_TOKEN: 'your_access_token',
  TWITTER_ACCESS_SECRET: 'your_access_secret',

  // Posting Schedule
  POST_INTERVAL_HOURS: 24, // How often to post (in hours)
  
  // Which platforms to use
  ENABLED_PLATFORMS: ['medium', 'devto', 'hashnode']
};


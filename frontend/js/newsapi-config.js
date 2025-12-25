// NewsAPI Configuration
// Get your free API key from: https://newsapi.org/register
// Free tier: 100 requests/day, 1-month history

const NEWSAPI_CONFIG = {
    apiKey: 'YOUR_NEWSAPI_KEY_HERE', // Replace with your actual API key
    baseUrl: 'https://newsapi.org/v2',
    
    // Fetch science news from ALL countries worldwide
    category: 'science',
    
    // NO country restriction = worldwide coverage
    // language: 'en' will get English articles from all countries
    language: 'en',
    
    // Increased page size for more diverse global content
    pageSize: 50,  // Max 100 articles (changed from 12)
    
    // Sort by latest first for most recent discoveries
    sortBy: 'publishedAt'
};

// Alternative configuration for even broader coverage
// Use 'everything' endpoint instead of 'top-headlines' for worldwide sources
const NEWSAPI_GLOBAL_CONFIG = {
    apiKey: 'YOUR_NEWSAPI_KEY_HERE',
    baseUrl: 'https://newsapi.org/v2',
    
    // Use /everything endpoint for truly global coverage
    endpoint: 'everything',
    
    // Search query covering major science fields
    searchQuery: '(science OR physics OR chemistry OR biology OR astronomy OR space OR quantum OR genetics OR climate OR AI OR robotics) AND (research OR discovery OR breakthrough OR study)',
    
    // Sort by relevance or latest
    sortBy: 'publishedAt',
    
    // Get articles from last 7 days for fresh content
    fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    // Language: English (captures global English science news)
    language: 'en',
    
    // Max articles
    pageSize: 50
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NEWSAPI_CONFIG, NEWSAPI_GLOBAL_CONFIG };
}

window.NEWSAPI_CONFIG = NEWSAPI_CONFIG;
window.NEWSAPI_GLOBAL_CONFIG = NEWSAPI_GLOBAL_CONFIG;
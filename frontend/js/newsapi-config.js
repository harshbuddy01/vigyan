// NewsData.io Configuration
// Get your free API key from: https://newsdata.io/register
// Free tier: 200 API credits/day, 10 articles per request, works in production!

const NEWSDATA_CONFIG = {
    apiKey: '35dc3e9fe7aa4a1bb45c77a36de22318', // Your NewsData.io API key
    baseUrl: 'https://newsdata.io/api/1',
    
    // Fetch science news from ALL countries worldwide
    category: 'science,technology',
    
    // Language: English articles from all countries
    language: 'en',
    
    // Articles per request (max 10 in free tier)
    size: 10,
    
    // Priority: top (latest and breaking news)
    prioritydomain: 'top'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NEWSDATA_CONFIG;
}

window.NEWSDATA_CONFIG = NEWSDATA_CONFIG;
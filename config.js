// Configuration file for GitHub Dashboard

const CONFIG = {
    // GitHub API Settings
    GITHUB_API_BASE: 'https://api.github.com',
    TOKEN: null, // Add your GitHub token here for higher rate limits'
    PER_PAGE: 30,

    // Categories with associated GitHub topics
    CATEGORIES: {
        'AI': ['machine-learning', 'artificial-intelligence', 'deep-learning', 'neural-networks', 'ai'],
        'Anime': ['anime', 'manga', 'otaku', 'anime-games', 'anime-app'],
        'FinTech': ['fintech', 'blockchain', 'cryptocurrency', 'banking', 'finance'],
        'Web Dev': ['web', 'javascript', 'react', 'vue', 'angular', 'nodejs'],
        'Mobile': ['mobile', 'android', 'ios', 'flutter', 'react-native'],
        'DevOps': ['devops', 'kubernetes', 'docker', 'ci-cd', 'infrastructure'],
        'Gaming': ['game', 'gaming', 'unity', 'unreal-engine', 'game-development'],
        'Data Science': ['data-science', 'analytics', 'big-data', 'data-visualization'],
        'Cybersecurity': ['security', 'cybersecurity', 'hacking', 'privacy'],
        'IoT': ['iot', 'arduino', 'raspberry-pi', 'embedded']
    },

    // Colors for categories
    CATEGORY_COLORS: {
        'AI': '#10b981',
        'Anime': '#ef4444',
        'FinTech': '#3b82f6',
        'Web Dev': '#8b5cf6',
        'Mobile': '#f59e0b',
        'DevOps': '#06b6d4',
        'Gaming': '#ec4899',
        'Data Science': '#6366f1',
        'Cybersecurity': '#84cc16',
        'IoT': '#f97316'
    },

    // Language colors (GitHub colors)
    LANGUAGE_COLORS: {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'Java': '#b07219',
        'TypeScript': '#2b7489',
        'C++': '#f34b7d',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Ruby': '#701516',
        'PHP': '#4F5D95',
        'Swift': '#ffac45'
    },

    // Trending calculation (days for trending)
    TRENDING_DAYS: 7,

    // Cache settings
    CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
    USE_CACHE: true
};

// Helper function to get category color
function getCategoryColor(category) {
    return CONFIG.CATEGORY_COLORS[category] || '#6e7681';
}

// Helper function to get language color
function getLanguageColor(language) {
    return CONFIG.LANGUAGE_COLORS[language] || '#6e7681';
}

export { CONFIG, getCategoryColor, getLanguageColor };
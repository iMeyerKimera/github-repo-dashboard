import { CONFIG } from '../config.js';

class GitHubAPI {
    constructor() {
        this.baseURL = CONFIG.GITHUB_API_BASE;
        this.headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        if (CONFIG.TOKEN) {
            this.headers['Authorization'] = `token ${CONFIG.TOKEN}`;
        }

        this.cache = new Map();
        this.localData = null;
        this.localDataAge = null;
    }

    async searchRepositories(category, sort = 'stars', page = 1) {
        // Try to load from local data.json first
        const localData = await this.getLocalData();

        if (localData && this.isLocalDataFresh()) {
            return this.getRepositoriesFromLocal(category, sort, page);
        }

        // Fallback to GitHub API
        return this.fetchFromGitHubAPI(category, sort, page);
    }

    async getLocalData() {
        if (this.localData) return this.localData;

        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Failed to load data.json');

            const data = await response.json();
            this.localData = data;

            // Store when we loaded it
            this.localDataAge = Date.now();

            return data;
        } catch (error) {
            console.warn('Failed to load local data:', error.message);
            return null;
        }
    }

    isLocalDataFresh() {
        if (!this.localData || !this.localDataAge) return false;

        // Check if local data has a timestamp
        if (this.localData._last_updated) {
            const lastUpdated = new Date(this.localData._last_updated);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return lastUpdated > oneWeekAgo;
        }

        // If no timestamp in data, use our load time (1 hour max)
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        return this.localDataAge > oneHourAgo;
    }

    getRepositoriesFromLocal(category, sort, page) {
        if (!this.localData) return [];

        let repos = [];

        // Your data structure: data[category][sort] = array of repos
        if (this.localData[category] && this.localData[category][sort]) {
            repos = this.localData[category][sort];
        } else if (this.localData._metadata) {
            // New structure with metadata
            if (this.localData[category] && this.localData[category][sort]) {
                repos = this.localData[category][sort];
            }
        }

        // Convert to the format expected by the dashboard
        repos = repos.map(repo => ({
            ...repo,
            category: category,
            calculated_stars_per_day: 0, // Not available in local data
            // Ensure all required fields exist
            stargazers_count: repo.stargazers_count || 0,
            forks_count: repo.forks_count || 0,
            open_issues_count: repo.open_issues_count || 0,
            watchers_count: repo.watchers_count || 0,
            description: repo.description || 'No description provided.',
            language: repo.language || null
        }));

        // Apply sorting (local data might already be sorted, but sort again to be sure)
        repos = this.sortRepositories(repos, sort);

        // Apply pagination
        const startIndex = (page - 1) * CONFIG.PER_PAGE;
        const endIndex = startIndex + CONFIG.PER_PAGE;

        return repos.slice(startIndex, endIndex);
    }

    sortRepositories(repos, sort) {
        switch(sort) {
            case 'stars':
                return repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
            case 'forks':
                return repos.sort((a, b) => b.forks_count - a.forks_count);
            case 'updated':
                return repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            case 'trending':
                // For trending, use stars as fallback since we don't have trending data
                return repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
            case 'newest':
                return repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            default:
                return repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
        }
    }

    async fetchFromGitHubAPI(category, sort = 'stars', page = 1) {
        const cacheKey = `${category}-${sort}-${page}`;

        // Check cache
        if (CONFIG.USE_CACHE && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
                return cached.data;
            }
        }

        const topics = CONFIG.CATEGORIES[category] || [category.toLowerCase()];
        const query = topics.map(topic => `topic:${topic}`).join(' ');

        const url = new URL(`${this.baseURL}/search/repositories`);
        url.searchParams.append('q', query);
        url.searchParams.append('sort', sort === 'trending' ? 'stars' : sort);
        url.searchParams.append('order', 'desc');
        url.searchParams.append('per_page', CONFIG.PER_PAGE);
        url.searchParams.append('page', page);

        try {
            const response = await fetch(url, { headers: this.headers });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Rate limit exceeded. Please add a GitHub token.');
                }
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();
            const results = data.items || [];

            // Calculate trending score if needed
            if (sort === 'trending') {
                await this.calculateTrendingScore(results);
                results.sort((a, b) => b.trending_score - a.trending_score);
            }

            // Add category to each repo
            results.forEach(repo => {
                repo.category = category;
                repo.calculated_stars_per_day = repo.trending_score || 0;
            });

            // Cache results
            if (CONFIG.USE_CACHE) {
                this.cache.set(cacheKey, {
                    data: results,
                    timestamp: Date.now()
                });
            }

            return results;

        } catch (error) {
            console.error('Error fetching repositories:', error);
            throw error;
        }
    }

    async calculateTrendingScore(repos) {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        for (const repo of repos) {
            try {
                const url = `${this.baseURL}/repos/${repo.full_name}/stats/commit_activity`;
                const response = await fetch(url, { headers: this.headers });

                if (response.ok) {
                    const stats = await response.json();
                    if (stats && stats.length > 0) {
                        // Calculate stars per day for last 7 days
                        const recentActivity = stats.slice(-CONFIG.TRENDING_DAYS);
                        const totalCommits = recentActivity.reduce((sum, week) => sum + week.total, 0);
                        repo.trending_score = totalCommits / CONFIG.TRENDING_DAYS;
                    }
                }
            } catch (error) {
                console.warn(`Could not calculate trending for ${repo.full_name}:`, error);
                repo.trending_score = 0;
            }
        }
    }

    clearCache() {
        this.cache.clear();
        this.localData = null;
        this.localDataAge = null;
    }
}

export default GitHubAPI;
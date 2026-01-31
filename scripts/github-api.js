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
    }

    async searchRepositories(category, sort = 'stars', page = 1) {
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

    async getRepositoryStats(fullName) {
        const url = `${this.baseURL}/repos/${fullName}`;
        try {
            const response = await fetch(url, { headers: this.headers });
            if (!response.ok) throw new Error('Failed to fetch repo stats');
            return await response.json();
        } catch (error) {
            console.error('Error fetching repo stats:', error);
            return null;
        }
    }

    async getUserRepos(username) {
        const url = `${this.baseURL}/users/${username}/repos?per_page=100&sort=updated`;
        try {
            const response = await fetch(url, { headers: this.headers });
            if (!response.ok) throw new Error('Failed to fetch user repos');
            return await response.json();
        } catch (error) {
            console.error('Error fetching user repos:', error);
            return [];
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

export default GitHubAPI;
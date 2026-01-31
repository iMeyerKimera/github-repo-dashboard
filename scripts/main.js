import { CONFIG, getCategoryColor, getLanguageColor } from '../config.js';
import GitHubAPI from './github-api.js';

class GitHubDashboard {
    constructor() {
        this.api = new GitHubAPI();
        this.currentCategory = 'AI';
        this.currentSort = 'stars';
        this.currentPage = 1;
        this.isLoading = false;
        this.hasMore = true;
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.renderCategoryFilters();
        this.loadRepositories();
        this.setupTheme();
    }

    setupEventListeners() {
        // Category filter buttons
        document.getElementById('category-filters').addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                this.handleCategoryChange(e.target.dataset.category);
            }
        });

        // Sort select
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.handleSortChange(e.target.value);
        });

        // Date range filter
        document.getElementById('date-range').addEventListener('change', (e) => {
            this.handleDateRangeChange(e.target.value);
        });

        // Language filter
        document.getElementById('language-filter').addEventListener('click', (e) => {
            if (e.target.classList.contains('language-tag')) {
                this.handleLanguageFilter(e.target.dataset.language);
            }
        });

        // Reset filters
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
        });

        // Load more
        document.getElementById('load-more').addEventListener('click', () => {
            this.loadMore();
        });

        // Theme toggle
        document.querySelector('.theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Refresh button
        document.querySelector('.refresh-btn').addEventListener('click', () => {
            this.refreshData();
        });

        // Retry button
        document.querySelector('.retry-btn')?.addEventListener('click', () => {
            this.loadRepositories();
        });
    }

    renderCategoryFilters() {
        const container = document.getElementById('category-filters');
        container.innerHTML = '';
        
        Object.keys(CONFIG.CATEGORIES).forEach(category => {
            const button = document.createElement('button');
            button.className = `category-btn ${category === this.currentCategory ? 'active' : ''}`;
            button.dataset.category = category;
            button.innerHTML = `
                <i class="fas fa-${this.getCategoryIcon(category)}"></i>
                ${category}
            `;
            button.style.setProperty('--category-color', getCategoryColor(category));
            container.appendChild(button);
        });
    }

    getCategoryIcon(category) {
        const icons = {
            'AI': 'brain',
            'Anime': 'play-circle',
            'FinTech': 'chart-line',
            'Web Dev': 'code',
            'Mobile': 'mobile-alt',
            'DevOps': 'server',
            'Gaming': 'gamepad',
            'Data Science': 'chart-bar',
            'Cybersecurity': 'shield-alt',
            'IoT': 'microchip'
        };
        return icons[category] || 'folder';
    }

    async loadRepositories() {
        this.showLoading();
        this.hideError();
        this.hideEmptyState();
        
        try {
            const repos = await this.api.searchRepositories(
                this.currentCategory,
                this.currentSort,
                this.currentPage
            );
            
            this.hideLoading();
            
            if (this.currentPage === 1) {
                this.renderRepositories(repos);
            } else {
                this.appendRepositories(repos);
            }
            
            this.hasMore = repos.length === CONFIG.PER_PAGE;
            this.updateLoadMoreButton();
            this.updateStats();
            
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
            console.error('Failed to load repositories:', error);
        }
    }

    renderRepositories(repos) {
        const container = document.getElementById('repos-container');
        
        if (repos.length === 0) {
            this.showEmptyState();
            return;
        }
        
        container.innerHTML = repos.map(repo => this.createRepoCard(repo)).join('');
    }

    appendRepositories(repos) {
        const container = document.getElementById('repos-container');
        repos.forEach(repo => {
            container.innerHTML += this.createRepoCard(repo);
        });
    }

    createRepoCard(repo) {
        const categoryColor = getCategoryColor(repo.category);
        const languageColor = getLanguageColor(repo.language);
        const updatedAt = new Date(repo.updated_at).toLocaleDateString();
        
        return `
            <article class="repo-card" data-category="${repo.category}" data-language="${repo.language || 'unknown'}">
                <div class="repo-header">
                    <div>
                        <h3 class="repo-title">
                            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
                                ${repo.full_name}
                            </a>
                        </h3>
                        <span class="repo-category" style="border-color: ${categoryColor}; color: ${categoryColor}">
                            ${repo.category}
                        </span>
                    </div>
                    <button class="repo-star-btn" aria-label="Star repository">
                        <i class="far fa-star"></i>
                    </button>
                </div>
                
                <p class="repo-description">
                    ${repo.description || 'No description provided.'}
                </p>
                
                <div class="repo-stats">
                    <div class="repo-stat" title="Stars">
                        <i class="fas fa-star"></i>
                        <span>${this.formatNumber(repo.stargazers_count)}</span>
                    </div>
                    <div class="repo-stat" title="Forks">
                        <i class="fas fa-code-branch"></i>
                        <span>${this.formatNumber(repo.forks_count)}</span>
                    </div>
                    <div class="repo-stat" title="Open Issues">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>${this.formatNumber(repo.open_issues_count)}</span>
                    </div>
                    ${repo.calculated_stars_per_day > 0 ? `
                        <div class="repo-stat" title="Trending Score">
                            <i class="fas fa-fire"></i>
                            <span>${repo.calculated_stars_per_day.toFixed(1)}/day</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="repo-footer">
                    <div class="repo-language">
                        ${repo.language ? `
                            <span class="language-color" style="background-color: ${languageColor}"></span>
                            <span>${repo.language}</span>
                        ` : ''}
                    </div>
                    <div class="repo-updated" title="Last updated">
                        Updated ${updatedAt}
                    </div>
                </div>
            </article>
        `;
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num;
    }

    handleCategoryChange(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        this.updateActiveCategory();
        this.loadRepositories();
    }

    handleSortChange(sort) {
        this.currentSort = sort;
        this.currentPage = 1;
        this.loadRepositories();
    }

    handleDateRangeChange(range) {
        // Implement date filtering logic
        console.log('Date range changed:', range);
        this.filterRepositories();
    }

    handleLanguageFilter(language) {
        // Toggle language filter
        const button = event.target;
        button.classList.toggle('active');
        this.filterRepositories();
    }

    filterRepositories() {
        const languageFilter = document.querySelectorAll('#language-filter .language-tag.active');
        const selectedLanguages = Array.from(languageFilter).map(btn => btn.dataset.language);
        
        const cards = document.querySelectorAll('.repo-card');
        cards.forEach(card => {
            const cardLanguage = card.dataset.language;
            const shouldShow = selectedLanguages.length === 0 || 
                             selectedLanguages.includes(cardLanguage) ||
                             (selectedLanguages.includes('other') && !cardLanguage);
            
            card.style.display = shouldShow ? 'block' : 'none';
        });
        
        this.checkEmptyState();
    }

    resetFilters() {
        this.currentCategory = 'AI';
        this.currentSort = 'stars';
        this.currentPage = 1;
        
        // Reset UI elements
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'AI');
        });
        
        document.getElementById('sort-select').value = 'stars';
        document.getElementById('date-range').value = 'all';
        document.querySelectorAll('.language-tag').forEach(tag => {
            tag.classList.remove('active');
        });
        
        this.loadRepositories();
    }

    loadMore() {
        if (this.isLoading || !this.hasMore) return;
        
        this.currentPage++;
        this.loadRepositories();
    }

    updateActiveCategory() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.currentCategory);
        });
    }

    updateLoadMoreButton() {
        const button = document.getElementById('load-more');
        button.style.display = this.hasMore ? 'inline-flex' : 'none';
    }

    updateStats() {
        // Update statistics in the header
        const cards = document.querySelectorAll('.repo-card');
        const totalStars = Array.from(cards).reduce((sum, card) => {
            return sum + parseInt(card.querySelector('.repo-stat:nth-child(1) span').textContent);
        }, 0);
        
        const totalForks = Array.from(cards).reduce((sum, card) => {
            return sum + parseInt(card.querySelector('.repo-stat:nth-child(2) span').textContent);
        }, 0);
        
        document.getElementById('total-repos').textContent = cards.length;
        document.getElementById('total-stars').textContent = this.formatNumber(totalStars);
        document.getElementById('total-forks').textContent = this.formatNumber(totalForks);
        document.getElementById('categories-count').textContent = Object.keys(CONFIG.CATEGORIES).length;
    }

    showLoading() {
        this.isLoading = true;
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        this.isLoading = false;
        document.getElementById('loading').style.display = 'none';
    }

    showError(message) {
        const errorContainer = document.getElementById('error-message');
        errorContainer.querySelector('.error-text').textContent = message;
        errorContainer.style.display = 'block';
    }

    hideError() {
        document.getElementById('error-message').style.display = 'none';
    }

    showEmptyState() {
        document.getElementById('empty-state').style.display = 'block';
    }

    hideEmptyState() {
        document.getElementById('empty-state').style.display = 'none';
    }

    checkEmptyState() {
        const visibleCards = document.querySelectorAll('.repo-card[style="display: block"]').length;
        if (visibleCards === 0 && !this.isLoading) {
            this.showEmptyState();
        } else {
            this.hideEmptyState();
        }
    }

    setupTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    refreshData() {
        this.api.clearCache();
        this.currentPage = 1;
        this.loadRepositories();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new GitHubDashboard();
    
    // Make dashboard available globally for debugging
    window.dashboard = dashboard;
});

// Share functions for LinkedIn
function shareToLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('GitHub Repos Dashboard');
    const summary = encodeURIComponent('Check out this awesome GitHub repositories dashboard!');
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
}

function shareToTwitter() {
    const text = encodeURIComponent('Check out this GitHub Repos Dashboard!');
    const url = encodeURIComponent(window.location.href);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
}

function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
    });
}

// Make functions available globally
window.shareToLinkedIn = shareToLinkedIn;
window.shareToTwitter = shareToTwitter;
window.copyToClipboard = copyToClipboard;
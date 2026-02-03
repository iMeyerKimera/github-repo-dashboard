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
        this.setupViralFeatures();
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
            'IoT': 'microchip',
            'Energy': 'bolt'
        };
        return icons[category] || 'folder';
    }

    // Add to your class methods
    setupViralFeatures() {
        // Show newsletter bar on 3rd visit
        const visitCount = parseInt(localStorage.getItem('visitCount') || '0');
        localStorage.setItem('visitCount', (visitCount + 1).toString());

        if (visitCount >= 2) {
            setTimeout(() => {
                const newsletterBar = document.getElementById('newsletter-bar');
                if (newsletterBar) newsletterBar.style.display = 'block';
            }, 3000);
        }

        // Newsletter form submission
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input').value;
                // Simple mailto: for now - upgrade to Mailchimp later
                window.location.href = `mailto:trending@yourdomain.com?subject=Subscribe%20to%20GitHub%20Trends&body=Please%20subscribe%20me%20with%20email:%20${email}`;
                newsletterForm.innerHTML = '<p style="color:white;margin:0;">✅ Check your email to confirm!</p>';
            });
        }

        // Close newsletter button
        document.querySelector('.newsletter-close')?.addEventListener('click', () => {
            document.getElementById('newsletter-bar').style.display = 'none';
        });

        // Add share buttons to each repo card
        this.addShareButtonsToRepos();
    }

    addShareButtonsToRepos() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.repo-share-btn')) {
                const repoCard = e.target.closest('.repo-card');
                const repoTitle = repoCard.querySelector('.repo-title a').textContent;
                const repoUrl = repoCard.querySelector('.repo-title a').href;
                const repoDescription = repoCard.querySelector('.repo-description').textContent;
                const repoCategory = repoCard.querySelector('.repo-category').textContent;

                this.showShareModal(repoTitle, repoUrl, repoDescription, repoCategory);
            }
        });
    }

    showShareModal(title, url, description = '', category = '') {
        // Store current repo data
        this.currentShareData = { title, url, description, category };

        // Get modal elements
        const modal = document.getElementById('share-modal');
        const textPreview = document.getElementById('share-text-preview');
        const urlPreview = document.getElementById('share-url-preview');
        const customText = document.getElementById('share-custom-text');

        // Update preview content
        const hashtags = category ? ` #${category.replace(/\s+/g, '')}` : '';
        const defaultText = `Check out "${title}"${hashtags} - trending on GitHub!`;

        textPreview.textContent = defaultText;
        urlPreview.textContent = url;
        customText.value = defaultText;

        // Show modal
        modal.style.display = 'flex';

        // Add event listeners for share buttons
        this.setupShareButtons();
    }

    setupShareButtons() {
        const modal = document.getElementById('share-modal');
        const overlay = document.getElementById('share-modal-overlay');
        const closeBtn = document.querySelector('.share-modal-close');
        const customCopyBtn = document.getElementById('share-custom-copy');
        const customText = document.getElementById('share-custom-text');

        // Close modal functions
        const closeModal = () => {
            modal.style.display = 'none';
            this.currentShareData = null;
        };

        // Close on overlay click
        overlay.addEventListener('click', closeModal);

        // Close on close button click
        closeBtn.addEventListener('click', closeModal);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });

        // Share option buttons
        document.querySelectorAll('.share-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = btn.dataset.platform;
                this.handleShare(platform);

                // Show success feedback for copy
                if (platform === 'copy') {
                    this.showCopyFeedback(btn);
                }
            });
        });

        // Custom copy button
        customCopyBtn.addEventListener('click', () => {
            const text = customText.value.trim() || customText.placeholder;
            const fullText = `${text}\n\n${this.currentShareData.url}`;

            navigator.clipboard.writeText(fullText).then(() => {
                this.showCopyFeedback(customCopyBtn, 'Copied with message!');
            }).catch(err => {
                console.error('Failed to copy:', err);
                // Fallback for older browsers
                customText.select();
                document.execCommand('copy');
                this.showCopyFeedback(customCopyBtn, 'Copied!');
            });
        });
    }

    handleShare(platform) {
        if (!this.currentShareData) return;

        const { title, url, category } = this.currentShareData;
        const hashtags = category ? ` #${category.replace(/\s+/g, '')} #GitHub` : ' #GitHub';

        let shareUrl = '';

        switch(platform) {
            case 'twitter':
                const twitterText = `Check out "${title}"${hashtags} - trending on GitHub!`;
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`;
                break;

            case 'linkedin':
                // LinkedIn sharing URL
                const linkedinText = `I found this amazing GitHub repository trending in ${category}!`;
                const linkedinSummary = `Check out ${title} - it's currently trending on GitHub.`;
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(linkedinSummary)}`;
                break;

            case 'copy':
                // Copy URL to clipboard
                navigator.clipboard.writeText(url).then(() => {
                    this.showToast('Link copied to clipboard!', 'success');
                    this.showCopyFeedback(document.querySelector('.share-option.copy'), 'Copied!');
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    // Fallback...
                    this.showToast('Link copied!', 'success');
                    this.showCopyFeedback(document.querySelector('.share-option.copy'), 'Copied!');
                });
                return; // Don't open window for copy

            default:
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=500');
        }
    }

    showCopyFeedback(button, message = 'Copied!') {
        const originalText = button.querySelector('span') ? button.querySelector('span').textContent : button.textContent;
        const originalHTML = button.innerHTML;

        // Change button text
        if (button.querySelector('span')) {
            button.querySelector('span').textContent = message;
        } else {
            button.textContent = message;
        }

        // Change icon to checkmark
        const icon = button.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-check';
        }

        // Reset after 2 seconds
        setTimeout(() => {
            if (button.querySelector('span')) {
                button.querySelector('span').textContent = originalText;
            } else {
                button.textContent = originalText;
            }

            if (icon) {
                // Restore original icon
                if (button.classList.contains('copy')) {
                    icon.className = 'fas fa-link';
                } else if (button.classList.contains('twitter')) {
                    icon.className = 'fab fa-twitter';
                } else if (button.classList.contains('linkedin')) {
                    icon.className = 'fab fa-linkedin';
                }
            }
        }, 2000);
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

            // Store current repos for stats calculation
            this.currentRepos = repos;
            
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
                    <div class="repo-actions">
                        <button class="repo-star-btn" aria-label="Star repository">
                            <i class="far fa-star"></i>
                        </button>
                        <button class="repo-share-btn" aria-label="Share repository">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
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
        const cards = document.querySelectorAll('.repo-card');

        // If we have currentRepos data, use it for accurate stats
        if (this.currentRepos && this.currentRepos.length > 0) {
            const totalStars = this.currentRepos.reduce((sum, repo) =>
                sum + (repo.stargazers_count || 0), 0
            );
            const totalForks = this.currentRepos.reduce((sum, repo) =>
                sum + (repo.forks_count || 0), 0
            );
            const totalWatchers = this.currentRepos.reduce((sum, repo) =>
                sum + (repo.watchers_count || 0), 0
            );

            document.getElementById('total-repos').textContent = this.currentRepos.length;
            document.getElementById('total-stars').textContent = this.formatNumber(totalStars);
            document.getElementById('total-forks').textContent = this.formatNumber(totalForks);
            // You could add watchers if you want
        } else {
            // Fallback to counting visible cards
            const visibleCards = Array.from(cards).filter(card =>
                card.style.display !== 'none'
            ).length;

            document.getElementById('total-repos').textContent = visibleCards;
            document.getElementById('total-stars').textContent = '--';
            document.getElementById('total-forks').textContent = '--';
        }

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

    showToast(message, type = 'success', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
                  type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' :
                  '<i class="fas fa-info-circle"></i>'}
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Auto-remove after duration
        const removeToast = () => {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (toast.parentNode === container) {
                    container.removeChild(toast);
                }
            }, 300);
        };

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', removeToast);

        // Auto-remove
        setTimeout(removeToast, duration);
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
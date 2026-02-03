# GitHub Repos Dashboard 🚀

![Dashboard Preview](assets/preview.png)

A beautiful, responsive dashboard for exploring GitHub repositories categorized by topics like AI, Energy, FinTech, and more. Filter by stars, forks, trending status, and other statistics. **Auto-updates daily** via GitHub Actions.

**Live Demo**: [https://imeyerkimera.github.io/github-repo-dashboard](https://imeyerkimera.github.io/github-repo-dashboard)

## ✨ Features

- **11 Categorized Repositories**: Browse repos by categories (AI, Energy, FinTech, Web Dev, Mobile, DevOps, Gaming, Data Science, Cybersecurity, IoT, Anime)
- **Advanced Filtering**: Filter by stars, forks, trending, recently updated, language, and date range
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme detection with manual toggle
- **Accessibility**: WCAG compliant with keyboard navigation
- **Real-time Stats**: Live statistics for loaded repositories
- **Smart Sharing**: One-click sharing to Twitter, LinkedIn, and copy-to-clipboard
- **Daily Auto-Updates**: Data refreshes automatically every 24 hours
- **Energy Category**: Special focus on renewable energy, solar, wind, and smart grid technologies

## 🛠️ Setup Instructions

### 1. Fork or Clone the Repository
```bash
git clone https://github.com/imeyerkimera/github-repo-dashboard.git
cd github-repo-dashboard
```

### 2. Add GitHub Token (Required for Daily Updates)
For automatic daily updates via GitHub Actions:
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with `public_repo` scope
3. In your repository, go to Settings > Secrets and variables > Actions
4. Add a new secret: Name = `DASHBOARD_TOKEN`, Value = `your_token_here`

### 3. Deploy to GitHub Pages
1. Go to repository Settings > Pages
2. Select "Deploy from a branch"
3. Choose `main` branch and `/root` folder
4. Save - Your site will be at `https://yourusername.github.io/github-repo-dashboard`

### 4. Customize Categories (Optional)
Edit `config.js` to add/remove categories:
```javascript
CATEGORIES: {
    'YourCategory': ['topic1', 'topic2', 'topic3']
}
```

## 📁 Project Structure

```
github-repo-dashboard/
├── index.html              # Main HTML file
├── styles/                 # CSS files
│   ├── main.css           # Main styles
│   ├── responsive.css     # Responsive styles
│   └── theme.css          # Theme styles
├── scripts/               # JavaScript files
│   ├── main.js           # Main application logic
│   └── github-api.js     # GitHub API handler with local data fallback
├── data.json              # Auto-generated repository data (updated daily)
├── config.js             # Configuration and categories
├── scripts/
│   └── fetch_repos.py    # Python script for data collection
├── .github/
│   └── workflows/
│       └── update_data.yml # GitHub Actions workflow
├── assets/               # Images, icons, fonts
└── README.md
```

## 🚀 Usage

1. **Select a Category**: Click on category buttons (AI, Energy, FinTech, etc.)
2. **Sort Repositories**: Use dropdown to sort by stars, forks, trending, newest, or recently updated
3. **Filter Further**: Use language and date range filters
4. **Load More**: Click "Load More" to see additional repositories
5. **Share**: Click the share button on any repository card to share on Twitter, LinkedIn, or copy link
6. **Toggle Theme**: Switch between light/dark mode in the header

## ⚙️ How It Works

### Data Collection (Automatic)
- **GitHub Action** runs daily at midnight UTC
- **Python script** (`fetch_repos.py`) fetches trending repositories for all categories
- **Data is cached** in `data.json` for fast loading
- **Fallback system**: Uses cached data if GitHub API rate limits are exceeded

### Frontend Features
- **ES6 Modules**: Modern JavaScript architecture
- **Local-first**: Loads from `data.json` first, falls back to GitHub API
- **Smart caching**: Browser caches API responses for 30 minutes
- **Share modal**: Modern sharing interface with custom messages
- **Responsive stats**: Real-time statistics update as you filter

## 🔧 Configuration Options

### Rate Limiting
- **Without token**: 60 requests/hour (GitHub API limit)
- **With token**: 5,000 requests/hour
- **Local data**: Always available via `data.json`

### Cache Settings
- **Browser cache**: 30 minutes for API responses
- **Local data**: Used if less than 7 days old
- **Manual refresh**: Click refresh button to clear cache

### Trending Calculation
Trending score is calculated based on commit activity over 7 days

## 🌐 Sharing & Social Features

### Built-in Share Modal
- **Twitter**: Auto-includes category hashtags
- **LinkedIn**: Professional sharing with proper formatting
- **Copy Link**: One-click copy with visual feedback
- **Custom Messages**: Edit before sharing

### LinkedIn Optimization
1. Update Open Graph tags in `index.html`
2. Create a preview image (1200×630px) in `assets/preview.png`
3. Share individual repos or the entire dashboard

## ♿ Accessibility Features

- Semantic HTML structure with proper headings
- ARIA labels and roles throughout
- Keyboard navigation support (Tab, Enter, Escape)
- High contrast mode support
- Reduced motion support for animations
- Screen reader compatible
- Skip to main content link

## 🚀 Advanced Features

### For Developers
- **ES6 Modules**: Clean, modular JavaScript
- **GitHub Actions**: Automated data pipeline
- **Responsive CSS Grid/Flexbox**: Modern layout techniques
- **CSS Custom Properties**: Easy theming system

### For Users
- **Energy Category**: Track renewable energy and smart grid technologies
- **Real-time Filtering**: Instant updates as you change filters
- **Category Icons**: Visual identification of categories
- **Detailed Stats**: Stars, forks, issues, and trending scores

## 🐛 Troubleshooting

**Rate Limit Errors**: Add a GitHub token to `config.js` and repository secrets

**No Repositories Showing**: 
1. Check if `data.json` exists in root directory
2. Check GitHub Actions workflow ran successfully
3. Check browser console for errors

**Share Modal Not Working**:
1. Ensure you're using a modern browser
2. Check browser console for errors
3. Try disabling ad-blockers

**Theme Not Working**: Clear localStorage and reload the page

## 🔄 Daily Updates

The dashboard automatically updates every 24 hours via GitHub Actions:

1. **Schedule**: Runs at 00:00 UTC daily
2. **Process**: Fetches trending repos for all 11 categories
3. **Commit**: Updates `data.json` automatically
4. **Deploy**: Changes are live immediately on GitHub Pages

**Manual Trigger**: Go to Actions → Update Repository Data → Run workflow

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Areas for Contribution
- Add new categories
- Improve UI/UX design
- Enhance accessibility
- Add visualizations/charts
- Improve data collection efficiency
- Add tests

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- **GitHub API** for providing the data
- **Font Awesome** for beautiful icons
- **Inter font family** for typography
- **All open-source maintainers** whose repositories are featured
- **GitHub Actions** for free CI/CD
- **GitHub Pages** for free hosting

## 📞 Support & Contact

For issues, questions, or suggestions:

1. **GitHub Issues**: [Open an issue](https://github.com/imeyerkimera/github-repo-dashboard/issues)
2. **Email**: mk.nowbuilds@gmail.com
3. **Feature Requests**: Submit via GitHub Issues

**Follow for Updates**: Star the repo to stay updated on new features!

---

## 🎯 Quick Start for Developers

```bash
# Clone and run locally
git clone https://github.com/imeyerkimera/github-repo-dashboard.git
cd github-repo-dashboard

# Run a local server (Python 3)
python -m http.server 8000

# Open in browser
open http://localhost:8000
```

**Note**: For local development, you need a local server because the dashboard uses ES6 modules.

---

⭐ **Star this repo if you find it useful!** ⭐

🚀 **Share with your network on LinkedIn to help others discover trending repositories!**

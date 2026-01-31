# GitHub Repos Dashboard 🚀

![Dashboard Preview](assets/preview.png)

A beautiful, responsive dashboard for exploring GitHub repositories categorized by topics like AI, Anime, FinTech, and more. Filter by stars, forks, trending status, and other statistics.

## ✨ Features

- **Categorized Repositories**: Browse repos by categories (AI, Anime, FinTech, Web Dev, etc.)
- **Advanced Filtering**: Filter by stars, forks, trending, recently updated
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme detection with manual toggle
- **Accessibility**: WCAG compliant with keyboard navigation
- **Real-time Stats**: Live statistics for loaded repositories
- **Shareable**: Easy sharing on LinkedIn, Twitter, and other platforms

## 🛠️ Setup Instructions

### 1. Fork or Clone the Repository
```bash
git clone https://github.com/imeyerkimera/github-repo-dashboard.git
cd github-repo-dashboard
```

### 2. Add GitHub Token (Optional)
For higher rate limits:
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with `public_repo` scope
3. Add to `config.js`:
```javascript
TOKEN: 'your_token_here'
```

### 3. Deploy to GitHub Pages
1. Go to repository Settings > Pages
2. Select "Deploy from a branch"
3. Choose `main` branch and `/root` folder
4. Save - Your site will be at `https://imeyerkimera.github.io/github-repo-dashboard`

### 4. Customize Categories
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
│   ├── github-api.js     # GitHub API handler
│   └── filters.js        # Filtering logic
├── config.js             # Configuration
├── assets/               # Images, icons, fonts
└── README.md
```

## 🚀 Usage

1. **Select a Category**: Click on category buttons (AI, Anime, FinTech, etc.)
2. **Sort Repositories**: Use dropdown to sort by stars, forks, trending
3. **Filter Further**: Use language and date filters
4. **Load More**: Click "Load More" to see additional repositories
5. **Share**: Use share buttons to post on LinkedIn or Twitter

## 🔧 Configuration Options

### Rate Limiting
Without a token: 60 requests/hour
With token: 5,000 requests/hour

### Cache Settings
Data is cached for 30 minutes by default

### Trending Calculation
Trending is calculated based on commit activity over 7 days

## 🌐 Sharing on LinkedIn

To share effectively:
1. Update Open Graph tags in `index.html`
2. Create a preview image (1200×630px) in `assets/preview.png`
3. Use the LinkedIn share button in the footer

## ♿ Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- High contrast mode support
- Reduced motion support
- Screen reader compatible

## 🐛 Troubleshooting

**Rate Limit Errors**: Add a GitHub token in `config.js`

**No Repositories Showing**: Check network tab in developer tools

**Theme Not Working**: Clear localStorage and reload

**Share Not Working**: Update URL in share functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- GitHub API for data
- Font Awesome for icons
- Inter font family
- All repository maintainers

## 📞 Support

For issues and questions:
1. Check existing issues
2. Create a new issue with details
3. Email: mk.nowbuilds@gmail.com

---

⭐ **Star this repo if you find it useful!**
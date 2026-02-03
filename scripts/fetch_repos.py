import requests
import json
import os
import time
from datetime import datetime

# GitHub token from environment
token = os.environ.get('DASHBOARD_TOKEN')
headers = {'Authorization': f'token {token}'} if token else {}

# Base URL for GitHub API
BASE_URL = 'https://api.github.com/search/repositories'

# Categories and their topics - MATCHING THE DASHBOARD CONFIG
categories = {
    "AI": ["machine-learning", "artificial-intelligence", "deep-learning", "neural-networks", "ai"],
    "Anime": ["anime", "manga", "otaku", "anime-games", "anime-app"],
    "FinTech": ["fintech", "blockchain", "cryptocurrency", "banking", "finance"],
    "Web Dev": ["web", "javascript", "react", "vue", "angular", "nodejs"],
    "Mobile": ["mobile", "android", "ios", "flutter", "react-native"],
    "DevOps": ["devops", "kubernetes", "docker", "ci-cd", "infrastructure"],
    "Gaming": ["game", "gaming", "unity", "unreal-engine", "game-development"],
    "Data Science": ["data-science", "analytics", "big-data", "data-visualization"],
    "Cybersecurity": ["security", "cybersecurity", "hacking", "privacy"],
    "IoT": ["iot", "arduino", "raspberry-pi", "embedded"],
    "Energy": ["energy", "renewable-energy", "solar", "wind", "battery", "power-systems", "smart-grid", "energy-storage", "electric-vehicles"]
}

# Sort criteria
sorts = [
    ("stars", "desc"),
    ("forks", "desc"),
    ("updated", "desc")
]


def search_repositories(query, sort, order, per_page=30):
    """Search repositories with given query, sort, and order."""
    params = {
        'q': query,
        'sort': sort,
        'order': order,
        'per_page': per_page
    }
    try:
        response = requests.get(BASE_URL, headers=headers, params=params, timeout=30)
        response.raise_for_status()
        return response.json()['items']
    except Exception as e:
        print(f"Error searching repositories: {e}")
        return []


def build_query(topics):
    """Build a search query for a list of topics."""
    # Search for repos that have at least one of the topics
    topic_query = ' '.join([f'topic:{topic}' for topic in topics])
    return f'{topic_query} stars:>10'  # Only repos with more than 10 stars


def main():
    data = {}
    total_repos = 0

    for category, topics in categories.items():
        data[category] = {}
        query = build_query(topics)

        for sort, order in sorts:
            try:
                print(f"Fetching {category} - {sort}...")
                repos = search_repositories(query, sort, order, per_page=50)

                # Simplify the repo data to what we need
                simplified_repos = []
                for repo in repos:
                    simplified_repos.append({
                        'id': repo['id'],
                        'name': repo['name'],
                        'full_name': repo['full_name'],
                        'html_url': repo['html_url'],
                        'description': repo['description'],
                        'language': repo['language'],
                        'stargazers_count': repo['stargazers_count'],
                        'forks_count': repo['forks_count'],
                        'watchers_count': repo['watchers_count'],
                        'open_issues_count': repo['open_issues_count'],
                        'created_at': repo['created_at'],
                        'updated_at': repo['updated_at'],
                        'topics': repo.get('topics', []),
                        'category': category,
                        'calculated_stars_per_day': 0
                    })

                data[category][sort] = simplified_repos
                total_repos += len(simplified_repos)

                # Be gentle to the API - longer delay for free API
                time.sleep(3)

            except Exception as e:
                print(f"Error fetching {category} with sort {sort}: {e}")
                data[category][sort] = []

    # Add metadata
    data['_last_updated'] = datetime.utcnow().isoformat() + 'Z'
    data['_total_repositories'] = total_repos
    data['_categories'] = list(categories.keys())

    # Write to data.json
    with open('data.json', 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n✅ Successfully updated data.json")
    print(f"📊 Total repositories: {total_repos}")
    print(f"📅 Last updated: {data['_last_updated']}")
    print(f"🏷️ Categories: {', '.join(categories.keys())}")


if __name__ == '__main__':
    main()
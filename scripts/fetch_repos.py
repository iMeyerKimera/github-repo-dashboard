import requests
import json
import os
import time

# GitHub token from environment
token = os.environ.get('DASHBOARD_TOKEN')
headers = {'Authorization': f'token {token}'} if token else {}

# Base URL for GitHub API
BASE_URL = 'https://api.github.com/search/repositories'

# Categories and their topics
categories = {
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
}

# Sort criteria
sorts = [
    ("stars", "desc"),
    ("forks", "desc"),
    ("updated", "desc")
]

def search_repositories(query, sort, order, per_page=100):
    """Search repositories with given query, sort, and order."""
    params = {
        'q': query,
        'sort': sort,
        'order': order,
        'per_page': per_page
    }
    response = requests.get(BASE_URL, headers=headers, params=params)
    response.raise_for_status()
    return response.json()['items']

def build_query(topics):
    """Build a search query for a list of topics."""
    # Search for repos that have at least one of the topics
    topic_query = ' '.join([f'topic:{topic}' for topic in topics])
    return topic_query

def main():
    data = {}
    for category, topics in categories.items():
        data[category] = {}
        query = build_query(topics)
        for sort, order in sorts:
            try:
                repos = search_repositories(query, sort, order)
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
                        'updated_at': repo['updated_at'],
                        'topics': repo.get('topics', [])
                    })
                data[category][sort] = simplified_repos
                # Be gentle to the API
                time.sleep(2)
            except Exception as e:
                print(f"Error fetching {category} with sort {sort}: {e}")
                data[category][sort] = []

    # Add a timestamp to the data
    data['_last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())
    # Write to data.json
    with open('data.json', 'w') as f:
        json.dump(data, f, indent=2)

if __name__ == '__main__':
    main()
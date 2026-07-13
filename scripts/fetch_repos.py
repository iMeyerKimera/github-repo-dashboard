import requests
import json
import os
import time
from datetime import datetime
from operator import itemgetter

# GitHub token from environment
token = os.environ.get('DASHBOARD_TOKEN')
headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
}
if token:
    headers['Authorization'] = f'token {token}'

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

MIN_STARS = 10
PER_PAGE = 100
MAX_REPOS_PER_CATEGORY_SORT = 150
REQUEST_DELAY_SECONDS = 3


def search_repositories(query, sort, order, per_page=PER_PAGE):
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


def build_topic_query(topic):
    """Build a broad category query for one GitHub topic."""
    return f'topic:{topic} stars:>{MIN_STARS}'


def simplify_repo(repo, category, matched_topics):
    """Keep only the fields the dashboard renders and a small provenance hint."""
    return {
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
        'matched_topics': set(matched_topics),
        'calculated_stars_per_day': 0
    }


def merge_repositories(existing_repos, new_repos, category, matched_topic):
    """Merge topic searches so broad categories are a union, not an intersection."""
    for repo in new_repos:
        repo_id = repo['id']
        if repo_id in existing_repos:
            existing_repos[repo_id]['matched_topics'].add(matched_topic)
            continue

        existing_repos[repo_id] = simplify_repo(
            repo,
            category,
            matched_topics={matched_topic}
        )


def sort_repositories(repos, sort):
    """Sort merged results the same way the dashboard expects."""
    if sort == 'stars':
        return sorted(repos, key=itemgetter('stargazers_count'), reverse=True)

    if sort == 'forks':
        return sorted(repos, key=itemgetter('forks_count'), reverse=True)

    if sort == 'updated':
        return sorted(
            repos,
            key=lambda repo: repo.get('updated_at') or '',
            reverse=True
        )

    return sorted(repos, key=itemgetter('stargazers_count'), reverse=True)


def main():
    data = {}
    total_entries = 0
    unique_repo_ids = set()

    for category, topics in categories.items():
        data[category] = {}

        for sort, order in sorts:
            try:
                print(f"Fetching {category} - {sort}...")
                merged_repos = {}

                for topic in topics:
                    query = build_topic_query(topic)
                    print(f"  topic:{topic}")
                    repos = search_repositories(query, sort, order)
                    merge_repositories(merged_repos, repos, category, topic)

                    # Stay under GitHub's authenticated search rate limit.
                    time.sleep(REQUEST_DELAY_SECONDS)

                sorted_repos = sort_repositories(
                    list(merged_repos.values()),
                    sort
                )
                category_repos = sorted_repos[:MAX_REPOS_PER_CATEGORY_SORT]

                # Convert matched topic sets to JSON-friendly lists after merging.
                for repo in category_repos:
                    repo['matched_topics'] = sorted(repo['matched_topics'])
                    unique_repo_ids.add(repo['id'])

                data[category][sort] = category_repos
                total_entries += len(category_repos)
                print(f"  saved {len(category_repos)} repos")

            except Exception as e:
                print(f"Error fetching {category} with sort {sort}: {e}")
                data[category][sort] = []

    # Add metadata
    data['_last_updated'] = datetime.utcnow().isoformat() + 'Z'
    data['_total_repositories'] = len(unique_repo_ids)
    data['_total_repository_entries'] = total_entries
    data['_categories'] = list(categories.keys())
    data['_collection'] = {
        'min_stars': MIN_STARS,
        'per_page': PER_PAGE,
        'max_repos_per_category_sort': MAX_REPOS_PER_CATEGORY_SORT,
        'strategy': 'topic_union'
    }

    # Write to data.json
    with open('data/data.json', 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n✅ Successfully updated data.json")
    print(f"📊 Unique repositories: {len(unique_repo_ids)}")
    print(f"📦 Repository entries: {total_entries}")
    print(f"📅 Last updated: {data['_last_updated']}")
    print(f"🏷️ Categories: {', '.join(categories.keys())}")


if __name__ == '__main__':
    main()

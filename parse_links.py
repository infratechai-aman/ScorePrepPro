from bs4 import BeautifulSoup

with open('cloudscraper_page.html', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

for a in soup.find_all('a'):
    href = a.get('href', '')
    if 'science' in href.lower() or 'math' in href.lower() or 'concept' in href.lower() or 'algebra' in href.lower() or 'geometry' in href.lower():
        print(f"[{a.text.strip()}] -> {href}")

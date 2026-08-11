import cloudscraper
import sys

def main():
    scraper = cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'windows',
            'desktop': True
        }
    )
    url = "https://www.shaalaa.com/course/maharashtra-board-10th-standard-ssc-english-medium_662"
    print(f"Fetching {url}")
    response = scraper.get(url)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        with open("cloudscraper_page.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        print("Saved to cloudscraper_page.html")
    else:
        print("Failed to fetch")

if __name__ == "__main__":
    main()

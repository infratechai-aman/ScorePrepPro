from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        stealth_sync(page)
        
        page.goto('https://www.shaalaa.com/search-concept-notes/maharashtra-board-10th-standard-ssc-english-medium_662?subjects=science-and-tech-1_3355')
        page.wait_for_timeout(3000)
        
        title = page.title()
        print(f"Title: {title}")
        
        links = page.evaluate('''() => {
            return Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('/concept-notes/'));
        }''')
        print(f"Links found: {len(links)}")
        
        browser.close()

if __name__ == "__main__":
    main()

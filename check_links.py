import asyncio
from playwright.async_api import async_playwright
import time

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto('https://www.shaalaa.com/course/maharashtra-board-10th-standard-ssc-english-medium_662')
        await page.wait_for_timeout(3000)
        
        # Get all links
        links = await page.evaluate('''() => {
            return Array.from(document.querySelectorAll('a')).map(a => {
                return { text: a.innerText, href: a.href }
            });
        }''')
        
        for link in links:
            if 'science' in link['href'].lower() or 'math' in link['href'].lower() or 'concept' in link['href'].lower():
                print(f"Text: {link['text']}, Href: {link['href']}")
                
        await browser.close()

asyncio.run(main())

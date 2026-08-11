import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto('https://www.shaalaa.com/course/maharashtra-board-10th-standard-ssc-english-medium_662')
        await page.wait_for_timeout(3000)
        await page.screenshot(path="shaalaa_page.png")
        
        # also print body innerText
        text = await page.evaluate("document.body.innerText")
        with open("page_text.txt", "w", encoding="utf-8") as f:
            f.write(text)
            
        await browser.close()

asyncio.run(main())

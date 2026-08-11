import tls_client
from bs4 import BeautifulSoup
import json
import time
from pathlib import Path
import sys
import io

# Fix Windows unicode console printing
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

OUTPUT_DIR = Path("scraped_content")
TS_OUTPUT = Path("lib/textbookContent.ts")

SUBJECTS = [
    {
        "board": "maharashtra",
        "grade": "10",
        "subject": "Science and Technology Part-1",
        "list_url": "https://www.shaalaa.com/search-concept-notes/maharashtra-board-10th-standard-ssc-english-medium_662?subjects=science-and-tech-1_3355",
        "chapters": [
            "Gravitation", "Periodic Classification of Elements",
            "Chemical Reactions and Equations", "Effects of Electric Current",
            "Heat", "Refraction of Light", "Lenses",
            "Metallurgy", "Carbon Compounds", "Space Missions"
        ]
    },
    {
        "board": "maharashtra",
        "grade": "10",
        "subject": "Science and Technology Part-2",
        "list_url": "https://www.shaalaa.com/search-concept-notes/maharashtra-board-10th-standard-ssc-english-medium_662?subjects=science-and-tech-2_3285",
        "chapters": [
            "Heredity and Evolution", "Life Processes in Living Organisms Part-1",
            "Life Processes in Living Organisms Part-2", "Environmental Management",
            "Towards Green Energy", "Animal Classification",
            "Introduction to Microbiology", "Cell Biology and Biotechnology",
            "Social Health", "Disaster Management"
        ]
    },
    {
        "board": "maharashtra",
        "grade": "10",
        "subject": "Mathematics Part-I (Algebra)",
        "list_url": "https://www.shaalaa.com/search-concept-notes/maharashtra-board-10th-standard-ssc-english-medium_662?subjects=algebra-mathematics-1_3277",
        "chapters": [
            "Linear Equations in Two Variables", "Quadratic Equations",
            "Arithmetic Progression", "Financial Planning",
            "Probability", "Statistics"
        ]
    },
    {
        "board": "maharashtra",
        "grade": "10",
        "subject": "Mathematics Part-II (Geometry)",
        "list_url": "https://www.shaalaa.com/search-concept-notes/maharashtra-board-10th-standard-ssc-english-medium_662?subjects=geometry-mathematics-2_3278",
        "chapters": [
            "Similarity", "Pythagoras Theorem", "Circle",
            "Geometric Constructions", "Coordinate Geometry",
            "Trigonometry", "Mensuration"
        ]
    },
    {
        "board": "maharashtra",
        "grade": "10",
        "subject": "History and Political Science",
        "list_url": "https://www.shaalaa.com/search-concept-notes/maharashtra-board-10th-standard-ssc-english-medium_662?subjects=history-and-political-science-social-science-1_3287",
        "chapters": [
            "Historiography: Development in the West", "Historiography: Indian Tradition",
            "Applied History", "History of Indian Arts", "Mass Media and History",
            "Entertainment and History", "Sports and History", "Tourism and History",
            "Heritage Management", "Working of the Constitution", "The Electoral Process",
            "Political Parties", "Social and Political Movements", "Challenges faced by Indian Democracy"
        ]
    },
    {
        "board": "maharashtra",
        "grade": "10",
        "subject": "Geography",
        "list_url": "https://www.shaalaa.com/search-concept-notes/maharashtra-board-10th-standard-ssc-english-medium_662?subjects=geography-social-science-2_3289",
        "chapters": [
            "Location and Extent", "Physiography and Drainage", "Climate",
            "Natural Vegetation and Wildlife", "Population", "Human Settlements",
            "Economy and Occupations", "Tourism, Transport and Communication"
        ]
    }
]

def get_session():
    return tls_client.Session(
        client_identifier="chrome_120",
        random_tls_extension_order=True
    )

def scrape_all_chapter_links(session, base_url):
    print(f"  Fetching listing: {base_url}")
    all_links = []
    
    # Shaalaa has ~10 items per page. 15 pages = 150 items.
    for page in range(1, 16):
        url = f"{base_url}&page={page}"
        try:
            resp = session.get(url)
            if resp.status_code != 200:
                break
                
            soup = BeautifulSoup(resp.text, 'html.parser')
            page_links = []
            for a in soup.find_all('a', href=True):
                href = a['href']
                if '/concept-notes/' in href and not '/search-concept-notes/' in href:
                    full_url = href if href.startswith('http') else f"https://www.shaalaa.com{href}"
                    if full_url not in page_links:
                        page_links.append(full_url)
            
            if not page_links:
                break # No more items
                
            for link in page_links:
                if link not in all_links:
                    all_links.append(link)
            
            print(f"    Page {page}: found {len(page_links)} links")
            
        except Exception as e:
            print(f"  [ERROR] Page {page}: {e}")
            break
            
    return all_links

def extract_content(session, url):
    try:
        resp = session.get(url)
        if resp.status_code != 200:
            return ""
        
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        for sel in ['div.concept-note-content', 'div.concept-content', 'article']:
            for el in soup.select(sel):
                return el.get_text(separator='\\n', strip=True)
                
        main = soup.find('main') or soup.find('body')
        if main:
            for unwanted in main.find_all(['nav', 'header', 'footer', 'script', 'style', 'aside', 'iframe', '.ad']):
                unwanted.decompose()
            return main.get_text(separator='\\n', strip=True)
            
        return ""
    except Exception as e:
        return ""

def generate_typescript(all_content):
    lines = [
        '// Auto-generated textbook content scraped from Shaalaa.com',
        '// Generated by scrape_shaalaa.py -- DO NOT EDIT MANUALLY',
        '',
        'export const TEXTBOOK_CONTENT: Record<string, Record<string, Record<string, Record<string, string>>>> = {',
    ]
    
    for board, grades in all_content.items():
        lines.append(f'  "{board}": {{')
        for grade, subjects in grades.items():
            lines.append(f'    "{grade}": {{')
            for subject, chapters in subjects.items():
                lines.append(f'      "{subject}": {{')
                for chapter, content in chapters.items():
                    escaped = content.replace('\\\\', '\\\\\\\\').replace('`', '\\\\`').replace('${', '\\\\${')
                    lines.append(f'        "{chapter}": `{escaped}`,')
                lines.append('      },')
            lines.append('    },')
        lines.append('  },')
    
    lines.append('};')
    lines.append('')
    lines.append('export function getTextbookContent(board: string, grade: string, subject: string, chapter: string): string {')
    lines.append('    return TEXTBOOK_CONTENT?.[board]?.[grade]?.[subject]?.[chapter] || "";')
    lines.append('}')
    lines.append('')
    lines.append('export function getChaptersContent(board: string, grade: string, subject: string, chapters: string[]): string {')
    lines.append('    return chapters')
    lines.append('        .map(ch => {')
    lines.append('            const content = getTextbookContent(board, grade, subject, ch);')
    lines.append('            return content ? `## ${ch}\\n${content}` : "";')
    lines.append('        })')
    lines.append('        .filter(Boolean)')
    lines.append('        .join("\\n\\n");')
    lines.append('}')
    
    ts = '\\n'.join(lines)
    with open(TS_OUTPUT, 'w', encoding='utf-8') as f:
        f.write(ts)

def main():
    print("=" * 60)
    print("SHAALAA.COM CONTENT SCRAPER (TLS-CLIENT + PAGINATION)")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(exist_ok=True)
    all_content = {}
    
    session = get_session()
    
    for subj_config in SUBJECTS:
        board = subj_config["board"]
        grade = subj_config["grade"]
        subject = subj_config["subject"]
        
        print(f"\\n--- {board.upper()} Class {grade}: {subject} ---")
        
        all_links = scrape_all_chapter_links(session, subj_config["list_url"])
        print(f"  Found {len(all_links)} concept note links total across all pages.")
        
        subject_content = {}
        
        for ch in subj_config["chapters"]:
            print(f"  Scraping: {ch}...", end=" ", flush=True)
            
            # Words longer than 3 chars
            ch_keywords = [w.lower() for w in ch.split() if len(w) > 3]
            if not ch_keywords:
                ch_keywords = [ch.lower()]
                
            # Try to match the slug from the URL
            ch_slug = ch.lower().replace(' ', '-')
            
            ch_links = [
                link for link in all_links 
                if ch_slug in link.lower() or any(kw in link.lower() for kw in ch_keywords)
            ]
            
            if not ch_links:
                print("NO LINKS FOUND")
                subject_content[ch] = ""
                continue
                
            content_parts = []
            for link in ch_links[:4]: # Grab up to 4 concepts for the chapter
                text = extract_content(session, link)
                if text:
                    content_parts.append(text)
                time.sleep(0.5)
                
            combined = "\\n\\n".join(content_parts)
            import re
            combined = re.sub(r'\\n{3,}', '\\n\\n', combined)
            
            words = combined.split()
            if len(words) > 2500:
                combined = " ".join(words[:2500])
                
            word_count = len(combined.split())
            print(f"OK ({word_count} words)")
            subject_content[ch] = combined
            
        all_content.setdefault(board, {}).setdefault(grade, {})[subject] = subject_content
        
        json_path = OUTPUT_DIR / f"{board}_{grade}_{subject.replace(' ', '_')}.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(subject_content, f, indent=2, ensure_ascii=False)
            
    generate_typescript(all_content)
    print("\\nDONE! TypeScript generated.")

if __name__ == "__main__":
    main()

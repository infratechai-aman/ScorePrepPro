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
        "board": "cbse",
        "grade": "6",
        "subject": "Mathematics",
        "list_url": "https://www.shaalaa.com/search-concept-notes/cbse-class-6-english-medium_1477?subjects=mathematics_8895",
        "chapters": [
            "Knowing Our Numbers", "Whole Numbers", "Playing with Numbers", "Basic Geometrical Ideas",
            "Understanding Elementary Shapes", "Integers", "Fractions", "Decimals", "Data Handling",
            "Mensuration", "Algebra", "Ratio and Proportion"
        ]
    },
    {
        "board": "cbse",
        "grade": "6",
        "subject": "Science",
        "list_url": "https://www.shaalaa.com/search-concept-notes/cbse-class-6-english-medium_1477?subjects=science_8910",
        "chapters": [
            "Components of Food", "Sorting Materials into Groups", "Separation of Substances",
            "Getting to Know Plants", "Body Movements", "The Living Organisms and Their Surroundings",
            "Motion and Measurement of Distances", "Light, Shadows and Reflections", "Electricity and Circuits",
            "Fun with Magnets", "Air Around Us"
        ]
    },
    {
        "board": "cbse",
        "grade": "6",
        "subject": "Social Science (History)",
        "list_url": "https://www.shaalaa.com/search-concept-notes/cbse-class-6-english-medium_1477?subjects=social-science_8909",
        "chapters": [
            "What Where, How and When?", "From Hunting-Gathering to Growing Food", "In the Earliest Cities",
            "What Books and Burials Tell Us", "Kingdoms, Kings and an Early Republic", "New Questions and Ideas",
            "From a Kingdom to an Empire", "Villages, Towns and Trade", "New Empires and Kingdoms",
            "Buildings, Paintings and Books"
        ]
    },
    {
        "board": "cbse",
        "grade": "6",
        "subject": "Social Science (Geography)",
        "list_url": "https://www.shaalaa.com/search-concept-notes/cbse-class-6-english-medium_1477?subjects=social-science_8909",
        "chapters": [
            "The Earth in the Solar System", "Globe: Latitudes and Longitudes", "Motions of the Earth",
            "Maps", "Major Domains of the Earth", "Our Country - India"
        ]
    },
    {
        "board": "cbse",
        "grade": "6",
        "subject": "Social Science (Civics)",
        "list_url": "https://www.shaalaa.com/search-concept-notes/cbse-class-6-english-medium_1477?subjects=social-science_8909",
        "chapters": [
            "Understanding Diversity", "Diversity and Discrimination", "What is Government?",
            "Panchayati Raj", "Rural Administration", "Urban Administration", "Rural Livelihoods",
            "Urban Livelihoods"
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
                break
                
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

def generate_typescript():
    all_content = {}
    for json_file in OUTPUT_DIR.glob("*.json"):
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            name_parts = json_file.stem.split('_')
            board = name_parts[0]
            grade = name_parts[1]
            subject = '_'.join(name_parts[2:]).replace('_', ' ')
            
            all_content.setdefault(board, {}).setdefault(grade, {})[subject] = data

    lines = [
        '// Auto-generated textbook content scraped from Shaalaa.com',
        '// Generated by scrape scripts -- DO NOT EDIT MANUALLY',
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
    print("SHAALAA.COM CBSE 6TH STD CONTENT SCRAPER")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    session = get_session()
    cached_links = {}
    
    for subj_config in SUBJECTS:
        board = subj_config["board"]
        grade = subj_config["grade"]
        subject = subj_config["subject"]
        list_url = subj_config["list_url"]
        
        print(f"\\n--- {board.upper()} Class {grade}: {subject} ---")
        
        if list_url in cached_links:
            all_links = cached_links[list_url]
            print(f"  Using {len(all_links)} cached links from previous fetch.")
        else:
            all_links = scrape_all_chapter_links(session, list_url)
            cached_links[list_url] = all_links
            print(f"  Found {len(all_links)} concept note links total across all pages.")
        
        subject_content = {}
        
        for ch in subj_config["chapters"]:
            print(f"  Scraping: {ch}...", end=" ", flush=True)
            
            # Words longer than 3 chars
            ch_keywords = [w.lower() for w in ch.split() if len(w) > 3]
            if not ch_keywords:
                ch_keywords = [ch.lower()]
                
            ch_clean = ch.lower().replace('?', '').replace('!', '').replace(',', '').replace(':', '').replace("'", "")
            ch_slug = ch_clean.replace(' ', '-')
            
            ch_links = [
                link for link in all_links 
                if ch_slug in link.lower() or any(kw in link.lower() for kw in ch_keywords)
            ]
            
            if not ch_links:
                print("NO LINKS FOUND")
                subject_content[ch] = ""
                continue
                
            content_parts = []
            for link in ch_links[:4]: 
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
            
        # Ensure we don't have parentheses in the filename breaking things
        safe_subject = subject.replace(' ', '_').replace('(', '').replace(')', '')
        json_path = OUTPUT_DIR / f"{board}_{grade}_{safe_subject}.json"
        
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(subject_content, f, indent=2, ensure_ascii=False)
            
    generate_typescript()
    print("\\nDONE! TypeScript generated with CBSE 6th, 7th, 8th, 9th, 10th and SSC files.")

if __name__ == "__main__":
    main()

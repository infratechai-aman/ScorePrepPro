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
        "grade": "9",
        "subject": "Mathematics",
        "list_url": "https://www.shaalaa.com/search-concept-notes/cbse-class-9-secondary-school-examination-english-medium_1435?subjects=mathematics_8354",
        "chapters": [
            "Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations in Two Variables",
            "Introduction to Euclid's Geometry", "Lines and Angles", "Triangles", "Quadrilaterals",
            "Circles", "Heron's Formula", "Surface Areas and Volumes", "Statistics"
        ]
    },
    {
        "board": "cbse",
        "grade": "9",
        "subject": "Science",
        "list_url": "https://www.shaalaa.com/search-concept-notes/cbse-class-9-secondary-school-examination-english-medium_1435?subjects=science_8355",
        "chapters": [
            "Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules",
            "Structure of the Atom", "The Fundamental Unit of Life", "Tissues", "Motion",
            "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound",
            "Improvement in Food Resources"
        ]
    },
    {
        "board": "cbse",
        "grade": "9",
        "subject": "Social Science (History)",
        "list_url": "https://www.shaalaa.com/search-concept-notes/cbse-class-9-secondary-school-examination-english-medium_1435?subjects=social-science_8356",
        "chapters": [
            "The French Revolution", "Socialism in Europe and the Russian Revolution",
            "Nazism and the Rise of Hitler", "Forest Society and Colonialism",
            "Pastoralists in the Modern World"
        ]
    },
    {
        "board": "cbse",
        "grade": "9",
        "subject": "Social Science (Geography)",
        "list_url": "https://www.shaalaa.com/search-concept-notes/cbse-class-9-secondary-school-examination-english-medium_1435?subjects=social-science_8356",
        "chapters": [
            "India - Size and Location", "Physical Features of India", "Drainage",
            "Climate", "Natural Vegetation and Wildlife", "Population"
        ]
    },
    {
        "board": "cbse",
        "grade": "9",
        "subject": "Social Science (Civics)",
        "list_url": "https://www.shaalaa.com/search-concept-notes/cbse-class-9-secondary-school-examination-english-medium_1435?subjects=social-science_8356",
        "chapters": [
            "What is Democracy? Why Democracy?", "Constitutional Design", "Electoral Politics",
            "Working of Institutions", "Democratic Rights"
        ]
    },
    {
        "board": "cbse",
        "grade": "9",
        "subject": "Social Science (Economics)",
        "list_url": "https://www.shaalaa.com/search-concept-notes/cbse-class-9-secondary-school-examination-english-medium_1435?subjects=social-science_8356",
        "chapters": [
            "The Story of Village Palampur", "People as Resource", "Poverty as a Challenge",
            "Food Security in India"
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
            
            # Extract board, grade, subject from filename
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
    print("SHAALAA.COM CBSE 9TH STD CONTENT SCRAPER")
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
                
            # Specifically for Civics/History chapters that might have question marks or special chars
            ch_clean = ch.lower().replace('?', '').replace('!', '')
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
    print("\\nDONE! TypeScript generated with CBSE 9th, 10th and SSC files.")

if __name__ == "__main__":
    main()

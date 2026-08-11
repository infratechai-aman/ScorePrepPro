"""
Textbook Content Extractor
===========================
Extracts chapter content from locally stored textbook PDFs.

STEP 1: Download PDFs manually and place in scraped_content/pdfs/
STEP 2: Run this script: python extract_textbook.py
STEP 3: Generates lib/textbookContent.ts automatically

PDF Naming Convention:
    maharashtra_10_science-part1.pdf
    maharashtra_10_science-part2.pdf
    maharashtra_10_math-algebra.pdf
    maharashtra_10_math-geometry.pdf

Download PDFs from:
    Maharashtra: https://ebalbharati.in (E-books Library)
    CBSE: https://ncert.nic.in/textbook.php
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import json
import os
import re
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    os.system("pip install pdfplumber")
    import pdfplumber


# --- Config: Map PDF files to their chapter structures ---

PDF_CONFIG = {
    "maharashtra": {
        "10": {
            "Science and Technology Part-1": {
                "filename": "maharashtra_10_science-part1.pdf",
                "chapters": [
                    "Gravitation",
                    "Periodic Classification of Elements",
                    "Chemical Reactions and Equations",
                    "Effects of Electric Current",
                    "Heat",
                    "Refraction of Light",
                    "Lenses",
                    "Metallurgy",
                    "Carbon Compounds",
                    "Space Missions"
                ]
            },
            "Science and Technology Part-2": {
                "filename": "maharashtra_10_science-part2.pdf",
                "chapters": [
                    "Heredity and Evolution",
                    "Life Processes in Living Organisms Part-1",
                    "Life Processes in Living Organisms Part-2",
                    "Environmental Management",
                    "Towards Green Energy",
                    "Animal Classification",
                    "Introduction to Microbiology",
                    "Cell Biology and Biotechnology",
                    "Social Health",
                    "Disaster Management"
                ]
            },
            "Mathematics Part-I (Algebra)": {
                "filename": "maharashtra_10_math-algebra.pdf",
                "chapters": [
                    "Linear Equations in Two Variables",
                    "Quadratic Equations",
                    "Arithmetic Progression",
                    "Financial Planning",
                    "Probability",
                    "Statistics"
                ]
            },
            "Mathematics Part-II (Geometry)": {
                "filename": "maharashtra_10_math-geometry.pdf",
                "chapters": [
                    "Similarity",
                    "Pythagoras Theorem",
                    "Circle",
                    "Geometric Constructions",
                    "Coordinate Geometry",
                    "Trigonometry",
                    "Mensuration"
                ]
            },
        }
    }
}

PDF_DIR = Path("scraped_content/pdfs")
OUTPUT_DIR = Path("scraped_content")
TS_OUTPUT = Path("lib/textbookContent.ts")


def extract_full_text(pdf_path):
    """Extract all text from a PDF file"""
    print(f"  [EXTRACTING] {pdf_path.name}...", end=" ", flush=True)
    try:
        full_text = ""
        with pdfplumber.open(pdf_path) as pdf:
            page_count = len(pdf.pages)
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    full_text += f"\n--- PAGE {i+1} ---\n" + text + "\n"
        
        word_count = len(full_text.split())
        print(f"OK ({word_count} words, {page_count} pages)")
        return full_text
    except Exception as e:
        print(f"FAILED: {e}")
        return ""


def split_into_chapters(full_text, chapter_names):
    """Smart chapter splitting using chapter names as markers"""
    chapters = {}
    text_lower = full_text.lower()
    
    # Find positions of each chapter heading
    positions = []
    for ch_name in chapter_names:
        # Look for chapter heading patterns
        patterns = [
            re.compile(r'(?:chapter\s*\d+[\s.:]*)?(' + re.escape(ch_name) + r')', re.IGNORECASE),
            re.compile(r'\b' + re.escape(ch_name.split()[0]) + r'\b.*?' + re.escape(ch_name.split()[-1]) if len(ch_name.split()) > 1 else re.escape(ch_name), re.IGNORECASE),
        ]
        
        best_pos = -1
        for pattern in patterns:
            match = pattern.search(full_text)
            if match:
                best_pos = match.start()
                break
        
        positions.append((ch_name, best_pos))
    
    # Sort by position and extract text between chapters
    valid_positions = [(name, pos) for name, pos in positions if pos >= 0]
    valid_positions.sort(key=lambda x: x[1])
    
    for i, (ch_name, pos) in enumerate(valid_positions):
        # End is either next chapter start or end of text
        end_pos = valid_positions[i + 1][1] if i + 1 < len(valid_positions) else len(full_text)
        
        chapter_text = full_text[pos:end_pos].strip()
        
        # Clean up
        chapter_text = re.sub(r'\n{3,}', '\n\n', chapter_text)
        chapter_text = re.sub(r'--- PAGE \d+ ---', '', chapter_text)
        chapter_text = re.sub(r'[ \t]+', ' ', chapter_text)
        
        word_count = len(chapter_text.split())
        
        # Keep max 2500 words per chapter (token efficiency)
        if word_count > 2500:
            words = chapter_text.split()
            chapter_text = ' '.join(words[:2500])
            print(f"    [OK] '{ch_name}' - {word_count} words (trimmed to 2500)")
        else:
            print(f"    [OK] '{ch_name}' - {word_count} words")
        
        chapters[ch_name] = chapter_text
    
    # Mark chapters that weren't found
    for ch_name in chapter_names:
        if ch_name not in chapters:
            print(f"    [!!] '{ch_name}' - NOT FOUND in PDF")
            chapters[ch_name] = ""
    
    return chapters


def generate_typescript(all_content):
    """Generate lib/textbookContent.ts"""
    
    ts_lines = [
        '// Auto-generated textbook content extracted from official board textbook PDFs',
        '// Generated by extract_textbook.py -- DO NOT EDIT MANUALLY',
        '// Re-run: python extract_textbook.py',
        '',
        'export const TEXTBOOK_CONTENT: Record<string, Record<string, Record<string, Record<string, string>>>> = {',
    ]
    
    for board, grades in all_content.items():
        ts_lines.append(f'  "{board}": {{')
        for grade, subjects in grades.items():
            ts_lines.append(f'    "{grade}": {{')
            for subject, chapters in subjects.items():
                ts_lines.append(f'      "{subject}": {{')
                for chapter, content in chapters.items():
                    escaped = content.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
                    ts_lines.append(f'        "{chapter}": `{escaped}`,')
                ts_lines.append('      },')
            ts_lines.append('    },')
        ts_lines.append('  },')
    
    ts_lines.append('};')
    ts_lines.append('')
    ts_lines.extend([
        'export function getTextbookContent(board: string, grade: string, subject: string, chapter: string): string {',
        '    return TEXTBOOK_CONTENT?.[board]?.[grade]?.[subject]?.[chapter] || "";',
        '}',
        '',
        'export function getChaptersContent(board: string, grade: string, subject: string, chapters: string[]): string {',
        '    return chapters',
        '        .map(ch => {',
        '            const content = getTextbookContent(board, grade, subject, ch);',
        '            return content ? `## ${ch}\\n${content}` : "";',
        '        })',
        '        .filter(Boolean)',
        '        .join("\\n\\n");',
        '}',
        '',
    ])
    
    ts_content = '\n'.join(ts_lines)
    with open(TS_OUTPUT, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    size_kb = TS_OUTPUT.stat().st_size / 1024
    print(f"\n[GENERATED] {TS_OUTPUT} ({size_kb:.0f} KB)")


def main():
    print("=" * 60)
    print("TEXTBOOK CONTENT EXTRACTOR")
    print("=" * 60)
    
    # Check if PDF directory exists
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    all_content = {}
    found_any = False
    missing_pdfs = []
    
    for board, grades in PDF_CONFIG.items():
        for grade, subjects in grades.items():
            for subject, config in subjects.items():
                pdf_path = PDF_DIR / config["filename"]
                
                if not pdf_path.exists():
                    missing_pdfs.append((subject, config["filename"]))
                    continue
                
                found_any = True
                print(f"\n--- {board.upper()} Class {grade}: {subject} ---")
                
                # Extract text
                full_text = extract_full_text(pdf_path)
                if not full_text:
                    continue
                
                # Split into chapters
                chapters = split_into_chapters(full_text, config["chapters"])
                
                # Store
                all_content.setdefault(board, {}).setdefault(grade, {})[subject] = chapters
                
                # Save JSON
                json_file = OUTPUT_DIR / f"{board}_{grade}_{subject.replace(' ', '_')}.json"
                with open(json_file, 'w', encoding='utf-8') as f:
                    json.dump(chapters, f, indent=2, ensure_ascii=False)
                print(f"  [SAVED] {json_file}")
    
    if missing_pdfs:
        print("\n" + "=" * 60)
        print("MISSING PDFs - Please download and place in scraped_content/pdfs/")
        print("=" * 60)
        for subject, filename in missing_pdfs:
            print(f"  {filename}  <-- {subject}")
        print(f"\nDownload from:")
        print(f"  Maharashtra: https://ebalbharati.in")
        print(f"  CBSE: https://ncert.nic.in/textbook.php")
    
    if all_content:
        generate_typescript(all_content)
    
    if found_any:
        print("\n[DONE!]")
    else:
        print("\nNo PDFs found. Place PDFs in: scraped_content/pdfs/")
        print("Then re-run: python extract_textbook.py")


if __name__ == "__main__":
    main()

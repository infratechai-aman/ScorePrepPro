import requests
from bs4 import BeautifulSoup
import json

URL = "https://cbseacademic.nic.in/curriculum_2025.html"

def scrape_cbse_subjects():
    print(f"Scraping CBSE Curriculum from {URL}...")
    try:
        response = requests.get(URL, verify=False)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        subjects = {
            "secondary": set(),
            "senior_secondary": set()
        }
        
        def clean_subject_name(name):
            return name.strip()
            
        def is_valid(name):
            name = name.lower()
            return name and not "curriculum" in name and not "initial" in name and not "group" in name and not "assessment" in name
            
        sec_div = soup.find(id="collapse2")
        if sec_div:
            for link in sec_div.find_all("a"):
                name = clean_subject_name(link.text)
                if is_valid(name):
                   subjects["secondary"].add(name)
                   
        sr_sec_div = soup.find(id="collapse3")
        if sr_sec_div:
            for link in sr_sec_div.find_all("a"):
                name = clean_subject_name(link.text)
                if is_valid(name):
                   subjects["senior_secondary"].add(name)
        
        data = {
            "classes_5_to_8": [
                "Mathematics", "Science", "Social Science (History)", "Social Science (Geography)", "Social Science (Civics)", "English", "Hindi", "Sanskrit", "Computer Science", "Artificial Intelligence"
            ],
            "secondary_9_10": sorted(list(subjects["secondary"])),
            "senior_secondary_11_12": sorted(list(subjects["senior_secondary"]))
        }
        
        with open("cbse_subjects_scraped.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
            
        print(f"Scraping successful. Found {len(data['senior_secondary_11_12'])} subjects for 11-12.")
        
    except Exception as e:
        print(f"Error scraping: {e}")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    scrape_cbse_subjects()


from PIL import Image
import os
import sys

# Path to the uploaded image
image_path = r"C:\Users\Aman Talukdar\.gemini\antigravity\brain\d686e9ed-1b61-44aa-b2de-dbed1e60a54c\media__1770532557461.png"
output_path = r"C:\Users\Aman Talukdar\Desktop\AmanSirSecond\question-paper-generator\public\paper_wizard_preview.png"

def crop_question_paper(img_path, out_path):
    print(f"Processing {img_path} with PIL...")
    try:
        img = Image.open(img_path)
        
        # Simple heuristic: Crop 10% from top, 10% from bottom/sides to remove UI clutter if any?
        # Or finding white background?
        # Let's just crop to the center 80%?
        # The user said "only select the question paper".
        # Assuming the question paper is in the middle.
        
        width, height = img.size
        left = width * 0.1
        top = height * 0.15 # Crop a bit more from top (header)
        right = width * 0.9
        bottom = height * 0.9
        
        # Heuristic: Find first white pixel row?
        # Too complex for PIL simple script without numpy/cv2 usually.
        # Let's just do a safe crop of the central area.
        
        crop = img.crop((left, top, right, bottom))
        crop.save(out_path)
        print(f"Saved cropped image to {out_path}")

    except Exception as e:
        print(f"Error: {e}")
        # Fallback copy
        import shutil
        shutil.copy(img_path, out_path)

if __name__ == "__main__":
    crop_question_paper(image_path, output_path)

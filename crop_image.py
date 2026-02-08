
import cv2
import numpy as np
import os

# Path to the uploaded image
# We'll use the latest one we identified
image_path = r"C:\Users\Aman Talukdar\.gemini\antigravity\brain\d686e9ed-1b61-44aa-b2de-dbed1e60a54c\media__1770532557461.png"
output_path = r"C:\Users\Aman Talukdar\Desktop\AmanSirSecond\question-paper-generator\public\paper_wizard_preview.png"

def crop_question_paper(img_path, out_path):
    print(f"Processing {img_path}...")
    try:
        img = cv2.imread(img_path)
        if img is None:
            print("Error: Could not read image")
            return

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply threshold to get binary image (assuming paper is white-ish)
        # Invert so paper is white, background is black for finding contours? 
        # Actually usually paper is light, so let's inverse threshold
        _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)  # High threshold for white paper

        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Find the largest contour which is likely the paper
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)
            
            # Simple heuristic: if the area is too small, fallback to center crop or full image
            if w * h < (img.shape[0] * img.shape[1] * 0.1): # Less than 10% of image
                 print("Warning: Largest white area is too small, using full image but trimming margins.")
                 # Fallback: Just crop 10% from all sides
                 h_img, w_img, _ = img.shape
                 y = int(h_img * 0.1)
                 x = int(w_img * 0.1)
                 h = int(h_img * 0.8)
                 w = int(w_img * 0.8)
            
            # Crop
            crop = img[y:y+h, x:x+w]
            cv2.imwrite(out_path, crop)
            print(f"Saved cropped image to {out_path}")
        else:
            print("No contours found, saving original")
            cv2.imwrite(out_path, img)

    except Exception as e:
        print(f"Error: {e}")
        # Fallback copy
        import shutil
        shutil.copy(img_path, out_path)

if __name__ == "__main__":
    crop_question_paper(image_path, output_path)

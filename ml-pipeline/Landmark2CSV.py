import cv2
import csv
import mediapipe as mp
import numpy as np
import os
from tqdm import tqdm

# --- Configuration ---
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5)

# --- Paths ---
INPUT_DATASET_PATH = "C:/Users/User/Downloads/archive/Test_Alphabet"
OUTPUT_CSV_PATH = "asl_landmarks_Test.csv"


def normalize_landmarks(hand_landmarks_list):
    """Normalizes landmarks to be invariant to position and scale."""
    coords = np.array([[lm.x, lm.y] for lm in hand_landmarks_list])
    wrist_coords = coords[0]
    translated_coords = coords - wrist_coords # move the hand so the wrist becomes the origin

    max_val = np.max(np.abs(translated_coords))
    if max_val == 0:
        return None

    normalized_coords = translated_coords / max_val # apply scaling rate
    return normalized_coords.flatten().tolist()


# Prepare the CSV file
with open(OUTPUT_CSV_PATH, 'w', newline='') as csvfile:
    csv_writer = csv.writer(csvfile)

    # Create and write the header row
    header = ['label']
    for i in range(21):
        header += [f'x{i}', f'y{i}']
    csv_writer.writerow(header)

    for root, dirs, files in os.walk(INPUT_DATASET_PATH):
        label = os.path.basename(root)

        if label == os.path.basename(INPUT_DATASET_PATH):
            continue

        print(f"\nProcessing folder for label: '{label}'")

        for filename in tqdm(files, desc=f"Processing '{label}'"):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                image_path = os.path.join(root, filename)

                img = cv2.imread(image_path)
                if img is None: continue

                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                results = hands.process(img_rgb)

                if results.multi_hand_landmarks:
                    # If a hand IS found, process it normally.
                    hand_landmarks = results.multi_hand_landmarks[0].landmark
                    normalized_landmarks = normalize_landmarks(hand_landmarks)

                    if normalized_landmarks:
                        csv_writer.writerow([label] + normalized_landmarks)

                # --- NEW LOGIC ADDED HERE ---
                elif label.lower() == 'nothing':
                    # If NO hand is found AND the label is 'nothing',
                    # write a row of zeros.
                    num_coords = 21 * 2  # 42 coordinates
                    zeros_row = [0.0] * num_coords
                    csv_writer.writerow([label] + zeros_row)
                    # --- END OF NEW LOGIC ---

hands.close()
print(f"\nProcessing complete! Dataset saved to '{OUTPUT_CSV_PATH}'")
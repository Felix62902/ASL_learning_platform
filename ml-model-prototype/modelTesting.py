import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf

# --- Load Your Trained Model ---
# Make sure the model file is in the same directory as this script
model = tf.keras.models.load_model('asl_alphabet_model.h5')
print("Model loaded successfully!")

# --- Define Your Classes ---
# IMPORTANT: This list MUST be in the same alphabetical order that your LabelEncoder used during training
# If your 'nothing' class was first or last, adjust accordingly.
class_names = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'Nothing', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
]

# --- Initialize MediaPipe and Webcam ---
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)  # Start the webcam


def normalize_landmarks(hand_landmarks_list):
    """The same normalization function from your data prep script."""
    coords = np.array([[lm.x, lm.y] for lm in hand_landmarks_list])
    wrist_coords = coords[0]
    translated_coords = coords - wrist_coords

    max_val = np.max(np.abs(translated_coords))
    if max_val == 0:
        return None  # Avoid division by zero

    normalized_coords = translated_coords / max_val
    return normalized_coords.flatten().tolist()


# Real-Time Prediction Loop
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Flip the frame horizontally for a later selfie-view display
    # and convert the BGR image to RGB.
    frame = cv2.cvtColor(cv2.flip(frame, 1), cv2.COLOR_BGR2RGB)

    # Process the frame to find hands
    results = hands.process(frame)

    # Convert the RGB image back to BGR for display with OpenCV
    frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

    # If a hand is detected
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Draw the landmarks on the frame
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # PREDICTION LOGIC
            # 1. Normalize the landmarks
            normalized_data = normalize_landmarks(hand_landmarks.landmark)

            if normalized_data:
                # 2. Reshape the data to match the model's input shape
                prediction_input = np.array([normalized_data])

                # 3. Make a prediction
                prediction_array = model.predict(prediction_input)

                # 4. Get the predicted class and confidence
                predicted_class_index = np.argmax(prediction_array)
                prediction_confidence = np.max(prediction_array)
                predicted_letter = class_names[predicted_class_index]

                # Display the prediction on the screen
                text = f"{predicted_letter} ({prediction_confidence * 100:.2f}%)"
                cv2.putText(frame, text, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

    # Show the frame in a window
    cv2.imshow('Live ASL Detection', frame)

    # Break the loop when 'q' is pressed
    if cv2.waitKey(5) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
hands.close()
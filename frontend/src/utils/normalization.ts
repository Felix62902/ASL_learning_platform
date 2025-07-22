import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

// helper function to normalize landmakrs, identical to the data prep pipeline in python
export const normalizeLandmarks = (
  landmarks: NormalizedLandmark[]
): number[] | null => {
  if (!landmarks || landmarks.length === 0) {
    return null;
  }
  const coords = landmarks.map((lm) => [lm.x, lm.y]);
  const wrist = coords[0];
  const translatedCoords = coords.map((lm) => [
    lm[0] - wrist[0],
    lm[1] - wrist[1],
  ]);
  let maxVal = 0;
  for (const coord of translatedCoords) {
    maxVal = Math.max(maxVal, Math.abs(coord[0]), Math.abs(coord[1]));
  }
  if (maxVal === 0) return null;
  return translatedCoords.flatMap((lm) => [lm[0] / maxVal, lm[1] / maxVal]);
};

// const normalizeLandmarks = (
//   landmarks: NormalizedLandmark[]
// ): number[] | null => {
//   const coords = landmarks.map((lm) => [lm.x, lm.y]); // extract the 21 landmark's x and y val
//   const wrist = coords[0];
//   const translated = coords.map(([x, y]) => [x - wrist[0], y - wrist[1]]);
//   const flat = translated.flat();
//   const maxVal = Math.max(...flat.map(Math.abs));

//   if (maxVal === 0) return null;
//   return flat.map((val) => val / maxVal);
// };

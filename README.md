# Emotion Detection & Artistic Style Transfer

An interactive web application that combines real-time emotion detection with artistic style transfer, creating unique artwork based on detected emotions.

## Features

### Emotion Detection

- Real-time facial expression analysis using FaceAPI.js
- Detection of multiple emotional states:
    - Happiness (converts to bright, playful impressionist/cartoon style)
    - Sadness (transforms into calm, melancholic abstract art)
    - Anger (generates bold, chaotic expressionist style)
    - Surprise (creates high-contrast pop art)
    - Fear (creates dark, distorted perspectives with deep shadows)
    - Disgust (generates warped organic forms with sickly colors)
    - Neutral (produces geometric, minimalist designs)

### Style Transfer

- Powered by Magenta.js for artistic transformations
- Emotion-driven style selection
- Real-time image processing
- Multiple artistic styles corresponding to different emotions

## Tech Stack

- Next.js
- FaceAPI.js for emotion detection
- Magenta.js for artistic style transfer
- TailwindCSS for styling
- ShadcnUI components for interface elements

## Prerequisites

- Node.js (v14 or higher)
- npm
- Modern web browser with webcam support
- Sufficient hardware capabilities for real-time ML processing

## Installation

1. Clone the repository:

```bash
git clone https://github.com/MihaKr/IOI_face_recognition
cd IOI_face_recognition
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

or go to: [this link](https://mihakr.github.io/IOI_face_recognition/)


## Usage

1. Open the application in your web browser
2. Start camera and grant camera permissions when prompted
3. In camera view:
    - Your face will be analyzed for emotions in real-time
    - The picture will be taken automatically after the timer runs down
    - The system will automatically detect your primary emotion
    - the system will apply the style of a random image that coresponds to the detected emotion
    - Save your favorite variations using the download button

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

### Gallery

- Camera capture functionality
- Image gallery for reviewing captured moments
- Tabbed interface for easy navigation between camera and gallery views

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
2. Grant camera permissions when prompted
3. Select between camera or gallery view using the tabs
4. In camera view:

    - Your face will be analyzed for emotions in real-time
    - Click the camera button to capture your image
    - The system will automatically detect your primary emotion

5. Style Transfer Process:

    - Navigate to the Gallery tab
    - Select your captured image from the gallery
    - A style transfer panel will appear with  slider for selecting different source style images
    - Use the slider to select the stzle image
    - After clicking the apply style trasnformation button, the image will be processed
    - after the image finished processing, the user can view and/or donwload it

6. Tips for Best Results:

    - Try different slider positions to find the perfect style intensity
    - You can apply different emotional styles to the same image
    - Higher slider values will create more dramatic transformations
    - Save your favorite variations using the download button
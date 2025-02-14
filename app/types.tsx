// types.ts
export interface CapturedImage {
    image: string;
    label: string;
    strength: number;
}

export interface SomethingProps {
    setImages: React.Dispatch<React.SetStateAction<CapturedImage[]>>;
    images: CapturedImage[];
    selectedImage: CapturedImage;
    setSelectedImage: React.Dispatch<React.SetStateAction<CapturedImage>>;
}

export interface StyleConfig {
    path: string;
    weight: number;
}

export interface EmotionConfig {
    styles: StyleConfig[];
}

export interface EmotionConfigsStyle {
    [key: string]: EmotionConfig;
}

const isProd = process.env.NODE_ENV === "production";
const pathPrefix = isProd ? "/IOI_face_recognition" : "";

type EmotionConfigStyle = {
    styles: { path: string; weight: number }[];
};

export type EmotionConfigs = {
    happy: EmotionConfig;
    disgusted: EmotionConfig;
    neutral: EmotionConfig;
    surprised: EmotionConfig;
    angry: EmotionConfig;
    fearful: EmotionConfig;
    sad: EmotionConfig;
};

export const emotionConfigs: EmotionConfigsStyle = {
    happy: {
        styles: [
            { path: pathPrefix + '/styles/happy/happy1.jpg', weight: 1 },
            { path: pathPrefix + '/styles/happy/happy2.jpg', weight: 1 },
            { path: pathPrefix + '/styles/happy/happy3.jpg', weight: 1 },
            { path: pathPrefix + '/styles/happy/happy4.jpg', weight: 1 },
            { path: pathPrefix + '/styles/happy/happy5.jpg', weight: 1 },
            { path: pathPrefix + '/styles/happy/happy6.jpg', weight: 1 },
        ],
    },

    disgusted: {
        styles: [
            { path: pathPrefix + '/styles/disgust/disgust1.jpg', weight: 1 },
            { path: pathPrefix + '/styles/disgust/disgust2.jpg', weight: 1 },
            { path: pathPrefix + '/styles/disgust/disgust3.jpg', weight: 1 },
            { path: pathPrefix + '/styles/disgust/disgust4.jpg', weight: 1 },
            { path: pathPrefix + '/styles/disgust/disgust5.jpg', weight: 1 },
        ],
    },

    neutral: {
        styles: [
            { path: pathPrefix + '/styles/neutral/neutral1.jpg', weight: 1 },
            { path: pathPrefix + '/styles/neutral/neutral2.jpg', weight: 1 },
            { path: pathPrefix + '/styles/neutral/neutral3.jpg', weight: 1 },
            { path: pathPrefix + '/styles/neutral/neutral4.jpg', weight: 1 },
            { path: pathPrefix + '/styles/neutral/neutral5.jpg', weight: 1 },
        ],
    },

    surprised: {
        styles: [
            { path: pathPrefix + '/styles/surprise/surprised1.jpg', weight: 1 },
            { path: pathPrefix + '/styles/surprise/surprised2.jpg', weight: 1 },
            { path: pathPrefix + '/styles/surprise/surprised3.jpg', weight: 1 },
            { path: pathPrefix + '/styles/surprise/surprised4.jpg', weight: 1 },
            { path: pathPrefix + '/styles/surprise/surprised5.jpg', weight: 1 },
        ],
    },

    angry: {
        styles: [
            { path: pathPrefix + '/styles/angry/angry1.jpg', weight: 1 },
            { path: pathPrefix + '/styles/angry/angry2.jpg', weight: 1 },
            { path: pathPrefix + '/styles/angry/angry3.jpg', weight: 1 },
            { path: pathPrefix + '/styles/angry/angry4.jpg', weight: 1 },
            { path: pathPrefix + '/styles/angry/angry5.jpg', weight: 1 },
        ],
    },

    fearful: {
        styles: [
            { path: pathPrefix + '/styles/fear/fear1.jpg', weight: 1 },
            { path: pathPrefix + '/styles/fear/fear2.jpg', weight: 1 },
            { path: pathPrefix + '/styles/fear/fear3.jpg', weight: 1 },
            { path: pathPrefix + '/styles/fear/fear4.jpg', weight: 1 },
            { path: pathPrefix + '/styles/fear/fear5.jpg', weight: 1 },
        ],
    },

    sad: {
        styles: [
            { path: pathPrefix + '/styles/sadness/sadness1.jpg', weight: 1 },
            { path: pathPrefix + '/styles/sadness/sadness2.jpg', weight: 1 },
            { path: pathPrefix + '/styles/sadness/sadness3.jpg', weight: 1 },
            { path: pathPrefix + '/styles/sadness/sadness4.jpg', weight: 1 },
            { path: pathPrefix + '/styles/sadness/sadness5.jpg', weight: 1 },
        ],
    },
};
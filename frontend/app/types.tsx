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

export interface EmotionConfigs {
    [key: string]: EmotionConfig;
}
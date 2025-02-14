import React, { useEffect, useRef, useState } from 'react';
import * as magenta from '@magenta/image';
import {Button} from "@/components/ui/button";
import {Slider} from "@/components/ui/slider";
import {ImageDown, Wand2} from "lucide-react";

interface ImageProp {
    image: { image: string; label: string; strength: number };
    outputImage: HTMLImageElement;

}

const Converter: React.FC<ImageProp> = ({ image , outputImage}) => {
    const [model, setModel] = useState<magenta.ArbitraryStyleTransferNetwork | null>(null);
    const [emotion, setEmotion] = useState("");
    const [inputImage, setInputImage] = useState<HTMLImageElement | null>(null);
    const [output, setOutput] = useState<HTMLImageElement | null>(null);
    const [styleImage, setStyleImage] = useState<HTMLImageElement | null>(null);
    const [sliderValue, setSliderValue] = useState(1);

    const [isProcessing, setIsProcessing] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isProd = process.env.NODE_ENV === "production";
    const pathPrefix = isProd ? "/IOI_face_recognition" : "";

    type EmotionConfig = {
        styles: { path: string; weight: number }[];
    };

    type EmotionConfigs = {
        happy: EmotionConfig;
        disgusted: EmotionConfig;
        neutral: EmotionConfig;
        surprised: EmotionConfig;
        angry: EmotionConfig;
        fearful: EmotionConfig;
        sad: EmotionConfig;
    };

    const emotionConfigs: EmotionConfigs = {
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

    useEffect(() => {
        const setup = async () => {
            try {
                const styleModel = new magenta.ArbitraryStyleTransferNetwork();
                await styleModel.initialize();
                setModel(styleModel);
            } catch (error) {
                console.error('Setup error:', error);
            }
        };

        setup();
    }, []);

    useEffect(() => {
        setEmotion(image.label);

        const loadImage = async () => {
            const tmp = new Image();
            tmp.crossOrigin = "anonymous";
            tmp.src = image.image;
            tmp.onload = () => {
                setInputImage(tmp);
            };
        };

        loadImage();
    }, [image]);

    const loadStyleImage = async (path: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = path;
        });
    };

    function imagedata_to_image(imagedata: ImageData): HTMLImageElement {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Unable to get 2D context');
        }

        canvas.width = imagedata.width;
        canvas.height = imagedata.height;
        ctx.putImageData(imagedata, 0, 0);

        const image = new Image();
        image.src = canvas.toDataURL();
        return image;
    }

    const applyStyleTransfer = async () => {
        if (!model || !inputImage || isProcessing) return;
        setIsProcessing(true);

        try {
            const config = emotionConfigs[emotion.toLowerCase() as keyof EmotionConfigs];
            if (!config) {
                console.error('No configuration for emotion:', emotion);
                return;
            }

            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(inputImage, 0, 0);
            const currentImage = inputImage;

            //const selectedStyle = getStyleBySliderValue(sliderValue, config.styles); // Use updated logic
            const selectedStyle = getStyleBySliderValue(Math.floor(Math.random() * (5 - 1 + 1) + 5), config.styles); // Use updated logic

            console.log('Applying selected style:', selectedStyle.path);

            const styleImage = await loadStyleImage(selectedStyle.path);
            setStyleImage(styleImage);

            try {
                const stylized = await model.stylize(currentImage, styleImage);
                setOutput(imagedata_to_image(stylized));
            } catch (error) {
                console.error('Error processing style:', selectedStyle.path, error);
            }
        } catch (error) {
            console.error('Style transfer error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleChange  = async(value: number[]) => {
        const newValue = value[0];
        setSliderValue(newValue);

        const config = emotionConfigs[emotion.toLowerCase() as keyof EmotionConfigs];
        if (config) {
            const selectedStyle = getStyleBySliderValue(newValue, config.styles);
            try {
                const styleImg = await loadStyleImage(selectedStyle.path);
                setStyleImage(styleImg);
            } catch (error) {
                console.error('Error loading style image:', error);
            }
        }
    };

    const handleDownload = () => {
        const imageSrc = output?.src; // Get the image source
        const link = document.createElement('a');
        if (imageSrc != null) {
            link.href = imageSrc;
        }
        link.download = 'converter_image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStyleBySliderValue = (
        sliderValue: number,
        styles: { path: string; weight: number }[]
    ) => {
        const index = Math.max(0, Math.min(sliderValue - 1, styles.length - 1)); // Ensure valid index
        return styles[index];
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Original Image</h3>
                    <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
                        {inputImage && (
                            <img
                                src={inputImage.src}
                                alt="Original"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Style Image</h3>
                    <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
                        {styleImage && (
                            <img
                                src={styleImage.src}
                                alt="Style"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Stylized Result</h3>
                    <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
                        {output ? (
                            <img
                                src={ouputImage.src}
                                alt="Stylized"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                {isProcessing ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div
                                            className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                                        ></div>
                                        <p className="text-sm">Applying style transfer...</p>
                                    </div>
                                ) : (
                                    <p className="text-sm">Style transfer result will appear here</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-10 space-y-6">
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-center">Select Style</h3>
                    <div className="flex justify-center">
                        <Slider
                            onValueChange={handleChange}
                            defaultValue={[1]}
                            max={6}
                            step={1}
                            className="w-3/4"
                        />
                    </div>
                </div>

                <div className="flex justify-center space-x-4">
                    <Button
                        onClick={applyStyleTransfer}
                        disabled={isProcessing || !inputImage}
                        size="lg"
                        className="px-8"
                    >
                        <Wand2 className="w-5 h-5 mr-2"/>
                        {isProcessing ? 'Applying Style Transfer...' : 'Apply Style Transfer'}
                    </Button>

                    <Button
                        onClick={handleDownload}
                        disabled={isProcessing || !inputImage}
                        size="lg"
                        className="px-8 pl-4" // Add left padding specifically for this button
                    >
                        <ImageDown className="w-5 h-5 mr-2"/>
                        {'Download'}
                    </Button>
                </div>

            </div>

            <canvas
                ref={canvasRef}
                className="hidden"
                width={inputImage?.width || 1280}
                height={inputImage?.height || 720}
            />
        </div>

    );
};

export default Converter;
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import {Camera, StopCircle, Camera as CameraIcon, Wand2, ImageDown} from 'lucide-react';
import { CapturedImage } from "@/app/types";
import Converter from "@/components/Converter";
import {emotionConfigs, EmotionConfigs} from "@/app/types";
import * as magenta from "@magenta/image";
import {Slider} from "@/components/ui/slider";

const isProd = process.env.NODE_ENV === "production";


interface FaceDetectionProps {
    setImages: React.Dispatch<React.SetStateAction<CapturedImage[]>>;
    images: CapturedImage[];
    selectedImage: CapturedImage;
    setSelectedImage: React.Dispatch<React.SetStateAction<CapturedImage>>;
}

const FaceDetection: React.FC<FaceDetectionProps> = ({ setImages, images, selectedImage, setSelectedImage}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [model, setModel] = useState<magenta.ArbitraryStyleTransferNetwork | null>(null);
    const [emotion, setEmotion] = useState("");


    const [isStreaming, setIsStreaming] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isProcessing2, setIsProcessing2] = useState(false);
    const [isProcessing3, setIsProcessing3] = useState(false);


    const [countdown, setCountdown] = useState<number | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const detectionsRef = useRef<boolean>(false);

    const [inputImage, setInputImage] = useState<HTMLImageElement | null>(null);
    const [output, setOutput] = useState<HTMLImageElement | null>(null);
    const [styleImage, setStyleImage] = useState<HTMLImageElement | null>(null);

    const videoConstraints = {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        facingMode: "user",
        advanced: [
            { zoom: 1.0 },
            { resizeMode: 'crop-and-scale' }
        ]
    };

    useEffect(() => {
        const setup = async () => {
            try {
                const styleModel = new magenta.ArbitraryStyleTransferNetwork();
                await styleModel.initialize();
                setModel(styleModel);
                console.log("magenta loaded")
            } catch (error) {
                console.error('Setup error:', error);
            }
        };
        setup();
    }, []);


    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = isProd ? '/IOI_face_recognition/models' : '/models';
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
            } catch (error) {
                console.error('Error loading models:', error);
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        setEmotion(selectedImage.label);

        const loadImage = async () => {
            const tmp = new Image();
            tmp.crossOrigin = "anonymous";
            tmp.src = selectedImage.image;
            tmp.onload = () => {
                setInputImage(tmp);
            };
        };

        loadImage();
    }, [selectedImage]);

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

    const getStyleBySliderValue = (
        sliderValue: number,
        styles: { path: string; weight: number }[]
    ) => {
        const index = Math.max(0, Math.min(sliderValue - 1, styles.length - 1)); // Ensure valid index
        return styles[index];
    };

    useEffect(() => {
        if (model && inputImage && !isProcessing3) {
            applyStyleTransfer();
        }
    }, [model, inputImage]);

    const applyStyleTransfer = async () => {
        console.log(model)
        console.log(inputImage)

        if (!model || !inputImage || isProcessing3) return;
        setIsProcessing3(true);

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
            setIsProcessing3(false);
        }
    };


    const startVideo = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            if (videoDevices.length > 0) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        deviceId: videoDevices[0].deviceId,
                        width: { min: 640, ideal: 1280, max: 1920 },
                        height: { min: 360, ideal: 720, max: 1080 },
                        facingMode: "user",
                    }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    const videoTrack = stream.getVideoTracks()[0];

                    await videoRef.current.play();
                    setIsStreaming(true);
                }
            }
        } catch (err) {
            console.error("Error accessing webcam:", err);
        }
    };

    const stopVideo = useCallback(() => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
        }
    }, []);

    const takePicture = async () => {
        if (!videoRef.current || !canvasRef.current || isProcessing) return;

        setIsProcessing(true);
        try {
            const video = videoRef.current;
            if (video.videoWidth && video.videoHeight) {
                const canvas = canvasRef.current;
                const context = canvas.getContext("2d");

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                context?.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageDataURL = canvas.toDataURL("image/png", 1.0);

                const detections = await faceapi
                    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceExpressions();

                let summed_emotions:any = {
                    "neutral": 0,
                    "happy": 0,
                    "sad": 0,
                    "angry": 0,
                    "fearful": 0,
                    "disgusted": 0,
                    "surprised": 0
                }

                if (detections.length > 0) {
                    setIsProcessing2(true);

                    for (let i = 0; i < detections.length; i++) {
                        const expressions = detections[i].expressions;

                        for (let [emotion, value] of Object.entries(expressions)) {
                            if (summed_emotions.hasOwnProperty(emotion)) {
                                summed_emotions[emotion] += value;
                            }
                        }
                    }

                    let avg_emotions: Record<string, number> = {};
                    for (let [emotion, total] of Object.entries(summed_emotions)) {
                        avg_emotions[emotion] = (total as number) / detections.length; // Cast total to number
                    }

                    console.log(detections)

                    let most_prevalent_emotion = Object.keys(avg_emotions).reduce((a, b) =>
                        avg_emotions[a] > avg_emotions[b] ? a : b
                    );

                    setImages([
                        ...images,
                        {
                            image: imageDataURL,
                            label: most_prevalent_emotion,
                            strength: avg_emotions[most_prevalent_emotion]
                        }
                    ]);

                    setSelectedImage({
                        image: imageDataURL,
                        label: most_prevalent_emotion,
                        strength: avg_emotions[most_prevalent_emotion]
                    });

                    applyStyleTransfer();
                }
            }
        } catch (error) {
            console.error("Error capturing image:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    function delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const startCountdown = useCallback(() => {
        if (countdownRef.current) return; // Don't start if already running

        setCountdown(5);
        setIsProcessing2(true);

        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev === null || prev <= 1) {
                    if (countdownRef.current) {
                        clearInterval(countdownRef.current);
                        countdownRef.current = null;
                    }
                    if (prev === 1) {
                        takePicture();
                        console.log("Taking picture...");
                        setIsProcessing2(false);
                    }
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const resetCountdown = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        setCountdown(null);
        setIsProcessing2(false);
        detectionsRef.current = false;
    }, []);


    useEffect(() => {
        let animationFrameId: number;
        let isPageVisible = true;
        let countdownInterval: NodeJS.Timeout | null = null;

        const handleVisibilityChange = () => {
            isPageVisible = document.visibilityState === 'visible';
            if (!isPageVisible && isStreaming) {
                stopVideo();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        const detectFaces = async () => {
            if (!videoRef.current || !videoRef.current.videoWidth || !canvasRef.current || !isStreaming || !isPageVisible) return;

            try {
                const detections = await faceapi
                    .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceExpressions();

                // Start countdown when face is detected and not already processing
                if (detections.length > 0 && !detectionsRef.current) {
                    detectionsRef.current = true;
                    startCountdown();
                } else if (detections.length === 0 && detectionsRef.current) {
                    resetCountdown();
                }

                if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
                    const canvas = canvasRef.current;
                    const displaySize = {
                        width: videoRef.current.videoWidth,
                        height: videoRef.current.videoHeight
                    };

                    faceapi.matchDimensions(canvas, displaySize);
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);

                    const ctx = canvas.getContext('2d');
                    ctx?.clearRect(0, 0, canvas.width, canvas.height);

                    resizedDetections.forEach(detection => {
                        if (ctx) {
                            ctx.strokeStyle = '#00ff88';
                            ctx.lineWidth = 2;
                            ctx?.strokeRect(
                                detection.detection.box.x,
                                detection.detection.box.y,
                                detection.detection.box.width,
                                detection.detection.box.height
                            );
                        }

                        const emotion = Object.entries(detection.expressions)
                            .reduce((acc, [key, value]) =>
                                    value > acc[1] ? [key, value] : acc,
                                ['', 0]
                            )[0];

                        if (ctx) {
                            ctx.font = '20px Arial';
                            ctx.fillStyle = '#00ff88';
                            ctx?.fillText(
                                countdown !== null ? `${emotion} (${countdown}s)` : emotion,
                                detection.detection.box.x,
                                detection.detection.box.y - 8
                            );
                        }

                        if (ctx) {
                            ctx.fillStyle = '#00ff88';
                        }
                        detection.landmarks.positions.forEach(point => {
                            ctx?.beginPath();
                            ctx?.arc(point.x, point.y, 1.5, 0, 2 * Math.PI);
                            ctx?.fill();
                        });
                    });
                }

                animationFrameId = requestAnimationFrame(detectFaces);
            } catch (error) {
                console.error('Detection error:', error);
            }
        };

        if (isStreaming && modelsLoaded) {
            detectFaces();
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            resetCountdown();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isStreaming, modelsLoaded, stopVideo, startCountdown, resetCountdown]);

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

    return (
        <div>
            <div className="space-y-4">
                <div className="flex justify-center">
                    <div className="relative w-full" style={{maxWidth: '720px'}}>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                playsInline
                                muted
                            />
                            <canvas
                                ref={canvasRef}
                                className="absolute top-0 left-0 w-full h-full"
                            />
                            {!isStreaming && !modelsLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-white text-base">Loading face detection models...</p>
                                </div>
                            )}
                            {countdown !== null && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div
                                        className="bg-black bg-opacity-50 rounded-full w-32 h-32 flex items-center justify-center">
                                        <p className="text-white text-6xl font-bold">{countdown}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-center">
                    <Button
                        onClick={startVideo}
                        disabled={!modelsLoaded || isStreaming}
                        className="gap-2"
                    >
                        <Camera className="w-4 h-4"/>
                        Start Camera
                    </Button>

                    <Button
                        onClick={stopVideo}
                        disabled={!isStreaming}
                        variant="destructive"
                        className="gap-2"
                    >
                        <StopCircle className="w-4 h-4"/>
                        Stop Camera
                    </Button>

                    <Button
                        onClick={takePicture}
                        disabled={!isStreaming || isProcessing}
                        className="gap-2"
                    >
                        <CameraIcon className="w-4 h-4"/>
                        {isProcessing ? 'Processing...' : 'Take Picture'}
                    </Button>
                </div>
            </div>

            <div className="w-full max-w-5xl mx-auto">
                {/* Input and Style Images in a grid */}
                <div className="grid grid-cols-2 gap-8 mb-8">
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
                </div>

                <div className="space-y-6">
                    {/* Stylized Result Header */}
                    <div
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-2xl font-bold text-gray-800">Stylized Result</h3>
                        <p className="text-base text-gray-600">
                            Most prevalent emotion: <span className="font-semibold text-blue-600">{emotion}</span>
                        </p>
                    </div>

                    {/* Stylized Result Image */}
                    <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden shadow-md">
                        {output ? (
                            <img
                                src={output.src}
                                alt="Stylized"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                {isProcessing ? (
                                    <>
                                        <div
                                            className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="mt-4 text-sm font-medium">Applying style transfer...</p>
                                    </>
                                ) : (
                                    <p className="text-sm">Style transfer result will appear here</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 space-y-6">
                    <div className="flex justify-center space-x-4">
                        <Button
                            onClick={handleDownload}
                            disabled={isProcessing || !inputImage}
                            size="lg"
                            className="px-8 pl-4"
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
        </div>
    )
        ;
};

export default FaceDetection;
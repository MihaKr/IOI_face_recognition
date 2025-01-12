import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Camera, StopCircle, Camera as CameraIcon } from 'lucide-react';
import { CapturedImage } from "@/app/types";


interface FaceDetectionProps {
    setImages: React.Dispatch<React.SetStateAction<CapturedImage[]>>;
    images: CapturedImage[];
}

const FaceDetection: React.FC<FaceDetectionProps> = ({ setImages, images }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null); // Explicitly typing the video ref
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // Explicitly typing the canvas ref

    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

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
        const loadModels = async () => {
            const MODEL_URL = '/models';
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

                if (detections && detections[0]) {
                    const expressions = detections[0].expressions;
                    const [label, strength] = Object.entries(expressions)
                        .reduce((acc, [key, value]) =>
                                value > acc[1] ? [key, value] : acc,
                            ["Unknown", 0]
                        );

                    setImages([
                        ...images,
                        {
                            image: imageDataURL,
                            label: label,
                            strength: strength
                        }
                    ]);
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

    useEffect(() => {
        let animationFrameId: number;
        let isPageVisible = true;

        // Handle tab visibility changes
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

                        )};

                        const emotion = Object.entries(detection.expressions)
                            .reduce((acc, [key, value]) =>
                                    value > acc[1] ? [key, value] : acc,
                                ['', 0]
                            )[0];

                        if (ctx) {
                            ctx.font = '20px Arial';
                            ctx.fillStyle = '#00ff88';
                        }
                        ctx?.fillText(
                            emotion,
                            detection.detection.box.x,
                            detection.detection.box.y - 8
                        );

                        // Only trigger the picture once for each emotion
                        if (emotion === 'fearful' || emotion === 'disgusted') {
                            if (!isProcessing) {
                                takePicture();
                                delay(2000); // Ensure there's a delay before the next capture
                            }
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
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isStreaming, modelsLoaded, stopVideo]);

    return (
        <div className="space-y-4">
            <div className="flex justify-center">
                <div className="relative w-full" style={{ maxWidth: '720px' }}>
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
                    </div>
                </div>
            </div>

            <div className="flex gap-3 justify-center">
                <Button
                    onClick={startVideo}
                    disabled={!modelsLoaded || isStreaming}
                    className="gap-2"
                >
                    <Camera className="w-4 h-4" />
                    Start Camera
                </Button>

                <Button
                    onClick={stopVideo}
                    disabled={!isStreaming}
                    variant="destructive"
                    className="gap-2"
                >
                    <StopCircle className="w-4 h-4" />
                    Stop Camera
                </Button>

                <Button
                    onClick={takePicture}
                    disabled={!isStreaming || isProcessing}
                    className="gap-2"
                >
                    <CameraIcon className="w-4 h-4" />
                    {isProcessing ? 'Processing...' : 'Take Picture'}
                </Button>
            </div>
        </div>
    );
};

export default FaceDetection;

import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';
import * as magenta from '@magenta/image';

const EmotionStyleTransfer = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [model, setModel] = useState(null);
    const [emotion, setEmotion] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const emotionStyles = {
        happy: '/styles/happy.jpg',
        sad: '/styles/sad.jpg',
        angry: '/styles/angry.jpg',
        surprised: '/styles/surprised.jpg',
        neutral: '/styles/neutral.jpg'
    };

    useEffect(() => {
        const setup = async () => {
            try {
                // Load face-api models
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceExpressionNet.loadFromUri('/models')
                ]);

                // Load Magenta style transfer model
                const styleModel = new magenta.ArbitraryStyleTransferNetwork();
                await styleModel.initialize();
                setModel(styleModel);

                // Setup camera
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                }
            } catch (error) {
                console.error('Setup error:', error);
            }
        };

        setup();

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const applyStyleTransfer = async (dominantEmotion) => {
        if (!model || isProcessing) return;

        setIsProcessing(true);

        try {
            // Capture current frame
            const contentImage = await tf.browser.fromPixels(videoRef.current);

            // Load style image
            const styleImg = new Image();
            styleImg.src = emotionStyles[dominantEmotion];
            await new Promise(resolve => styleImg.onload = resolve);
            const styleImage = await tf.browser.fromPixels(styleImg);

            // Apply style transfer
            const stylizedImage = await model.stylize(contentImage, styleImage);

            // Draw result on canvas
            await tf.browser.toPixels(stylizedImage, canvasRef.current);

            // Cleanup tensors
            tf.dispose([contentImage, styleImage, stylizedImage]);
        } catch (error) {
            console.error('Style transfer error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVideoPlay = () => {
        const canvas = canvasRef.current;
        const displaySize = {
            width: videoRef.current.width,
            height: videoRef.current.height
        };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            if (videoRef.current && !isProcessing) {
                const detections = await faceapi
                    .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceExpressions();

                if (detections) {
                    const emotions = detections.expressions;
                    const dominantEmotion = Object.keys(emotions).reduce((a, b) =>
                        emotions[a] > emotions[b] ? a : b
                    );

                    if (dominantEmotion !== emotion) {
                        setEmotion(dominantEmotion);
                        await applyStyleTransfer(dominantEmotion);
                    }
                }
            }
        }, 1000);
    };

    return (
        <div className="relative w-full max-w-lg mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Emotion Style Transfer</h2>
            <div className="relative">
                <video
                    ref={videoRef}
                    className="w-full"
                    width="640"
                    height="480"
                    autoPlay
                    muted
                    onPlay={handleVideoPlay}
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full"
                    width="640"
                    height="480"
                />
            </div>
            {emotion && (
                <div className="mt-4">
                    <p>Current Emotion: {emotion}</p>
                    {isProcessing && <p>Applying style transfer...</p>}
                </div>
            )}
        </div>
    );
};

export default EmotionStyleTransfer;
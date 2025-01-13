'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FaceDetection from '@/components/FaceDetection';
import ImageGallery from "@/components/ImageGallery";
import Converter from "@/components/Converter";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CapturedImage } from '@/app/types';


export default function Home() {
    const [images, setImages] = useState<CapturedImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<CapturedImage>({
        image: '',
        label: '',
        strength: 0.0
    });
    const [isLoading] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                <header className="text-center space-y-3">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Emotion Detection & Style Transfer
                    </h1>
                    <p className="text-base text-gray-600 dark:text-gray-300">
                        Capture your expressions and transform them with AI-powered style transfer
                    </p>
                </header>

                <Tabs defaultValue="camera" className="w-full">
                    <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2">
                        <TabsTrigger value="camera">Camera Feed</TabsTrigger>
                        <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
                    </TabsList>

                    <TabsContent value="camera">
                        <Card>
                            <CardContent className="p-4">
                                <FaceDetection
                                    setImages={setImages}
                                    images={images}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="gallery">
                        <Card>
                            <CardContent className="p-4">
                                <ImageGallery
                                    setImages={setImages}
                                    images={images}
                                    selectedImage={selectedImage}
                                    setSelectedImage={setSelectedImage}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {selectedImage.image && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Style Transfer</h2>
                                    <p className="text-sm text-gray-500">
                                        Selected emotion: {selectedImage.label}
                                    </p>
                                </div>

                                {isLoading ? (
                                    <LoadingSpinner/>
                                ) : (
                                    <Converter
                                        image={selectedImage}
                                    />

                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <footer className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>
                        Built with Next.js, Face-API.js, and Magenta.js Style Transfer
                    </p>
                </footer>
            </div>
        </div>
    );
}
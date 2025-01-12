import React from 'react';
import Image from "next/image";
import { Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import {CapturedImage, SomethingProps} from "@/app/types";


const ImageGallery: React.FC<SomethingProps> = ({setImages, images, selectedImage, setSelectedImage}) => {
    const handleRemove = (index:number) => {
        setImages(images.filter((_, i) => i !== index));
        if (selectedImage === images[index]) {
            setSelectedImage({image: '', label: '', strength: 0.0});
        }
    };

    const handleSelect = (image: React.SetStateAction<CapturedImage>) => {
        setSelectedImage(image);
    };

    return (
        <div className="space-y-3">
            <h2 className="text-xl font-semibold">Captured Images</h2>

            {images.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No images captured yet. Use the camera to take some pictures!
                </div>
            ) : (
                <ScrollArea className="w-full rounded-md border p-4">
                    <div className="flex gap-4">
                        {images.map((image, index) => (
                            <Card
                                key={index}
                                className={`flex-shrink-0 w-96 transition-all duration-200 ${
                                    selectedImage === image ? 'ring-2 ring-blue-500' : ''
                                }`}
                            >
                                <CardContent className="p-3 space-y-3">
                                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
                                        <Image
                                            src={image.image}
                                            alt={`Captured image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority={index < 2}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium capitalize text-base">{image.label}</p>
                                                <p className="text-sm text-gray-500">
                                                    {(image.strength * 100).toFixed(1)}% confidence
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSelect(image)}
                                                className={`flex-1 h-9 text-sm ${
                                                    selectedImage === image ? 'bg-blue-50 text-blue-500' : ''
                                                }`}
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                Select
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemove(index)}
                                                className="h-9 text-red-500 hover:text-red-600 hover:bg-red-50 px-3"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="h-2" />
                </ScrollArea>
            )}
        </div>
    );
};

export default ImageGallery;
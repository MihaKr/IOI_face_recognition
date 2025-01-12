import { callApi } from './apiCaller';
import { decodeAndSaveBase64, timestamp } from './apiUtils';
import path from 'path';
import fs from "fs";

const outDir = path.resolve('api_out');
const outDirT2I = path.join(outDir, 'txt2img');
const outDirI2I = path.join(outDir, 'img2img');

// Ensure directories exist
if (!fs.existsSync(outDirT2I)) fs.mkdirSync(outDirT2I, { recursive: true });
if (!fs.existsSync(outDirI2I)) fs.mkdirSync(outDirI2I, { recursive: true });

export const callTxt2ImgApi = async (payload: Record<string, any>) => {
    const response = await callApi('sdapi/v1/txt2img', payload);
    response.images.forEach((image: string, index: number) => {
        const savePath = path.join(outDirT2I, `txt2img-${timestamp()}-${index}.png`);
        decodeAndSaveBase64(image, savePath);
    });
};

export const callImg2ImgApi = async (payload: Record<string, any>) => {
    const response = await callApi('sdapi/v1/img2img', payload);
    response.images.forEach((image: string, index: number) => {
        const savePath = path.join(outDirI2I, `img2img-${timestamp()}-${index}.png`);
        decodeAndSaveBase64(image, savePath);
    });
};

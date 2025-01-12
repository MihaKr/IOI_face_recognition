import fs from 'fs';
import path from 'path';

export const timestamp = (): string => {
    return new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
};

export const encodeFileToBase64 = (filePath: string): string => {
    const fileData = fs.readFileSync(filePath);
    return fileData.toString('base64');
};

export const decodeAndSaveBase64 = (base64Str: string, savePath: string): void => {
    const buffer = Buffer.from(base64Str, 'base64');
    fs.writeFileSync(savePath, buffer);
};

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function readData(relativeFilePath) {
    const fullPath = path.resolve(__dirname, relativeFilePath);
    try {
        const data = await fs.readFile(fullPath, 'utf-8');
        return data.trim() ? JSON.parse(data) : [];
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.writeFile(fullPath, JSON.stringify([], null, 2), 'utf-8');
            return [];
        }
        throw error;
    }
}

export async function writeData(relativeFilePath, data) {
    const fullPath = path.resolve(__dirname, relativeFilePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
}

export default { readData, writeData };
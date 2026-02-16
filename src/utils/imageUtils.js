import heic2any from 'heic2any';

// Verificar si es archivo HEIC/HEIF
export const isHeicFile = (file) => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    return fileName.endsWith('.heic') ||
        fileName.endsWith('.heif') ||
        fileType === 'image/heic' ||
        fileType === 'image/heif';
};

// Convertir HEIC a JPEG
export const convertHeicToJpeg = async (file) => {
    try {
        const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
        });

        // heic2any puede devolver un Blob o un array de Blobs. Asegurarnos de usar solo uno.
        const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

        const newFileName = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
        return new File([blobToUse], newFileName, { type: 'image/jpeg' });
    } catch (error) {
        console.error('Error converting HEIC:', error);
        throw new Error('Error al convertir la imagen HEIC. Intente con otro formato.');
    }
};

// Comprimir imagen - versión optimizada que libera memoria inmediatamente
export const compressImage = async (file, maxWidth = 1200, maxHeight = 900, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        const cleanup = () => URL.revokeObjectURL(url);

        img.onload = () => {
            try {
                // Calcular dimensiones reducidas
                let { width, height } = img;
                if (width > height && width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                } else if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // Usar imageSmoothingEnabled para mejor calidad
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Dibujar imagen en canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Liberar memoria de img inmediatamente
                img.src = '';
                cleanup();

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    } else {
                        reject(new Error('Error al comprimir la imagen.'));
                    }
                }, 'image/jpeg', quality);
            } catch (error) {
                cleanup();
                reject(error);
            }
        };

        img.onerror = () => {
            cleanup();
            reject(new Error('Error al cargar la imagen para compresión.'));
        };

        img.src = url;
    });
};

// Procesar imagen (convertir HEIC si es necesario y luego comprimir)
// Procesar imagen (convertir HEIC si es necesario y luego comprimir)
export const processImage = async (file, onProgress) => {
    let processedFile = file;

    // Reportar inicio (10%)
    if (onProgress) onProgress(10);

    // Si es HEIC, intentar convertir a JPEG
    if (isHeicFile(file)) {
        try {
            // Reportar que estamos convirtiendo (20%)
            if (onProgress) onProgress(20);
            processedFile = await convertHeicToJpeg(file);
            // Reportar fin de conversión (50%)
            if (onProgress) onProgress(50);
        } catch (error) {
            console.warn('Error converting HEIC, attempting to compress original as fallback:', error);
            // Si falla, seguimos con el original
        }
    } else {
        // Si no es HEIC, saltamos al 50%
        if (onProgress) onProgress(50);
    }

    // Reportar inicio de compresión (60%)
    if (onProgress) onProgress(60);

    // Luego comprimir
    try {
        const compressed = await compressImage(processedFile);
        // Reportar fin de compresión (100%)
        if (onProgress) onProgress(100);
        return compressed;
    } catch (error) {
        console.error('Error compressing image:', error);
        return processedFile;
    }
};

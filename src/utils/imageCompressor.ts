/**
 * High-performance, client-side Image Compressor & Resizer
 * Scales high-resolution camera photos / files to lightweight, high-clarity WebP/JPEG data URLs.
 * Prevents LocalStorage 5MB quota errors and Firestore 1MB document limit rejections.
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Compresses an image File, Blob, or Data URL down to a compact base64 string.
 * Resulting images are typically only 15KB - 45KB while maintaining sharp visual quality.
 */
export async function compressImage(
  input: File | Blob | string,
  options: CompressImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.82,
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise<string>((resolve, reject) => {
    let srcUrl = '';
    let shouldRevoke = false;

    if (typeof input === 'string') {
      // If it's already a very short URL (like http:// or https://), return directly
      if (input.startsWith('http://') || input.startsWith('https://')) {
        resolve(input);
        return;
      }
      srcUrl = input;
    } else if (input && typeof (input as any).size === 'number') {
      try {
        srcUrl = URL.createObjectURL(input);
        shouldRevoke = true;
      } catch (err) {
        // Fallback to FileReader if object URL creation fails
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            compressImage(reader.result, options).then(resolve).catch(reject);
          } else {
            reject(new Error('Failed to read image file data.'));
          }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(input);
        return;
      }
    } else {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (shouldRevoke) {
        try {
          URL.revokeObjectURL(srcUrl);
        } catch (e) {}
      }

      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          resolve(typeof input === 'string' ? input : '');
          return;
        }

        // Calculate proportional scale while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: outputFormat !== 'image/jpeg' });

        if (!ctx) {
          resolve(typeof input === 'string' ? input : '');
          return;
        }

        // Fill background if converting PNG to JPEG to avoid black transparent backgrounds
        if (outputFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        // Draw with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(outputFormat, quality);
        resolve(dataUrl);
      } catch (canvasErr) {
        console.warn('Canvas compression fallback notice:', canvasErr);
        resolve(typeof input === 'string' ? input : '');
      }
    };

    img.onerror = (imgErr) => {
      if (shouldRevoke) {
        try {
          URL.revokeObjectURL(srcUrl);
        } catch (e) {}
      }
      console.warn('Image load error during compression:', imgErr);
      if (typeof input === 'string') {
        resolve(input);
      } else {
        // Fallback to simple FileReader
        const reader = new FileReader();
        reader.onload = () => {
          resolve(typeof reader.result === 'string' ? reader.result : '');
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(input as Blob);
      }
    };

    img.src = srcUrl;
  });
}

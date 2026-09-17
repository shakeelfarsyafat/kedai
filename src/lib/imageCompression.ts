/**
 * Image Compression Utility for Menu Product Photos
 * Converts any JPG, JPEG, or PNG into an optimized lightweight Base64 Data URL.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSize: string;
  compressedSize: string;
  savedPercentage: number;
  width: number;
  height: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function compressMenuImage(
  file: File,
  options: {
    maxDimension?: number;
    quality?: number;
  } = {}
): Promise<CompressionResult> {
  const { maxDimension = 800, quality = 0.82 } = options;

  // Validate format strictly to JPG, JPEG, and PNG
  const validExtensions = ['jpg', 'jpeg', 'png'];
  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
  const validMimes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (!validExtensions.includes(fileExt) && !validMimes.includes(file.type)) {
    throw new Error('Hanya file foto berformat JPG, JPEG, atau PNG yang diizinkan.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('File gambar rusak atau tidak valid.'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down keeping aspect ratio if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal memproses kanvas grafis browser.'));
          return;
        }

        // Use high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill transparent areas with clean white if converting to JPEG
        if (file.type === 'image/png') {
          // Check if user wants PNG or if we can preserve transparency
          ctx.drawImage(img, 0, 0, width, height);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }

        // Export as optimized JPEG unless PNG with transparency
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        let compressedDataUrl = canvas.toDataURL(outputMime, quality);

        // If PNG turned out larger than 300KB, fallback to high quality JPEG for compactness
        const approxSize = Math.round((compressedDataUrl.length * 3) / 4);
        if (outputMime === 'image/png' && approxSize > 250 * 1024) {
          // Flatten onto white background
          const jpgCanvas = document.createElement('canvas');
          jpgCanvas.width = width;
          jpgCanvas.height = height;
          const jpgCtx = jpgCanvas.getContext('2d');
          if (jpgCtx) {
            jpgCtx.fillStyle = '#ffffff';
            jpgCtx.fillRect(0, 0, width, height);
            jpgCtx.drawImage(canvas, 0, 0);
            compressedDataUrl = jpgCanvas.toDataURL('image/jpeg', quality);
          }
        }

        const finalBytes = Math.round((compressedDataUrl.length * 3) / 4);
        const originalBytes = file.size;
        const saved = Math.max(0, Math.round(((originalBytes - finalBytes) / originalBytes) * 100));

        resolve({
          dataUrl: compressedDataUrl,
          originalSize: formatBytes(originalBytes),
          compressedSize: formatBytes(finalBytes),
          savedPercentage: saved,
          width,
          height,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

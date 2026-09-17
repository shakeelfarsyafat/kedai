/**
 * Image Compression & Transparency Utility for Menu Product Photos
 * Converts JPG, JPEG, or PNG into an optimized lightweight Base64 Data URL
 * with transparency preserved and automatic outer white background removal.
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

/**
 * Detect and remove solid/near-white outer background from canvas using BFS flood-fill from borders.
 * Leaves the subject (plates, cups, food) completely untouched.
 */
function removeOuterWhiteBackground(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Check if pixel is near-white (threshold > 232 to catch compression artifacts)
  const isNearWhite = (idx: number) => {
    return (
      data[idx + 3] > 10 && // has opacity
      data[idx] >= 230 &&
      data[idx + 1] >= 230 &&
      data[idx + 2] >= 230
    );
  };

  // Check the four corners
  const cornerIndices = [
    0, // top-left
    (w - 1) * 4, // top-right
    (h - 1) * w * 4, // bottom-left
    ((h - 1) * w + (w - 1)) * 4, // bottom-right
  ];
  const whiteCornersCount = cornerIndices.filter(isNearWhite).length;

  // If corners are not predominantly white, no need to strip background
  if (whiteCornersCount < 2) {
    return false;
  }

  const visited = new Uint8Array(w * h);
  const queue: number[] = [];

  // Enqueue white border pixels from all 4 edges
  for (let x = 0; x < w; x++) {
    const topIdx = x * 4;
    if (isNearWhite(topIdx)) {
      visited[x] = 1;
      queue.push(x, 0);
    }
    const bottomPos = (h - 1) * w + x;
    const bottomIdx = bottomPos * 4;
    if (isNearWhite(bottomIdx)) {
      visited[bottomPos] = 1;
      queue.push(x, h - 1);
    }
  }

  for (let y = 0; y < h; y++) {
    const leftPos = y * w;
    const leftIdx = leftPos * 4;
    if (isNearWhite(leftIdx) && !visited[leftPos]) {
      visited[leftPos] = 1;
      queue.push(0, y);
    }
    const rightPos = y * w + (w - 1);
    const rightIdx = rightPos * 4;
    if (isNearWhite(rightIdx) && !visited[rightPos]) {
      visited[rightPos] = 1;
      queue.push(w - 1, y);
    }
  }

  // BFS flood-fill to turn connected outer background pixels transparent
  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const pIdx = (cy * w + cx) * 4;

    // Set alpha to 0 (completely transparent)
    data[pIdx + 3] = 0;

    // Check 4-connected neighbors
    const neighbors: [number, number][] = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];

    for (let i = 0; i < 4; i++) {
      const nx = neighbors[i][0];
      const ny = neighbors[i][1];
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nPos = ny * w + nx;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const nIdx = nPos * 4;
          if (isNearWhite(nIdx)) {
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return true;
}

export async function compressMenuImage(
  file: File,
  options: {
    maxDimension?: number;
    quality?: number;
    removeWhiteBg?: boolean;
  } = {}
): Promise<CompressionResult> {
  const { maxDimension = 700, quality = 0.85, removeWhiteBg = true } = options;

  // Validate format strictly to JPG, JPEG, and PNG
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
  const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!validExtensions.includes(fileExt) && !validMimes.includes(file.type)) {
    throw new Error('Hanya file foto berformat JPG, JPEG, PNG, atau WebP yang diizinkan.');
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

        // Draw image directly onto canvas (NO white fill background!)
        ctx.drawImage(img, 0, 0, width, height);

        // Remove outer white/near-white background so food sits cleanly on card
        if (removeWhiteBg) {
          removeOuterWhiteBackground(canvas);
        }

        // Export as WebP with alpha transparency (or PNG fallback)
        let compressedDataUrl = canvas.toDataURL('image/webp', quality);
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          // If browser doesn't support toDataURL webp, use PNG
          compressedDataUrl = canvas.toDataURL('image/png');
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

/**
 * Strips outer white background from any existing Base64 Data URL.
 */
export function stripWhiteBackgroundFromDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const changed = removeOuterWhiteBackground(canvas);
      if (changed) {
        let cleaned = canvas.toDataURL('image/webp', 0.88);
        if (!cleaned.startsWith('data:image/webp')) {
          cleaned = canvas.toDataURL('image/png');
        }
        resolve(cleaned);
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

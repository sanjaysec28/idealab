import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { auth, storage } from './config';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateProfileImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'Please select an image file to upload.' };
  }

  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: 'Unsupported image format. Please choose a JPG, PNG, or WebP file.',
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'The selected image file is empty.' };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Image is too large (${sizeMb} MB). Maximum allowed file size is 5 MB.`,
    };
  }

  return { valid: true };
}

export interface CropParameters {
  zoom: number; // 1.0 to 3.0
  offsetX: number; // -100 to 100 percentage of overflow
  offsetY: number; // -100 to 100 percentage of overflow
}

/**
 * Loads an image element from a File or object URL and crops/renders it onto an HTML5 Canvas
 * at the exact target dimensions while preserving aspect ratio.
 */
export async function renderCroppedImageBlob(params: {
  imageSource: string;
  targetWidth: number;
  targetHeight: number;
  crop: CropParameters;
  outputType?: 'image/webp' | 'image/jpeg';
  quality?: number;
}): Promise<{ blob: Blob; previewDataUrl: string }> {
  const {
    imageSource,
    targetWidth,
    targetHeight,
    crop,
    outputType = 'image/webp',
    quality = 0.9,
  } = params;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.crossOrigin = 'anonymous';
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('Unable to decode the selected image file.'));
    element.src = imageSource;
  });

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser canvas context is unavailable for image processing.');
  }

  // Fill warm cream background for transparent PNGs
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  const safeZoom = Math.min(3, Math.max(1, crop.zoom || 1));
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = img.naturalWidth / img.naturalHeight;

  let baseCropWidth = img.naturalWidth;
  let baseCropHeight = img.naturalHeight;

  if (sourceRatio > targetRatio) {
    baseCropWidth = img.naturalHeight * targetRatio;
  } else {
    baseCropHeight = img.naturalWidth / targetRatio;
  }

  const zoomedCropWidth = baseCropWidth / safeZoom;
  const zoomedCropHeight = baseCropHeight / safeZoom;

  const maxShiftX = Math.max(0, (img.naturalWidth - zoomedCropWidth) / 2);
  const maxShiftY = Math.max(0, (img.naturalHeight - zoomedCropHeight) / 2);

  const centerX =
    img.naturalWidth / 2 - (Math.max(-100, Math.min(100, crop.offsetX)) / 100) * maxShiftX;
  const centerY =
    img.naturalHeight / 2 - (Math.max(-100, Math.min(100, crop.offsetY)) / 100) * maxShiftY;

  const sx = Math.max(0, Math.min(img.naturalWidth - zoomedCropWidth, centerX - zoomedCropWidth / 2));
  const sy = Math.max(0, Math.min(img.naturalHeight - zoomedCropHeight, centerY - zoomedCropHeight / 2));

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    img,
    sx,
    sy,
    zoomedCropWidth,
    zoomedCropHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );

  const previewDataUrl = canvas.toDataURL(outputType, quality);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Failed to encode cropped image.'));
        }
      },
      outputType,
      quality
    );
  });

  return { blob, previewDataUrl };
}

export async function uploadStudentProfileMedia(params: {
  uid: string;
  category: 'avatar' | 'banner';
  blob: Blob;
  onProgress?: (percent: number) => void;
}): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== params.uid) {
    throw new Error('You must be signed in as the profile owner to upload media.');
  }

  if (!currentUser.emailVerified) {
    throw new Error('Please verify your email address before uploading profile images.');
  }

  if (params.blob.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new Error('Processed image exceeds the 5 MB limit.');
  }

  const ext =
    params.blob.type === 'image/png'
      ? 'png'
      : params.blob.type === 'image/jpeg'
      ? 'jpg'
      : 'webp';

  const storagePath = `students/${params.uid}/profile/${params.category}_${Date.now()}.${ext}`;
  const storageRef = ref(storage, storagePath);

  return new Promise<string>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, params.blob, {
      contentType: params.blob.type || 'image/webp',
      customMetadata: {
        ownerUid: params.uid,
        category: params.category,
      },
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (params.onProgress && snapshot.totalBytes > 0) {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          params.onProgress(percent);
        }
      },
      (error) => {
        const code = (error as { code?: string }).code || '';
        if (code === 'storage/unauthorized') {
          reject(
            new Error(
              'Firebase Storage permissions denied. Deploy storage.rules in Firebase Console -> Storage -> Rules to allow writes to students/{uid}/profile/*, or select a default preset below.'
            )
          );
          return;
        }
        if (code === 'storage/canceled') {
          reject(new Error('Image upload was cancelled.'));
          return;
        }
        reject(
          new Error(
            error instanceof Error
              ? error.message
              : 'Failed to upload image to Firebase Storage.'
          )
        );
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          if (params.onProgress) params.onProgress(100);
          resolve(downloadUrl);
        } catch (err) {
          reject(
            new Error(
              err instanceof Error
                ? err.message
                : 'Failed to retrieve download URL from Firebase Storage.'
            )
          );
        }
      }
    );
  });
}

export async function deletePreviousStudentStorageUrlIfOwned(
  uid: string,
  url: string | undefined
): Promise<void> {
  if (!url || !url.includes('firebasestorage.googleapis.com') || !url.includes(`students%2F${uid}%2Fprofile%2F`)) {
    return;
  }
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch {
    // Non-fatal cleanup if previous object was already removed
  }
}

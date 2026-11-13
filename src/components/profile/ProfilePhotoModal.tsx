import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Loader2,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from 'lucide-react';
import { ASSETS } from '../../utils/assets';
import {
  CropParameters,
  deletePreviousStudentStorageUrlIfOwned,
  renderCroppedImageBlob,
  uploadStudentProfileMedia,
  validateProfileImageFile,
} from '../../firebase/storageService';
import { updateStudentProfilePhoto } from '../../firebase/studentService';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  uid: string;
  studentName: string;
  currentPhotoUrl?: string;
  currentAvatarPresetId?: string;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'IL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  uid,
  studentName,
  currentPhotoUrl,
  currentAvatarPresetId,
  onClose,
  onSaved,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'upload' | 'presets' | 'initials'>('upload');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    currentAvatarPresetId || ASSETS.profile.defaultAvatars[0].id
  );

  const [rawUploadUrl, setRawUploadUrl] = useState<string | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [crop, setCrop] = useState<CropParameters>({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setUploadProgress(null);
    setIsSaving(false);
    if (currentAvatarPresetId) {
      setMode('presets');
      setSelectedPresetId(currentAvatarPresetId);
    } else if (currentPhotoUrl) {
      setMode('upload');
    } else {
      setMode('presets');
    }
  }, [isOpen, currentAvatarPresetId, currentPhotoUrl]);

  useEffect(() => {
    return () => {
      if (rawUploadUrl && rawUploadUrl.startsWith('blob:')) {
        URL.revokeObjectURL(rawUploadUrl);
      }
    };
  }, [rawUploadUrl]);

  useEffect(() => {
    if (!rawUploadUrl) {
      setCroppedPreviewUrl(null);
      setCroppedBlob(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const result = await renderCroppedImageBlob({
          imageSource: rawUploadUrl,
          targetWidth: 512,
          targetHeight: 512,
          crop,
          outputType: 'image/webp',
          quality: 0.9,
        });
        if (!cancelled) {
          setCroppedPreviewUrl(result.previewDataUrl);
          setCroppedBlob(result.blob);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Unable to preview the selected photo.'
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rawUploadUrl, crop]);

  if (!isOpen) return null;

  const selectedPreset =
    ASSETS.profile.defaultAvatars.find((a) => a.id === selectedPresetId) ||
    ASSETS.profile.defaultAvatars[0];

  const previewAvatarSrc =
    mode === 'upload'
      ? croppedPreviewUrl || currentPhotoUrl || null
      : mode === 'presets'
      ? selectedPreset.imageUrl
      : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const validation = validateProfileImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file.');
      e.target.value = '';
      return;
    }

    if (rawUploadUrl && rawUploadUrl.startsWith('blob:')) {
      URL.revokeObjectURL(rawUploadUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setRawUploadUrl(objectUrl);
    setCrop({ zoom: 1, offsetX: 0, offsetY: 0 });
    setMode('upload');
    e.target.value = '';
  };

  const handleResetToDefault = async () => {
    if (isSaving) return;
    setError(null);
    setIsSaving(true);
    try {
      await updateStudentProfilePhoto(uid, {
        photoURL: '',
        avatarPresetId: '',
      });
      if (currentPhotoUrl) {
        await deletePreviousStudentStorageUrlIfOwned(uid, currentPhotoUrl);
      }
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset profile photo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setError(null);
    setIsSaving(true);

    try {
      if (mode === 'initials') {
        await handleResetToDefault();
        return;
      }

      if (mode === 'presets') {
        await updateStudentProfilePhoto(uid, {
          photoURL: '',
          avatarPresetId: selectedPreset.id,
        });
        if (currentPhotoUrl) {
          await deletePreviousStudentStorageUrlIfOwned(uid, currentPhotoUrl);
        }
      } else {
        if (!croppedBlob) {
          if (currentPhotoUrl && !rawUploadUrl) {
            onClose();
            return;
          }
          throw new Error('Please choose a photo file (JPG, PNG, or WebP) to upload.');
        }

        setUploadProgress(5);
        const downloadUrl = await uploadStudentProfileMedia({
          uid,
          category: 'avatar',
          blob: croppedBlob,
          onProgress: (pct) => setUploadProgress(pct),
        });

        await updateStudentProfilePhoto(uid, {
          photoURL: downloadUrl,
          avatarPresetId: '',
        });

        if (currentPhotoUrl && currentPhotoUrl !== downloadUrl) {
          await deletePreviousStudentStorageUrlIfOwned(uid, currentPhotoUrl);
        }
      }

      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile photo.');
    } finally {
      setIsSaving(false);
      setUploadProgress(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-2xl w-full max-w-lg overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE6E1] flex items-center justify-between gap-4 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#202020]">
                Student Profile Photo
              </h2>
              <p className="text-xs text-[#777777]">
                Upload & crop your photo or choose a default IDEA LAB avatar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo modal"
            className="w-9 h-9 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-[#777777] hover:text-[#E63946] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Circular Avatar Live Preview */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1]">
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#FFF0F1] flex items-center justify-center">
              {previewAvatarSrc ? (
                <img
                  src={previewAvatarSrc}
                  alt={studentName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-extrabold text-[#E63946]">
                  {getInitials(studentName)}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-[#202020] mt-2.5">{studentName}</p>
            <p className="text-[11px] text-[#777777]">Circular Profile Preview (1:1)</p>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1]">
            <button
              type="button"
              onClick={() => {
                setMode('upload');
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                mode === 'upload'
                  ? 'bg-white text-[#202020] shadow-xs border border-[#EAE6E1]'
                  : 'text-[#777777] hover:text-[#202020]'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Upload & Crop</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('presets');
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                mode === 'presets'
                  ? 'bg-white text-[#202020] shadow-xs border border-[#EAE6E1]'
                  : 'text-[#777777] hover:text-[#202020]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Default Avatars</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#FFF0F1] border border-[#E63946]/30 text-xs text-[#E63946] font-medium">
              {error}
            </div>
          )}

          {mode === 'upload' ? (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="rounded-2xl border-2 border-dashed border-[#EAE6E1] bg-[#FAF8F5] p-4 text-center space-y-2.5">
                <p className="text-xs font-bold text-[#202020]">
                  Select a JPG, PNG, or WebP photo (max 5 MB)
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#FFF0F1] text-[#202020] hover:text-[#E63946] border border-[#EAE6E1] text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#E63946]" />
                  <span>{rawUploadUrl ? 'Choose Different Photo' : 'Browse Photo File'}</span>
                </button>
              </div>

              {rawUploadUrl && (
                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#202020] flex items-center gap-1.5">
                      <ZoomIn className="w-4 h-4 text-[#E63946]" />
                      <span>Crop & Frame Photo</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCrop({ zoom: 1, offsetX: 0, offsetY: 0 })}
                      className="text-[11px] font-semibold text-[#777777] hover:text-[#202020] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Crop</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#777777] mb-1">
                        <span>Zoom</span>
                        <span className="tabular-nums">{crop.zoom.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={crop.zoom}
                        onChange={(e) =>
                          setCrop((prev) => ({ ...prev, zoom: Number(e.target.value) }))
                        }
                        className="w-full accent-[#E63946]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#777777] mb-1">
                          Horizontal Offset
                        </label>
                        <input
                          type="range"
                          min={-100}
                          max={100}
                          step={2}
                          value={crop.offsetX}
                          onChange={(e) =>
                            setCrop((prev) => ({ ...prev, offsetX: Number(e.target.value) }))
                          }
                          className="w-full accent-[#E63946]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#777777] mb-1">
                          Vertical Offset
                        </label>
                        <input
                          type="range"
                          min={-100}
                          max={100}
                          step={2}
                          value={crop.offsetY}
                          onChange={(e) =>
                            setCrop((prev) => ({ ...prev, offsetY: Number(e.target.value) }))
                          }
                          className="w-full accent-[#E63946]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {uploadProgress !== null && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#202020]">Uploading to Firebase Storage...</span>
                    <span className="text-[#E63946] tabular-nums">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#FAF8F5] border border-[#EAE6E1] overflow-hidden">
                    <div
                      className="h-full bg-[#E63946] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ASSETS.profile.defaultAvatars.map((avatar) => {
                const isSelected = avatar.id === selectedPresetId;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedPresetId(avatar.id)}
                    className={`rounded-2xl border p-3 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#E63946] bg-[#FFF0F1]/40 ring-2 ring-[#E63946]/20'
                        : 'border-[#EAE6E1] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <img
                      src={avatar.imageUrl}
                      alt={avatar.label}
                      className="w-16 h-16 rounded-full object-cover border border-[#EAE6E1]"
                    />
                    <span className="text-[11px] font-bold text-[#202020] text-center">
                      {avatar.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EAE6E1] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
          {(currentPhotoUrl || currentAvatarPresetId) ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void handleResetToDefault()}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-semibold text-[#E63946] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset to Initials</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#EAE6E1] text-xs font-semibold text-[#202020] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => void handleSave()}
              className="px-5 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold shadow-md shadow-[#E63946]/25 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

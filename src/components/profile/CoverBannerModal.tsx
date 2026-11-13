import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ImagePlus,
  Loader2,
  RotateCcw,
  Sparkles,
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
import { updateStudentCoverBanner } from '../../firebase/studentService';

interface CoverBannerModalProps {
  isOpen: boolean;
  uid: string;
  currentBannerUrl?: string;
  currentBannerPresetId?: string;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export const CoverBannerModal: React.FC<CoverBannerModalProps> = ({
  isOpen,
  uid,
  currentBannerUrl,
  currentBannerPresetId,
  onClose,
  onSaved,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'presets' | 'upload'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    currentBannerPresetId || ASSETS.profile.defaultBannerId
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
    setSelectedPresetId(currentBannerPresetId || ASSETS.profile.defaultBannerId);
    setActiveTab(currentBannerUrl && !currentBannerPresetId ? 'upload' : 'presets');
  }, [isOpen, currentBannerPresetId, currentBannerUrl]);

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
          targetWidth: 1600,
          targetHeight: 450,
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
            err instanceof Error ? err.message : 'Unable to preview the selected banner image.'
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
    ASSETS.profile.defaultBanners.find((b) => b.id === selectedPresetId) ||
    ASSETS.profile.defaultBanners[0];

  const livePreviewUrl =
    activeTab === 'upload' && croppedPreviewUrl
      ? croppedPreviewUrl
      : activeTab === 'upload' && currentBannerUrl && !rawUploadUrl
      ? currentBannerUrl
      : selectedPreset.imageUrl;

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
    setActiveTab('upload');
    e.target.value = '';
  };

  const handleSave = async () => {
    if (isSaving) return;
    setError(null);
    setIsSaving(true);

    try {
      if (activeTab === 'presets') {
        const preset =
          ASSETS.profile.defaultBanners.find((b) => b.id === selectedPresetId) ||
          ASSETS.profile.defaultBanners[0];

        const bannerUrlToStore = preset.imageUrl.startsWith('data:') ? '' : preset.imageUrl;

        await updateStudentCoverBanner(uid, {
          bannerURL: bannerUrlToStore,
          bannerPresetId: preset.id,
        });

        if (currentBannerUrl) {
          await deletePreviousStudentStorageUrlIfOwned(uid, currentBannerUrl);
        }
      } else {
        if (!croppedBlob) {
          if (currentBannerUrl && !rawUploadUrl) {
            onClose();
            return;
          }
          throw new Error('Please choose an image file to upload or select a default banner.');
        }

        setUploadProgress(5);
        const downloadUrl = await uploadStudentProfileMedia({
          uid,
          category: 'banner',
          blob: croppedBlob,
          onProgress: (pct) => setUploadProgress(pct),
        });

        await updateStudentCoverBanner(uid, {
          bannerURL: downloadUrl,
          bannerPresetId: '',
        });

        if (currentBannerUrl && currentBannerUrl !== downloadUrl) {
          await deletePreviousStudentStorageUrlIfOwned(uid, currentBannerUrl);
        }
      }

      await onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to save cover banner right now.'
      );
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
        className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-2xl w-full max-w-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EAE6E1] flex items-center justify-between gap-4 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
              <ImagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#202020]">
                Customize Profile Cover Banner
              </h2>
              <p className="text-xs text-[#777777]">
                Select an official IDEA LAB studio banner or upload your own landscape cover.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cover banner modal"
            className="w-9 h-9 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-[#777777] hover:text-[#E63946] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Live Banner Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#202020]">Live Banner Preview</span>
              <span className="text-[11px] text-[#777777]">
                {activeTab === 'presets' ? selectedPreset.title : 'Custom Uploaded Cover (16:4.5)'}
              </span>
            </div>

            <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-[#EAE6E1] bg-[#202020]">
              <img
                src={livePreviewUrl}
                alt="Cover banner preview"
                className="w-full h-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-full bg-[#FFF0F1] border-2 border-white text-[#E63946] font-extrabold text-xs flex items-center justify-center shadow-md">
                  IL
                </div>
                <div className="text-white drop-shadow-xs">
                  <p className="text-xs font-bold leading-tight">Profile Header Preview</p>
                  <p className="text-[10px] text-white/85">IDEA LAB • Saveetha Engineering College</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('presets');
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'presets'
                  ? 'bg-white text-[#202020] shadow-xs border border-[#EAE6E1]'
                  : 'text-[#777777] hover:text-[#202020]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Default Banners Gallery</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'upload'
                  ? 'bg-white text-[#202020] shadow-xs border border-[#EAE6E1]'
                  : 'text-[#777777] hover:text-[#202020]'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Upload Custom Image</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#FFF0F1] border border-[#E63946]/30 text-xs text-[#E63946] font-medium">
              {error}
            </div>
          )}

          {activeTab === 'presets' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ASSETS.profile.defaultBanners.map((banner) => {
                const isSelected = banner.id === selectedPresetId;
                return (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => setSelectedPresetId(banner.id)}
                    className={`group text-left rounded-2xl border p-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#E63946] bg-[#FFF0F1]/40 ring-2 ring-[#E63946]/20'
                        : 'border-[#EAE6E1] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="relative h-22 rounded-xl overflow-hidden bg-[#202020] border border-[#EAE6E1]">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#E63946] text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="mt-2 px-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#202020] truncate">{banner.title}</p>
                        <span className="text-[10px] font-semibold text-[#777777] shrink-0">
                          {banner.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#777777] truncate mt-0.5">
                        {banner.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="rounded-2xl border-2 border-dashed border-[#EAE6E1] bg-[#FAF8F5] p-5 text-center space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#202020]">
                    Upload a custom landscape banner
                  </p>
                  <p className="text-[11px] text-[#777777] mt-0.5">
                    Supports JPG, PNG, or WebP up to 5 MB • Recommended 1600×450 px
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#FFF0F1] text-[#202020] hover:text-[#E63946] border border-[#EAE6E1] text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <ImagePlus className="w-4 h-4 text-[#E63946]" />
                  <span>{rawUploadUrl ? 'Choose Another Image' : 'Select Image File'}</span>
                </button>
              </div>

              {rawUploadUrl && (
                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#202020] flex items-center gap-1.5">
                      <ZoomIn className="w-4 h-4 text-[#E63946]" />
                      <span>Adjust Banner Crop & Framing</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCrop({ zoom: 1, offsetX: 0, offsetY: 0 })}
                      className="text-[11px] font-semibold text-[#777777] hover:text-[#202020] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#777777] mb-1">
                        Zoom ({crop.zoom.toFixed(1)}x)
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={2.5}
                        step={0.05}
                        value={crop.zoom}
                        onChange={(e) =>
                          setCrop((prev) => ({ ...prev, zoom: Number(e.target.value) }))
                        }
                        className="w-full accent-[#E63946]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#777777] mb-1">
                        Horizontal Position
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
                        Vertical Position
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
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#EAE6E1] bg-[#FAF8F5] flex items-center justify-end gap-3">
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
                <span>Saving Cover...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Cover Banner</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Upload, Trash2, Camera, Loader2, Check, X, Sparkles } from 'lucide-react';

interface AvatarUploadModalProps {
  currentAvatar?: string | null;
  onUpload: (base64Url: string) => Promise<void>;
  onRemove: () => Promise<void>;
}

const PRESET_AVATARS = [
  { id: '1', label: 'Executive 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },
  { id: '2', label: 'Corporate 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
  { id: '3', label: 'Professional 3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80' },
  { id: '4', label: 'Creative 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80' },
  { id: '5', label: 'Tech 5', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80' },
  { id: '6', label: 'Finance 6', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80' },
];

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  currentAvatar,
  onUpload,
  onRemove,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPG, PNG, and WEBP images are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!preview || preview === currentAvatar) return;
    setIsUploading(true);
    try {
      await onUpload(preview);
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to upload avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove();
      setPreview(null);
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to remove avatar.');
    } finally {
      setIsRemoving(false);
    }
  };

  const modalMarkup = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#12101b] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-white relative">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-black font-heading text-white">Profile Photo</h3>
          <p className="text-xs text-gray-400">Upload custom photo or select a preset avatar</p>
        </div>

        {/* Preview Box */}
        <div className="flex justify-center py-2">
          <div className="w-28 h-28 rounded-full border-4 border-violet-500/40 overflow-hidden shadow-2xl bg-slate-900 flex items-center justify-center">
            {preview ? (
              <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
                <Camera className="w-10 h-10 text-white/80" />
              </div>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Choose File
          </button>

          {currentAvatar ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Remove
            </button>
          ) : (
            <div className="flex items-center justify-center text-[11px] text-gray-400 font-medium">
              JPG, PNG, WEBP &lt; 5MB
            </div>
          )}
        </div>

        {/* Preset Dummy Avatars Section */}
        <div className="space-y-2 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Or Choose Preset Avatar</span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {PRESET_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setPreview(avatar.url)}
                className={`w-11 h-11 rounded-full border-2 overflow-hidden transition cursor-pointer shrink-0 ${
                  preview === avatar.url
                    ? 'border-violet-500 scale-110 shadow-lg shadow-violet-500/50 ring-2 ring-violet-500/50 opacity-100'
                    : 'border-white/20 hover:border-white/50 opacity-70 hover:opacity-100'
                }`}
                title={avatar.label}
              >
                <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="py-2.5 px-5 rounded-full bg-transparent hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isUploading || !preview || preview === currentAvatar}
            className="flex items-center gap-2 py-2.5 px-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition cursor-pointer disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="relative group cursor-pointer shrink-0" onClick={() => setIsOpen(true)}>
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-violet-500/30 overflow-hidden shadow-xl bg-slate-900 flex items-center justify-center text-white font-bold text-3xl">
          {currentAvatar ? (
            <img src={currentAvatar} alt="Profile Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
              <Camera className="w-10 h-10 text-white/80" />
            </div>
          )}
        </div>
        <button
          type="button"
          className="absolute bottom-0 right-0 p-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg border-2 border-slate-950 transition cursor-pointer"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {modalMarkup && createPortal(modalMarkup, document.body)}
    </>
  );
};

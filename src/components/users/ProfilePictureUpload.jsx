import { useRef, useState, useCallback } from 'react';
import { MdCameraAlt, MdClose, MdCheck } from 'react-icons/md';
import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import Loader from '@components/common/Loader';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * ProfilePictureUpload — avatar with camera overlay for profile picture upload.
 */
const ProfilePictureUpload = ({ user, onUpload, disabled = false }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, GIF, and WebP images are allowed.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('File size must not exceed 5MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await onUpload?.(selectedFile);
      setPreview(null);
      setSelectedFile(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [selectedFile, onUpload]);

  const handleCancel = useCallback(() => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const displaySrc = preview || user?.profileImageUrl || undefined;

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <Avatar
          src={displaySrc}
          name={fullName}
          size="2xl"
          ring
        />

        {/* Camera overlay */}
        {!disabled && !uploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
            aria-label="Change profile picture"
          >
            <MdCameraAlt size={24} className="text-white" />
          </button>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <Loader size="sm" className="text-white" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Preview actions */}
      {selectedFile && !uploading && (
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="primary"
            size="xs"
            leftIcon={<MdCheck />}
            onClick={handleUpload}
          >
            Save
          </Button>
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<MdClose />}
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-2 text-xs text-danger-500 text-center max-w-[200px]">{error}</p>
      )}
    </div>
  );
};

export default ProfilePictureUpload;

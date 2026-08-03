import { useState } from 'react';
import { MdStar, MdStarBorder } from 'react-icons/md';
import toast from 'react-hot-toast';
import supplierService from '@api/services/supplierService';

const SupplierRating = ({ supplierId, rating, onRatingUpdated }) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating || 0);
  const [updating, setUpdating] = useState(false);

  const handleRatingClick = async (value) => {
    if (updating) return;
    setUpdating(true);
    try {
      await supplierService.updateRating(supplierId, { rating: value });
      setCurrentRating(value);
      toast.success(`Rating updated to ${value} / 5.0`);
      if (onRatingUpdated) onRatingUpdated(value);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update rating');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={updating}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
          onClick={() => handleRatingClick(star)}
          className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
          title={`${star} star${star !== 1 ? 's' : ''}`}
        >
          {(hoveredStar || currentRating) >= star ? (
            <MdStar size={24} className="text-warning-400 fill-warning-400" />
          ) : (
            <MdStarBorder size={24} className="text-surface-300 dark:text-surface-600" />
          )}
        </button>
      ))}
      <span className="ml-2 text-sm font-medium text-surface-600 dark:text-surface-300">
        {currentRating ? `${currentRating} / 5.0` : 'Not rated'}
      </span>
    </div>
  );
};

export default SupplierRating;

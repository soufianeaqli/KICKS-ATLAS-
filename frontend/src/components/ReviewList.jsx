import React from 'react';
import { Star, ThumbsUp, Image } from 'lucide-react';

const ReviewList = ({ reviews, sortBy, onSortChange }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
        <p className="text-gray-500 uppercase tracking-widest font-bold text-sm">Aucun avis pour le moment</p>
        <p className="text-gray-600 text-xs mt-2">Soyez le premier à donner votre avis</p>
      </div>
    );
  }

  const sorted = [...reviews];
  if (sortBy === 'highest') sorted.sort((a, b) => b.rating - a.rating);
  else sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{reviews.length} avis</p>
        <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-gold-500">
          <option value="newest">Plus récents</option>
          <option value="highest">Mieux notés</option>
        </select>
      </div>

      <div className="space-y-4">
        {sorted.map((review) => (
          <div key={review._id} className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                  {review.user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{review.user?.name || 'Anonyme'}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={12} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-600'} fill={star <= review.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <span className="text-green-500 text-[10px] font-bold flex items-center gap-1">
                      <ThumbsUp size={10} /> Achat vérifié
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-gray-500">{new Date(review.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>

            {review.photos && review.photos.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {review.photos.map((photo, i) => (
                  <a key={i} href={photo} target="_blank" rel="noopener noreferrer"
                    className="w-16 h-16 rounded-lg overflow-hidden border border-gray-700 hover:border-gold-500 transition-colors">
                    <img src={photo} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;

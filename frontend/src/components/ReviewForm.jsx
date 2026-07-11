import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Star, Upload, X, Camera } from 'lucide-react';

const API = 'http://localhost:5000/api';

const ReviewForm = ({ productId, onReviewSubmitted, userInfo }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - photos.length);
    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
        setPhotoPreviews(prev => [...prev, URL.createObjectURL(file)]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (rating === 0) { setError('Veuillez sélectionner une note'); return; }
    if (!comment.trim()) { setError('Veuillez écrire un commentaire'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/reviews/product/${productId}`, { rating, comment, photos }, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setSuccess('Avis soumis avec succès !');
      setRating(0);
      setComment('');
      setPhotos([]);
      setPhotoPreviews([]);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold uppercase tracking-widest mb-4">Écrire un avis</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">Note</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                className={`p-1 transition-colors ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}>
                <Star size={28} fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">Commentaire</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} required maxLength={1000}
            className="w-full bg-black/40 border border-gray-700 text-white rounded p-3 focus:outline-none focus:border-gold-500 resize-none"
            placeholder="Partagez votre expérience avec ce produit..." />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">Photos (max 3)</label>
          <div className="flex gap-3 flex-wrap">
            {photoPreviews.map((preview, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-700">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 text-white hover:bg-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-500 hover:border-gold-500 hover:text-gold-500 transition-colors">
                <Camera size={20} />                                 <span className="text-[10px] mt-1">Ajouter une photo</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <button type="submit" disabled={submitting}
          className={`w-full py-3 uppercase font-black tracking-widest text-sm transition-colors ${submitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gold-500 text-black hover:bg-white'}`}>
          {submitting ? 'Envoi...' : 'Soumettre l\'avis'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;

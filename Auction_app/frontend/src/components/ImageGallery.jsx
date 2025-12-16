import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/ImageGallery.css';

export default function ImageGallery({ images = [] }) {
  const [mainImage, setMainImage] = useState(0);

  const nextImage = () => {
    setMainImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setMainImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="image-gallery">
      <div className="gallery-main">
        <img src={images[mainImage]} alt="Product" />
        {images.length > 1 && (
          <>
            <button onClick={prevImage} className="gallery-btn prev">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextImage} className="gallery-btn next">
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Thumb ${idx}`}
              className={`thumbnail ${mainImage === idx ? 'active' : ''}`}
              onClick={() => setMainImage(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
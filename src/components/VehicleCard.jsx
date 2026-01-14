import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const VehicleCard = ({ vehicle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const images = vehicle.images || [];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const nextImage = () => {
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out overflow-hidden border border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        {images.length > 0 ? (
          <div className="relative w-full h-48">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out ${
                  index === currentImageIndex
                    ? 'opacity-100 translate-x-0'
                    : index < currentImageIndex
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-3xl">🚗</span>
          </div>
        )}

        {isHovered && hasMultipleImages && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                prevImage();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                nextImage();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ease-in-out ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 text-sm">
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </h3>
        <p className="text-xl font-bold text-green-600 mb-2">
          ${vehicle.price?.toLocaleString()}
        </p>
        <div className="text-xs text-gray-600 space-y-1">
          <p>{vehicle.mileage?.toLocaleString()} km • {vehicle.location}</p>
          <p className="text-gray-500">{vehicle.transmission} • {vehicle.fuel_type}</p>
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;
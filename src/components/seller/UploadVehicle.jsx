import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const UploadVehicle = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    location: '',
    transmission: 'manual',
    fuel_type: 'gasolina',
    description: '',
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Compress and resize image
  const compressImage = (file, maxWidth = 1200, maxHeight = 900, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    const previews = [];
    const compressedFiles = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          // Compress the image
          const compressedBlob = await compressImage(file);
          const compressedFile = new File([compressedBlob], file.name, {
            type: 'image/jpeg',
          });

          // Create preview URL
          const previewUrl = URL.createObjectURL(compressedFile);
          previews.push(previewUrl);
          compressedFiles.push(compressedFile);
        } catch (error) {
          console.error('Error compressing image:', error);
          // Fallback to original file if compression fails
          const previewUrl = URL.createObjectURL(file);
          previews.push(previewUrl);
          compressedFiles.push(file);
        }
      }
    }

    setImageFiles(prev => [...prev, ...compressedFiles]);
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImages = async () => {
    const uploadedUrls = [];

    console.log('Starting image upload for', imageFiles.length, 'files');

    for (const file of imageFiles) {
      const fileExt = 'jpg'; // All compressed images are JPEG
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `vehicle-images/${fileName}`;

      console.log('Uploading file:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('vehicles')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('vehicles')
        .getPublicUrl(filePath);

      console.log('Uploaded URL:', data.publicUrl);
      uploadedUrls.push(data.publicUrl);
    }

    console.log('All images uploaded, URLs:', uploadedUrls);
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    console.log('Starting vehicle upload');
    console.log('User:', user);

    try {
      // First upload images
      console.log('Uploading images...');
      const uploadedImageUrls = await uploadImages();
      console.log('Images uploaded:', uploadedImageUrls);

      // Then create vehicle record
      const vehicleData = {
        ...formData,
        images: uploadedImageUrls,
        seller_id: user.id,
        status: 'pending',
        price: parseFloat(formData.price),
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      console.log('Inserting vehicle data:', vehicleData);

      const { error } = await supabase
        .from('vehicles')
        .insert(vehicleData);

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Vehicle inserted successfully');
      setMessage('Vehículo subido exitosamente. Está pendiente de aprobación.');

      // Reset form
      setFormData({
        brand: '',
        model: '',
        year: '',
        price: '',
        mileage: '',
        location: '',
        transmission: 'manual',
        fuel_type: 'gasolina',
        description: '',
        images: [],
      });
      setImageFiles([]);
      setImagePreviews([]);

    } catch (error) {
      console.error('Error uploading vehicle:', error);
      setMessage('Error al subir el vehículo. Inténtalo de nuevo.');
    } finally {
      console.log('Setting uploading to false');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Subir Nuevo Vehículo</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                {message}
              </div>
            )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca *
              </label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                placeholder="Ej: Toyota"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo *
              </label>
              <input
                type="text"
                name="model"
                required
                value={formData.model}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                placeholder="Ej: Corolla"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año *
              </label>
              <input
                type="number"
                name="year"
                required
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                placeholder="2020"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                placeholder="50000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kilometraje *
              </label>
              <input
                type="number"
                name="mileage"
                required
                value={formData.mileage}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                placeholder="Manizales"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transmisión
              </label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automática</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Combustible
              </label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
              >
                <option value="gasolina">Gasolina</option>
                <option value="diesel">Diésel</option>
                <option value="electric">Eléctrico</option>
                <option value="hybrid">Híbrido</option>
              </select>
            </div>
          </div>
        </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors resize-none"
                placeholder="Describe las características del vehículo..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes del vehículo (opcional)
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                />
                <p className="text-sm text-gray-500">
                  Las imágenes se comprimirán automáticamente para optimizar el espacio de almacenamiento.
                </p>

                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Previsualización de imágenes:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subiendo vehículo...
                </span>
              ) : (
                'Subir Vehículo'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadVehicle;
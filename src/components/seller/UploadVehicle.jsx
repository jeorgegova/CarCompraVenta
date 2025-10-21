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
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedUrls = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `vehicle-images/${fileName}`;

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

      uploadedUrls.push(data.publicUrl);
    }

    setFormData({
      ...formData,
      images: [...formData.images, ...uploadedUrls],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('vehicles')
        .insert({
          ...formData,
          seller_id: user.id,
          status: 'pending',
          price: parseFloat(formData.price),
          year: parseInt(formData.year),
          mileage: parseInt(formData.mileage),
        });

      if (error) throw error;

      setMessage('Vehículo subido exitosamente. Está pendiente de aprobación.');
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
    } catch (error) {
      console.error('Error uploading vehicle:', error);
      setMessage('Error al subir el vehículo. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-primary-900 mb-6">Subir Nuevo Vehículo</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Marca *
            </label>
            <input
              type="text"
              name="brand"
              required
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Toyota"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Modelo *
            </label>
            <input
              type="text"
              name="model"
              required
              value={formData.model}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Corolla"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Año *
            </label>
            <input
              type="number"
              name="year"
              required
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="2020"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Precio *
            </label>
            <input
              type="number"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="50000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Kilometraje *
            </label>
            <input
              type="number"
              name="mileage"
              required
              value={formData.mileage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Ubicación *
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Manizales"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Transmisión
            </label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="manual">Manual</option>
              <option value="automatic">Automática</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Tipo de Combustible
            </label>
            <select
              name="fuel_type"
              value={formData.fuel_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="gasolina">Gasolina</option>
              <option value="diesel">Diésel</option>
              <option value="electric">Eléctrico</option>
              <option value="hybrid">Híbrido</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Describe las características del vehículo..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">
            Imágenes (opcional)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {formData.images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.images.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
        >
          {uploading ? 'Subiendo...' : 'Subir Vehículo'}
        </button>
      </form>
    </div>
  );
};

export default UploadVehicle;
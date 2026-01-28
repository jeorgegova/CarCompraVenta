import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const AdminUploadVehicle = () => {
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
  });
  const [rawPrice, setRawPrice] = useState('');
  const [rawMileage, setRawMileage] = useState('');
  const [customYear, setCustomYear] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const formatPrice = (value) => {
    if (!value) return '';
    return '$' + value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatMileage = (value) => {
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleChange = (e) => {
    if (e.target.name === 'price') {
      const cleanedValue = e.target.value.replace(/\D/g, '');
      setRawPrice(cleanedValue);
    } else if (e.target.name === 'mileage') {
      const cleanedValue = e.target.value.replace(/\D/g, '');
      setRawMileage(cleanedValue);
    } else if (e.target.name === 'customYear') {
      setCustomYear(e.target.value);
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  // Comprimir imagen
  const compressImage = (file, maxWidth = 1200, maxHeight = 900, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        } else if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', quality);
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
          const compressedFile = await compressImage(file);
          const previewUrl = URL.createObjectURL(compressedFile);
          previews.push(previewUrl);
          compressedFiles.push(compressedFile);
        } catch (err) {
          const previewUrl = URL.createObjectURL(file);
          previews.push(previewUrl);
          compressedFiles.push(file);
        }
      }
    }

    setImageFiles((prev) => [...prev, ...compressedFiles]);
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    // Validaciones
    if (!formData.brand.trim()) {
      setMessage('La marca es obligatoria.');
      setUploading(false);
      return;
    }
    if (!formData.model.trim()) {
      setMessage('El modelo es obligatorio.');
      setUploading(false);
      return;
    }
    if (!formData.year || (formData.year === 'other' && !customYear)) {
      setMessage('El año es obligatorio.');
      setUploading(false);
      return;
    }
    if (!rawPrice) {
      setMessage('El precio es obligatorio.');
      setUploading(false);
      return;
    }
    if (!rawMileage) {
      setMessage('El kilometraje es obligatorio.');
      setUploading(false);
      return;
    }
    if (!formData.location) {
      setMessage('La ubicación es obligatoria.');
      setUploading(false);
      return;
    }
    if (!formData.description.trim()) {
      setMessage('La descripción es obligatoria.');
      setUploading(false);
      return;
    }
    if (imageFiles.length === 0) {
      setMessage('Debes subir al menos una imagen.');
      setUploading(false);
      return;
    }

    try {
      // Usar la sesión del contexto de autenticación
      if (!user) throw new Error('Debes iniciar sesión');

      // Preparar FormData
      const form = new FormData();
      imageFiles.forEach((file) => form.append('images', file));
      form.append('vehicle', JSON.stringify({
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year === 'other' ? customYear : formData.year),
        price: parseInt(rawPrice),
        mileage: parseInt(rawMileage),
        location: formData.location,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        description: formData.description,
        status: 'approved', // Directamente aprobado
        approved_at: new Date().toISOString(),
      }));

      // Llamar a la función
      const res = await fetch('https://hgzqnchkalmxcyuedphr.supabase.co/functions/v1/upload-vehicle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: form,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Error del servidor');
      }

      setShowSuccessModal(true);
      setMessage('');

      // Reset form
      setFormData({
        brand: '', model: '', year: '', price: '', mileage: '',
        location: '', transmission: 'manual', fuel_type: 'gasolina', description: ''
      });
      setRawPrice('');
      setRawMileage('');
      setCustomYear('');
      setImageFiles([]);
      setImagePreviews((prev) => {
        prev.forEach(URL.revokeObjectURL);
        return [];
      });

    } catch (error) {
      console.error('Error:', error);
      setMessage(error.message || 'Error al subir el vehículo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Vehículo</h2>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {message && (
              <div className={`p-4 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                {message}
              </div>
            )}

            {showSuccessModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 mb-4">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">¡Vehículo publicado exitosamente!</h3>
                    <p className="text-sm text-gray-500 mb-4">El vehículo ha sido aprobado y está disponible para los compradores.</p>
                    <button
                      onClick={() => setShowSuccessModal(false)}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white py-1 sm:py-2 px-3 sm:px-4 rounded-lg font-medium transition-colors"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Campos del formulario - igual que UploadVehicle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                <input type="text" name="brand" required value={formData.brand} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500" placeholder="Ej: Toyota" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                <input type="text" name="model" required value={formData.model} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500" placeholder="Ej: Corolla" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año *</label>
                <select name="year" required value={formData.year} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <option value="">Selecciona un año</option>
                  {Array.from({ length: new Date().getFullYear() + 1 - 1990 }, (_, i) => new Date().getFullYear() + 1 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                  <option value="other">Otro año</option>
                </select>
                {formData.year === 'other' && (
                  <input type="number" name="customYear" value={customYear} onChange={handleChange} required
                    className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500" placeholder="Ingresa el año" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio *</label>
                <input type="text" name="price" required value={formatPrice(rawPrice)} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500" placeholder="$50.000.000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kilometraje *</label>
                <input type="text" name="mileage" required value={formatMileage(rawMileage)} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500" placeholder="50.000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación *</label>
                <select name="location" required value={formData.location} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <option value="">Selecciona una ubicación</option>
                  <option value="Manizales">Manizales</option>
                  <option value="Pereira">Pereira</option>
                  <option value="Armenia">Armenia</option>
                  <option value="Chinchiná">Chinchiná</option>
                  <option value="Villamaría">Villamaría</option>
                  <option value="Neira">Neira</option>
                  <option value="Salamina">Salamina</option>
                  <option value="Marmato">Marmato</option>
                  <option value="Marulanda">Marulanda</option>
                  <option value="La Dorada">La Dorada</option>
                  <option value="Pensilvania">Pensilvania</option>
                  <option value="Belalcázar">Belalcázar</option>
                  <option value="Risaralda">Risaralda</option>
                  <option value="Quinchía">Quinchía</option>
                  <option value="Apía">Apía</option>
                  <option value="Balboa">Balboa</option>
                  <option value="Santuario">Santuario</option>
                  <option value="La Celia">La Celia</option>
                  <option value="Marsella">Marsella</option>
                  <option value="Filandia">Filandia</option>
                  <option value="Circasia">Circasia</option>
                  <option value="Quimbaya">Quimbaya</option>
                  <option value="Montenegro">Montenegro</option>
                  <option value="Pijao">Pijao</option>
                  <option value="Córdoba">Córdoba</option>
                  <option value="Génova">Génova</option>
                  <option value="Buenavista">Buenavista</option>
                  <option value="Salento">Salento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmisión</label>
                <select name="transmission" value={formData.transmission} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <option value="manual">Manual</option>
                  <option value="automatic">Automática</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Combustible</label>
                <select name="fuel_type" value={formData.fuel_type} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <option value="gasolina">Gasolina</option>
                  <option value="diesel">Diésel</option>
                  <option value="electric">Eléctrico</option>
                  <option value="hybrid">Híbrido</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
                placeholder="Describe las características del vehículo..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del vehículo (opcional)</label>
              <div className="space-y-4">
                <input type="file" multiple accept="image/*" onChange={handleImageSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500" />
                <p className="text-sm text-gray-500">Las imágenes se comprimirán automáticamente.</p>

                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Previsualización:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                      {imagePreviews.map((preview, i) => (
                        <div key={i} className="relative group">
                          <img src={preview} alt="" className="w-full h-20 sm:h-24 object-cover rounded-lg border" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 text-xs opacity-0 group-hover:opacity-100 transition">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={uploading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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

export default AdminUploadVehicle;
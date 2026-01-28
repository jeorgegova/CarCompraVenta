import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';

const AdminEditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    action: null,
  });
  const [vehicleStatus, setVehicleStatus] = useState('');

  useEffect(() => {
    fetchVehicle();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVehicle = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        brand: data.brand || '',
        model: data.model || '',
        year: data.year?.toString() || '',
        price: data.price?.toString() || '',
        mileage: data.mileage?.toString() || '',
        location: data.location || '',
        transmission: data.transmission || 'manual',
        fuel_type: data.fuel_type || 'gasolina',
        description: data.description || '',
      });
      setRawPrice(data.price?.toString() || '');
      setRawMileage(data.mileage?.toString() || '');
      if (data.year && data.year < 1990) {
        setCustomYear(data.year.toString());
        setFormData(prev => ({ ...prev, year: 'other' }));
      }
      setCurrentImages(data.images || []);
      setVehicleStatus(data.status || '');
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      setMessage('Error al cargar el vehículo');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value) => {
    if (!value) return '';
    return '$' + value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatMileage = (value) => {
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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

  const uploadImages = async (files) => {
    const urls = [];
    for (const file of files) {
      const compressed = await compressImage(file);
      const fileName = `vehicle-${Date.now()}-${Math.random()}.jpg`;
      const { error } = await supabase.storage.from('vehicle-images').upload(fileName, compressed);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('vehicle-images').getPublicUrl(fileName);
      urls.push(urlData.publicUrl);
    }
    return urls;
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
        } catch {
          const previewUrl = URL.createObjectURL(file);
          previews.push(previewUrl);
          compressedFiles.push(file);
        }
      }
    }

    setNewImageFiles((prev) => [...prev, ...compressedFiles]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeCurrentImage = (index) => {
    const imageToRemove = currentImages[index];
    setRemovedImages((prev) => [...prev, imageToRemove]);
    setCurrentImages((prev) => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    // Validaciones
    if (!formData.brand.trim()) {
      setMessage('La marca es obligatoria.');
      setUpdating(false);
      return;
    }
    if (!formData.model.trim()) {
      setMessage('El modelo es obligatorio.');
      setUpdating(false);
      return;
    }
    if (!formData.year || (formData.year === 'other' && !customYear)) {
      setMessage('El año es obligatorio.');
      setUpdating(false);
      return;
    }
    if (!rawPrice) {
      setMessage('El precio es obligatorio.');
      setUpdating(false);
      return;
    }
    if (!rawMileage) {
      setMessage('El kilometraje es obligatorio.');
      setUpdating(false);
      return;
    }
    if (!formData.location) {
      setMessage('La ubicación es obligatoria.');
      setUpdating(false);
      return;
    }
    if (!formData.description.trim()) {
      setMessage('La descripción es obligatoria.');
      setUpdating(false);
      return;
    }

    try {
      // Subir nuevas imágenes
      let newUrls = [];
      if (newImageFiles.length > 0) {
        newUrls = await uploadImages(newImageFiles);
      }

      // Combinar imágenes: actuales menos removidas + nuevas
      const updatedImages = currentImages.filter(img => !removedImages.includes(img)).concat(newUrls);

      const updateData = {
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year === 'other' ? customYear : formData.year),
        price: parseInt(rawPrice),
        mileage: parseInt(rawMileage),
        location: formData.location,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        description: formData.description,
        images: updatedImages,
      };

      const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      setMessage(error.message || 'Error al actualizar el vehículo');
    } finally {
      setUpdating(false);
    }
  };

  const changeStatusToPending = async () => {
    setUpdating(true);
    setMessage('');

    // Validaciones
    if (!formData.brand.trim()) {
      setMessage('La marca es obligatoria.');
      setUpdating(false);
      return;
    }
    if (!formData.model.trim()) {
      setMessage('El modelo es obligatorio.');
      setUpdating(false);
      return;
    }
    if (!formData.year || (formData.year === 'other' && !customYear)) {
      setMessage('El año es obligatorio.');
      setUpdating(false);
      return;
    }
    if (!rawPrice) {
      setMessage('El precio es obligatorio.');
      setUpdating(false);
      return;
    }
    if (!rawMileage) {
      setMessage('El kilometraje es obligatorio.');
      setUpdating(false);
      return;
    }
    if (!formData.location) {
      setMessage('La ubicación es obligatoria.');
      setUpdating(false);
      return;
    }
    if (!formData.description.trim()) {
      setMessage('La descripción es obligatoria.');
      setUpdating(false);
      return;
    }

    try {
      // Subir nuevas imágenes
      let newUrls = [];
      if (newImageFiles.length > 0) {
        newUrls = await uploadImages(newImageFiles);
      }

      // Combinar imágenes: actuales menos removidas + nuevas
      const updatedImages = currentImages.filter(img => !removedImages.includes(img)).concat(newUrls);

      const updateData = {
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year === 'other' ? customYear : formData.year),
        price: parseInt(rawPrice),
        mileage: parseInt(rawMileage),
        location: formData.location,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        description: formData.description,
        images: updatedImages,
        status: 'pending',
        approved_at: null,
      };

      const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      navigate('/admin');
    } catch (error) {
      console.error('Error changing status:', error);
      setMessage(error.message || 'Error al cambiar el estado.');
    } finally {
      setUpdating(false);
    }
  };

  const approvePublication = async () => {
    setUpdating(true);
    setMessage('');

    // Validaciones
    if (!formData.brand.trim()) {
      setMessage('La marca es obligatoria.');
      setUpdating(false);
      return;
    }
    if (!formData.model.trim()) {
      setMessage('El modelo es obligatorio.');
      setUpdating(false);
      return;
    }
    if (!formData.year || (formData.year === 'other' && !customYear)) {
      setMessage('El año es obligatorio.');
      setUpdating(false);
      return;
    }
    if (!rawPrice) {
      setMessage('El precio es obligatorio.');
      setUpdating(false);
      return;
    }
    if (!rawMileage) {
      setMessage('El kilometraje es obligatorio.');
      setUpdating(false);
      return;
    }
    if (!formData.location) {
      setMessage('La ubicación es obligatoria.');
      setUpdating(false);
      return;
    }
    if (!formData.description.trim()) {
      setMessage('La descripción es obligatoria.');
      setUpdating(false);
      return;
    }

    try {
      // Subir nuevas imágenes
      let newUrls = [];
      if (newImageFiles.length > 0) {
        newUrls = await uploadImages(newImageFiles);
      }

      // Combinar imágenes: actuales menos removidas + nuevas
      const updatedImages = currentImages.filter(img => !removedImages.includes(img)).concat(newUrls);

      const updateData = {
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year === 'other' ? customYear : formData.year),
        price: parseInt(rawPrice),
        mileage: parseInt(rawMileage),
        location: formData.location,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        description: formData.description,
        images: updatedImages,
        status: 'approved',
        approved_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      navigate('/admin/vehicles');
    } catch (error) {
      console.error('Error approving publication:', error);
      setMessage(error.message || 'Error al aprobar la publicación.');
    } finally {
      setUpdating(false);
    }
  };

  const showConfirmModal = (title, message, action) => {
    setConfirmModal({
      show: true,
      title,
      message,
      action,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      show: false,
      title: '',
      message: '',
      action: null,
    });
  };

  const executeAction = async () => {
    const { action } = confirmModal;
    closeConfirmModal();

    if (action === 'delete') {
      await deleteVehicle();
    }
  };

  const deleteVehicle = async () => {
    try {
      // Delete images from storage if any
      if (currentImages.length > 0) {
        for (const imageUrl of currentImages) {
          // Extract file name from URL
          const fileName = imageUrl.split('/').pop();
          if (fileName) {
            await supabase.storage.from('vehicle-images').remove([fileName]);
          }
        }
      }

      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      navigate('/admin/vehicles');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      setMessage('Error al eliminar el vehículo.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Editar Vehículo</h2>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {message && (
              <div className={`p-4 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                {message}
              </div>
            )}

            {showSuccessModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">¡Vehículo actualizado exitosamente!</h3>
                    <p className="text-sm text-gray-500 mb-4">Los cambios han sido guardados.</p>
                    <button
                      onClick={() => navigate('/admin/vehicles')}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Volver a la lista
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Campos del formulario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                <input type="text" name="brand" required value={formData.brand} onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500" placeholder="Ej: Toyota" />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes actuales del vehículo</label>
              {currentImages.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Haz clic en × para remover una imagen.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                    {currentImages.map((preview, i) => (
                      <div key={i} className="relative group">
                        <img src={preview} alt="" className="w-full h-20 sm:h-24 object-cover rounded-lg border" />
                        <button type="button" onClick={() => removeCurrentImage(i)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 text-xs opacity-0 group-hover:opacity-100 transition">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay imágenes actuales.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agregar nuevas imágenes</label>
              <div className="space-y-4">
                <input type="file" multiple accept="image/*" onChange={handleImageSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500" />
                <p className="text-sm text-gray-500">Las imágenes se comprimirán automáticamente.</p>

                {newImagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Previsualización de nuevas imágenes:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                      {newImagePreviews.map((preview, i) => (
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

            <button type="submit" disabled={updating}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {updating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando vehículo...
                </span>
              ) : (
                'Actualizar Vehículo'
              )}
            </button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Acciones Administrativas</h3>
              <div className="flex space-x-2 sm:space-x-4">
                {vehicleStatus === 'pending' ? (
                  <button
                    type="button"
                    onClick={approvePublication}
                    className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 sm:py-2 sm:px-4 rounded-lg font-medium transition-colors"
                  >
                    Aprobar Publicación
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={changeStatusToPending}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 sm:py-2 sm:px-4 rounded-lg font-medium transition-colors"
                  >
                    Cambiar a Pendiente
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => showConfirmModal(
                    'Eliminar Vehículo',
                    '¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer y eliminará también todas las imágenes asociadas.',
                    'delete'
                  )}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 sm:py-2 sm:px-4 rounded-lg font-medium transition-colors"
                >
                  Eliminar Vehículo
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{confirmModal.title}</h3>
              <p className="text-sm text-gray-500 mb-6">{confirmModal.message}</p>
              <div className="flex space-x-3">
                <button
                  onClick={closeConfirmModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeAction}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEditVehicle;
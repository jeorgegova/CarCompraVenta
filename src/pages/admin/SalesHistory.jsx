import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const SalesHistory = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    startDate: '',
    endDate: '',
  });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    action: null,
    vehicleId: null,
  });

  useEffect(() => {
    fetchSoldVehicles();
  }, []);

  const fetchSoldVehicles = async () => {
    try {
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'sold');

      if (filters.brand) {
        query = query.ilike('brand', `%${filters.brand}%`);
      }
      if (filters.model) {
        query = query.ilike('model', `%${filters.model}%`);
      }
      if (filters.startDate) {
        query = query.gte('sold_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('sold_at', filters.endDate + 'T23:59:59');
      }

      const { data, error } = await query.order('sold_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error('Error fetching sold vehicles:', err);
      setError('Error al cargar el historial de ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    setLoading(true);
    fetchSoldVehicles();
  };

  const showConfirmModal = (title, message, action, vehicleId) => {
    setConfirmModal({
      show: true,
      title,
      message,
      action,
      vehicleId,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      show: false,
      title: '',
      message: '',
      action: null,
      vehicleId: null,
    });
  };

  const executeAction = async () => {
    const { action, vehicleId } = confirmModal;
    closeConfirmModal();

    if (action === 'republish') {
      await republishVehicle(vehicleId);
    } else if (action === 'delete') {
      await deleteVehicle(vehicleId);
    }
  };

  const formatTimestampDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const republishVehicle = async (vehicleId) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ status: 'approved', sold_at: null })
        .eq('id', vehicleId);

      if (error) throw error;

      // Remove from the list since it's no longer sold
      setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
    } catch (err) {
      console.error('Error republishing vehicle:', err);
      setError('Error al volver a publicar el vehículo');
    }
  };

  const deleteVehicle = async (vehicleId) => {
    try {
      // First, get the vehicle to know its images
      const { data: vehicle, error: fetchError } = await supabase
        .from('vehicles')
        .select('images')
        .eq('id', vehicleId)
        .single();

      if (fetchError) throw fetchError;

      // Delete images from storage if any
      if (vehicle.images && vehicle.images.length > 0) {
        for (const imageUrl of vehicle.images) {
          // Extract file name from URL
          const fileName = imageUrl.split('/').pop();
          if (fileName) {
            await supabase.storage.from('vehicle-images').remove([fileName]);
          }
        }
      }

      // Delete the vehicle record
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      // Remove from the list
      setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setError('Error al eliminar el vehículo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Historial de Ventas</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros de Búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
            <input
              type="text"
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Buscar por marca"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
            <input
              type="text"
              name="model"
              value={filters.model}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Buscar por modelo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={applyFilters}
            className="bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay vehículos vendidos.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {vehicle.images && vehicle.images.length > 0 && (
                        <img
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                          src={vehicle.images[0]}
                          alt=""
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.brand} {vehicle.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle.year} • {vehicle.mileage?.toLocaleString()} km
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.admin_notes ? (
                      <div>
                        <span className="line-through text-gray-500">${parseInt(vehicle.admin_notes).toLocaleString()}</span>
                        <br />
                        <span>${vehicle.price?.toLocaleString()}</span>
                      </div>
                    ) : (
                      `$${vehicle.price?.toLocaleString()}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.sold_at ? formatTimestampDate(vehicle.sold_at) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => showConfirmModal(
                          'Volver a Publicar Vehículo',
                          '¿Estás seguro de que quieres volver a publicar este vehículo? Aparecerá nuevamente en la lista de vehículos publicados.',
                          'republish',
                          vehicle.id
                        )}
                        className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                      >
                        Volver a Publicar
                      </button>
                      <button
                        onClick={() => showConfirmModal(
                          'Eliminar Vehículo',
                          '¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer y eliminará también todas las imágenes asociadas.',
                          'delete',
                          vehicle.id
                        )}
                        className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    confirmModal.action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {confirmModal.action === 'delete' ? 'Eliminar' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [sellPrice, setSellPrice] = useState('');
  const [usePublishedPrice, setUsePublishedPrice] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Error al cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  const openSellModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setSellPrice('');
    setUsePublishedPrice(true);
    setShowSellModal(true);
  };

  const closeSellModal = () => {
    setShowSellModal(false);
    setSelectedVehicle(null);
    setSellPrice('');
    setUsePublishedPrice(true);
  };

  const handleSellPriceChange = (e) => {
    const cleanedValue = e.target.value.replace(/\D/g, '');
    setSellPrice(cleanedValue);
  };

  const formatPrice = (value) => {
    if (!value) return '';
    return '$' + value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const markAsSold = async () => {
    if (!selectedVehicle) return;

    const finalPrice = usePublishedPrice ? selectedVehicle.price : parseInt(sellPrice);

    if (!usePublishedPrice && !finalPrice) {
      alert('Por favor ingresa un precio válido.');
      return;
    }

    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          status: 'sold',
          sold_at: new Date().toISOString(),
          price: finalPrice,
          admin_notes: selectedVehicle.price?.toString()
        })
        .eq('id', selectedVehicle.id);

      if (error) throw error;

      // Remove the vehicle from the list since it's no longer approved
      setVehicles(vehicles.filter(vehicle => vehicle.id !== selectedVehicle.id));
      closeSellModal();
    } catch (err) {
      console.error('Error marking vehicle as sold:', err);
      setError('Error al marcar el vehículo como vendido');
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
        <h2 className="text-2xl font-bold text-gray-900">Vehículos Publicados</h2>
        <Link
          to="/admin/create-vehicle"
          className="bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Crear Nuevo Vehículo
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay vehículos publicados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
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
                      ${vehicle.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/edit-vehicle/${vehicle.id}`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => openSellModal(vehicle)}
                          className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                        >
                          Marcar como Vendido
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirmar Venta</h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.year}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio de Venta</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="published-price"
                      name="price-option"
                      checked={usePublishedPrice}
                      onChange={() => setUsePublishedPrice(true)}
                      className="mr-2"
                    />
                    <label htmlFor="published-price" className="text-sm text-gray-700">
                      Usar precio publicado: {formatPrice(selectedVehicle.price?.toString())}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="custom-price"
                      name="price-option"
                      checked={!usePublishedPrice}
                      onChange={() => setUsePublishedPrice(false)}
                      className="mr-2"
                    />
                    <label htmlFor="custom-price" className="text-sm text-gray-700">
                      Ingresar precio personalizado
                    </label>
                  </div>
                  {!usePublishedPrice && (
                    <input
                      type="text"
                      value={formatPrice(sellPrice)}
                      onChange={handleSellPriceChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="$0"
                    />
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={closeSellModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={markAsSold}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Confirmar Venta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
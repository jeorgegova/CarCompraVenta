import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    location: '',
    minMileage: '',
    maxMileage: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'approved');

      // Apply filters
      if (filters.brand) query = query.ilike('brand', `%${filters.brand}%`);
      if (filters.model) query = query.ilike('model', `%${filters.model}%`);
      if (filters.location) query = query.ilike('location', `%${filters.location}%`);
      if (filters.minPrice) query = query.gte('price', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
      if (filters.minYear) query = query.gte('year', filters.minYear);
      if (filters.maxYear) query = query.lte('year', filters.maxYear);
      if (filters.minMileage) query = query.gte('mileage', filters.minMileage);
      if (filters.maxMileage) query = query.lte('mileage', filters.maxMileage);

      const { data, error } = await query;

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
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

  const clearFilters = () => {
    setFilters({
      brand: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      location: '',
      minMileage: '',
      maxMileage: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Vehículos Disponibles</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Toyota"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Modelo
              </label>
              <input
                type="text"
                name="model"
                value={filters.model}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Corolla"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Precio Mínimo
              </label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Precio Máximo
              </label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="100000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Año Mínimo
              </label>
              <input
                type="number"
                name="minYear"
                value={filters.minYear}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="2000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Año Máximo
              </label>
              <input
                type="number"
                name="maxYear"
                value={filters.maxYear}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Ubicación
              </label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Manizales"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicles Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-primary-200 flex items-center justify-center">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-primary-500 text-4xl">🚗</div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-primary-900 mb-2">
                  {vehicle.brand} {vehicle.model} {vehicle.year}
                </h3>

                <div className="space-y-1 text-sm text-primary-600 mb-4">
                  <p>Precio: ${vehicle.price?.toLocaleString()}</p>
                  <p>Kilometraje: {vehicle.mileage?.toLocaleString()} km</p>
                  <p>Ubicación: {vehicle.location}</p>
                </div>

                <Link
                  to={`/vehicle/${vehicle.id}`}
                  className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-4 rounded-md transition duration-300"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && vehicles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-primary-600 text-lg">No se encontraron vehículos con los filtros aplicados.</p>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
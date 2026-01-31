import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import VehicleCard from '../components/VehicleCard';

const Vehicles = () => {
  const { runQuery } = useAuth();
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
      const { data, error } = await runQuery((s) => {
        let q = s
          .from('vehicles')
          .select('*')
          .eq('status', 'approved');

        if (filters.brand) q = q.ilike('brand', `%${filters.brand}%`);
        if (filters.model) q = q.ilike('model', `%${filters.model}%`);
        if (filters.location) q = q.ilike('location', `%${filters.location}%`);
        if (filters.minPrice) q = q.gte('price', filters.minPrice);
        if (filters.maxPrice) q = q.lte('price', filters.maxPrice);
        if (filters.minYear) q = q.gte('year', filters.minYear);
        if (filters.maxYear) q = q.lte('year', filters.maxYear);
        if (filters.minMileage) q = q.gte('mileage', filters.minMileage);
        if (filters.maxMileage) q = q.lte('mileage', filters.maxMileage);

        return q;
      });

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

  const canonicalUrl = window.location.origin + window.location.pathname;

  return (
    <>
      <Helmet>
        <title>Vehículos en Venta - Conecta Car</title>
        <meta name="description" content="Explora una amplia selección de vehículos usados en Colombia. Encuentra carros de todas las marcas y modelos con filtros avanzados." />
        <meta name="keywords" content="vehículos usados Colombia, carros en venta, compra venta autos" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Vehículos en Venta - Conecta Car" />
        <meta property="og:description" content="Explora una amplia selección de vehículos usados en Colombia. Encuentra carros de todas las marcas y modelos con filtros avanzados." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Conecta Car" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vehículos en Venta - Conecta Car" />
        <meta name="twitter:description" content="Explora una amplia selección de vehículos usados en Colombia. Encuentra carros de todas las marcas y modelos con filtros avanzados." />
        <meta name="twitter:image" content="/logo.png" />
        {vehicles.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "itemListElement": vehicles.map((v, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "url": `${window.location.origin}/vehicles/${v.id}`,
                "name": `${v.brand} ${v.model} ${v.year}`,
                ...(v.images?.[0] ? { "image": v.images[0] } : {}),
                ...(v.price ? { "offers": { "@type": "Offer", "price": v.price, "priceCurrency": "COP", "availability": "https://schema.org/InStock" } } : {})
              }))
            })}
          </script>
        )}
      </Helmet>
      <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vehículos Disponibles</h1>
            <p className="text-gray-600 mt-2">Encuentra el vehículo perfecto para ti</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors self-start sm:self-auto"
          >
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="font-semibold text-gray-900 mb-6">Filtros de búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                  placeholder="Ej: Toyota"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  name="model"
                  value={filters.model}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                  placeholder="Ej: Corolla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Mínimo
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Máximo
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                  placeholder="100000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año Mínimo
                </label>
                <input
                  type="number"
                  name="minYear"
                  value={filters.minYear}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                  placeholder="2000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año Máximo
                </label>
                <input
                  type="number"
                  name="maxYear"
                  value={filters.maxYear}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                  placeholder="Ej: Manizales"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-medium transition-colors"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}

        {!loading && vehicles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No se encontraron vehículos con los filtros aplicados.</p>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default Vehicles;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    locations: [],
    years: [],
    prices: [],
    mileages: [],
    minPrice: 0,
    maxPrice: 0,
    minYear: 0,
    maxYear: 0,
    minMileage: 0,
    maxMileage: 0,
  });
  const [filters, setFilters] = useState({
    brand: '',
    brand_dropdown: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    transmission: '',
    fuel_type: '',
    year_min: '',
    year_max: '',
    mileage_min: '',
    mileage_max: '',
    condition: '',
    body_type: '',
    doors: '',
    color: '',
  });

  useEffect(() => {
    fetchApprovedVehicles();
  }, []);

  const fetchApprovedVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50); // Increased limit to get more data for filters

      if (error) throw error;
      setVehicles(data || []);

      // Extract filter options from the data
      if (data && data.length > 0) {
        const brands = [...new Set(data.map(v => v.brand).filter(Boolean))].sort();
        const locations = [...new Set(data.map(v => v.location).filter(Boolean))].sort();
        const prices = data.map(v => v.price).filter(Boolean);
        const years = data.map(v => v.year).filter(Boolean);
        const mileages = data.map(v => v.mileage).filter(Boolean);

        // Group years with counts
        const yearCounts = {};
        years.forEach(year => {
          yearCounts[year] = (yearCounts[year] || 0) + 1;
        });
        const yearsWithCounts = Object.keys(yearCounts)
          .map(year => ({ year: parseInt(year), count: yearCounts[year] }))
          .sort((a, b) => b.year - a.year); // Newest first

        // Group prices into ranges
        const priceRanges = [
          { label: 'Hasta $20.000.000', min: 0, max: 20000000, count: 0 },
          { label: '$20.000.000 - $40.000.000', min: 20000000, max: 40000000, count: 0 },
          { label: '$40.000.000 - $60.000.000', min: 40000000, max: 60000000, count: 0 },
          { label: '$60.000.000 - $80.000.000', min: 60000000, max: 80000000, count: 0 },
          { label: 'Más de $80.000.000', min: 80000000, max: Infinity, count: 0 },
        ];

        prices.forEach(price => {
          const range = priceRanges.find(r => price >= r.min && price < r.max);
          if (range) range.count++;
        });

        // Group mileages into ranges
        const mileageRanges = [
          { label: 'Hasta 10.000 km', min: 0, max: 10000, count: 0 },
          { label: '10.000 km - 50.000 km', min: 10000, max: 50000, count: 0 },
          { label: '50.000 km - 100.000 km', min: 50000, max: 100000, count: 0 },
          { label: '100.000 km - 150.000 km', min: 100000, max: 150000, count: 0 },
          { label: 'Más de 150.000 km', min: 150000, max: Infinity, count: 0 },
        ];

        mileages.forEach(mileage => {
          const range = mileageRanges.find(r => mileage >= r.min && mileage < r.max);
          if (range) range.count++;
        });

        setFilterOptions({
          brands,
          locations,
          years: yearsWithCounts,
          prices: priceRanges.filter(r => r.count > 0),
          mileages: mileageRanges.filter(r => r.count > 0),
          minPrice: prices.length > 0 ? Math.min(...prices) : 0,
          maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
          minYear: years.length > 0 ? Math.min(...years) : 0,
          maxYear: years.length > 0 ? Math.max(...years) : 0,
          minMileage: mileages.length > 0 ? Math.min(...mileages) : 0,
          maxMileage: mileages.length > 0 ? Math.max(...mileages) : 0,
        });
      }
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

  const filteredVehicles = vehicles.filter(vehicle => {
    return (
      (!filters.brand || vehicle.brand.toLowerCase().includes(filters.brand.toLowerCase())) &&
      (!filters.model || vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) &&
      (!filters.minPrice || vehicle.price >= parseInt(filters.minPrice)) &&
      (!filters.maxPrice || vehicle.price <= parseInt(filters.maxPrice)) &&
      (!filters.location || vehicle.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.transmission || vehicle.transmission === filters.transmission) &&
      (!filters.fuel_type || vehicle.fuel_type === filters.fuel_type) &&
      (!filters.year_min || vehicle.year >= parseInt(filters.year_min)) &&
      (!filters.year_max || vehicle.year <= parseInt(filters.year_max)) &&
      (!filters.mileage_min || vehicle.mileage >= parseInt(filters.mileage_min)) &&
      (!filters.mileage_max || vehicle.mileage <= parseInt(filters.mileage_max))
    );
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  const services = [
    {
      title: "Registro de Vehículos",
      description: "Registro completo de vehículos nuevos y usados con toda la documentación requerida.",
      icon: "📄",
      details: ["Registro inicial", "Actualización de datos", "Certificación de propiedad"]
    },
    {
      title: "Transferencia de Propiedad",
      description: "Transferencia rápida y segura de propiedad con verificación completa de documentos.",
      icon: "🔄",
      details: ["Verificación de documentos", "Tramite ante tránsito", "Entrega inmediata"]
    },
    {
      title: "SOAT y Seguros",
      description: "Renovación y expedición de SOAT con las mejores aseguradoras del mercado.",
      icon: "📋",
      details: ["Cotización automática", "Pago en línea", "Entrega digital"]
    },
    {
      title: "Licencias de Conducir",
      description: "Expedición de licencias de conducción para todo tipo de vehículo.",
      icon: "🚦",
      details: ["Examen teórico", "Examen práctico", "Licencias especiales"]
    },
    {
      title: "Revisión Técnico Mecánica",
      description: "Revisión técnico mecánica completa en centros autorizados.",
      icon: "🔧",
      details: ["Inspección visual", "Pruebas de emisiones", "Certificación oficial"]
    },
    {
      title: "Trámites de Importación",
      description: "Asesoría completa para importación de vehículos desde el exterior.",
      icon: "✈️",
      details: ["Documentación aduanera", "Homologación", "Registro nacional"]
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(services.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(services.length / 3)) % Math.ceil(services.length / 3));
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">

      {/* Services Carousel Section */}
      <section className="bg-white py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Servicios de Tránsito
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Te ayudamos con todos los trámites necesarios para tu vehículo en Manizales y toda Colombia
            </p>
          </div>

          {/* Services Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: Math.ceil(services.length / 3) }, (_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                      {services.slice(slideIndex * 3, (slideIndex + 1) * 3).map((service, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200"
                        >
                          <div className="text-center mb-4">
                            <div className="text-5xl mb-3">{service.icon}</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {service.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {service.description}
                            </p>
                          </div>
                          <ul className="space-y-2">
                            {service.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-center text-sm text-gray-700">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 flex-shrink-0"></span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
              style={{ left: '-20px' }}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
              style={{ right: '-20px' }}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.ceil(services.length / 3) }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    index === currentSlide ? 'bg-gray-800' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar Filters */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Filtros</h3>

                {/* Search by Brand/Model */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar por marca o modelo</label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="Ej: Toyota Corolla"
                    value={filters.brand}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
                  />
                </div>

                {/* Location */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
                  >
                    <option value="">Todas las ubicaciones</option>
                    {filterOptions.locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Price Ranges with counts */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Precio</label>
                  <div className="space-y-2">
                    {filterOptions.prices.map((range, index) => (
                      <label key={index} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="price_range"
                            checked={
                              (range.min === 0 && filters.minPrice === '' && filters.maxPrice === '') ||
                              (filters.minPrice === range.min.toString() && filters.maxPrice === (range.max === Infinity ? '' : range.max.toString()))
                            }
                            onChange={() => {
                              setFilters({
                                ...filters,
                                minPrice: range.min === 0 ? '' : range.min.toString(),
                                maxPrice: range.max === Infinity ? '' : range.max.toString()
                              });
                            }}
                            className="text-gray-600 focus:ring-gray-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                        </div>
                        <span className="text-xs text-gray-500">({range.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                  <select
                    name="brand_dropdown"
                    value={filters.brand_dropdown || ''}
                    onChange={(e) => {
                      setFilters({...filters, brand_dropdown: e.target.value, brand: e.target.value});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
                  >
                    <option value="">Todas las marcas</option>
                    {filterOptions.brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Years with counts */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Año</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filterOptions.years.map(({ year, count }) => (
                      <label key={year} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.year_min <= year && filters.year_max >= year}
                            onChange={() => {
                              // For simplicity, we'll toggle year ranges
                              if (filters.year_min === year && filters.year_max === year) {
                                setFilters({...filters, year_min: '', year_max: ''});
                              } else {
                                setFilters({...filters, year_min: year, year_max: year});
                              }
                            }}
                            className="text-gray-600 focus:ring-gray-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{year}</span>
                        </div>
                        <span className="text-xs text-gray-500">({count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transmisión</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="transmission"
                        value=""
                        checked={filters.transmission === ''}
                        onChange={handleFilterChange}
                        className="text-gray-600 focus:ring-gray-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Cualquiera</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="transmission"
                        value="manual"
                        checked={filters.transmission === 'manual'}
                        onChange={handleFilterChange}
                        className="text-gray-600 focus:ring-gray-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Manual</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="transmission"
                        value="automatic"
                        checked={filters.transmission === 'automatic'}
                        onChange={handleFilterChange}
                        className="text-gray-600 focus:ring-gray-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Automática</span>
                    </label>
                  </div>
                </div>

                {/* Fuel Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de combustible</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="fuel_type"
                        value=""
                        checked={filters.fuel_type === ''}
                        onChange={handleFilterChange}
                        className="text-gray-600 focus:ring-gray-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Cualquiera</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="fuel_type"
                        value="gasolina"
                        checked={filters.fuel_type === 'gasolina'}
                        onChange={handleFilterChange}
                        className="text-gray-600 focus:ring-gray-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Gasolina</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="fuel_type"
                        value="diesel"
                        checked={filters.fuel_type === 'diesel'}
                        onChange={handleFilterChange}
                        className="text-gray-600 focus:ring-gray-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Diésel</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="fuel_type"
                        value="electric"
                        checked={filters.fuel_type === 'electric'}
                        onChange={handleFilterChange}
                        className="text-gray-600 focus:ring-gray-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Eléctrico</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="fuel_type"
                        value="hybrid"
                        checked={filters.fuel_type === 'hybrid'}
                        onChange={handleFilterChange}
                        className="text-gray-600 focus:ring-gray-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Híbrido</span>
                    </label>
                  </div>
                </div>

                {/* Mileage Ranges with counts */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Kilometraje</label>
                  <div className="space-y-2">
                    {filterOptions.mileages.map((range, index) => (
                      <label key={index} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="mileage_range"
                            checked={
                              (range.min === 0 && filters.mileage_min === '' && filters.mileage_max === '') ||
                              (filters.mileage_min === range.min.toString() && filters.mileage_max === (range.max === Infinity ? '' : range.max.toString()))
                            }
                            onChange={() => {
                              setFilters({
                                ...filters,
                                mileage_min: range.min === 0 ? '' : range.min.toString(),
                                mileage_max: range.max === Infinity ? '' : range.max.toString()
                              });
                            }}
                            className="text-gray-600 focus:ring-gray-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                        </div>
                        <span className="text-xs text-gray-500">({range.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setFilters({
                    brand: '', model: '', minPrice: '', maxPrice: '', location: '',
                    transmission: '', fuel_type: '', year_min: '', year_max: '',
                    mileage_min: '', mileage_max: '', condition: '', body_type: '',
                    doors: '', color: ''
                  })}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </aside>

            {/* Vehicles Grid */}
            <main className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Vehículos en venta ({filteredVehicles.length})
                </h2>
                <div className="flex items-center gap-4">
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500">
                    <option>Más relevantes</option>
                    <option>Menor precio</option>
                    <option>Mayor precio</option>
                    <option>Más nuevos</option>
                    <option>Menos km</option>
                  </select>
                  <Link
                    to="/vehicles"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver todos
                  </Link>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No se encontraron vehículos con los filtros aplicados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVehicles.map((vehicle) => (
                    <Link
                      key={vehicle.id}
                      to={`/vehicles/${vehicle.id}`}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
                    >
                      <div className="relative">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <img
                            src={vehicle.images[0]}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-3xl">🚗</span>
                          </div>
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
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Categories/Quick Links */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Buscar por tipo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left">
              <div className="text-2xl mb-2">🚗</div>
              <div className="font-medium text-gray-900">Autos</div>
              <div className="text-sm text-gray-600">Sedanes y hatchbacks</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left">
              <div className="text-2xl mb-2">🚙</div>
              <div className="font-medium text-gray-900">SUVs</div>
              <div className="text-sm text-gray-600">Todo terreno</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left">
              <div className="text-2xl mb-2">🏍️</div>
              <div className="font-medium text-gray-900">Motos</div>
              <div className="text-sm text-gray-600">Deportivas y urbanas</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left">
              <div className="text-2xl mb-2">🚛</div>
              <div className="font-medium text-gray-900">Camiones</div>
              <div className="text-sm text-gray-600">Carga y trabajo</div>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VehicleCard from '../components/VehicleCard';
import ServicesSection from '../components/ServicesSection';
import AboutUsSection from '../components/AboutUsSection';
import ScrollToTopButton from '../components/ScrollToTopButton';

const Home = () => {
  const { runQuery } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
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
      const { data, error } = await runQuery((s) =>
        s
          .from('vehicles')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(50)
      );

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

  const [currentSlide, setCurrentSlide] = useState(0);

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 6);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 6) % 6);
  };


  const testimonials = [
  {
    name: "Carlos Ramírez",
    role: "Comprador de Vehículo",
    product: "car-purchase",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop&auto=format&q=80",
    text: "Compré mi auto usado con total confianza. El proceso fue transparente y me ayudaron con toda la documentación.",
  },
  {
    name: "Laura Martínez",
    role: "Vendedora de Auto",
    product: "car-sale",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=400&fit=crop&auto=format&q=80",
    text: "Vendí mi carro en tiempo récord. La plataforma me conectó con compradores serios y el pago fue seguro.",
  },
  {
    name: "Roberto Silva",
    role: "Cliente de Traspaso",
    product: "transit-service",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop&auto=format&q=80",
    text: "El servicio de traspaso fue excelente. Se encargaron de todo el papeleo y lo resolvieron en días.",
  },
]


  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-100">

      {/* Modern Services Carousel Section */}
      <section className="relative h-[350px] flex items-center overflow-hidden bg-gray-100">
        {/* Fondo animado */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out transform scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=600&fit=crop&auto=format&q=80')`,
              filter: 'grayscale(60%) contrast(1) brightness(1)'
            }}
          ></div>

          {/* 🔹 Capa de difuminado general sobre el fondo */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-gray-50/30 to-transparent"></div>
        </div>

        {/* Contenido principal con blur suave */}
        <div className="relative z-10 w-full">
          <div className="max-w-5xl mx-auto px-4">
            <div className="relative">
              {/* 🔹 Cuadro principal con efecto “vidrio difuminado” */}
              <div className="backdrop-blur-md bg-white/25 rounded-2xl border border-white/30 shadow-2xl overflow-hidden">
                <div
                  className="flex transition-transform duration-1000 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {[
                    {
                      title: "Registro de Vehículos",
                      description: "Registro completo de vehículos nuevos y usados con toda la documentación requerida.",
                      details: ["Registro inicial", "Actualización de datos", "Certificación de propiedad"],
                    },
                    {
                      title: "Transferencia de Propiedad",
                      description: "Transferencia rápida y segura de propiedad con verificación completa de documentos.",
                      details: ["Verificación de documentos", "Tramite ante tránsito", "Entrega inmediata"],
                    },
                    {
                      title: "SOAT y Seguros",
                      description: "Renovación y expedición de SOAT con las mejores aseguradoras del mercado.",
                      details: ["Cotización automática", "Pago en línea", "Entrega digital"],
                    },
                    {
                      title: "Licencias de Conducir",
                      description: "Expedición de licencias de conducción para todo tipo de vehículo.",
                      details: ["Examen teórico", "Examen práctico", "Licencias especiales"],
                    },
                    {
                      title: "Revisión Técnico Mecánica",
                      description: "Revisión técnico mecánica completa en centros autorizados.",
                      details: ["Inspección visual", "Pruebas de emisiones", "Certificación oficial"],
                    },
                    {
                      title: "Trámites de Importación",
                      description: "Asesoría completa para importación de vehículos desde el exterior.",
                      details: ["Documentación aduanera", "Homologación", "Registro nacional"],
                    },
                  ].map((service, index) => (
                    <div key={index} className="w-full flex-shrink-0 p-5">
                      <div className="text-center">
                        {/* Icono */}
                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/25 backdrop-blur-sm border border-white/30 mb-3">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>

                        {/* Título */}
                        <h3 className="text-lg md:text-2xl font-bold text-white mb-2 drop-shadow-md">
                          {service.title}
                        </h3>

                        {/* Descripción */}
                        <p className="text-gray-100 text-xs md:text-sm leading-relaxed mb-4 max-w-md mx-auto opacity-90">
                          {service.description}
                        </p>

                        {/* Detalles */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {service.details.map((detail, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-center gap-2 text-gray-100 text-xs font-medium bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20 hover:bg-white/25 transition-all duration-300"
                            >
                              <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse"></span>
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de navegación */}
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300"
                aria-label="Anterior"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300"
                aria-label="Siguiente"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Indicadores */}
              <div className="flex justify-center gap-1.5 mt-4">
                {[
                  {
                    title: "Registro de Vehículos",
                    description: "Registro completo de vehículos nuevos y usados con toda la documentación requerida.",
                    details: ["Registro inicial", "Actualización de datos", "Certificación de propiedad"],
                  },
                  {
                    title: "Transferencia de Propiedad",
                    description: "Transferencia rápida y segura de propiedad con verificación completa de documentos.",
                    details: ["Verificación de documentos", "Tramite ante tránsito", "Entrega inmediata"],
                  },
                  {
                    title: "SOAT y Seguros",
                    description: "Renovación y expedición de SOAT con las mejores aseguradoras del mercado.",
                    details: ["Cotización automática", "Pago en línea", "Entrega digital"],
                  },
                  {
                    title: "Licencias de Conducir",
                    description: "Expedición de licencias de conducción para todo tipo de vehículo.",
                    details: ["Examen teórico", "Examen práctico", "Licencias especiales"],
                  },
                  {
                    title: "Revisión Técnico Mecánica",
                    description: "Revisión técnico mecánica completa en centros autorizados.",
                    details: ["Inspección visual", "Pruebas de emisiones", "Certificación oficial"],
                  },
                  {
                    title: "Trámites de Importación",
                    description: "Asesoría completa para importación de vehículos desde el exterior.",
                    details: ["Documentación aduanera", "Homologación", "Registro nacional"],
                  },
                ].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 ${index === currentSlide
                      ? 'w-7 h-1.5 bg-white rounded-full shadow-md'
                      : 'w-1.5 h-1.5 bg-white/50 rounded-full hover:bg-white/80 hover:scale-125'
                      }`}
                    aria-label={`Ir a slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar Filters */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 lg:justify-start">
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
                      setFilters({ ...filters, brand_dropdown: e.target.value, brand: e.target.value });
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
                                setFilters({ ...filters, year_min: '', year_max: '' });
                              } else {
                                setFilters({ ...filters, year_min: year, year_max: year });
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
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <div id="services">
        <ServicesSection />
      </div>

      {/* About Us Section */}
      <AboutUsSection />

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 bg-gray-50">
        <div className="w-full px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Testimonios de Clientes</h2>
            <p className="text-base text-gray-600">Lo que dicen nuestros clientes</p>
          </div>

          <div className="relative overflow-hidden">
            <style>{`
              @keyframes scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-scroll {
                animation: scroll 15s linear infinite;
              }
            `}</style>
            <div className="flex gap-6 animate-scroll">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div key={index} className="group relative flex-shrink-0 w-[500px]">
                  <div className="flex items-center gap-4">
                    {/* Image with background square - more compact */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-gray-300 rounded-2xl transition-all duration-300 ease-out group-hover:rotate-6 group-hover:scale-110 group-hover:bg-gray-400" />

                      <div className="relative z-10 w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-1 group-hover:rotate-3">
                        <img
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.product}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="relative bg-white rounded-2xl p-5 shadow-lg border-3 border-gray-300 transition-all duration-300 ease-out group-hover:scale-105 group-hover:-rotate-1 group-hover:shadow-xl group-hover:border-gray-400 flex-1">
                      {/* Quote icon - smaller */}
                      <div className="text-gray-400 mb-2 transition-all duration-300 group-hover:text-gray-600 group-hover:scale-110">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                        </svg>
                      </div>

                      {/* Testimonial text - more compact */}
                      <p className="text-gray-700 text-sm leading-relaxed mb-3 italic">{testimonial.text}</p>

                      {/* Author info - compact */}
                      <div className="border-t border-gray-200 pt-2">
                        <h4 className="font-bold text-gray-900 text-base mb-0.5">{testimonial.name}</h4>
                        <p className="text-gray-600 text-xs">{testimonial.role}</p>
                      </div>

                      {/* Stars - smaller */}
                      <div className="flex gap-0.5 mt-2 text-gray-400 transition-all duration-300 group-hover:text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">CarCompraVenta</h3>
              <p className="text-sm">Tu plataforma confiable para comprar y vender vehículos en Colombia.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Inicio</a></li>
                <li><a href="#" className="hover:text-white">Vehículos</a></li>
                <li><a href="#" className="hover:text-white">Vendedores</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={scrollToServices} className="hover:text-white text-left">Traspaso</button></li>
                <li><button onClick={scrollToServices} className="hover:text-white text-left">Levantamiento de Prenda</button></li>
                <li><button onClick={scrollToServices} className="hover:text-white text-left">Inscripción de Prenda</button></li>
                <li><button onClick={scrollToServices} className="hover:text-white text-left">Radicación de Cuenta</button></li>
                <li><button onClick={scrollToServices} className="hover:text-white text-left">Traslados</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => {
                  const aboutSection = document.getElementById('about');
                  if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }} className="hover:text-white text-left">Sobre Nosotros</button></li>
                <li><a href="#testimonials" className="hover:text-white">Testimonios</a></li>
                <li><a href="#contact" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <p className="text-sm">Email: info@carcompraventa.com</p>
              <p className="text-sm">Tel: +57 123 456 7890</p>
              <p className="text-sm">Bogotá, Colombia</p>
            </div>
          </div>
          <div id="contact" className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 CarCompraVenta. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />

    </div>
  );
};

export default Home;

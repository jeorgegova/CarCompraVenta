import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import VehicleCard from '../components/VehicleCard';
import ServicesSection from '../components/ServicesSection';
import AboutUsSection from '../components/AboutUsSection';
import ScrollToTopButton from '../components/ScrollToTopButton';
import compraVehiculo from '../assets/compraVehiculo.mp4';
import compraVehiculo1 from '../assets/compraVehiculo.webp';

const ITEMS_PER_PAGE = 12;

const Home = () => {
  const { runQuery } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [modalAnimation, setModalAnimation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
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
    selectedYears: [],
    selectedPriceRange: null,
    selectedMileageRange: null,
    condition: '',
    body_type: '',
    doors: '',
    color: '',
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [sortBy, setSortBy] = useState('recent'); // recent, price_asc, price_desc, mileage_asc

  // Debounce filters to reduce Supabase traffic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const images = [
    compraVehiculo1,
    /* 'https://i.imgur.com/iuAVa9B.png', */
  ];

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Funciones para abrir/cerrar modal con animación
  const openFiltersModal = () => {
    setShowFiltersModal(true);
    // Activar animación después de un pequeño delay
    setTimeout(() => setModalAnimation(true), 10);
  };

  const closeFiltersModal = () => {
    setModalAnimation(false);
    // Cerrar después de que termine la animación
    setTimeout(() => setShowFiltersModal(false), 300);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = useCallback(() => {
    return (
      filters.brand !== '' ||
      filters.location !== '' ||
      filters.transmission !== '' ||
      filters.fuel_type !== '' ||
      filters.selectedYears.length > 0 ||
      filters.selectedPriceRange !== null ||
      filters.selectedMileageRange !== null
    );
  }, [filters]);

  // fetchTotalCount removed - integrated into fetchVehicles

  // Obtener vehículos paginados desde Supabase
  const fetchVehicles = useCallback(async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await runQuery((s) => {
        let q = s
          .from('vehicles')
          .select('*', { count: 'exact' }) // Get count and data in one request
          .eq('status', 'approved')
          .range(from, to);

        // Aplicar ordenamiento
        switch (sortBy) {
          case 'price_asc':
            q = q.order('price', { ascending: true });
            break;
          case 'price_desc':
            q = q.order('price', { ascending: false });
            break;
          case 'mileage_asc':
            q = q.order('mileage', { ascending: true });
            break;
          case 'mileage_desc':
            q = q.order('mileage', { ascending: false });
            break;
          case 'year_desc':
            q = q.order('year', { ascending: false });
            break;
          case 'year_asc':
            q = q.order('year', { ascending: true });
            break;
          default:
            q = q.order('created_at', { ascending: false });
        }

        if (debouncedFilters.brand) {
          q = q.or(`brand.ilike.%${debouncedFilters.brand}%,model.ilike.%${debouncedFilters.brand}%`);
        }
        if (debouncedFilters.model) q = q.ilike('model', `%${debouncedFilters.model}%`);
        if (debouncedFilters.location) q = q.ilike('location', `%${debouncedFilters.location}%`);
        if (debouncedFilters.transmission) q = q.eq('transmission', debouncedFilters.transmission);
        if (debouncedFilters.fuel_type) q = q.eq('fuel_type', debouncedFilters.fuel_type);

        // Años múltiples
        if (debouncedFilters.selectedYears.length > 0) {
          q = q.in('year', debouncedFilters.selectedYears);
        }

        // Precio range
        if (debouncedFilters.selectedPriceRange !== null) {
          if (debouncedFilters.selectedPriceRange.min > 0) {
            q = q.gte('price', debouncedFilters.selectedPriceRange.min);
          }
          if (debouncedFilters.selectedPriceRange.max !== Infinity) {
            q = q.lte('price', debouncedFilters.selectedPriceRange.max);
          }
        } else {
          if (debouncedFilters.minPrice) q = q.gte('price', debouncedFilters.minPrice);
          if (debouncedFilters.maxPrice) q = q.lte('price', debouncedFilters.maxPrice);
        }

        // Kilometraje range
        if (debouncedFilters.selectedMileageRange !== null) {
          if (debouncedFilters.selectedMileageRange.min > 0) {
            q = q.gte('mileage', debouncedFilters.selectedMileageRange.min);
          }
          if (debouncedFilters.selectedMileageRange.max !== Infinity) {
            q = q.lte('mileage', debouncedFilters.selectedMileageRange.max);
          }
        } else {
          if (debouncedFilters.mileage_min) q = q.gte('mileage', debouncedFilters.mileage_min);
          if (debouncedFilters.mileage_max) q = q.lte('mileage', debouncedFilters.mileage_max);
        }

        return q;
      });

      if (error) throw error;

      setTotalCount(count || 0); // Update total count from unified query

      if (append) {
        setVehicles((prev) => [...prev, ...(data || [])]);
      } else {
        setVehicles(data || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      if (!append) setVehicles([]);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [runQuery, debouncedFilters, sortBy]);

  // Cargar opciones de filtros con contadores desde Supabase
  const fetchFilterOptions = useCallback(async () => {
    try {
      // Intentar cargar desde localStorage primero
      const cachedData = localStorage.getItem('filterOptionsCache');
      if (cachedData) {
        const { timestamp, options } = JSON.parse(cachedData);
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - timestamp < oneHour) {
          console.log('Using cached filter options');
          setFilterOptions(options);
          return;
        }
      }

      console.log('Fetching fresh filter options');
      // fetch only necessary columns for filter metadata
      const { data, error } = await runQuery((s) =>
        s.from('vehicles').select('brand, location, year, price, mileage').eq('status', 'approved')
      );

      if (error) throw error;

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
          .sort((a, b) => b.year - a.year);

        // Group prices into ranges
        const priceRanges = [
          { label: 'Todos', min: 0, max: Infinity, count: prices.length },
          { label: 'Hasta $20.000.000', min: 0, max: 20000000, count: 0 },
          { label: '$20.000.000 - $40.000.000', min: 20000000, max: 40000000, count: 0 },
          { label: '$40.000.000 - $60.000.000', min: 40000000, max: 60000000, count: 0 },
          { label: '$60.000.000 - $80.000.000', min: 60000000, max: 80000000, count: 0 },
          { label: 'Más de $80.000.000', min: 80000000, max: Infinity, count: 0 },
        ];

        // Contar vehículos por rango
        prices.forEach(price => {
          const range = priceRanges.find(r => r.label !== 'Todos' && price >= r.min && price < r.max);
          if (range) range.count++;
        });

        // Group mileages into ranges
        const mileageRanges = [
          { label: 'Todos', min: 0, max: Infinity, count: mileages.length },
          { label: 'Hasta 10.000 km', min: 0, max: 10000, count: 0 },
          { label: '10.000 km - 50.000 km', min: 10000, max: 50000, count: 0 },
          { label: '50.000 km - 100.000 km', min: 50000, max: 100000, count: 0 },
          { label: '100.000 km - 150.000 km', min: 100000, max: 150000, count: 0 },
          { label: 'Más de 150.000 km', min: 150000, max: Infinity, count: 0 },
        ];

        // Contar vehículos por rango
        mileages.forEach(mileage => {
          const range = mileageRanges.find(r => r.label !== 'Todos' && mileage >= r.min && mileage < r.max);
          if (range) range.count++;
        });

        const newOptions = {
          brands,
          locations,
          years: yearsWithCounts,
          prices: priceRanges,
          mileages: mileageRanges,
          minPrice: prices.length > 0 ? Math.min(...prices) : 0,
          maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
          minYear: years.length > 0 ? Math.min(...years) : 0,
          maxYear: years.length > 0 ? Math.max(...years) : 0,
          minMileage: mileages.length > 0 ? Math.min(...mileages) : 0,
          maxMileage: mileages.length > 0 ? Math.max(...mileages) : 0,
        };

        setFilterOptions(newOptions);

        // Guardar en caché
        localStorage.setItem('filterOptionsCache', JSON.stringify({
          timestamp: Date.now(),
          options: newOptions
        }));
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, [runQuery]);

  // Cargar más vehículos (modo móvil)
  const loadMore = () => {
    fetchVehicles(currentPage + 1, true);
    setCurrentPage((prev) => prev + 1);
  };

  // Cambiar de página (modo desktop)
  const goToPage = (page) => {
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchVehicles(page, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generar páginas para mostrar
  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  // Inicializar datos
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchVehicles(1, false);
  }, [fetchVehicles]);

  // Slider
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearTimeout(timeout);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
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
  ];

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <>
      <Helmet>
        <title>Conecta Car - Compra y Venta de Vehículos en Colombia</title>
        <meta name="description" content="Plataforma confiable para compra y venta de vehículos en Colombia. Servicios de traspaso, levantamiento de prenda y más. Acompañamiento personalizado." />
        <meta name="keywords" content="compra venta carros, vehículos usados Colombia, traspaso vehicular, levantamiento prenda, conecta car" />
        <meta property="og:title" content="Conecta Car - Compra y Venta de Vehículos" />
        <meta property="og:description" content="Tu plataforma confiable para comprar y vender vehículos en Colombia con servicios completos de tránsito." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Conecta Car - Compra y Venta de Vehículos" />
        <meta name="twitter:description" content="Tu plataforma confiable para comprar y vender vehículos en Colombia con servicios completos de tránsito." />
        <meta name="twitter:image" content="/logo.png" />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Conecta Car",
            url: "https://conectacar.com",
            logo: "https://conectacar.com/logo.png",
            description: "Plataforma para compra y venta de vehículos en Colombia",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+57-300-620-5493",
              contactType: "customer service",
              areaServed: "CO",
              availableLanguage: "es"
            }
          })}
        </script>
      </Helmet>
      <div className="min-h-screen font-sans text-gray-900 bg-gray-100">

        {/* Modern Services Carousel Section */}
        <section className="relative h-[300px] sm:h-[400px] flex items-center overflow-hidden bg-gray-100">
          <div className="relative z-10 w-full h-full">
            <div className="w-full h-full relative overflow-hidden">
              <div className="flex transition-transform duration-1000 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {images.map((item, index) => (
                  <div key={index} className="w-full flex-shrink-0 h-full">
                    {typeof item === 'string' && (item.includes('.mp4') || item.includes('.webp')) ? (
                      <div className="relative w-full h-full">
                        {item.includes('webp') ? (
                          <img src={item} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <video src={item} className="w-full h-full object-cover" autoPlay muted loop />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="text-center text-white">
                            <h1 className="text-3xl md:text-5xl font-extrabold mb-2 drop-shadow-2xl">
                              Compra y Venta de Vehículos
                            </h1>
                            <p className="text-lg md:text-xl font-light opacity-90 drop-shadow-lg">
                              Acompañamiento Personalizado entre Comprador y Vendedor
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img src={item} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de navegación */}
            {images.length > 1 &&
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300"
                  aria-label="Anterior"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300"
                  aria-label="Siguiente"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center gap-1.5">
                  {images.map((_, index) => (
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
              </>
            }
          </div>
        </section>

        {/* Main Content with Sidebar Filters */}
        <section className="py-8 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8 lg:justify-start">
              {/* Sidebar Filters - Desktop Only */}
              {!isMobile && (
                <aside className="lg:w-80 flex-shrink-0">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                    <FiltersContent
                      filters={filters}
                      setFilters={setFilters}
                      filterOptions={filterOptions}
                      isMobile={false}
                      onClose={() => { }}
                    />
                  </div>
                </aside>
              )}

              {/* Vehicles Grid */}
              <main className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Vehículos en venta ({totalCount > 0 ? totalCount : '0'})
                  </h2>

                  {/* Mobile: Search input, sort selector and filter button */}
                  {isMobile && (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          name="brand"
                          placeholder="Buscar por marca o modelo..."
                          value={filters.brand}
                          onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          fetchVehicles(1, false);
                        }}
                        className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <option value="recent">Más recientes</option>
                        <option value="price_asc">Menor precio</option>
                        <option value="price_desc">Mayor precio</option>
                        <option value="mileage_asc">Menos km</option>
                      </select>
                      <button
                        onClick={openFiltersModal}
                        className={`relative p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${hasActiveFilters() ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        {/* Badge con cantidad de filtros activos */}
                        <span className={`absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center font-medium ${hasActiveFilters() ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {hasActiveFilters() ?
                            filters.selectedYears.length +
                            (filters.selectedPriceRange !== null ? 1 : 0) +
                            (filters.selectedMileageRange !== null ? 1 : 0) +
                            (filters.location ? 1 : 0) +
                            (filters.transmission ? 1 : 0) +
                            (filters.fuel_type ? 1 : 0) :
                            '0'}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Desktop: Sort dropdown */}
                  {!isMobile && (
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        fetchVehicles(1, false);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                    >
                      <option value="recent">Más recientes</option>
                      <option value="price_asc">Menor precio</option>
                      <option value="price_desc">Mayor precio</option>
                      <option value="mileage_asc">Menos km</option>
                    </select>
                  )}
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No se encontraron vehículos con los filtros aplicados.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vehicles.map((vehicle) => (
                        <VehicleCard key={vehicle.id} vehicle={vehicle} />
                      ))}
                    </div>

                    {/* Pagination - Desktop with circles */}
                    {!isMobile && totalPages > 1 && (
                      <div className="mt-8">
                        <div className="flex justify-center items-center gap-2">
                          {/* Previous button */}
                          <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>

                          {/* Page circles */}
                          {getPageNumbers().map((page) => (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${currentPage === page
                                ? 'bg-gray-900 text-white'
                                : 'border-2 border-gray-300 hover:border-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              {page}
                            </button>
                          ))}

                          {/* Next button */}
                          <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>

                        <p className="text-center text-sm text-gray-600 mt-4">
                          Página {currentPage} de {totalPages}
                        </p>
                      </div>
                    )}

                    {/* Load More button - Mobile */}
                    {isMobile && currentPage < totalPages && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={loadMore}
                          disabled={loadingMore}
                          className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingMore ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Cargando...
                            </span>
                          ) : (
                            `Cargar más vehículos`
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </main>
            </div>
          </div>
        </section>

        {/* Filters Modal - Mobile */}
        {showFiltersModal && (
          <>
            <div
              className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${modalAnimation ? 'opacity-100' : 'opacity-0'}`}
              onClick={closeFiltersModal}
            />
            <div className={`fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:top-1/2 sm:-translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2 transform transition-transform duration-300 ease-out ${modalAnimation ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:scale-95 opacity-0'}`}>
              <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl transform transition-transform duration-300 ease-out">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between rounded-t-3xl">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">Filtros</h3>
                    {hasActiveFilters() && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {filters.selectedYears.length +
                          (filters.selectedPriceRange !== null ? 1 : 0) +
                          (filters.selectedMileageRange !== null ? 1 : 0) +
                          (filters.location ? 1 : 0) +
                          (filters.transmission ? 1 : 0) +
                          (filters.fuel_type ? 1 : 0)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={closeFiltersModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 space-y-6">
                  <FiltersContent
                    filters={filters}
                    setFilters={setFilters}
                    filterOptions={filterOptions}
                    isMobile={true}
                    onClose={closeFiltersModal}
                  />
                </div>
              </div>
            </div>
          </>
        )}

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
                  <div key={index} className="group relative flex-shrink-0 w-[90vw] max-w-[500px]">
                    <div className="flex items-center gap-4">
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
                        <div className="text-gray-400 mb-2 transition-all duration-300 group-hover:text-gray-600 group-hover:scale-110">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                          </svg>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-3 italic">{testimonial.text}</p>
                        <div className="border-t border-gray-200 pt-2">
                          <h4 className="font-bold text-gray-900 text-base mb-0.5">{testimonial.name}</h4>
                          <p className="text-gray-600 text-xs">{testimonial.role}</p>
                        </div>
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
                <h3 className="text-white font-semibold mb-4">ConectaCar</h3>
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
                <p className="text-sm">Email: conectacarcolombia@gmail.com</p>
                <p className="text-sm">Tel: +57 300 620 5493</p>
                <p className="text-sm">Manizales, Caldas Colombia</p>
              </div>
            </div>
            <div id="contact" className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
              <p>&copy; 2026 ConectaCar. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>

        {/* Scroll to Top Button */}
        <ScrollToTopButton />

        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/573006205493?text=Hola,%20requiero%20un%20servicio%20en%20tr%C3%A1nsito.%20%C2%BFMe%20pueden%20ayudar?"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-full shadow-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
          aria-label="Contactar por WhatsApp"
        >
          <div className="relative flex-shrink-0">
            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </svg>
            <span className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></span>
          </div>

          <div className="text-white text-xs font-medium leading-tight">
            <div>¿Servicio en tránsito?</div>
            <div className="font-bold">Nosotros te ayudamos</div>
          </div>
        </a>

      </div>
    </>
  );
};

// Componente de filtros separado para reutilizar
const FiltersContent = ({ filters, setFilters, filterOptions, isMobile, onClose }) => {
  const handleClearFilters = () => {
    setFilters({
      ...filters,
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
      selectedYears: [],
      selectedPriceRange: null,
      selectedMileageRange: null,
    });
    if (isMobile) onClose();
  };

  return (
    <>
      <h3 className="font-semibold text-gray-900 mb-4">Filtros</h3>

      {/* Brand/Model Search - Desktop Version */}
      {!isMobile && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
          <div className="relative">
            <input
              type="text"
              name="brand"
              placeholder="Marca o modelo..."
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
        <select
          name="location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
        >
          <option value="">Todas las ubicaciones</option>
          {filterOptions.locations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-100 my-6"></div>

      {/* Price Ranges with counts and "Todos" */}
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
                    (range.label === 'Todos' && filters.selectedPriceRange === null) ||
                    (filters.selectedPriceRange !== null &&
                      filters.selectedPriceRange.min === range.min &&
                      filters.selectedPriceRange.max === range.max)
                  }
                  onChange={() => {
                    if (range.label === 'Todos') {
                      setFilters({ ...filters, selectedPriceRange: null, minPrice: '', maxPrice: '' });
                    } else {
                      setFilters({
                        ...filters,
                        selectedPriceRange: { min: range.min, max: range.max },
                        minPrice: '',
                        maxPrice: ''
                      });
                    }
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

      <div className="border-t border-gray-100 my-6"></div>

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

      <div className="border-t border-gray-100 my-6"></div>

      {/* Years with counts - Multiple selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Año (puedes seleccionar varios)</label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {filterOptions.years.map(({ year, count }) => (
            <label key={year} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.selectedYears.includes(year)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters({ ...filters, selectedYears: [...filters.selectedYears, year] });
                    } else {
                      setFilters({ ...filters, selectedYears: filters.selectedYears.filter(y => y !== year) });
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

      <div className="border-t border-gray-100 my-6"></div>

      {/* transmission */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Transmisión</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="transmission"
              value=""
              checked={filters.transmission === ''}
              onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
              className="text-gray-600 focus:ring-gray-500"
            />
            <span className="ml-2 text-sm text-gray-700">Automática</span>
          </label>
        </div>
      </div>

      <div className="border-t border-gray-100 my-6"></div>

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
              onChange={(e) => setFilters({ ...filters, fuel_type: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, fuel_type: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, fuel_type: e.target.value })}
              className="text-gray-600 focus:ring-gray-500"
            />
            <span className="ml-2 text-sm text-gray-700">Diéstor</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="fuel_type"
              value="electric"
              checked={filters.fuel_type === 'electric'}
              onChange={(e) => setFilters({ ...filters, fuel_type: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, fuel_type: e.target.value })}
              className="text-gray-600 focus:ring-gray-500"
            />
            <span className="ml-2 text-sm text-gray-700">Híbrido</span>
          </label>
        </div>
      </div>

      <div className="border-t border-gray-100 my-6"></div>

      {/* Mileage Ranges with counts and "Todos" */}
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
                    (range.label === 'Todos' && filters.selectedMileageRange === null) ||
                    (filters.selectedMileageRange !== null &&
                      filters.selectedMileageRange.min === range.min &&
                      filters.selectedMileageRange.max === range.max)
                  }
                  onChange={() => {
                    if (range.label === 'Todos') {
                      setFilters({ ...filters, selectedMileageRange: null, mileage_min: '', mileage_max: '' });
                    } else {
                      setFilters({
                        ...filters,
                        selectedMileageRange: { min: range.min, max: range.max },
                        mileage_min: '',
                        mileage_max: ''
                      });
                    }
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

      {/* Clear Filters - Button on right side (mobile) */}
      <button
        onClick={handleClearFilters}
        className="sm:hidden float-right py-2 px-4 bg-gray-900 text-white text-sm rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Limpiar filtros
      </button>
      {/* Desktop clear filters button */}
      <div className="hidden sm:block">
        <button
          onClick={handleClearFilters}
          className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </>
  );
};

export default Home;

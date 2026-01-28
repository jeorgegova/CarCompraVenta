"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ServicesCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const sectionRef = useRef(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  const services = [
    {
      id: 1,
      title: "Traspaso",
      description: "Servicio completo de traspaso de propiedad con toda la documentación requerida.",
      image: "/vehicle-transfer.jpg",
      color: "from-slate-600 to-slate-400",
      requirements: ["Documento de identidad del vendedor y comprador", "Factura de venta", "SOAT vigente", "Revisión técnico-mecánica"],
      documentation: ["Registro civil de nacimiento", "Certificado de libertad y tradición", "Paz y salvo municipal"],
      cost: "$150,000 COP",
    },
    {
      id: 2,
      title: "Levantamiento de Prenda",
      description: "Liberación de prendas y gravámenes de manera rápida y segura.",
      image: "/lien-release-vehicle.jpg",
      color: "from-slate-500 to-slate-300",
      requirements: ["Documento de identidad del propietario", "Factura de venta o contrato", "Paz y salvo de la entidad financiera"],
      documentation: ["Certificado de levantamiento de prenda", "Registro de propiedad vehicular"],
      cost: "$100,000 COP",
    },
    {
      id: 3,
      title: "Inscripción de Prenda",
      description: "Registro de prendas con total seguridad jurídica.",
      image: "/lien-registration.jpg",
      color: "from-slate-700 to-slate-500",
      requirements: ["Documento de identidad del propietario", "Contrato de prenda", "Factura del vehículo"],
      documentation: ["Registro de inscripción de prenda", "Certificado de tradición"],
      cost: "$120,000 COP",
    },
    {
      id: 4,
      title: "Radicación de Cuenta",
      description: "Apertura de cuentas bancarias para procesos vehiculares.",
      image: "/bank-account-vehicle.jpg",
      color: "from-slate-600 to-slate-400",
      requirements: ["Documento de identidad", "Comprobante de ingresos", "Referencias bancarias"],
      documentation: ["Certificado de apertura de cuenta", "Estado de cuenta inicial"],
      cost: "$50,000 COP",
    },
    {
      id: 5,
      title: "Traslados",
      description: "Servicio de traslado seguro entre diferentes ciudades.",
      image: "/vehicle-transport-service.jpg",
      color: "from-slate-500 to-slate-300",
      requirements: ["Documento de identidad del propietario", "Factura del vehículo", "SOAT y revisión vigente"],
      documentation: ["Contrato de traslado", "Póliza de seguro de transporte"],
      cost: "$200,000 COP (dependiendo de la distancia)",
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % services.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [autoPlay, services.length])

  const handleNext = () => {
    setAutoPlay(false)
    setCurrentSlide((prev) => (prev + 1) % services.length)
  }

  const handlePrev = () => {
    setAutoPlay(false)
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length)
  }

  const goToSlide = (index) => {
    setAutoPlay(false)
    setCurrentSlide(index)
  }

  return (
    <>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(71, 85, 105, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(71, 85, 105, 0.5);
          }
        }

        .carousel-fade-enter {
          animation: fadeInScale 0.8s ease-out;
        }

        .carousel-slide-content {
          animation: slideInUp 0.8s ease-out 0.2s both;
        }

        .indicator-active {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <section
        ref={sectionRef}
        className="relative w-full py-12 sm:py-16 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div
              className={`transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <span className="inline-block text-xs font-semibold text-slate-600 tracking-widest uppercase mb-4 px-4 py-2 bg-slate-100 rounded-full">
                Nuestros Servicios
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 tracking-tight">
                Soluciones{" "}
                <span className="font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  Vehiculares
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
                Experiencia y confianza en cada trámite
              </p>
            </div>
          </div>

          <div
            className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setTimeout(() => setAutoPlay(true), 2000)}
          >
            {/* Main Carousel */}
            <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 mb-12 rounded-3xl overflow-hidden shadow-2xl">
              {services.map((service, idx) => (
                <div
                  key={service.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    idx === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  } ${idx === currentSlide ? "carousel-fade-enter" : ""}`}
                >
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-60 mix-blend-multiply`} />

                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Content Container */}
                  <div
                    className={`absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 lg:p-10 transition-all duration-700 ${
                      idx === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    } carousel-slide-content`}
                  >
                    <div className="max-w-xl">
                      <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">{service.title}</h3>
                      <p className="text-base text-gray-100 font-light mb-6 line-clamp-2">{service.description}</p>
                      <button className="bg-white text-slate-900 px-4 py-1 sm:px-6 sm:py-2 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        Conocer Más
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 md:px-8 pointer-events-none">
                <button
                  onClick={handlePrev}
                  className="pointer-events-auto p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all duration-300 backdrop-blur-md border border-white/20 hover:border-white/40 group"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                </button>

                <button
                  onClick={handleNext}
                  className="pointer-events-auto p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all duration-300 backdrop-blur-md border border-white/20 hover:border-white/40 group"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              {/* Indicators */}
              <div className="flex gap-3">
                {services.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      index === currentSlide
                        ? "w-8 h-2 sm:w-12 sm:h-3 bg-gradient-to-r from-slate-700 to-slate-900 shadow-md indicator-active"
                        : "w-2 h-2 sm:w-3 sm:h-3 bg-gray-300 hover:bg-slate-400"
                    }`}
                    aria-label={`Ir a slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Counter */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-light text-slate-600 tracking-widest">
                  {String(currentSlide + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-20 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-200 rounded-full blur-3xl opacity-20 -z-10" />
      </section>
    </>
  )
}

export default ServicesCarousel

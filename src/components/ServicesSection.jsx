"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, X, FileText, DollarSign, CheckCircle, AlertCircle, MessageCircle } from "lucide-react"

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
      requirements: [
        "Paz y Salvo de impuestos: Estar a paz y salvo de años anteriores y año actual, no requiere copia ni soportes. *No aplica para automotores con cilindraje igual o menor a 125cc.",
        "SOAT y Revisión técnico-mecánica: Debe estar vigente y cargado en RUNT.",
        "Paz y salvo de multas e infracciones de tránsito: El vendedor y el comprador deben estar a paz y salvo de infracciones a nivel local y a nivel nacional.",
        "Inscripción a RUNT: El vendedor y el comprador deben estar inscritos en el sistema nacional RUNT, si no lo están deben acercarse al organismo de tránsito más cercano con el documento de identificación y realizar este proceso."
      ],
      documentation: [
        "Formulario de solicitud trámite. Debe estar completamente diligenciado, legible, sin tachones ni enmendaduras, firmado por el vendedor y el comprador.",
        "Improntas (numeraciones de chasis, serie, motor, vin) sin residuos de papel.",
        "Contrato de compraventa documento o declaración en el que conste la transferencia del derecho de dominio del vehículo, debe estar completamente diligenciado, legible, sin tachones ni enmendaduras, firmado por el vendedor y el comprador, con las improntas adheridas de manera que no afecten la información. (El contrato de compraventa se encuentra al respaldo del formulario).",
        "Este documento puede estar autenticado pero no es indispensable, sólo en casos en que el propietario actual no recuerde la firma que tiene registrada en RUNT, o cuando el funcionario de la Secretaría de Movilidad lo haya requerido.",
        "Copia del documento de identidad del comprador.",
        "Menor de Edad: Si el comprador o vendedor es menor de edad, debe aportar: carta de autorización por parte de uno de los padres o tutor junto con la copia de la cédula de quien autoriza y copia del registro civil.",
        "Empresa: Cuando el comprador o vendedor es una empresa o persona jurídica debe aportar la representación legal (cámara de comercio). La fecha de expedición no puede superar los 30 días respecto a la fecha en que se va a realizar el trámite en el organismo de tránsito.",
        "Si el trámite lo va a legalizar un tercero, éste debe estar previamente inscrito en RUNT y adjuntar poder de autorización del vendedor para legalizar el trámite."
      ],
      cost: "Con certificado de tradición: $224.947 | Sin certificado de tradición: $164.318 (No incluye 1% retención en la fuente)",
      important: "Si el vehículo cuenta con blindaje superior a grado III, deberá aportar resolución expedida por la Superintendencia de Vigilancia y Seguridad a través de la cual se autoriza al nuevo propietario el uso del vehículo blindado."
    },
    {
      id: 2,
      title: "Levantamiento de Prenda",
      description: "Liberación de prendas y gravámenes de manera rápida y segura.",
      image: "/lien-release-vehicle.jpg",
      color: "from-slate-500 to-slate-300",
      requirements: [
        "Si el trámite lo va a legalizar un tercero, éste debe estar previamente inscrito en RUNT y adjuntar poder de autorización para legalizar el trámite.",
        "Tener vigente el seguro obligatorio (soat) y la revisión técnico-mecánica.",
        "Encontrarse a paz y salvo de multas e infracciones de tránsito",
        "Estar inscrito en el RUNT."
      ],
      documentation: ["Formulario de solicitud de trámite: Debe estar completamente diligenciado, legible, sin tachones ni enmendaduras, firmado por el propietario legal del vehículo.",
        "Improntas (numeraciones de chasís, serie, motor, vin) adheridas a la carta de inscripción de prenda o en su defecto al formulario de solicitud de trámite.",
        "Documento de la prenda: Cuando el acreedor prendario es una entidad bancaria o financiera: no se exigirá documento físico suscrito por la entidad prendaria siempre y cuando esté inscrito en el registro de garantías mobiliarias. En caso de no estar registrada la información en el RUNT, deberá aportar la carta de levantamiento de prenda entregada por el acreedor prendario y la representación legal (cámara de comercio o Superintendencia Bancaria) no superior a 30 días. Cuando el acreedor prendario es una persona natural: debe aportar la carta de levantamiento de prenda autenticada por el acreedor prendario con las siguientes características: Placa y características del vehículo, Firma del acreedor prendario u otorgante, Firma del deudor prendario (Deudor propietario)",
      ],
      cost: "Tarifas del trámite (Con certificado de tradición): Carro, moto, motocarro, remolque, maquinaria: $199.032 | Tarifas del trámite (Sin certificado de tradición): Carro, moto, motocarro, remolque, maquinaria: $138.403",
    },
    {
      id: 3,
      title: "Inscripción de Prenda o Pignoración",
      description: "Registro de prendas con total seguridad jurídica.",
      image: "/lien-registration.jpg",
      color: "from-slate-700 to-slate-500",
      requirements: [
        "Tener vigente el seguro obligatorio (SOAT) y la revisión técnico mecánica.",
        "Encontrarse a paz y salvo de multas e infracciones de tránsito.",
        "Estar inscrito en RUNT."
      ],
      documentation: [
        "Formulario de solicitud trámite. Debe estar completamente diligenciado, legible, sin tachones ni enmendaduras, firmado por el propietario legal del vehículo.",
        "Improntas (numeraciones de chasís, serie, motor, vin)",
        "Si el trámite es legalizado por un tercero, éste deberá estar inscrito en RUNT y adjuntar el poder de autorización del propietario legal para realizar el trámite.",
        "Documento de prenda: Cuando el acreedor prendario es una entidad bancaria o financiera: no se exigirá documento físico suscrito por la entidad prendaria siempre y cuando esté inscrito en el registro de garantías mobiliarias. – En caso de no estar registrada la información en el RUNT, deberá aportar la carta de inscripción de prenda entregada por el acreedor prendario y la representación legal no superior a 30 días. Cuando el acreedor prendario es una persona natural: debe aportar la carta de inscripción de prenda con las siguientes características: – Placa y características del vehículo – Monto de la deuda – Vigencia (en tiempo o valores) – Firma del acreedor prendario u otorgante – Firma del deudor prendario (Deudor propietario) – Adicionar fotocopia de la cédula del acreedor prendario u otorgante"
      ],
      cost: "Tarifas del trámite (Con certificado de tradición): Carro, moto, motocarro, remolque, maquinaria: $199.032 | Tarifas del trámite (Sin certificado de tradición): Carro, moto, motocarro, remolque, maquinaria: $138.403",
    },
    {
      id: 4,
      title: "Radicado de Cuenta",
      description: "Inscripción o transferencia de la matrícula vehícular",
      image: "/bank-account-vehicle.jpg",
      color: "from-slate-600 to-slate-400",
      requirements: [
        "Paz y salvo de Impuestos. – Debe estar a paz y salvo de impuestos en años anteriores y el año actual. No requiere copia ni soportes. – Si realizó el pago de la totalidad de los impuestos del vehículo en el organismo de tránsito de origen, se validará la información en el certificado de nueva residencia. * No aplica para motos de 125 cc o menor cilindraje.",
        "Tener vigente el seguro obligatorio (SOAT) y revisión técnico mecánica.",
        "Encontrarse a paz y salvo de multas e infracciones de tránsito.",
        "Estar inscrito en RUNT."
      ],
      documentation: [
        "Si asiste el propietario legal solo deberá presentar su documento original.",
        "Si el trámite lo va a legalizar un tercero, éste debe estar previamente inscrito en RUNT y adjuntar poder de autorización para legalizar el trámite."
      ],
      cost: "Tarifas del trámite (Con certificado de tradición): Carro: $240.114, Moto, motocarro: $148.958 | Tarifas del trámite (Sin certificado de tradición): Carro: $179.485, Moto, motocarro: $88.329",
      important: "Para usted legalizar este trámite en Manizales, cuenta con un plazo de 60 días a partir de la fecha de solicitud de traslado de la carpeta en el organismo de tránsito de origen."
    },
    {
      id: 5,
      title: "Traslados",
      description: "Servicio de traslado seguro entre diferentes ciudades.",
      image: "/vehicle-transport-service.jpg",
      color: "from-slate-500 to-slate-300",
      requirements: [
        "Encontrarse a paz y salvo de impuestos, para vehículos de servicio particular usted puede realizar el pago en la oficina de Rentas Departamentales de la Gobernación de Caldas o en www.caldas.gov.co",
        "Encontrarse a paz y salvo de multas e infracciones de tránsito.",
        "Estar inscrito en RUNT.",
        "Tener SOAT y revisión técnico mecánica vigente."
      ],
      documentation: [
        "El formulario de solicitud trámite. (Dentro del formulario seleccione la casilla: Traslado) Debe estar completamente diligenciado, legible, sin tachones ni enmendaduras, firmado por el propietario legal del vehículo.",
        "Improntas (numeraciones de chasis, serie, motor, vin) adheridas al formulario.",
        "Si el trámite lo va a legalizar un tercero, éste debe estar previamente inscrito en RUNT y adjuntar poder de autorización para legalizar el trámite."
      ],
      cost: "Tarifas del trámite (Con certificado de tradición): Carro, moto, motocarro, remolque, maquinaria: $92.141 | Tarifas del trámite (Sin certificado de tradición): Carro, moto, motocarro, remolque, maquinaria: $31.512",
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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInModal {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-content {
          animation: slideInModal 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-item {
          opacity: 0;
          animation: slideInUp 0.5s ease-out forwards;
        }

        .modal-item:nth-child(1) { animation-delay: 0.1s; }
        .modal-item:nth-child(2) { animation-delay: 0.2s; }
        .modal-item:nth-child(3) { animation-delay: 0.3s; }
        .modal-item:nth-child(4) { animation-delay: 0.4s; }
      `}</style>

      <section
        ref={sectionRef}
        className="relative w-full py-12 sm:py-16 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div
              className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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
                  className={`absolute inset-0 transition-all duration-700 ease-out ${idx === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
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
                    className={`absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 lg:p-10 transition-all duration-700 ${idx === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                      } carousel-slide-content`}
                  >
                    <div className="max-w-xl">
                      <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">{service.title}</h3>
                      <p className="text-base text-gray-100 font-light mb-6 line-clamp-2">{service.description}</p>
                      <button
                        onClick={() => {
                          setSelectedService(service)
                          setIsModalOpen(true)
                        }}
                        className={`bg-white text-slate-900 px-4 py-1 sm:px-6 sm:py-2 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${idx === currentSlide ? "pointer-events-auto" : "pointer-events-none"}`}
                      >
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
                    className={`transition-all duration-300 rounded-full cursor-pointer ${index === currentSlide
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

      {/* MODAL MEJORADO */}
      {isModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden modal-content">
            {/* Header con gradiente mejorado */}
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>

              <div className="relative flex justify-between items-start">
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
                    Servicio Profesional
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-2">{selectedService.title}</h3>
                  <p className="text-base text-gray-200 font-light max-w-2xl">{selectedService.description}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-full w-10 h-10 flex items-center justify-center ml-4 flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content con mejor estructura */}
            <div className="p-6 md:p-8 lg:p-10 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Grid de 2 columnas para mejor organización */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Requisitos */}
                <div className="modal-item">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-blue-500 rounded-lg p-2.5 shadow-sm">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Requisitos</h4>
                    </div>
                    <div className="space-y-3">
                      {selectedService.requirements.map((req, index) => (
                        <div key={index} className="flex gap-3 group">
                          <div className="flex-shrink-0 mt-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:bg-blue-500 transition-colors duration-200"></div>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-sm flex-1">{req}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Documentación */}
                <div className="modal-item">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-purple-500 rounded-lg p-2.5 shadow-sm">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Documentación</h4>
                    </div>
                    <div className="space-y-3">
                      {selectedService.documentation.map((doc, index) => (
                        <div key={index} className="flex gap-3 group">
                          <div className="flex-shrink-0 mt-1.5">
                            <div className="w-2 h-2 rounded-full bg-purple-400 group-hover:bg-purple-500 transition-colors duration-200"></div>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-sm flex-1">{doc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Importante */}
              {selectedService.important && (
                <div className="modal-item mb-6">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="bg-amber-500 rounded-lg p-3 shadow-md flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-amber-900 mb-3">⚠️ Información Importante</h4>
                        <p className="text-amber-800 leading-relaxed">{selectedService.important}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Costo de tránsito movido al final */}
              <div className="modal-item mb-6">
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    <div className="bg-slate-600 rounded-xl p-3 shadow-md">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 w-full">
                      <h4 className="text-lg font-bold text-slate-900 mb-2">Costos de Tránsito</h4>
                      <p className="text-slate-700 leading-relaxed mb-1 text-sm sm:text-base">{selectedService.cost}</p>
                      <p className="text-xs text-slate-500 italic mb-6">* No incluye el costo del servicio de gestoría</p>
                      <a
                        href={`https://wa.me/573006205493?text=Hola,%20quisiera%20obtener%20una%20cotizaci%C3%B3n%20para%20el%20servicio%20de%20${encodeURIComponent(selectedService.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full sm:w-fit items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-4 sm:py-3 rounded-2xl sm:rounded-full transition-all duration-300 font-bold text-sm sm:text-base shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] transform hover:-translate-y-0.5"
                      >
                        <MessageCircle className="w-6 h-6 fill-current flex-shrink-0" />
                        <span>Escríbenos para obtener cotización</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer con acciones */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row gap-6 justify-between items-center text-center md:text-left">
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-500 font-medium italic">
                    ¿Tienes dudas? Contáctanos para más información...
                  </p>
                  <a
                    href={`https://wa.me/573006205493?text=Hola,%20tengo%20algunas%20dudas%20sobre%20el%20servicio%20de%20${encodeURIComponent(selectedService.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-white border-2 border-[#25D366] text-[#128C7E] hover:bg-[#25D366] hover:text-white px-4 py-2 rounded-full transition-all duration-300 text-sm font-bold w-fit mx-auto md:mx-0 shadow-sm hover:shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat WhatsApp
                  </a>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-900 text-white px-10 py-3 rounded-full hover:bg-black transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full md:w-auto"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ServicesCarousel
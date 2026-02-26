import { useState, useEffect } from "react"
import { X, FileCheck, Car, ChevronRight, Calculator } from "lucide-react"

const WelcomeModal = () => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Check if the modal has been shown in the current session
        const hasBeenShown = sessionStorage.getItem("welcomeModalShown")
        if (!hasBeenShown) {
            const timer = setTimeout(() => {
                setIsOpen(true)
            }, 1500) // Show after 1.5 seconds
            return () => clearTimeout(timer)
        }
    }, [])

    const handleClose = () => {
        setIsOpen(false)
        sessionStorage.setItem("welcomeModalShown", "true")
    }

    const handleConoceMas = () => {
        setIsOpen(false)
        sessionStorage.setItem("welcomeModalShown", "true")
        const servicesSection = document.getElementById("services")
        if (servicesSection) {
            // Small delay to allow modal close animation
            setTimeout(() => {
                servicesSection.scrollIntoView({ behavior: "smooth" })
            }, 100)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-out">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full -mr-32 -mt-32 opacity-50 ring-1 ring-slate-200"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-50 rounded-full -ml-24 -mb-24 opacity-50"></div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100/80 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-all duration-200 z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative p-8 md:p-10 flex flex-col items-center text-center">
                    {/* Icon Badge */}
                    <div className="mb-6 relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 group hover:rotate-0 transition-transform duration-300">
                            <FileCheck className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center anim-bounce">
                            <Car className="w-6 h-6 text-slate-700" />
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        ¿Tienes trámites de tránsito{" "}
                        <span className="text-slate-700 relative inline-block">
                            pendientes?
                            <span className="absolute bottom-1 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full"></span>
                        </span>
                    </h2>

                    <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-sm">
                        ¡Nosotros te ayudamos! Realizamos servicios de <span className="font-semibold text-gray-800">traspasos, pignoraciones, traslados</span> y mucho más de forma rápida y segura.
                    </p>

                    <div className="w-full flex flex-col gap-3">
                        <button
                            onClick={handleConoceMas}
                            className="group flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                        >
                            Conocer más servicios
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mt-2">
                            Conecta Car &copy; 2026
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes anim-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .anim-bounce {
          animation: anim-bounce 2s infinite ease-in-out;
        }
      `}</style>
        </div>
    )
}

export default WelcomeModal

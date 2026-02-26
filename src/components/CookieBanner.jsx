import { useState, useEffect } from "react"
import { X, Cookie, ShieldCheck } from "lucide-react"

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const hasSeen = sessionStorage.getItem("cookieConsentSeen")
        if (!hasSeen) {
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, 1200)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        setIsVisible(false)
        sessionStorage.setItem("cookieConsentSeen", "true")
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-[100] animate-in slide-in-from-bottom-5 duration-500 ease-out">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 md:p-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-slate-100 p-2.5 rounded-xl flex-shrink-0">
                            <Cookie className="w-6 h-6 text-slate-700" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                                Uso de Cookies
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                Utilizamos cookies para mejorar tu experiencia y analizar el tráfico del sitio. Al continuar navegando, aceptas nuestro uso de cookies.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAccept}
                                    className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Aceptar
                                </button>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
                                    aria-label="Cerrar"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-slate-200 via-slate-700 to-slate-200"></div>
            </div>
        </div>
    )
}

export default CookieBanner

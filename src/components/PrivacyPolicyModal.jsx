import { X, Download, ShieldCheck, ScrollText } from "lucide-react"

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300 modal-global-container">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 ease-out">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0 no-print">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 p-2 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Política de Privacidad</h2>
                            <p className="text-xs text-gray-500 font-medium">Última actualización: Febrero 2026</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 text-gray-500 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none text-print">
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ScrollText className="w-5 h-5 text-slate-400" />
                            1. Identificación del Responsable
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            CONECTA CAR, con domicilio principal en Colombia, es el responsable del tratamiento de sus datos personales recolectados a través de esta plataforma, garantizando los derechos de los titulares bajo la Ley 1581 de 2012.
                        </p>
                    </section>

                    <section className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-sm sm:text-lg">2. Finalidades del Tratamiento</h3>
                        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600">
                            <li>Gestión de servicios de compra y venta de vehículos.</li>
                            <li>Trámites ante autoridades de tránsito (traspasos, pignoraciones, etc.).</li>
                            <li>Contacto para soporte técnico y atención al cliente.</li>
                            <li>Envío de notificaciones sobre el estado de sus trámites o vehículos de interés.</li>
                            <li>Mejora de la experiencia de usuario y análisis estadístico.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">3. Derechos del Titular</h3>
                        <p className="text-gray-600 leading-relaxed text-sm mb-4">
                            Como titular de la información, usted tiene derecho a:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "Conocer, actualizar y rectificar sus datos.",
                                "Solicitar prueba de la autorización otorgada.",
                                "Ser informado sobre el uso de sus datos.",
                                "Revocar la autorización o solicitar la supresión.",
                                "Acceder de forma gratuita a sus datos personales."
                            ].map((item, i) => (
                                <div key={i} className="flex gap-2 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                    <span className="text-xs text-gray-600">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">4. Seguridad de la Información</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Implementamos medidas técnicas, humanas y administrativas necesarias para otorgar seguridad a los registros, evitando su adulteración, pérdida, consulta, uso o acceso no autorizado o fraudulento.
                        </p>
                    </section>

                    <section className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">5. Contacto</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Para consultas o reclamos sobre sus datos, puede contactarnos a través de nuestra línea de WhatsApp institucional o al correo electrónico de soporte.
                        </p>
                    </section>
                </div>

                {/* Footer del Modal */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0 no-print">
                    <p className="text-[10px] sm:text-xs text-gray-400 text-center sm:text-left leading-tight max-w-[200px] sm:max-w-none">
                        Al registrarte confirmas que has leído y aceptas esta política de privacidad.
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={handlePrint}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all duration-300"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Imprimir</span>
                            <span className="sm:hidden">PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none bg-slate-900 text-white px-8 py-2 rounded-xl font-bold text-sm hover:bg-black transition-all duration-300 shadow-lg min-w-[120px]"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body { visibility: hidden; background: white; }
                    .modal-global-container { 
                        visibility: visible !important; 
                        position: absolute !important; 
                        left: 0 !important; 
                        top: 0 !important; 
                        width: 100% !important;
                        height: auto !important;
                        display: block !important;
                        background: white !important;
                    }
                    .modal-global-container * { visibility: visible !important; }
                    .modal-global-container .no-print { display: none !important; }
                    .overflow-y-auto { overflow: visible !important; max-height: none !important; }
                    .max-h-[90vh] { max-height: none !important; }
                    .shadow-2xl { box-shadow: none !important; }
                    .bg-black/70 { display: none !important; }
                    .bg-slate-50 { background: white !important; }
                    .rounded-3xl, .rounded-xl, .rounded-2xl { border-radius: 0 !important; }
                }
            `}</style>
        </div>
    )
}

export default PrivacyPolicyModal

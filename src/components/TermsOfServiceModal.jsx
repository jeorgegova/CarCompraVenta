import { X, Download, FileText, CheckCircle2 } from "lucide-react"

const TermsOfServiceModal = ({ isOpen, onClose }) => {
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
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Términos y Condiciones</h2>
                            <p className="text-xs text-gray-500 font-medium">Versión 2.0 - Febrero 2026</p>
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
                            1. Aceptación de Términos
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Al acceder y utilizar la plataforma de CONECTA CAR, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">2. Descripción del Servicio</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            CONECTA CAR facilita la conexión entre compradores y vendedores de vehículos, proporcionando herramientas de publicación, gestión y asesoría en trámites de tránsito. No somos propietarios de los vehículos publicados por terceros, a menos que se indique lo contrario.
                        </p>
                    </section>

                    <section className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">3. Responsabilidades del Usuario</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex gap-3">
                                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <span>Proporcionar información veraz y actualizada.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <span>Mantener la confidencialidad de sus credenciales de acceso.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <span>Realizar los trámites legales correspondientes según la normativa vigente.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">4. Veracidad de la Información</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            CONECTA CAR realiza esfuerzos razonables para verificar la información, pero la responsabilidad final sobre la veracidad de los datos técnicos y el estado legal del vehículo recae sobre el vendedor y el comprador durante su proceso de debida diligencia.
                        </p>
                    </section>

                    <section className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">5. Propiedad Intelectual</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Todo el contenido presente en esta plataforma, incluyendo logos, diseños, textos y software, es propiedad de CONECTA CAR o sus licenciantes y está protegido por leyes de propiedad intelectual.
                        </p>
                    </section>
                </div>

                {/* Footer del Modal */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0 no-print">
                    <p className="text-[10px] sm:text-xs text-gray-400 text-center sm:text-left leading-tight max-w-[200px] sm:max-w-none">
                        Este documento es un contrato legal entre usted y Conecta Car.
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

export default TermsOfServiceModal

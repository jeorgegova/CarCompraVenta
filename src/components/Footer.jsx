import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoBlanco from '../assets/logoBlanco.png';

const Footer = ({ onOpenPrivacy, onOpenTerms }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const scrollToSection = (id) => {
        // If we are not on Home, navigate to Home first
        if (window.location.pathname !== '/') {
            navigate('/');
            // Wait for navigation and then scroll
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="bg-gray-800 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <img src={logoBlanco} alt="Conecta Car Logo" className="h-10 w-auto" />
                        <p className="text-sm leading-relaxed opacity-80">
                            Tu plataforma confiable para comprar y vender vehículos en Colombia con acompañamiento experto en cada paso.
                        </p>
                    </div>

                    {/* Enlaces Rápidos */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Plataforma</h4>
                        <ul className="space-y-4 text-sm">
                            <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors">Inicio</button></li>
                            <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors">Vehículos</button></li>
                            <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">Sobre Nosotros</button></li>
                            <li><button onClick={() => scrollToSection('testimonials')} className="hover:text-white transition-colors">Testimonios</button></li>
                        </ul>
                    </div>

                    {/* Servicios Column */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Servicios</h4>
                        <ul className="space-y-4 text-sm">
                            <li><button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors text-left">Traspaso Vehicular</button></li>
                            <li><button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors text-left">Levantamiento de Prenda</button></li>
                            <li><button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors text-left">Trámites de Tránsito</button></li>
                            <li><button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors text-left">Traslados Nacionales</button></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Contacto</h4>
                        <div className="space-y-4 text-sm opacity-80">
                            <p className="flex items-center gap-2">
                                <span className="font-medium text-white">Email:</span> conectacarcolombia@gmail.com
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="font-medium text-white">Tel:</span> +57 300 620 5493
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="font-medium text-white">Ubicación:</span> Manizales, Caldas Colombia
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700/50 mt-12 pt-8 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                    <div className="hidden md:block order-1">
                        {/* Spacer to help centering the copyright */}
                    </div>

                    <div className="text-center order-1 md:order-2">
                        <p className="text-sm font-medium opacity-60">
                            &copy; {new Date().getFullYear()} Conecta Car. Todos los derechos reservados.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 order-2 md:order-3">
                        <button
                            onClick={onOpenPrivacy}
                            className="text-sm hover:text-white transition-colors opacity-60 hover:opacity-100"
                        >
                            Política de privacidad
                        </button>
                        <button
                            onClick={onOpenTerms}
                            className="text-sm hover:text-white transition-colors opacity-60 hover:opacity-100"
                        >
                            Términos y condiciones
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

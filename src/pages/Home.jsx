import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen font-sans text-primary-900 bg-gradient-to-b from-white via-primary-50 to-white">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Encuentra tu <span className="text-primary-200">Vehículo Ideal</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Compra y vende vehículos de manera segura y confiable con la mejor plataforma del mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/vehicles"
              className="px-8 py-4 bg-white text-primary-800 font-semibold rounded-2xl shadow-md hover:shadow-xl hover:translate-y-[-2px] transition-all"
            >
              🚗 Explorar Vehículos
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 border-2 border-white rounded-2xl text-white font-semibold hover:bg-white hover:text-primary-800 transition-all"
            >
              📝 Vender mi Vehículo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">¿Por qué elegirnos?</h2>
          <p className="text-primary-700 text-lg mb-12 max-w-2xl mx-auto">
            Ofrecemos la mejor experiencia para compradores y vendedores con procesos seguros y transparentes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🚗", title: "Amplia Selección", text: "Miles de vehículos verificados para elegir, desde autos compactos hasta SUVs de lujo." },
              { icon: "🔒", title: "Transacciones Seguras", text: "Verificación completa de documentos y garantía de propiedad en cada transacción." },
              { icon: "📋", title: "Trámites Simplificados", text: "Asistencia total en los trámites de tránsito de Manizales y toda Colombia." },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 text-center transition-all hover:translate-y-[-4px]"
              >
                <div className="text-6xl mb-6">{f.icon}</div>
                <h3 className="text-2xl font-semibold mb-3">{f.title}</h3>
                <p className="text-primary-700">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-white to-primary-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Lo que dicen nuestros clientes</h2>
          <p className="text-lg text-primary-700 mb-12">
            Historias reales de satisfacción de nuestra comunidad.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "María González",
                initials: "MG",
                role: "Compradora - Bogotá",
                text: "Excelente plataforma. Encontré el carro perfecto y el proceso fue muy sencillo.",
              },
              {
                name: "Carlos Rodríguez",
                initials: "CR",
                role: "Vendedor - Medellín",
                text: "Vendí mi vehículo rápidamente. Recibí varias ofertas y cerré el trato en una semana.",
              },
              {
                name: "Ana López",
                initials: "AL",
                role: "Compradora - Cali",
                text: "Los trámites fueron profesionales y sin complicaciones. Muy recomendados.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 text-left transition-all hover:translate-y-[-4px]"
              >
                <div className="flex items-center mb-6">
                  <div className="text-yellow-400 text-lg mr-2">★★★★★</div>
                  <span className="text-primary-600 font-medium">5.0</span>
                </div>
                <p className="text-primary-700 mb-6">{`"${t.text}"`}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-700 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-primary-600 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transit Procedures */}
      <section className="py-20 bg-gradient-to-r from-primary-800 to-primary-700 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Trámites de Tránsito Manizales</h2>
          <p className="text-primary-200 text-lg mb-12 max-w-2xl mx-auto">
            Te ayudamos con todos los trámites necesarios para tu vehículo en Manizales y toda Colombia.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "📄", title: "Registro", text: "Registro de vehículos nuevos y usados con toda la documentación requerida." },
              { icon: "🔄", title: "Transferencia", text: "Transferencia de propiedad rápida con verificación completa." },
              { icon: "📋", title: "SOAT", text: "Renovación y expedición con las mejores aseguradoras." },
              { icon: "🚦", title: "Licencias", text: "Expedición de licencias de conducción para todo tipo de vehículo." },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-primary-700/60 rounded-2xl border border-primary-500 p-8 hover:bg-primary-600/80 transition-all hover:translate-y-[-3px]"
              >
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-primary-100">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">¿Listo para encontrar tu próximo vehículo?</h2>
          <p className="text-lg mb-10 text-primary-100">
            Únete a miles de usuarios que ya confían en <span className="font-semibold">CarCompraVenta</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/vehicles"
              className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-2xl shadow-md hover:shadow-xl hover:translate-y-[-2px] transition-all"
            >
              Ver Catálogo Completo
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 border-2 border-white rounded-2xl text-white font-semibold hover:bg-white hover:text-primary-700 transition-all"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

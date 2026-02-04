import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from 'react-helmet-async'

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, runQuery } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const [reserving, setReserving] = useState(false);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [receiverId, setReceiverId] = useState(null);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  useEffect(() => {
    if (showChat && user && receiverId) {
      fetchChatMessages();
    }
  }, [showChat, user, id, receiverId]);

  const fetchVehicle = async () => {
    try {
      const { data, error } = await runQuery((s) =>
        s
          .from("vehicles")
          .select("*")
          .eq("id", id)
          .single()
      );

      if (error) throw error;
      setVehicle(data);
      if (data.images?.length > 0) setSelectedImage(data.images[0]);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!user) return navigate("/login");

    setReserving(true);
    try {
      const { error } = await runQuery((s) => s.from("reservations").insert({
        vehicle_id: id,
        user_id: user.id,
        reservation_date: reservationDate,
        reservation_time: reservationTime,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      if (error) throw error;

      // Enviar notificación por correo
      const userEmail = profile?.email || user?.email;
      console.log('envia correo a userEmail:', userEmail);
      if (userEmail) {
        try {
          await supabase.functions.invoke('send-email-notification', {
            body: {
              to: userEmail,
              type: "reservation_created",
              marca: vehicle.brand,
              modelo: vehicle.model,
              fecha_reserva: reservationDate.split('-').reverse().join('/'),
              hora_reserva: reservationTime,
            }
          });
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // No bloquear el flujo si falla el email
        }
      } else {
        console.error('No user email available for notification');
      }

      setShowSuccessModal(true);
      setReservationDate("");
      setReservationTime("");
      // Redirigir a la sección de reservas después de cerrar el modal
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/account?tab=reservations');
      }, 3000);
    } catch (error) {
      console.error("Error creando reserva:", error);
      setMessage("❌ Error al crear la reserva. Inténtalo de nuevo.");
    } finally {
      setReserving(false);
    }
  };

  const handleContact = async () => {
    if (!user) return navigate("/login");
    try {
      const { data: admin } = await runQuery((s) =>
        s
          .from("profiles")
          .select("id")
          .eq("role", "admin")
          .limit(1)
          .single()
      );

      if (!admin) {
        alert("No hay asesores disponibles en este momento.");
        return;
      }

      setReceiverId(admin.id);
      setShowChat(true);
    } catch (error) {
      console.error("Error al contactar asesor:", error);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const { data, error } = await runQuery((s) =>
        s
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(first_name, last_name),
            receiver:profiles!messages_receiver_id_fkey(first_name, last_name)
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
          .eq('vehicle_id', id)
          .order('created_at', { ascending: true })
      );

      if (error) throw error;
      setChatMessages(data || []);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
    }
  };

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    setSendingMessage(true);
    try {
      const { error } = await runQuery((s) => s.from("messages").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        vehicle_id: id,
        content: chatMessage.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
      }));

      if (error) throw error;
      setChatMessage("");
      fetchChatMessages();
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    if (!vehicle.images || vehicle.images.length <= 1) return;
    const currentIndex = vehicle.images.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % vehicle.images.length;
    setSelectedImage(vehicle.images[nextIndex]);
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    if (!vehicle.images || vehicle.images.length <= 1) return;
    const currentIndex = vehicle.images.indexOf(selectedImage);
    const prevIndex = (currentIndex - 1 + vehicle.images.length) % vehicle.images.length;
    setSelectedImage(vehicle.images[prevIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showChat || showSuccessModal) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setShowLightbox(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, vehicle, showChat, showSuccessModal, showLightbox]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-700">
        <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-gray-800 rounded-full"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Vehículo no encontrado.
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${vehicle.brand} ${vehicle.model} ${vehicle.year} en ${vehicle.location} - $${(vehicle.price || 0).toLocaleString('es-CO')}`}</title>
        <meta name="description" content={`Compra ${vehicle.brand} ${vehicle.model} ${vehicle.year} en ${vehicle.location}. ${vehicle.mileage?.toLocaleString('es-CO')} km, ${vehicle.transmission}, ${vehicle.fuel_type}. Precio $${vehicle.price?.toLocaleString('es-CO')}.`} />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />

        <meta property="og:title" content={`${vehicle.brand} ${vehicle.model} ${vehicle.year} - Conecta Car`} />
        <meta property="og:description" content={`Disponible en ${vehicle.location}. ${vehicle.mileage?.toLocaleString('es-CO')} km, ${vehicle.transmission}, ${vehicle.fuel_type}. Precio $${vehicle.price?.toLocaleString('es-CO')}.`} />
        <meta property="og:image" content={vehicle.images?.[0] || '/logo.png'} />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Conecta Car" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${vehicle.brand} ${vehicle.model} ${vehicle.year} - Conecta Car`} />
        <meta name="twitter:description" content={`Disponible en ${vehicle.location}. ${vehicle.mileage?.toLocaleString('es-CO')} km, ${vehicle.transmission}, ${vehicle.fuel_type}. Precio $${vehicle.price?.toLocaleString('es-CO')}.`} />
        <meta name="twitter:image" content={vehicle.images?.[0] || '/logo.png'} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Vehicle",
            name: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
            brand: vehicle.brand,
            model: vehicle.model,
            vehicleModel: vehicle.model,
            vehicleConfiguration: `${vehicle.transmission} ${vehicle.fuel_type}`,
            numberOfDoors: vehicle.doors || undefined,
            color: vehicle.color || undefined,
            mileageFromOdometer: {
              "@type": "QuantitativeValue",
              value: vehicle.mileage || 0,
              unitCode: "KMT",
            },
            image: vehicle.images || [],
            url: window.location.origin + window.location.pathname,
            offers: {
              "@type": "Offer",
              priceCurrency: "COP",
              price: vehicle.price || 0,
              availability: "https://schema.org/InStock",
              url: window.location.origin + window.location.pathname,
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-2 gap-8">
          {/* Galería */}
          <div className="space-y-4">
            <div className="relative group overflow-hidden rounded-2xl shadow-lg border border-gray-200 bg-white cursor-pointer" onClick={() => setShowLightbox(true)}>
              <motion.img
                key={selectedImage}
                src={selectedImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-[300px] sm:h-[450px] object-contain sm:object-cover rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

              {/* Zoom Hint */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Click para ampliar
              </div>

              {/* Navigation Arrows */}
              {vehicle.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                    aria-label="Anterior"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                    aria-label="Siguiente"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas */}
            {vehicle.images?.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {vehicle.images.map((image, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`aspect-square overflow-hidden rounded-lg cursor-pointer border-2 ${selectedImage === image
                      ? "border-gray-900"
                      : "border-transparent"
                      } transition-colors duration-200`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`Vista ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </h1>
              <p className="text-2xl font-semibold text-green-600 mt-1">
                ${vehicle.price?.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h3 className="font-semibold">Kilometraje</h3>
                <p>{vehicle.mileage?.toLocaleString()} km</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h3 className="font-semibold">Ubicación</h3>
                <p>{vehicle.location}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h3 className="font-semibold">Transmisión</h3>
                <p>{vehicle.transmission}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h3 className="font-semibold">Combustible</h3>
                <p>{vehicle.fuel_type}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-gray-700">{vehicle.description}</p>
            </div>

            {/* Reservar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-semibold mb-4 text-lg">
                Reservar cita para ver el vehículo
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Fecha</label>
                  <input
                    type="date"
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Hora</label>
                  <input
                    type="time"
                    value={reservationTime}
                    onChange={(e) => setReservationTime(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-600"
                  />
                </div>

                <button
                  onClick={handleReservation}
                  disabled={!reservationDate || !reservationTime || reserving}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg transition disabled:opacity-50"
                >
                  {reserving ? "Reservando..." : "Reservar Cita"}
                </button>
              </div>
            </div>

            {/* Contactar asesor */}
            <button
              onClick={handleContact}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg transition"
            >
              Contactar Asesor
            </button>

            {/* Mensaje de confirmación */}
            {message && (
              <div
                className={`p-4 text-sm rounded-lg ${message.includes("Error")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
                  }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">¡Reserva creada exitosamente!</h3>
                <p className="text-sm text-gray-500 mb-4">Te contactaremos pronto para confirmar los detalles. Serás redirigido a tu panel de reservas.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal del chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="font-semibold">
                    Chat sobre {vehicle.brand} {vehicle.model}
                  </h3>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm">
                      No hay mensajes aún. Envía el primero.
                    </p>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === user.id
                          ? "justify-end"
                          : "justify-start"
                          }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender_id === user.id
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-900"
                            }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-600"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!chatMessage.trim() || sendingMessage}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    ➤
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Lightbox Modal */}
        <AnimatePresence>
          {showLightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              {/* Close button */}
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute top-6 right-6 text-white hover:text-gray-300 z-[110] transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Navigation Arrows inside Lightbox */}
              {vehicle.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-[110] p-2 transition-colors"
                    aria-label="Anterior"
                  >
                    <svg className="w-10 h-10 sm:w-16 sm:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-[110] p-2 transition-colors"
                    aria-label="Siguiente"
                  >
                    <svg className="w-10 h-10 sm:w-16 sm:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Container */}
              <div
                className="w-full h-full flex items-center justify-center p-4 sm:p-12 cursor-pointer"
                onClick={() => setShowLightbox(false)}
              >
                <motion.img
                  key={selectedImage}
                  src={selectedImage}
                  alt="Vista ampliada"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="max-w-full max-h-full object-contain pointer-events-none rounded-2xl shadow-2xl"
                />
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white font-medium bg-black/40 px-4 py-1 rounded-full text-sm">
                {vehicle.images.indexOf(selectedImage) + 1} / {vehicle.images.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default VehicleDetail;

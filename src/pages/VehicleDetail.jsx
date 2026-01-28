import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-2 gap-8">
        {/* Galería */}
        <div className="space-y-4">
          {/* Imagen principal con efecto hover zoom */}
          <div
            className="relative overflow-hidden rounded-2xl shadow-lg border border-gray-200"
            style={{
              backgroundImage: `url(${selectedImage})`,
              backgroundSize: "100%",
              backgroundPosition: "center",
              transition: "background-position 0.2s ease, background-size 0.3s ease",
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              e.currentTarget.style.backgroundPosition = `${x}% ${y}%`;
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundSize = "200%";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundSize = "100%";
              e.currentTarget.style.backgroundPosition = "center";
            }}
          >
            <Zoom>
              <motion.img
                key={selectedImage}
                src={selectedImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="opacity-0 w-full h-[300px] sm:h-[450px] object-cover rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Zoom>
          </div>

          {/* Miniaturas */}
          {vehicle.images?.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {vehicle.images.map((image, i) => (
                <motion.img
                  key={i}
                  src={image}
                  alt="thumbnail"
                  className={`w-full h-24 object-cover rounded-lg cursor-pointer border-2 ${selectedImage === image
                      ? "border-gray-900 scale-105"
                      : "border-transparent hover:scale-105"
                    } transition-transform duration-200`}
                  onClick={() => setSelectedImage(image)}
                />
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
    </div>
  );
};

export default VehicleDetail;

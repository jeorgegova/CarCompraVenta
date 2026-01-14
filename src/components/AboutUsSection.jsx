"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const AboutUsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1], // Curva de easing moderna
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="about"
      ref={ref}
      className="py-20 px-6 bg-gradient-to-b from-white to-gray-50 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Sobre Nosotros
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Conoce nuestra misión y visión que nos guían en cada paso para ofrecerte el mejor servicio
          </motion.p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          {/* Misión */}
          <motion.div
            variants={cardVariants}
            whileHover={{
              y: -8,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-500"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mr-4 shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Misión</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              Brindar acompañamiento profesional, transparente y humano a las personas que compran o venden su
              vehículo, generando confianza en cada paso del proceso.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Nuestro propósito es ser el aliado que guía con seguridad, protege los intereses de ambas partes y
              convierte cada transacción en una experiencia tranquila y sin complicaciones.
            </p>
          </motion.div>

          {/* Visión */}
          <motion.div
            variants={cardVariants}
            whileHover={{
              y: -8,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-500"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mr-4 shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Visión</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              Ser reconocidos como la asesoría automotriz más confiable y humana, referente en el acompañamiento
              integral para la compra y venta de vehículos.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Aspiramos a construir relaciones duraderas basadas en la honestidad, la empatía y el conocimiento,
              transformando la manera en que las personas viven sus decisiones de movilidad.
            </p>
          </motion.div>
        </motion.div>

        {/* Footer Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 text-center"
        >
          {/* Etiqueta superior sutil */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4"
          >
            Nuestros Valores
          </motion.p>

          {/* Valores + separadores en el orden correcto */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6">
            {["Compromiso", "Confianza", "Excelencia"].map((valor, index) => (
              <motion.span
                key={valor}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: 1.2 + index * 0.2,
                  duration: 0.7,
                  ease: "easeOut",
                }}
                className="text-lg md:text-xl font-bold text-gray-800 inline-flex items-center"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                {valor}
                {/* Añadir • solo si no es el último */}
                {index < 2 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{
                      delay: 1.35 + index * 0.2,
                      duration: 0.5,
                      ease: "backOut",
                    }}
                    className="mx-3 md:mx-4 text-gray-400 text-xl"
                  >
                    •
                  </motion.span>
                )}
              </motion.span>
            ))}
          </div>

          {/* Línea inferior sutil */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ delay: 1.8, duration: 0.9, ease: "easeOut" }}
            className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent max-w-xs mx-auto"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUsSection;
import React, { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

const WhatsAppWidget = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const phoneNumber = "7059911480"; // Replace with your actual number

  const handleSend = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  const WidgetContent = (
    <div className="relative z-50">
      {/* Chat Box */}
      {open && (
        <div  className={`absolute ${
      dragPosition.x > window.innerWidth - 250 ? "bottom-16 right-0" : "bottom-16 left-0"
    } w-[90vw] max-w-xs border bg-white rounded-lg shadow-xl p-4 sm:w-72`}>
          <p className="font-medium mb-2 text-sm text-gray-700">
            Chat with us on WhatsApp
          </p>
          <textarea
            rows={3}
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            onClick={handleSend}
            className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded text-sm"
          >
            Send on WhatsApp
          </button>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition"
        aria-label="Open WhatsApp chat"
      >
        <FaWhatsapp size={24} />
      </button>
    </div>
  );

  return (
    <motion.div
      drag={true}
      onDrag={(event, info) => setDragPosition({ x: info.point.x, y: info.point.y })}
      dragConstraints={{ left: 0, right: window.innerWidth - 100, top: 0, bottom: 0 }}
      className={`fixed z-50 ${isMobile ? "bottom-16 left-4" : "bottom-6 left-6"}`}
      style={{ touchAction: "none" }} // prevent page scrolling while dragging
    >
      {WidgetContent}
    </motion.div>
  );
};

export default WhatsAppWidget;

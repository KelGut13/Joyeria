import React, { useState, useEffect, useRef } from "react";
import { Volume2, MousePointerClick, Eye, Type, Contrast, StopCircle, Link2 } from "lucide-react";

const Accesibilidad = () => {
  const [abierto, setAbierto] = useState(false);
  const esperandoSeleccion = useRef(false);
  const [mensajeMostrado, setMensajeMostrado] = useState(false);

  // Detiene cualquier lectura en curso
  const detenerLectura = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  // Leer selección: permite ambas formas de uso
  const leerSeleccion = () => {
    detenerLectura();
    const texto = window.getSelection().toString().trim();
    if (texto) {
      // Si ya hay texto seleccionado, lo lee directamente
      const mensaje = new SpeechSynthesisUtterance(texto);
      mensaje.lang = "es-MX";
      window.speechSynthesis.speak(mensaje);
    } else {
      // Si no hay texto seleccionado, activa el modo de espera
      esperandoSeleccion.current = true;
      if (!mensajeMostrado) {
        alert("Selecciona el texto que deseas escuchar.");
        setMensajeMostrado(true);
      }
      const handleMouseUp = () => {
        if (!esperandoSeleccion.current) return;
        const textoSeleccionado = window.getSelection().toString().trim();
        if (textoSeleccionado) {
          const mensaje = new SpeechSynthesisUtterance(textoSeleccionado);
          mensaje.lang = "es-MX";
          window.speechSynthesis.speak(mensaje);
          esperandoSeleccion.current = false;
          document.removeEventListener("mouseup", handleMouseUp);
        }
      };
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  // Lee el contenido principal de la página de inicio
  const leerContenidoInicio = () => {
    detenerLectura();
    const elementosALeer = [];
    const tituloResena = document.querySelector(".resena h1");
    const textoResena = document.querySelector(".resena p");
    const ubicacionTitulo = document.querySelector(".ubicacion-titulo");
    const ubicacionTexto = document.querySelector(".ubicacion-texto p");

    if (tituloResena) elementosALeer.push(tituloResena.innerText);
    if (textoResena) elementosALeer.push(textoResena.innerText);
    if (ubicacionTitulo) elementosALeer.push(ubicacionTitulo.innerText);
    if (ubicacionTexto) elementosALeer.push(ubicacionTexto.innerText);

    if (elementosALeer.length === 0) {
      alert("No se encontró contenido accesible para leer.");
      return;
    }

    const textoCompleto = elementosALeer.join(". ");
    const mensaje = new SpeechSynthesisUtterance(textoCompleto);
    mensaje.lang = "es-MX";
    window.speechSynthesis.speak(mensaje);
  };

  // Aumentar fuente
  const aumentarFuente = () => {
    document.body.style.fontSize = "larger";
  };

  // Restablecer fuente
  const restablecerFuente = () => {
    document.body.style.fontSize = "initial";
  };

  // Alto contraste
  const toggleAltoContraste = () => {
    document.body.classList.toggle("alto-contraste");
  };

  // Invertir colores
  const toggleInvertirColores = () => {
    document.body.classList.toggle("invertir-colores");
  };

  // Subrayar enlaces
  const toggleSubrayarEnlaces = () => {
    document.body.classList.toggle("subrayar-enlaces");
  };

  // Estilos globales para accesibilidad
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body.alto-contraste {
        background: #000 !important;
        color: #fff !important;
      }
      body.alto-contraste * {
        background: transparent !important;
        color: #fff !important;
        border-color: #fff !important;
      }
      body.invertir-colores {
        filter: invert(1) hue-rotate(180deg);
      }
      body.subrayar-enlaces a {
        text-decoration: underline !important;
        color: #d4a2f4 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={estilos.flotante}>
      <button
        onClick={() => setAbierto(!abierto)}
        style={{
          ...estilos.boton,
          background: abierto
            ? "linear-gradient(135deg, #d4a2f4 60%, #a86be3 100%)"
            : "linear-gradient(135deg, #fff 60%, #e3d8f7 100%)",
          color: abierto ? "#fff" : "#a86be3",
          border: abierto ? "2px solid #a86be3" : "2px solid #e3d8f7",
        }}
        aria-label="Opciones de accesibilidad"
      >
        <Eye size={28} />
      </button>

      {abierto && (
        <div style={estilos.menu}>
          <button
            onClick={leerSeleccion}
            title="Leer texto seleccionado"
            style={estilos.opcion}
          >
            <MousePointerClick size={20} style={{ marginRight: 8 }} />
            Leer selección
          </button>
          <button
            onClick={leerContenidoInicio}
            title="Leer contenido principal"
            style={estilos.opcion}
          >
            <Volume2 size={20} style={{ marginRight: 8 }} />
            Leer contenido principal
          </button>
          <button
            onClick={aumentarFuente}
            title="Aumentar tamaño de fuente"
            style={estilos.opcion}
          >
            <Type size={20} style={{ marginRight: 8 }} />
            Aumentar fuente
          </button>
          <button
            onClick={restablecerFuente}
            title="Restablecer tamaño de fuente"
            style={estilos.opcion}
          >
            <Type size={20} style={{ marginRight: 8 }} />
            Restablecer fuente
          </button>
          <button
            onClick={toggleAltoContraste}
            title="Alto contraste"
            style={estilos.opcion}
          >
            <Contrast size={20} style={{ marginRight: 8 }} />
            Alto contraste
          </button>
          <button
            onClick={toggleInvertirColores}
            title="Invertir colores"
            style={estilos.opcion}
          >
            <Contrast size={20} style={{ marginRight: 8 }} />
            Invertir colores
          </button>
          <button
            onClick={toggleSubrayarEnlaces}
            title="Subrayar enlaces"
            style={estilos.opcion}
          >
            <Link2 size={20} style={{ marginRight: 8 }} />
            Subrayar enlaces
          </button>
          <button
            onClick={detenerLectura}
            title="Detener lectura"
            style={estilos.opcion}
          >
            <StopCircle size={20} style={{ marginRight: 8 }} />
            Detener lectura
          </button>
        </div>
      )}
    </div>
  );
};

const estilos = {
  flotante: {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    zIndex: 1000,
  },
  boton: {
    borderRadius: "50%",
    width: "56px",
    height: "56px",
    fontSize: "24px",
    border: "2px solid #e3d8f7",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(168,107,227,0.13)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    outline: "none",
  },
  menu: {
    marginTop: "12px",
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 4px 16px rgba(168,107,227,0.13)",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: "210px",
    alignItems: "flex-start",
    border: "1.5px solid #e3d8f7",
  },
  opcion: {
    background: "linear-gradient(90deg, #f9f9f9 60%, #e3d8f7 100%)",
    color: "#222",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "background 0.2s, color 0.2s",
  },
};

export default Accesibilidad;

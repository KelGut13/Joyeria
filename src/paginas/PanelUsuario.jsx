import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ShieldCheck, Smartphone, MapPin, Edit, Lock, Users, Mail } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import "./estilos/PanelUsuario.css";
import Separar from "../componentes/Separador NavBar/Separador";

const PanelUsuario = () => {
	const [usuario, setUsuario] = useState(null);
	const [modalActivo, setModalActivo] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		console.log("PanelUsuario component mounted");
		
		// Verificar si hay un usuario logueado
		const usuarioStorage = localStorage.getItem("usuario");
		const token = localStorage.getItem("token");
		
		console.log("Usuario en localStorage:", usuarioStorage);
		console.log("Token en localStorage:", token ? "Presente" : "No presente");
		
		if (!usuarioStorage || !token) {
			console.log("No hay usuario o token, redirigiendo a login");
			navigate("/login");
			return;
		}
		
		setUsuario(JSON.parse(usuarioStorage));
	}, [navigate]);

	// Si no hay usuario, mostrar loading
	if (!usuario) {
		return <div>Cargando...</div>;
	}

	// Construir el nombre completo
	const nombreCompleto = `${usuario.nombre} ${usuario.primer_apellido || ''} ${usuario.segundo_apellido || ''}`.trim();
	
	// Obtener las iniciales para el avatar
	const iniciales = usuario.nombre 
		? `${usuario.nombre.charAt(0)}${usuario.primer_apellido ? usuario.primer_apellido.charAt(0) : ''}`.toUpperCase()
		: 'U';

	// Definir las tarjetas con datos dinámicos del usuario
	const tarjetas = [
		{
			id: "datos-personales",
			icon: <User size={32} />,
			titulo: "Datos personales",
			descripcion: nombreCompleto,
			estado: "validado",
		},
		{
			id: "datos-cuenta",
			icon: <Mail size={32} />,
			titulo: "Datos de tu cuenta",
			descripcion: "Datos que representan tu cuenta.",
			estado: "validado",
		},
		{
			id: "seguridad",
			icon: <ShieldCheck size={32} />,
			titulo: "Seguridad",
			descripcion: "Configura la seguridad de tu cuenta.",
			estado: "validado",
		},
		{
			id: "direcciones",
			icon: <MapPin size={32} />,
			titulo: "Direcciones",
			descripcion: "Direcciones guardadas en tu cuenta.",
		},
		{
			id: "cerrar-sesion",
			icon: <Lock size={32} />,
			titulo: "Cerrar sesión",
			descripcion: "Salir de tu cuenta de usuario.",
		},
	];

	const abrirModal = (cardId) => {
		if (cardId === "cerrar-sesion") {
			handleLogout();
		} else {
			setModalActivo(cardId);
		}
	};

	const cerrarModal = () => {
		setModalActivo(null);
	};

	const handleLogout = () => {
		if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
			localStorage.removeItem('token');
			localStorage.removeItem('usuario');
			navigate('/');
		}
	};

	return (
		<div className="panel-dashboard-bg">
            <Separar />
			<div className="panel-dashboard-header">
				<div className="panel-dashboard-avatar">
					<span className="avatar-circle">{iniciales}</span>
					<div>
						<h2>{nombreCompleto}</h2>
						<p className="panel-dashboard-email">{usuario.email}</p>
					</div>
				</div>
			</div>
			<div className="panel-dashboard-grid">
				{tarjetas.map((card, idx) => (
					<div 
						className={`panel-dashboard-card ${card.id === 'cerrar-sesion' ? 'logout-card' : ''}`} 
						key={idx}
						onClick={() => abrirModal(card.id)}
						style={{ cursor: 'pointer' }}
					>
						<div className="panel-dashboard-card-icon">{card.icon}</div>
						<div className="panel-dashboard-card-content">
							<div className="panel-dashboard-card-title">{card.titulo}</div>
							<div className="panel-dashboard-card-desc">{card.descripcion}</div>
							{card.estado === "validado" && (
								<span className="panel-dashboard-card-validado">✔ Validado</span>
							)}
						</div>
						<div className="panel-dashboard-card-edit">
							<Edit size={20} />
						</div>
					</div>
				))}
			</div>

			{/* Modal para editar datos personales */}
			{modalActivo === "datos-personales" && (
				<ModalDatosPersonales 
					usuario={usuario} 
					setUsuario={setUsuario}
					onClose={cerrarModal} 
				/>
			)}

			{/* Modal para editar datos de cuenta */}
			{modalActivo === "datos-cuenta" && (
				<ModalDatosCuenta 
					usuario={usuario} 
					setUsuario={setUsuario}
					onClose={cerrarModal} 
				/>
			)}

			{/* Modal para seguridad */}
			{modalActivo === "seguridad" && (
				<ModalSeguridad 
					usuario={usuario}
					onClose={cerrarModal} 
				/>
			)}

			{/* Modal para direcciones */}
			{modalActivo === "direcciones" && (
				<ModalDirecciones 
					usuario={usuario}
					onClose={cerrarModal} 
				/>
			)}
		</div>
	);
};

// Componente Modal para Datos Personales
const ModalDatosPersonales = ({ usuario, setUsuario, onClose }) => {
	const [form, setForm] = useState({
		nombre: usuario.nombre || '',
		primer_apellido: usuario.primer_apellido || '',
		segundo_apellido: usuario.segundo_apellido || ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		// Validaciones del frontend
		if (!form.nombre.trim()) {
			setError('El nombre es requerido.');
			return;
		}

		if (form.nombre.trim().length < 2) {
			setError('El nombre debe tener al menos 2 caracteres.');
			return;
		}

		if (form.nombre.trim().length > 50) {
			setError('El nombre no puede tener más de 50 caracteres.');
			return;
		}

		// Validación de solo letras, espacios y acentos para nombre
		const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
		if (!nombreRegex.test(form.nombre.trim())) {
			setError('El nombre solo puede contener letras, espacios y acentos.');
			return;
		}

		if (!form.primer_apellido.trim()) {
			setError('El primer apellido es requerido.');
			return;
		}

		if (form.primer_apellido.trim().length < 2) {
			setError('El primer apellido debe tener al menos 2 caracteres.');
			return;
		}

		if (form.primer_apellido.trim().length > 50) {
			setError('El primer apellido no puede tener más de 50 caracteres.');
			return;
		}

		// Validación de solo letras, espacios y acentos para primer apellido
		if (!nombreRegex.test(form.primer_apellido.trim())) {
			setError('El primer apellido solo puede contener letras, espacios y acentos.');
			return;
		}

		// Segundo apellido es opcional, pero si existe debe ser válido
		if (form.segundo_apellido && form.segundo_apellido.trim()) {
			if (form.segundo_apellido.trim().length < 2) {
				setError('El segundo apellido debe tener al menos 2 caracteres.');
				return;
			}

			if (form.segundo_apellido.trim().length > 50) {
				setError('El segundo apellido no puede tener más de 50 caracteres.');
				return;
			}

			if (!nombreRegex.test(form.segundo_apellido.trim())) {
				setError('El segundo apellido solo puede contener letras, espacios y acentos.');
				return;
			}
		}

		setLoading(true);

		try {
			const token = localStorage.getItem('token');
			
			if (!token) {
				setError('No hay sesión activa');
				navigate('/login');
				return;
			}

			// Limpiar y formatear datos antes de enviar
			const dataToSend = {
				nombre: form.nombre.trim(),
				primer_apellido: form.primer_apellido.trim(),
				segundo_apellido: form.segundo_apellido.trim() || null
			};

			console.log('Enviando datos:', dataToSend);
			console.log('Token:', token ? 'Presente' : 'No presente');

			const response = await fetch(API_ENDPOINTS.ACTUALIZAR_DATOS_PERSONALES, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(dataToSend)
			});

			console.log('Response status:', response.status);

			if (response.ok) {
				// Actualizar el usuario en localStorage
				const usuarioActualizado = { ...usuario, ...form };
				localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
				setUsuario(usuarioActualizado);
				alert('Datos actualizados correctamente');
				onClose();
			} else {
				const data = await response.json();
				console.log('Error response:', data);
				
				if (response.status === 401) {
					// Token expirado o inválido
					localStorage.removeItem('token');
					localStorage.removeItem('usuario');
					setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
					setTimeout(() => {
						navigate('/login');
					}, 2000);
				} else {
					setError(data.error || 'Error al actualizar datos');
				}
			}
		} catch (err) {
			console.error('Error de conexión:', err);
			setError('Error de conexión con el servidor');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>Editar Datos Personales</h2>
					<button onClick={onClose} className="modal-close">✕</button>
				</div>
				<form onSubmit={handleSubmit} className="modal-form">
					<div className="form-group">
						<label>Nombre</label>
						<input
							type="text"
							value={form.nombre}
							onChange={(e) => setForm({...form, nombre: e.target.value})}
							required
						/>
					</div>
					<div className="form-group">
						<label>Primer apellido</label>
						<input
							type="text"
							value={form.primer_apellido}
							onChange={(e) => setForm({...form, primer_apellido: e.target.value})}
							required
						/>
					</div>
					<div className="form-group">
						<label>Segundo apellido</label>
						<input
							type="text"
							value={form.segundo_apellido}
							onChange={(e) => setForm({...form, segundo_apellido: e.target.value})}
						/>
					</div>
					{error && <div className="error-message">{error}</div>}
					<div className="form-buttons">
						<button type="button" onClick={onClose} disabled={loading}>
							Cancelar
						</button>
						<button type="submit" disabled={loading}>
							{loading ? 'Guardando...' : 'Guardar cambios'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

// Componente Modal para Datos de Cuenta
const ModalDatosCuenta = ({ usuario, setUsuario, onClose }) => {
	const [form, setForm] = useState({
		email: usuario.email || '',
		telefono: usuario.telefono || ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		// Validaciones del frontend
		if (!form.email.trim()) {
			setError('El correo electrónico es requerido.');
			return;
		}

		// Validación de formato de email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(form.email.trim())) {
			setError('El formato del correo electrónico no es válido.');
			return;
		}

		if (form.email.trim().length > 100) {
			setError('El correo electrónico no puede tener más de 100 caracteres.');
			return;
		}

		if (!form.telefono.trim()) {
			setError('El número de teléfono es requerido.');
			return;
		}

		// Validación de formato de teléfono (10 dígitos)
		const telefonoRegex = /^\d{10}$/;
		if (!telefonoRegex.test(form.telefono.trim())) {
			setError('El teléfono debe tener exactamente 10 dígitos numéricos.');
			return;
		}

		setLoading(true);

		try {
			const token = localStorage.getItem('token');

			// Limpiar y formatear datos antes de enviar
			const dataToSend = {
				email: form.email.trim().toLowerCase(),
				telefono: form.telefono.trim()
			};

			const response = await fetch(API_ENDPOINTS.ACTUALIZAR_CUENTA, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(dataToSend)
			});

			if (response.ok) {
				const usuarioActualizado = { ...usuario, ...dataToSend };
				localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
				setUsuario(usuarioActualizado);
				alert('Datos de cuenta actualizados correctamente');
				onClose();
			} else {
				const data = await response.json();
				setError(data.error || 'Error al actualizar datos de cuenta');
			}
		} catch (err) {
			setError('Error de conexión con el servidor');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>Editar Datos de Cuenta</h2>
					<button onClick={onClose} className="modal-close">✕</button>
				</div>
				<form onSubmit={handleSubmit} className="modal-form">
					<div className="form-group">
						<label>Correo electrónico</label>
						<input
							type="email"
							value={form.email}
							onChange={(e) => setForm({...form, email: e.target.value})}
							required
						/>
					</div>
					<div className="form-group">
						<label>Teléfono</label>
						<input
							type="tel"
							value={form.telefono}
							onChange={(e) => setForm({...form, telefono: e.target.value})}
							placeholder="Ej: 3114441683"
						/>
					</div>
					{error && <div className="error-message">{error}</div>}
					<div className="form-buttons">
						<button type="button" onClick={onClose} disabled={loading}>
							Cancelar
						</button>
						<button type="submit" disabled={loading}>
							{loading ? 'Guardando...' : 'Guardar cambios'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

// Componente Modal para Seguridad
const ModalSeguridad = ({ usuario, onClose }) => {
	const [form, setForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		// Validaciones del frontend
		if (!form.currentPassword.trim()) {
			setError('La contraseña actual es requerida.');
			return;
		}

		if (!form.newPassword.trim()) {
			setError('La nueva contraseña es requerida.');
			return;
		}

		if (form.newPassword.length < 6) {
			setError('La nueva contraseña debe tener al menos 6 caracteres.');
			return;
		}

		if (form.newPassword.length > 100) {
			setError('La nueva contraseña no puede tener más de 100 caracteres.');
			return;
		}

		// Validación de contraseña segura (opcional: mayúscula, minúscula, número)
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
		if (!passwordRegex.test(form.newPassword)) {
			setError('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número.');
			return;
		}

		if (!form.confirmPassword.trim()) {
			setError('La confirmación de contraseña es requerida.');
			return;
		}

		if (form.newPassword !== form.confirmPassword) {
			setError('Las contraseñas no coinciden.');
			return;
		}

		if (form.currentPassword === form.newPassword) {
			setError('La nueva contraseña debe ser diferente a la actual.');
			return;
		}

		setLoading(true);

		try {
			const token = localStorage.getItem('token');

			const dataToSend = {
				currentPassword: form.currentPassword.trim(),
				newPassword: form.newPassword.trim()
			};

			const response = await fetch(API_ENDPOINTS.CAMBIAR_PASSWORD, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(dataToSend)
			});

			if (response.ok) {
				alert('Contraseña actualizada correctamente');
				onClose();
				setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
			} else {
				const errorData = await response.json();
				
				if (response.status === 400) {
					setError(errorData.error || 'Datos inválidos');
				} else if (response.status === 401) {
					setError('Contraseña actual incorrecta');
				} else if (response.status === 404) {
					setError('Usuario no encontrado');
				} else {
					setError('Error al actualizar la contraseña');
				}
			}
		} catch (error) {
			console.error('Error:', error);
			setError('Error de conexión. Verifica tu internet.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>Cambiar Contraseña</h2>
					<button onClick={onClose} className="modal-close">✕</button>
				</div>
				<form onSubmit={handleSubmit} className="modal-form">
					<div className="form-group">
						<label>Contraseña actual</label>
						<input
							type="password"
							value={form.currentPassword}
							onChange={(e) => setForm({...form, currentPassword: e.target.value})}
							required
						/>
					</div>
					<div className="form-group">
						<label>Nueva contraseña</label>
						<input
							type="password"
							value={form.newPassword}
							onChange={(e) => setForm({...form, newPassword: e.target.value})}
							required
						/>
					</div>
					<div className="form-group">
						<label>Confirmar nueva contraseña</label>
						<input
							type="password"
							value={form.confirmPassword}
							onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
							required
						/>
					</div>
					{error && <div className="error-message">{error}</div>}
					<div className="form-buttons">
						<button type="button" onClick={onClose} disabled={loading}>
							Cancelar
						</button>
						<button type="submit" disabled={loading}>
							{loading ? 'Cambiando...' : 'Cambiar contraseña'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

// Componente Modal para Direcciones
const ModalDirecciones = ({ usuario, onClose }) => {
	const [direcciones, setDirecciones] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [showForm, setShowForm] = useState(false);
	const [editingDireccion, setEditingDireccion] = useState(null);

	const [form, setForm] = useState({
		alias: '',
		calle: '',
		numero_exterior: '',
		numero_interior: '',
		colonia: '',
		ciudad: '',
		estado: '',
		codigo_postal: '',
		pais: 'México',
		predeterminada: false
	});

	useEffect(() => {
		cargarDirecciones();
	}, []);

	const cargarDirecciones = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			const response = await fetch(API_ENDPOINTS.DIRECCIONES, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				setDirecciones(data);
			} else {
				setError('Error al cargar direcciones');
			}
		} catch (err) {
			setError('Error de conexión');
		} finally {
			setLoading(false);
		}
	};

	const limpiarForm = () => {
		setForm({
			alias: '',
			calle: '',
			numero_exterior: '',
			numero_interior: '',
			colonia: '',
			ciudad: '',
			estado: '',
			codigo_postal: '',
			pais: 'México',
			predeterminada: false
		});
		setEditingDireccion(null);
	};

	const handleAgregar = () => {
		limpiarForm();
		setShowForm(true);
	};

	const handleEditar = (direccion) => {
		setForm({
			alias: direccion.alias,
			calle: direccion.calle,
			numero_exterior: direccion.numero_exterior,
			numero_interior: direccion.numero_interior || '',
			colonia: direccion.colonia,
			ciudad: direccion.ciudad,
			estado: direccion.estado,
			codigo_postal: direccion.codigo_postal,
			pais: direccion.pais || 'México',
			predeterminada: direccion.predeterminada === 1
		});
		setEditingDireccion(direccion);
		setShowForm(true);
	};

	const handleEliminar = async (direccionId) => {
		if (!window.confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
			return;
		}

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(API_ENDPOINTS.DIRECCION_BY_ID(direccionId), {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				alert('Dirección eliminada correctamente');
				cargarDirecciones();
			} else {
				const data = await response.json();
				setError(data.error || 'Error al eliminar dirección');
			}
		} catch (err) {
			setError('Error de conexión');
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		// Validaciones del frontend
		if (!form.alias.trim()) {
			setError('El alias es requerido.');
			return;
		}

		if (form.alias.trim().length < 2) {
			setError('El alias debe tener al menos 2 caracteres.');
			return;
		}

		if (!form.calle.trim()) {
			setError('La calle es requerida.');
			return;
		}

		if (form.calle.trim().length < 3) {
			setError('La calle debe tener al menos 3 caracteres.');
			return;
		}

		if (!form.numero_exterior.trim()) {
			setError('El número exterior es requerido.');
			return;
		}

		// Validación de número exterior (alfanumérico)
		const numeroExteriorRegex = /^[a-zA-Z0-9\s\-#]+$/;
		if (!numeroExteriorRegex.test(form.numero_exterior.trim())) {
			setError('El número exterior solo puede contener letras, números, espacios, guiones y #.');
			return;
		}

		if (!form.colonia.trim()) {
			setError('La colonia es requerida.');
			return;
		}

		if (form.colonia.trim().length < 2) {
			setError('La colonia debe tener al menos 2 caracteres.');
			return;
		}

		if (!form.ciudad.trim()) {
			setError('La ciudad es requerida.');
			return;
		}

		if (form.ciudad.trim().length < 2) {
			setError('La ciudad debe tener al menos 2 caracteres.');
			return;
		}

		// Validación de solo letras, espacios y acentos para ciudad
		const ciudadRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/;
		if (!ciudadRegex.test(form.ciudad.trim())) {
			setError('La ciudad solo puede contener letras, espacios, acentos y guiones.');
			return;
		}

		if (!form.estado.trim()) {
			setError('El estado es requerido.');
			return;
		}

		if (form.estado.trim().length < 2) {
			setError('El estado debe tener al menos 2 caracteres.');
			return;
		}

		// Validación de solo letras, espacios y acentos para estado
		const estadoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/;
		if (!estadoRegex.test(form.estado.trim())) {
			setError('El estado solo puede contener letras, espacios, acentos y guiones.');
			return;
		}

		if (!form.codigo_postal.trim()) {
			setError('El código postal es requerido.');
			return;
		}

		// Validación de código postal (5 dígitos para México)
		const codigoPostalRegex = /^\d{5}$/;
		if (!codigoPostalRegex.test(form.codigo_postal.trim())) {
			setError('El código postal debe tener exactamente 5 dígitos.');
			return;
		}

		if (!form.pais.trim()) {
			setError('El país es requerido.');
			return;
		}

		// Validación de número interior (opcional pero si existe debe ser válido)
		if (form.numero_interior && form.numero_interior.trim()) {
			const numeroInteriorRegex = /^[a-zA-Z0-9\s\-#]+$/;
			if (!numeroInteriorRegex.test(form.numero_interior.trim())) {
				setError('El número interior solo puede contener letras, números, espacios, guiones y #.');
				return;
			}
		}

		setLoading(true);

		try {
			const token = localStorage.getItem('token');
			const url = editingDireccion 
				? API_ENDPOINTS.DIRECCION_BY_ID(editingDireccion.ID_direccion)
				: API_ENDPOINTS.DIRECCIONES;
			
			const method = editingDireccion ? 'PUT' : 'POST';

			// Limpiar y formatear datos antes de enviar
			const dataToSend = {
				alias: form.alias.trim(),
				calle: form.calle.trim(),
				numero_exterior: form.numero_exterior.trim(),
				numero_interior: form.numero_interior.trim() || null,
				colonia: form.colonia.trim(),
				ciudad: form.ciudad.trim(),
				estado: form.estado.trim(),
				codigo_postal: form.codigo_postal.trim(),
				pais: form.pais.trim(),
				predeterminada: form.predeterminada
			};

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(dataToSend)
			});

			if (response.ok) {
				alert(editingDireccion ? 'Dirección actualizada correctamente' : 'Dirección agregada correctamente');
				setShowForm(false);
				limpiarForm();
				cargarDirecciones();
			} else {
				const data = await response.json();
				setError(data.error || 'Error al guardar dirección');
			}
		} catch (err) {
			console.error('❌ Error en direcciones:', err);
			setError('Error de conexión con el servidor.');
		} finally {
			setLoading(false);
		}
	};

	const handleCancelar = () => {
		setShowForm(false);
		limpiarForm();
		setError('');
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content direcciones-modal" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>Mis Direcciones</h2>
					<button onClick={onClose} className="modal-close">✕</button>
				</div>
				
				<div className="modal-body">
					{!showForm ? (
						<div className="direcciones-list-container">
							<div className="direcciones-header">
								<button className="btn-agregar" onClick={handleAgregar}>
									+ Agregar Dirección
								</button>
							</div>

							{loading ? (
								<div className="loading-text">Cargando direcciones...</div>
							) : error ? (
								<div className="error-message">{error}</div>
							) : direcciones.length === 0 ? (
								<div className="empty-state">
									<p>No tienes direcciones guardadas</p>
									<p>Agrega tu primera dirección para realizar pedidos</p>
								</div>
							) : (
								<div className="direcciones-grid">
									{direcciones.map((direccion) => (
										<div key={direccion.ID_direccion} className="direccion-card">
											{direccion.predeterminada === 1 && (
												<div className="direccion-badge">Predeterminada</div>
											)}
											<div className="direccion-info">
												<h4>{direccion.alias}</h4>
												<p>
													{direccion.calle} {direccion.numero_exterior}
													{direccion.numero_interior && ` Int. ${direccion.numero_interior}`}
												</p>
												<p>{direccion.colonia}</p>
												<p>{direccion.ciudad}, {direccion.estado}</p>
												<p>CP: {direccion.codigo_postal}</p>
												<p>{direccion.pais}</p>
											</div>
											<div className="direccion-actions">
												<button 
													className="btn-editar"
													onClick={() => handleEditar(direccion)}
												>
													Editar
												</button>
												<button 
													className="btn-eliminar"
													onClick={() => handleEliminar(direccion.ID_direccion)}
												>
													Eliminar
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					) : (
						<form onSubmit={handleSubmit} className="direccion-form">
							<h3>{editingDireccion ? 'Editar Dirección' : 'Nueva Dirección'}</h3>
							
							<div className="form-row">
								<div className="form-group">
									<label>Alias *</label>
									<input
										type="text"
										value={form.alias}
										onChange={(e) => setForm({...form, alias: e.target.value})}
										placeholder="Casa, Trabajo, etc."
										required
									/>
								</div>
								<div className="form-group">
									<label>Código Postal *</label>
									<input
										type="text"
										value={form.codigo_postal}
										onChange={(e) => setForm({...form, codigo_postal: e.target.value})}
										placeholder="63173"
										required
									/>
								</div>
							</div>

							<div className="form-row">
								<div className="form-group flex-2">
									<label>Calle *</label>
									<input
										type="text"
										value={form.calle}
										onChange={(e) => setForm({...form, calle: e.target.value})}
										placeholder="Av. Principal"
										required
									/>
								</div>
								<div className="form-group">
									<label>Número Exterior *</label>
									<input
										type="text"
										value={form.numero_exterior}
										onChange={(e) => setForm({...form, numero_exterior: e.target.value})}
										placeholder="123"
										required
									/>
								</div>
								<div className="form-group">
									<label>Número Interior</label>
									<input
										type="text"
										value={form.numero_interior}
										onChange={(e) => setForm({...form, numero_interior: e.target.value})}
										placeholder="A"
									/>
								</div>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label>Colonia *</label>
									<input
										type="text"
										value={form.colonia}
										onChange={(e) => setForm({...form, colonia: e.target.value})}
										placeholder="Centro"
										required
									/>
								</div>
								<div className="form-group">
									<label>Ciudad *</label>
									<input
										type="text"
										value={form.ciudad}
										onChange={(e) => setForm({...form, ciudad: e.target.value})}
										placeholder="Tepic"
										required
									/>
								</div>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label>Estado *</label>
									<input
										type="text"
										value={form.estado}
										onChange={(e) => setForm({...form, estado: e.target.value})}
										placeholder="Nayarit"
										required
									/>
								</div>
								<div className="form-group">
									<label>País</label>
									<input
										type="text"
										value={form.pais}
										onChange={(e) => setForm({...form, pais: e.target.value})}
										placeholder="México"
									/>
								</div>
							</div>

							<div className="form-group checkbox-group">
								<label className="checkbox-label">
									<input
										type="checkbox"
										checked={form.predeterminada}
										onChange={(e) => setForm({...form, predeterminada: e.target.checked})}
									/>
									Establecer como dirección predeterminada
								</label>
							</div>

							{error && <div className="error-message">{error}</div>}

							<div className="form-buttons">
								<button type="button" onClick={handleCancelar} disabled={loading}>
									Cancelar
								</button>
								<button type="submit" disabled={loading}>
									{loading ? 'Guardando...' : (editingDireccion ? 'Actualizar' : 'Guardar')}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
};

export default PanelUsuario;
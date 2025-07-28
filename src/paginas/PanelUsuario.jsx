import React, { useState } from "react";
import { User, ShieldCheck, Smartphone, MapPin, Edit, Lock, Users, Mail } from "lucide-react";
import "./estilos/PanelUsuario.css";
import Separar from "../componentes/Separador NavBar/Separador";

const tarjetas = [
	{
		icon: <User size={32} />,
		titulo: "Datos personales",
		descripcion: "Kelvim Isahi Gutierrez Sandoval",
		estado: "validado",
	},
	{
		icon: <Mail size={32} />,
		titulo: "Datos de tu cuenta",
		descripcion: "Datos que representan tu cuenta.",
		estado: "validado",
	},
	{
		icon: <ShieldCheck size={32} />,
		titulo: "Seguridad",
		descripcion: "Configura la seguridad de tu cuenta.",
		estado: "validado",
	},
	{
		icon: <Users size={32} />,
		titulo: "Colaboradores",
		descripcion: "Personas que operan con tu cuenta.",
	},
	{
		icon: <MapPin size={32} />,
		titulo: "Direcciones",
		descripcion: "Direcciones guardadas en tu cuenta.",
	},
	{
		icon: <Lock size={32} />,
		titulo: "Privacidad",
		descripcion: "Preferencias y control sobre el uso de tus datos.",
	},
];

const PanelUsuario = () => {
	return (
		<div className="panel-dashboard-bg">
            <Separar />
			<div className="panel-dashboard-header">
				<div className="panel-dashboard-avatar">
					<span className="avatar-circle">ÁS</span>
					<div>
						<h2>Acrono Game Studios</h2>
						<p className="panel-dashboard-email">acronostudios@gmail.com</p>
					</div>
				</div>
			</div>
			<div className="panel-dashboard-grid">
				{tarjetas.map((card, idx) => (
					<div className="panel-dashboard-card" key={idx}>
						<div className="panel-dashboard-card-icon">{card.icon}</div>
						<div className="panel-dashboard-card-content">
							<div className="panel-dashboard-card-title">{card.titulo}</div>
							<div className="panel-dashboard-card-desc">{card.descripcion}</div>
							{card.estado === "validado" && (
								<span className="panel-dashboard-card-validado">✔ Validado</span>
							)}
						</div>
						<button className="panel-dashboard-card-edit" aria-label="Editar">
							<Edit size={20} />
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default PanelUsuario;
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const Carrito = () => {
  const { carrito, eliminarProducto, total } = useCart();

  if (carrito.length === 0) return <h2>Tu carrito está vacío</h2>;

  return (
    <div className="carrito">
      <h2>Carrito de compras</h2>
      <ul>
        {carrito.map(item => (
          <li key={item.id_producto}>
            {item.nombre} x {item.cantidad} = ${item.precio * item.cantidad}
            <button onClick={() => eliminarProducto(item.id_producto)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <h3>Total: ${total.toFixed(2)}</h3>
      <Link to="/resumen"><button>Confirmar compra</button></Link>
    </div>
  );
};

export default Carrito;

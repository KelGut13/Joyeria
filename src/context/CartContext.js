import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  const agregarProducto = (producto) => {
    const existe = carrito.find(item => item.id_producto === producto.id_producto);

    if (existe) {
      const nuevoCarrito = carrito.map(item =>
        item.id_producto === producto.id_producto
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      );
      setCarrito(nuevoCarrito);
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const eliminarProducto = (id_producto) => {
    setCarrito(carrito.filter(item => item.id_producto !== id_producto));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <CartContext.Provider value={{ carrito, agregarProducto, eliminarProducto, vaciarCarrito, total }}>
      {children}
    </CartContext.Provider>
  );
};

USE pizzeriaDB;
GO

-- Insertar categorías de pizza
INSERT INTO Categoria_Pizza (nombre) VALUES 
    ('Clásicas'),
    ('Especiales'),
    ('Vegetarianas');
GO

-- Insertar tamaños de pizza
INSERT INTO Tamaño_Pizza (nombre, factor_precio) VALUES 
    ('Pequeña', 0.8),
    ('Mediana', 1.0),
    ('Grande', 1.3),
    ('Familiar', 1.8);
GO

-- Insertar pizzas
INSERT INTO Pizza (nombre, descripcion, precio_base, categoria_id, imagen) VALUES 
    ('Margarita', 'La clásica pizza italiana con salsa de tomate, mozzarella fresca y albahaca.', 8.99, 1, 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=600'),
    ('Pepperoni', 'Pizza con abundante pepperoni y queso mozzarella sobre salsa de tomate.', 10.99, 1, 'https://images.pexels.com/photos/5792329/pexels-photo-5792329.jpeg?auto=compress&cs=tinysrgb&w=600'),
    ('Cuatro Quesos', 'Deliciosa combinación de mozzarella, gorgonzola, parmesano y provolone.', 12.99, 2, 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=600'),
    ('Vegetariana', 'Mezcla de vegetales frescos: pimientos, champiñones, cebolla, aceitunas y tomate.', 11.99, 3, 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=600'),
    ('Hawaiana', 'Combinación de jamón y piña sobre queso mozzarella y salsa de tomate.', 10.49, 2, 'https://images.pexels.com/photos/6937416/pexels-photo-6937416.jpeg?auto=compress&cs=tinysrgb&w=600'),
    ('BBQ Chicken', 'Pollo a la barbacoa, cebolla roja, bacon y queso mozzarella con salsa BBQ.', 13.99, 1, 'https://images.pexels.com/photos/2233348/pexels-photo-2233348.jpeg?auto=compress&cs=tinysrgb&w=600');
GO

-- Insertar cliente de ejemplo
INSERT INTO Cliente (nombre, direccion, telefono, email, password) VALUES 
    ('Juan Pérez', 'Calle Principal 123, Madrid', '123-456-7890', 'juan.perez@email.com', 'password123'),
    ('María López', 'Avenida Central 456, Barcelona', '234-567-8901', 'maria.lopez@email.com', 'password123'),
    ('Carlos Rodríguez', 'Plaza Mayor 789, Valencia', '345-678-9012', 'carlos.rodriguez@email.com', 'password123');
GO

-- Insertar orden de ejemplo
INSERT INTO Orden (cliente_id, fecha, estado) VALUES 
    (1, GETDATE(), 'entregado'),
    (2, GETDATE(), 'en preparacion'),
    (3, GETDATE(), 'en camino');
GO

-- Insertar detalles de orden de ejemplo
INSERT INTO Detalle_Orden (orden_id, pizza_id, tamaño_id, cantidad, precio_unitario) VALUES 
    (1, 1, 2, 2, 8.99),
    (1, 2, 3, 1, 10.99),
    (2, 3, 4, 1, 12.99),
    (2, 4, 2, 1, 11.99),
    (3, 5, 3, 2, 10.49);
GO

-- Insertar facturas de ejemplo
INSERT INTO Factura (orden_id, metodo_pago, estado_pago, total) VALUES 
    (1, 'tarjeta', 'completado', 28.97),
    (2, 'efectivo', 'pendiente', 24.98),
    (3, 'paypal', 'completado', 20.98);
GO
-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'pizzeria')
BEGIN
    CREATE DATABASE pizzeria;
END
GO

USE pizzeria;
GO

-- Drop tables if they exist (in reverse order of dependencies)
IF OBJECT_ID('dbo.Factura', 'U') IS NOT NULL DROP TABLE dbo.Factura;
IF OBJECT_ID('dbo.Detalle_Orden', 'U') IS NOT NULL DROP TABLE dbo.Detalle_Orden;
IF OBJECT_ID('dbo.Orden', 'U') IS NOT NULL DROP TABLE dbo.Orden;
IF OBJECT_ID('dbo.Pizza', 'U') IS NOT NULL DROP TABLE dbo.Pizza;
IF OBJECT_ID('dbo.Cliente', 'U') IS NOT NULL DROP TABLE dbo.Cliente;
IF OBJECT_ID('dbo.Tamano_Pizza', 'U') IS NOT NULL DROP TABLE dbo.Tamano_Pizza;
IF OBJECT_ID('dbo.Categoria_Pizza', 'U') IS NOT NULL DROP TABLE dbo.Categoria_Pizza;
GO

-- Create tables
CREATE TABLE Categoria_Pizza (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(255)
);

CREATE TABLE Tamano_Pizza (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(50) NOT NULL,
    factor_precio DECIMAL(4,2) NOT NULL,
    descripcion NVARCHAR(255)
);

CREATE TABLE Pizza (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(255),
    precio_base DECIMAL(8,2) NOT NULL,
    imagen_url NVARCHAR(255),
    categoria_id INT NOT NULL,
    ingredientes NVARCHAR(500),
    disponible BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (categoria_id) REFERENCES Categoria_Pizza(id)
);

CREATE TABLE Cliente (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    direccion NVARCHAR(255),
    telefono NVARCHAR(20),
    fecha_registro DATETIME DEFAULT GETDATE(),
    es_admin BIT NOT NULL DEFAULT 0
);

CREATE TABLE Orden (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cliente_id INT NOT NULL,
    fecha_orden DATETIME DEFAULT GETDATE(),
    estado NVARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    direccion_entrega NVARCHAR(255) NOT NULL,
    telefono_contacto NVARCHAR(20) NOT NULL,
    metodo_pago NVARCHAR(50) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    notas NVARCHAR(500),
    FOREIGN KEY (cliente_id) REFERENCES Cliente(id)
);

CREATE TABLE Detalle_Orden (
    id INT IDENTITY(1,1) PRIMARY KEY,
    orden_id INT NOT NULL,
    pizza_id INT NOT NULL,
    tamano_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(8,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    instrucciones_especiales NVARCHAR(255),
    FOREIGN KEY (orden_id) REFERENCES Orden(id),
    FOREIGN KEY (pizza_id) REFERENCES Pizza(id),
    FOREIGN KEY (tamano_id) REFERENCES Tamano_Pizza(id)
);

CREATE TABLE Factura (
    id INT IDENTITY(1,1) PRIMARY KEY,
    orden_id INT NOT NULL UNIQUE,
    numero_factura NVARCHAR(20) NOT NULL UNIQUE,
    fecha_emision DATETIME DEFAULT GETDATE(),
    monto_total DECIMAL(10,2) NOT NULL,
    estado_pago NVARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    metodo_pago NVARCHAR(50) NOT NULL,
    FOREIGN KEY (orden_id) REFERENCES Orden(id)
);
GO

USE pizzeriaDB;
GO

-- Insert categories
INSERT INTO Categoria_Pizza (nombre, descripcion)
VALUES 
('Clasicas', 'Pizzas tradicionales y favoritas de siempre'),
('Especiales', 'Pizzas con combinaciones exclusivas de ingredientes'),
('Vegetarianas', 'Pizzas sin carne, perfectas para vegetarianos'),
('Picantes', 'Pizzas con un toque de picante para los mas atrevidos');
GO

-- Insert sizes
INSERT INTO Tamano_Pizza (nombre, factor_precio, descripcion)
VALUES 
('Personal', 1.00, '20 cm de diametro, ideal para una persona'),
('Mediana', 1.50, '30 cm de diametro, para 2-3 personas'),
('Familiar', 2.25, '40 cm de diametro, para 3-4 personas'),
('Gigante', 3.00, '50 cm de diametro, para 4-6 personas');
GO

-- Insert pizzas
INSERT INTO Pizza (nombre, descripcion, precio_base, imagen_url, categoria_id, ingredientes, disponible)
VALUES 
('Margarita', 'La clasica pizza italiana con salsa de tomate y queso mozzarella', 8.99, 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e', 1, 'Salsa de tomate, mozzarella, albahaca fresca, aceite de oliva', 1),
('Pepperoni', 'Pizza con abundante pepperoni y queso derretido', 10.99, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee', 1, 'Salsa de tomate, mozzarella, pepperoni', 1),
('Hawaiana', 'Pizza con jamon y pina para los amantes de lo dulce y salado', 11.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', 1, 'Salsa de tomate, mozzarella, jamon, pina', 1),
('Cuatro Quesos', 'Deliciosa combinacion de cuatro quesos diferentes', 12.99, 'https://images.unsplash.com/photo-1513104890138-7c749659a591', 2, 'Salsa de tomate, mozzarella, queso azul, parmesano, queso de cabra', 1),
('Vegetariana', 'Llena de vegetales frescos y saludables', 11.99, 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47', 3, 'Salsa de tomate, mozzarella, pimiento, cebolla, champinones, aceitunas, maiz', 1),
('BBQ Chicken', 'Pollo a la barbacoa con cebolla y mozzarella', 13.99, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3', 2, 'Salsa BBQ, mozzarella, pollo, cebolla roja, cilantro', 1),
('Diavola', 'Pizza picante con salami picante y chile', 12.99, 'https://images.unsplash.com/photo-1558030006-450675393462', 4, 'Salsa de tomate, mozzarella, salami picante, chile rojo, aceite de oliva picante', 1),
('Mexicana', 'Con jalapenos, carne molida y un toque de picante', 13.99, 'https://images.unsplash.com/photo-1584365685547-9a5fb6f3a70c', 4, 'Salsa de tomate, mozzarella, carne molida, jalapenos, pimiento, cebolla, guacamole', 1);
GO

-- Insert admin user (password: admin123)
INSERT INTO Cliente (nombre, email, password_hash, direccion, telefono, es_admin)
VALUES ('Administrador', 'admin@pizzadelicia.com', '$2a$10$XUR7D/bUPYdijCzz3G2mIeghwzN0DjUJxFsZtVnNUCnxYQ6Uwkp/O', 'Calle Principal 123', '555-123-4567', 1);

-- Insert regular user (password: usuario123)
INSERT INTO Cliente (nombre, email, password_hash, direccion, telefono, es_admin)
VALUES ('Usuario', 'usuario@ejemplo.com', '$2a$10$LR7OdAbMpWRX7yy7LkTJ0eXmDr0D5d0wQEJ96b2oUb.BQFHsYPMCC', 'Avenida Secundaria 456', '555-987-6543', 0);
GO

--(usuario123) password_hash = '$2b$10$jva3VmYxYJK/YnvKpe3W1OdwJWFYw8Bl1BO6Mu./aTC.lyP2o/nQq'

-- Insert sample order
DECLARE @ClienteID INT = (SELECT id FROM Cliente WHERE email = 'usuario@ejemplo.com');
DECLARE @PizzaID INT = (SELECT id FROM Pizza WHERE nombre = 'Margarita');
DECLARE @TamanoID INT = (SELECT id FROM Tamano_Pizza WHERE nombre = 'Familiar');

INSERT INTO Orden (cliente_id, estado, direccion_entrega, telefono_contacto, metodo_pago, total)
VALUES (@ClienteID, 'Entregado', 'Avenida Secundaria 456', '555-987-6543', 'Efectivo', 20.23);

DECLARE @OrdenID INT = SCOPE_IDENTITY();

INSERT INTO Detalle_Orden (orden_id, pizza_id, tamano_id, cantidad, precio_unitario, subtotal)
VALUES (@OrdenID, @PizzaID, @TamanoID, 1, 20.23, 20.23);

-- Generate invoice for the order
INSERT INTO Factura (orden_id, numero_factura, monto_total, estado_pago, metodo_pago)
VALUES (@OrdenID, 'FAC-2023-001', 20.23, 'Pagado', 'Efectivo');
GO

select * from Factura
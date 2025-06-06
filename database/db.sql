USE [pizzeria]
GO
/****** Object:  Table [dbo].[Categoria_Pizza]    Script Date: 05/06/2025 17:21:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Categoria_Pizza](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [nvarchar](100) NOT NULL,
	[descripcion] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Cliente]    Script Date: 05/06/2025 17:21:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Cliente](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [nvarchar](100) NOT NULL,
	[email] [nvarchar](100) NOT NULL,
	[password_hash] [nvarchar](255) NOT NULL,
	[direccion] [nvarchar](255) NULL,
	[telefono] [nvarchar](20) NULL,
	[fecha_registro] [datetime] NULL,
	[es_admin] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Detalle_Orden]    Script Date: 05/06/2025 17:21:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Detalle_Orden](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[orden_id] [int] NOT NULL,
	[pizza_id] [int] NOT NULL,
	[tamano_id] [int] NOT NULL,
	[cantidad] [int] NOT NULL,
	[precio_unitario] [decimal](8, 2) NOT NULL,
	[subtotal] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Factura]    Script Date: 05/06/2025 17:21:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Factura](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[orden_id] [int] NOT NULL,
	[numero_factura] [nvarchar](20) NOT NULL,
	[fecha_emision] [datetime] NULL,
	[monto_total] [decimal](10, 2) NOT NULL,
	[estado_pago] [nvarchar](50) NOT NULL,
	[metodo_pago] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[numero_factura] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[orden_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Orden]    Script Date: 05/06/2025 17:21:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Orden](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[cliente_id] [int] NOT NULL,
	[fecha_orden] [datetime] NULL,
	[estado] [nvarchar](50) NOT NULL,
	[direccion_entrega] [nvarchar](255) NOT NULL,
	[telefono_contacto] [nvarchar](20) NOT NULL,
	[metodo_pago] [nvarchar](50) NOT NULL,
	[total] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Pizza]    Script Date: 05/06/2025 17:21:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Pizza](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [nvarchar](100) NOT NULL,
	[descripcion] [nvarchar](255) NULL,
	[precio_base] [decimal](8, 2) NOT NULL,
	[imagen_url] [nvarchar](255) NULL,
	[categoria_id] [int] NOT NULL,
	[disponible] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tamano_Pizza]    Script Date: 05/06/2025 17:21:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tamano_Pizza](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [nvarchar](50) NOT NULL,
	[factor_precio] [decimal](4, 2) NOT NULL,
	[descripcion] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Cliente] ADD  DEFAULT (getdate()) FOR [fecha_registro]
GO
ALTER TABLE [dbo].[Cliente] ADD  DEFAULT ((0)) FOR [es_admin]
GO
ALTER TABLE [dbo].[Detalle_Orden] ADD  DEFAULT ((1)) FOR [cantidad]
GO
ALTER TABLE [dbo].[Factura] ADD  DEFAULT (getdate()) FOR [fecha_emision]
GO
ALTER TABLE [dbo].[Factura] ADD  DEFAULT ('Pendiente') FOR [estado_pago]
GO
ALTER TABLE [dbo].[Orden] ADD  DEFAULT (getdate()) FOR [fecha_orden]
GO
ALTER TABLE [dbo].[Orden] ADD  DEFAULT ('Pendiente') FOR [estado]
GO
ALTER TABLE [dbo].[Pizza] ADD  DEFAULT ((1)) FOR [disponible]
GO
ALTER TABLE [dbo].[Detalle_Orden]  WITH CHECK ADD FOREIGN KEY([orden_id])
REFERENCES [dbo].[Orden] ([id])
GO
ALTER TABLE [dbo].[Detalle_Orden]  WITH CHECK ADD FOREIGN KEY([pizza_id])
REFERENCES [dbo].[Pizza] ([id])
GO
ALTER TABLE [dbo].[Detalle_Orden]  WITH CHECK ADD FOREIGN KEY([tamano_id])
REFERENCES [dbo].[Tamano_Pizza] ([id])
GO
ALTER TABLE [dbo].[Factura]  WITH CHECK ADD FOREIGN KEY([orden_id])
REFERENCES [dbo].[Orden] ([id])
GO
ALTER TABLE [dbo].[Orden]  WITH CHECK ADD FOREIGN KEY([cliente_id])
REFERENCES [dbo].[Cliente] ([id])
GO
ALTER TABLE [dbo].[Pizza]  WITH CHECK ADD FOREIGN KEY([categoria_id])
REFERENCES [dbo].[Categoria_Pizza] ([id])
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


----------------------------------------------------
--------------CONSULTAS----------------------------
----------------------------------------------------

-- Consulta para obtener métricas principales del dashboard
SELECT
    (SELECT COUNT(*) FROM Orden WHERE CAST(fecha_orden AS DATE) = CAST(GETDATE() AS DATE)) AS pedidos_hoy,
    (SELECT SUM(total) FROM Orden WHERE CAST(fecha_orden AS DATE) = CAST(GETDATE() AS DATE)) AS ingresos_hoy,
    (SELECT COUNT(*) FROM Cliente) AS total_clientes,
    (SELECT COUNT(*) FROM Orden WHERE estado = 'en_camino') AS pedidos_en_proceso


-- Consulta para el gráfico circular de ventas por categoría
SELECT 
    c.nombre AS categoria,
    COUNT(do.id) AS cantidad_vendida,
    SUM(do.subtotal) AS total_ventas
FROM Detalle_Orden do
JOIN Pizza p ON do.pizza_id = p.id
JOIN Categoria_Pizza c ON p.categoria_id = c.id
JOIN Orden o ON do.orden_id = o.id
WHERE o.fecha_orden >= DATEADD(MONTH, -1, GETDATE())
GROUP BY c.nombre
ORDER BY total_ventas DESC

-- Consulta para el gráfico de barras de pedidos por día
SELECT 
    CAST(fecha_orden AS DATE) AS fecha,
    COUNT(*) AS cantidad_pedidos,
    SUM(total) AS total_ventas
FROM Orden
WHERE fecha_orden >= DATEADD(DAY, -7, GETDATE())
GROUP BY CAST(fecha_orden AS DATE)
ORDER BY fecha

-- Consulta para el gráfico de líneas de ingresos mensuales
SELECT 
    YEAR(fecha_orden) AS año,
    MONTH(fecha_orden) AS mes,
    SUM(total) AS total_ventas
FROM Orden
WHERE fecha_orden >= DATEADD(MONTH, -12, GETDATE())
GROUP BY YEAR(fecha_orden), MONTH(fecha_orden)
ORDER BY año, mes

-- Consulta para análisis de rendimiento por día y hora
SELECT 
    DATEPART(WEEKDAY, fecha_orden) AS dia_semana,
    DATEPART(HOUR, fecha_orden) AS hora,
    COUNT(*) AS cantidad_pedidos,
    AVG(total) AS ticket_promedio
FROM Orden
WHERE fecha_orden >= DATEADD(MONTH, -3, GETDATE())
GROUP BY DATEPART(WEEKDAY, fecha_orden), DATEPART(HOUR, fecha_orden)
ORDER BY dia_semana, hora

-- Consulta para la vista de pedidos pendientes con detalles
SELECT 
    o.id,
    o.fecha_orden,
    c.nombre AS cliente,
    o.direccion_entrega,
    o.telefono_contacto,
    o.estado,
    STRING_AGG(CONCAT(p.nombre, ' (', tp.nombre, ') x', do.cantidad), ', ') AS items,
    o.total
FROM Orden o
JOIN Cliente c ON o.cliente_id = c.id
JOIN Detalle_Orden do ON o.id = do.orden_id
JOIN Pizza p ON do.pizza_id = p.id
JOIN Tamano_Pizza tp ON do.tamano_id = tp.id
WHERE o.estado IN ('recibido', 'en_preparacion', 'en_camino')
GROUP BY o.id, o.fecha_orden, c.nombre, o.direccion_entrega, o.telefono_contacto, o.estado, o.total
ORDER BY 
    CASE 
        WHEN o.estado = 'recibido' THEN 1
        WHEN o.estado = 'en_preparacion' THEN 2
        WHEN o.estado = 'en_camino' THEN 3
    END,
    o.fecha_orden
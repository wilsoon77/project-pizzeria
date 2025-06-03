USE pizzeriaDB;
GO

-- Crear tabla Categoria_Pizza
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Categoria_Pizza]') AND type in (N'U'))
BEGIN
    CREATE TABLE Categoria_Pizza (
        categoria_id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(50) NOT NULL
    );
END
GO

-- Crear tabla Tamaño_Pizza
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Tamaño_Pizza]') AND type in (N'U'))
BEGIN
    CREATE TABLE Tamaño_Pizza (
        tamaño_id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(50) NOT NULL,
        factor_precio DECIMAL(4,2) NOT NULL
    );
END
GO

-- Crear tabla Pizza
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Pizza]') AND type in (N'U'))
BEGIN
    CREATE TABLE Pizza (
        pizza_id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        descripcion NVARCHAR(500),
        precio_base DECIMAL(10,2) NOT NULL,
        categoria_id INT NOT NULL,
        imagen NVARCHAR(500),
        FOREIGN KEY (categoria_id) REFERENCES Categoria_Pizza(categoria_id)
    );
END
GO

-- Crear tabla Cliente
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cliente]') AND type in (N'U'))
BEGIN
    CREATE TABLE Cliente (
        cliente_id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        direccion NVARCHAR(200),
        telefono NVARCHAR(20),
        email NVARCHAR(100) NOT NULL UNIQUE,
        password NVARCHAR(100) NOT NULL
    );
END
GO

-- Crear tabla Orden
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Orden]') AND type in (N'U'))
BEGIN
    CREATE TABLE Orden (
        orden_id INT IDENTITY(1,1) PRIMARY KEY,
        cliente_id INT NOT NULL,
        fecha DATETIME DEFAULT GETDATE(),
        estado NVARCHAR(20) CHECK (estado IN ('recibido', 'en preparacion', 'en camino', 'entregado', 'cancelado')),
        FOREIGN KEY (cliente_id) REFERENCES Cliente(cliente_id)
    );
END
GO

-- Crear tabla Detalle_Orden
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Detalle_Orden]') AND type in (N'U'))
BEGIN
    CREATE TABLE Detalle_Orden (
        detalle_id INT IDENTITY(1,1) PRIMARY KEY,
        orden_id INT NOT NULL,
        pizza_id INT NOT NULL,
        tamaño_id INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (orden_id) REFERENCES Orden(orden_id),
        FOREIGN KEY (pizza_id) REFERENCES Pizza(pizza_id),
        FOREIGN KEY (tamaño_id) REFERENCES Tamaño_Pizza(tamaño_id)
    );
END
GO

-- Crear tabla Factura
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Factura]') AND type in (N'U'))
BEGIN
    CREATE TABLE Factura (
        factura_id INT IDENTITY(1,1) PRIMARY KEY,
        orden_id INT NOT NULL UNIQUE,
        metodo_pago NVARCHAR(20) NOT NULL,
        estado_pago NVARCHAR(20) CHECK (estado_pago IN ('pendiente', 'completado', 'cancelado', 'reembolsado')),
        total DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (orden_id) REFERENCES Orden(orden_id)
    );
END
GO

-- Crear índices para mejorar el rendimiento
CREATE INDEX IX_Pizza_Categoria ON Pizza(categoria_id);
CREATE INDEX IX_Orden_Cliente ON Orden(cliente_id);
CREATE INDEX IX_Detalle_Orden_Orden ON Detalle_Orden(orden_id);
CREATE INDEX IX_Factura_Orden ON Factura(orden_id);
GO
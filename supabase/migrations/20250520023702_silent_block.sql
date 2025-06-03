-- Crear la base de datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'pizzeriaDB')
BEGIN
    CREATE DATABASE pizzeriaDB;
END
GO

USE pizzeriaDB;
GO
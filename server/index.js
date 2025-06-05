import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';
import fs from 'fs-extra';
import path from 'path';
dotenv.config();
import nodemailer from 'nodemailer';

import { Resend } from 'resend';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de SQL Server
const sqlConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'sql1234',
  database: process.env.DB_NAME || 'pizzeria',
  server: process.env.DB_SERVER || 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // para conexiones seguras, cambiar a true
    trustServerCertificate: true // para desarrollo local, en producción cambiar a false
  }
};

// Conectar a SQL Server
async function connectToDatabase() {
  try {
    await sql.connect(sqlConfig);
    console.log('Conexión a SQL Server establecida con éxito');
  } catch (error) {
    console.error('Error al conectar a SQL Server:', error);
  }
}

// Iniciar la conexión a la base de datos
connectToDatabase();

// Rutas para Categorías
app.get('/api/categorias', async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM Categoria_Pizza`;
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Rutas para Tamaños
app.get('/api/tamanos', async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM Tamano_Pizza`;
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener tamaños:', error);
    res.status(500).json({ error: 'Error al obtener tamaños' });
  }
});

// Rutas para Pizzas
app.get('/api/pizzas', async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM Pizza`;
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener pizzas:', error);
    res.status(500).json({ error: 'Error al obtener pizzas' });
  }
});

// Crear una nueva pizza
app.post('/api/pizzas', async (req, res) => {
  try {
    const { nombre, descripcion, precio_base, categoria_id } = req.body;
    // Obtener imagen de cualquiera de los dos campos
    const imagen_url = req.body.imagen_url || req.body.imagen || null;

    // Validación básica
    if (!nombre || !descripcion || !precio_base || !categoria_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const result = await sql.query`
      INSERT INTO Pizza (nombre, descripcion, precio_base, categoria_id, imagen_url)
      OUTPUT INSERTED.*
      VALUES (${nombre}, ${descripcion}, ${precio_base}, ${categoria_id}, ${imagen_url})
    `;

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error al crear pizza:', error);
    res.status(500).json({ error: 'Error al crear pizza', details: error.message });
  }
});


// Actualizar una pizza existente
app.put('/api/pizzas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Actualizando pizza con ID:", id);
    const { nombre, descripcion, precio_base, categoria_id } = req.body;

    // Obtener imagen de cualquiera de los dos campos
    const imagen_url = req.body.imagen_url || req.body.imagen || null;

    // Validación básica
    if (!nombre || !descripcion || !precio_base || !categoria_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Usar el enfoque con Request en lugar de template literals
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    request.input('nombre', sql.NVarChar, nombre);
    request.input('descripcion', sql.NVarChar, descripcion);
    request.input('precio_base', sql.Decimal(10, 2), precio_base);
    request.input('categoria_id', sql.Int, categoria_id);
    request.input('imagen_url', sql.NVarChar, imagen_url);

    const result = await request.query(`
      UPDATE Pizza
      SET nombre = @nombre,
          descripcion = @descripcion,
          precio_base = @precio_base,
          categoria_id = @categoria_id,
          imagen_url = @imagen_url
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Pizza no encontrada' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al actualizar pizza:', error);
    res.status(500).json({ error: 'Error al actualizar pizza', details: error.message });
  }
});

// Eliminar una pizza
app.delete('/api/pizzas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Eliminando pizza con ID:", id);

    // Verificar si la pizza está asociada a alguna orden
    const checkReferences = await sql.query`
      SELECT COUNT(*) as count FROM Detalle_Orden WHERE pizza_id = ${id}
    `;

    if (checkReferences.recordset[0].count > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar esta pizza porque está asociada a pedidos existentes'
      });
    }

    // Cambia la forma en que ejecutas la consulta DELETE
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    const result = await request.query('DELETE FROM Pizza WHERE id = @id');

    // Verifica si se eliminó algún registro
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Pizza no encontrada' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar pizza:', error);
    res.status(500).json({ error: 'Error al eliminar pizza', details: error.message });
  }
});

// ==================== API DE CLIENTES ====================

// Obtener todos los clientes
app.get('/api/clientes', async (req, res) => {
  try {
    // Cambiado para mostrar ID como 'id' consistentemente
    const result = await sql.query`
      SELECT id, nombre, email, direccion, telefono, password_hash
      FROM Cliente
      ORDER BY nombre ASC
    `;
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Obtener un cliente por ID
app.get('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const request = new sql.Request();
    request.input('id', sql.Int, id);
    // Cambiado cliente_id por id
    const result = await request.query('SELECT * FROM Cliente WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// Crear un nuevo cliente
app.post('/api/clientes', async (req, res) => {
  try {
    const { nombre, email, direccion, telefono, password } = req.body;

    // Validación básica
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'El nombre, email y contraseña son obligatorios' });
    }

    // Verificar si ya existe el email
    const checkEmail = new sql.Request();
    checkEmail.input('email', sql.NVarChar, email);
    const emailExists = await checkEmail.query('SELECT COUNT(*) as count FROM Cliente WHERE email = @email');

    if (emailExists.recordset[0].count > 0) {
      return res.status(400).json({ error: 'Ya existe un cliente con ese email' });
    }

    // Generar hash de la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const request = new sql.Request();
    request.input('nombre', sql.NVarChar, nombre);
    request.input('email', sql.NVarChar, email);
    request.input('direccion', sql.NVarChar, direccion || null);
    request.input('telefono', sql.NVarChar, telefono || null);
    request.input('password_hash', sql.NVarChar, password_hash);

    const result = await request.query(`
      INSERT INTO Cliente (nombre, email, direccion, telefono, password_hash)
      OUTPUT INSERTED.*
      VALUES (@nombre, @email, @direccion, @telefono, @password_hash)
    `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente', details: error.message });
  }
});

// Actualizar un cliente existente
app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, direccion, telefono, password } = req.body;

    // Validación básica
    if (!nombre || !email) {
      return res.status(400).json({ error: 'El nombre y email son obligatorios' });
    }

    // Verificar si el email ya existe para otro cliente
    const checkEmail = new sql.Request();
    checkEmail.input('email', sql.NVarChar, email);
    checkEmail.input('id', sql.Int, id);
    const emailExists = await checkEmail.query('SELECT COUNT(*) as count FROM Cliente WHERE email = @email AND id != @id');

    if (emailExists.recordset[0].count > 0) {
      return res.status(400).json({ error: 'Ya existe otro cliente con ese email' });
    }

    let query = `
      UPDATE Cliente
      SET nombre = @nombre,
          email = @email,
          direccion = @direccion,
          telefono = @telefono
    `;

    const request = new sql.Request();
    request.input('id', sql.Int, id);
    request.input('nombre', sql.NVarChar, nombre);
    request.input('email', sql.NVarChar, email);
    request.input('direccion', sql.NVarChar, direccion || null);
    request.input('telefono', sql.NVarChar, telefono || null);

    // Si se proporciona una nueva contraseña, actualizar el hash
    if (password) {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      request.input('password_hash', sql.NVarChar, password_hash);
      query += `, password_hash = @password_hash`;
    }

    query += ` OUTPUT INSERTED.* WHERE id = @id`;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente', details: error.message });
  }
});

// Eliminar un cliente
app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Eliminando cliente con ID:", id);

    // Verificar si el cliente tiene órdenes
    const checkOrders = new sql.Request();
    checkOrders.input('id', sql.Int, id);
    const hasOrders = await checkOrders.query('SELECT COUNT(*) as count FROM Orden WHERE cliente_id = @id');

    if (hasOrders.recordset[0].count > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar este cliente porque tiene pedidos asociados'
      });
    }

    const request = new sql.Request();
    request.input('id', sql.Int, id);
    // Cambiado cliente_id por id
    const result = await request.query('DELETE FROM Cliente WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente', details: error.message });
  }
});


app.post('/api/ordenes', async (req, res) => {
  const transaction = new sql.Transaction();

  try {
    const { cliente_id, items, metodo_pago, direccion_entrega, telefono_contacto, total } = req.body;

    console.log('Creating order with:', { cliente_id, metodo_pago, direccion_entrega, telefono_contacto, total });

    await transaction.begin();

    // Change 'orden_id' to 'id' in the OUTPUT clause
    const ordenResult = await transaction.request()
      .input('cliente_id', sql.Int, cliente_id)
      .input('estado', sql.VarChar, 'recibido')
      .input('direccion_entrega', sql.VarChar, direccion_entrega)
      .input('telefono_contacto', sql.VarChar, telefono_contacto)
      .input('metodo_pago', sql.VarChar, metodo_pago)
      .input('total', sql.Decimal(10, 2), total)
      .query(`
        INSERT INTO Orden (cliente_id, fecha_orden, estado, direccion_entrega, telefono_contacto, metodo_pago, total)
        OUTPUT INSERTED.id
        VALUES (@cliente_id, GETDATE(), @estado, @direccion_entrega, @telefono_contacto, @metodo_pago, @total)
      `);

    console.log("Order result:", ordenResult);

    // Get the ID with the correct name
    const orden_id = ordenResult.recordset[0].id;
    console.log("Created order with ID:", orden_id);

    if (!orden_id) {
      throw new Error("Failed to get orden_id from database");
    }

    // Calcular el total de la orden (for verification only)
    let calculatedTotal = 0;

    // Fix 5: Use orden_id directly instead of orden.orden_id
    for (const item of items) {
      const precioTotal = item.precio_unitario * item.cantidad;
      calculatedTotal += precioTotal;

      console.log(`Adding item: pizza_id=${item.pizza_id}, tamano_id=${item.tamano_id}, orden_id=${orden_id}`);

      await transaction.request()
        .input('orden_id', sql.Int, orden_id)
        .input('pizza_id', sql.Int, item.pizza_id)
        .input('tamano_id', sql.Int, item.tamano_id)
        .input('cantidad', sql.Int, item.cantidad)
        .input('precio_unitario', sql.Decimal(10, 2), item.precio_unitario)
        .query(`
          INSERT INTO Detalle_Orden (orden_id, pizza_id, tamano_id, cantidad, precio_unitario, subtotal)
          VALUES (@orden_id, @pizza_id, @tamano_id, @cantidad, @precio_unitario, @precio_unitario * @cantidad)
        `);
    }

    console.log(`Received total: ${total}, Calculated total: ${calculatedTotal}`);

    // Fix 6: Use orden_id here as well
    await transaction.request()
      .input('orden_id', sql.Int, orden_id)
      .input('metodo_pago', sql.VarChar, metodo_pago)
      .input('estado_pago', sql.VarChar, 'pendiente')  // Cambiado de 'estado' a 'estado_pago'
      .input('total', sql.Decimal(10, 2), total)
      .input('numero_factura', sql.VarChar, 'FAC-' + Date.now())
      .query(`
    INSERT INTO Factura (orden_id, numero_factura, metodo_pago, estado_pago, monto_total)
    VALUES (@orden_id, @numero_factura, @metodo_pago, @estado_pago, @total)
  `);

    await transaction.commit();

    // Crear un nuevo Request DESPUÉS del commit
    const newRequest = new sql.Request();
    newRequest.input('cliente_id', sql.Int, cliente_id);

    // Obtener información del cliente para el correo
    const clienteInfo = await newRequest.query(`
  SELECT nombre, email 
  FROM Cliente 
  WHERE id = @cliente_id
`);

    if (clienteInfo.recordset.length > 0) {
      const cliente = clienteInfo.recordset[0];

      // Obtener detalles completos de los items para el correo
      const detalleItems = [];
      for (const item of items) {
        const infoRequest = new sql.Request();
        const itemInfo = await infoRequest
          .input('pizza_id', sql.Int, item.pizza_id)
          .input('tamano_id', sql.Int, item.tamano_id)
          .query(`
    SELECT p.nombre as pizza_nombre, t.nombre as tamano_nombre
    FROM Pizza p 
    JOIN Tamano_Pizza t ON t.id = @tamano_id
    WHERE p.id = @pizza_id
  `);

        if (itemInfo.recordset.length > 0) {
          detalleItems.push({
            ...item,
            pizza_nombre: itemInfo.recordset[0].pizza_nombre,
            tamano_nombre: itemInfo.recordset[0].tamano_nombre
          });
        } else {
          detalleItems.push(item);
        }
      }

      // Enviar correo de confirmación (no esperamos a que termine)
      enviarConfirmacionOrden(
        cliente.email,
        cliente.nombre,
        orden_id,
        detalleItems,
        total,
        direccion_entrega
      ).catch(err => console.error('Error enviando confirmación:', err));
    }
    res.status(201).json({
      orden_id: orden_id,
      message: 'Orden creada con éxito'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: 'Error al crear orden' });
  }
});


// Rutas para facturas

app.get('/api/facturas', async (req, res) => {
  try {
    const result = await sql.query`
      SELECT f.*, o.estado as orden_estado, c.nombre as cliente_nombre
      FROM Factura f
      JOIN Orden o ON f.orden_id = o.id
      JOIN Cliente c ON o.cliente_id = c.id
      ORDER BY f.fecha_emision DESC
    `;

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

// Get invoice by ID
app.get('/api/facturas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const facturaResult = await sql.query`
      SELECT f.*, o.estado as orden_estado
      FROM Factura f
      JOIN Orden o ON f.orden_id = o.id
      WHERE f.id = ${id}
    `;

    if (facturaResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const factura = facturaResult.recordset[0];

    // Get order details for this invoice
    const ordenResult = await sql.query`
      SELECT o.*, c.nombre as cliente_nombre
      FROM Orden o
      JOIN Cliente c ON o.cliente_id = c.id
      WHERE o.id = ${factura.orden_id}
    `;

    factura.orden = ordenResult.recordset[0];

    // Get order items
    const itemsResult = await sql.query`
      SELECT d.*, p.nombre as pizza_nombre, t.nombre as tamano
      FROM Detalle_Orden d
      JOIN Pizza p ON d.pizza_id = p.id
      JOIN Tamano_Pizza t ON d.tamano_id = t.id
      WHERE d.orden_id = ${factura.orden_id}
    `;

    factura.items = itemsResult.recordset;

    res.json(factura);
  } catch (error) {
    console.error('Error al obtener la factura:', error);
    res.status(500).json({ error: 'Error al obtener la factura' });
  }
});

// Update invoice payment status
app.patch('/api/facturas/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_pago } = req.body;

    if (!['pendiente', 'completado', 'cancelado'].includes(estado_pago)) {
      return res.status(400).json({ error: 'Estado de pago no válido' });
    }

    const result = await sql.query`
      UPDATE Factura
      SET estado_pago = ${estado_pago}
      OUTPUT INSERTED.*
      WHERE id = ${id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al actualizar estado de factura:', error);
    res.status(500).json({ error: 'Error al actualizar estado de factura' });
  }
});

// ===================================================
// Rutas para estadísticas del panel de administración
// ===================================================

// Ingresos por mes
app.get('/api/stats/ingresos', async (req, res) => {
  try {
    const result = await sql.query`
      SELECT 
        CONCAT(DATENAME(MONTH, o.fecha_orden), ' ', YEAR(o.fecha_orden)) as name,
        SUM(f.monto_total) as value
      FROM Orden o
      JOIN Factura f ON o.id = f.orden_id
      WHERE o.fecha_orden >= DATEADD(MONTH, -6, GETDATE())
      GROUP BY CONCAT(DATENAME(MONTH, o.fecha_orden), ' ', YEAR(o.fecha_orden)), 
               YEAR(o.fecha_orden), MONTH(o.fecha_orden)
      ORDER BY YEAR(o.fecha_orden), MONTH(o.fecha_orden)
    `;

    //console.log("Datos de ingresos:", JSON.stringify(result.recordset, null, 2));
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener estadísticas de ingresos:', error);
    // NO devuelvas datos de ejemplo aquí
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Obtener pedidos por día para el gráfico de barras
app.get('/api/stats/pedidos-por-dia', async (req, res) => {
  try {
    const result = await sql.query`
      SELECT 
        CASE DATEPART(WEEKDAY, fecha_orden)
          WHEN 1 THEN 'Domingo'
          WHEN 2 THEN 'Lunes'
          WHEN 3 THEN 'Martes'
          WHEN 4 THEN 'Miercoles'
          WHEN 5 THEN 'Jueves'
          WHEN 6 THEN 'Viernes'
          WHEN 7 THEN 'Sábado'
        END as name,
        COUNT(*) as value
      FROM Orden
      WHERE fecha_orden >= DATEADD(DAY, -30, GETDATE())
      GROUP BY DATEPART(WEEKDAY, fecha_orden)
      ORDER BY DATEPART(WEEKDAY, fecha_orden)
    `;

    //console.log("Datos de pedidos por día:", JSON.stringify(result.recordset, null, 2));
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener estadísticas de pedidos por día:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Obtener ventas por categoría para el gráfico circular
// Corrige el endpoint ventas-por-categoria para agrupar por categoría en lugar de por pizza
app.get('/api/stats/ventas-por-categoria', async (req, res) => {
  try {
    const result = await sql.query`
      SELECT 
        c.nombre as name,
        COUNT(*) as value
      FROM Detalle_Orden do
      JOIN Pizza p ON do.pizza_id = p.id
      JOIN Categoria_Pizza c ON p.categoria_id = c.id
      JOIN Orden o ON do.orden_id = o.id
      WHERE o.fecha_orden >= DATEADD(MONTH, -1, GETDATE())
      GROUP BY c.nombre
      ORDER BY COUNT(*) DESC
    `;

    //console.log("Datos de ventas por categoría:", JSON.stringify(result.recordset, null, 2));
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener estadísticas de ventas por categoría:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Obtener estadísticas generales para tarjetas de resumen
app.get('/api/stats/resumen', async (req, res) => {
  try {
    // Ingresos de los últimos 30 días
    const ingresosUltimos30Dias = await sql.query`
      SELECT ISNULL(SUM(f.monto_total), 0) as total
      FROM Factura f
      JOIN Orden o ON f.orden_id = o.id
      WHERE o.fecha_orden >= DATEADD(DAY, -30, GETDATE())
    `;

    // Ingresos de los 30 días anteriores a los últimos 30 días
    const ingresos30a60Dias = await sql.query`
      SELECT ISNULL(SUM(f.monto_total), 0) as total
      FROM Factura f
      JOIN Orden o ON f.orden_id = o.id
      WHERE o.fecha_orden >= DATEADD(DAY, -60, GETDATE())
      AND o.fecha_orden < DATEADD(DAY, -30, GETDATE())
    `;

    // Pedidos de los últimos 30 días
    const pedidosUltimos30Dias = await sql.query`
      SELECT COUNT(*) as total
      FROM Orden
      WHERE fecha_orden >= DATEADD(DAY, -30, GETDATE())
    `;

    // Pedidos de los 30 días anteriores a los últimos 30 días
    const pedidos30a60Dias = await sql.query`
      SELECT COUNT(*) as total
      FROM Orden
      WHERE fecha_orden >= DATEADD(DAY, -60, GETDATE())
      AND fecha_orden < DATEADD(DAY, -30, GETDATE())
    `;

    // Clientes distintos con pedidos en los últimos 30 días
    const clientesUltimos30Dias = await sql.query`
      SELECT COUNT(DISTINCT cliente_id) as total
      FROM Orden
      WHERE fecha_orden >= DATEADD(DAY, -30, GETDATE())
    `;

    // Clientes distintos con pedidos entre 30 y 60 días atrás
    const clientes30a60Dias = await sql.query`
      SELECT COUNT(DISTINCT cliente_id) as total
      FROM Orden
      WHERE fecha_orden >= DATEADD(DAY, -60, GETDATE())
      AND fecha_orden < DATEADD(DAY, -30, GETDATE())
    `;

    // Obtener los valores
    const ingresosActual = parseFloat(ingresosUltimos30Dias.recordset[0].total || 0);
    const ingresosAnterior = parseFloat(ingresos30a60Dias.recordset[0].total || 0);
    const pedidosActual = parseInt(pedidosUltimos30Dias.recordset[0].total || 0);
    const pedidosAnterior = parseInt(pedidos30a60Dias.recordset[0].total || 0);
    const clientesActual = parseInt(clientesUltimos30Dias.recordset[0].total || 0);
    const clientesAnterior = parseInt(clientes30a60Dias.recordset[0].total || 0);

    // Evitar división por cero
    const ticketPromedioActual = pedidosActual > 0 ? ingresosActual / pedidosActual : 0;
    const ticketPromedioAnterior = pedidosAnterior > 0 ? ingresosAnterior / pedidosAnterior : 0;

    // Calcula cambios porcentuales
    const calcularCambio = (actual, anterior) => {
      if (anterior === 0) return actual > 0 ? 100 : 0;
      return ((actual - anterior) / anterior) * 100;
    };

    // Agregar logs para debugging
    console.log("Ingresos - Actual:", ingresosActual, "Anterior:", ingresosAnterior);
    console.log("Pedidos - Actual:", pedidosActual, "Anterior:", pedidosAnterior);
    console.log("Clientes - Actual:", clientesActual, "Anterior:", clientesAnterior);

    // Construir objeto de respuesta
    const resumen = {
      ingresos: {
        valor: Math.round(ingresosActual * 100) / 100,
        porcentajeCambio: Math.round(calcularCambio(ingresosActual, ingresosAnterior))
      },
      pedidos: {
        valor: pedidosActual,
        porcentajeCambio: Math.round(calcularCambio(pedidosActual, pedidosAnterior))
      },
      nuevosClientes: {
        valor: clientesActual,
        porcentajeCambio: Math.round(calcularCambio(clientesActual, clientesAnterior))
      },
      ticketPromedio: {
        valor: Math.round(ticketPromedioActual * 100) / 100,
        porcentajeCambio: Math.round(calcularCambio(ticketPromedioActual, ticketPromedioAnterior))
      }
    };

    // Log final de datos procesados
    console.log("Datos del resumen:", JSON.stringify(resumen, null, 2));

    res.json(resumen);
  } catch (error) {
    console.error('Error al obtener resumen de estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Obtener pedidos recientes para la tabla
app.get('/api/stats/pedidos-recientes', async (req, res) => {
  try {
    const result = await sql.query`
      SELECT TOP 5
        o.id,
        c.nombre as cliente,
        o.total as total,
        o.fecha_orden as fecha,
        o.estado
      FROM Orden o
      JOIN Cliente c ON o.cliente_id = c.id
      ORDER BY o.fecha_orden DESC
    `;

    //console.log("Datos de pedidos recientes:", JSON.stringify(result.recordset, null, 2));
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener pedidos recientes:', error);
    res.status(500).json({ error: 'Error al obtener pedidos recientes' });
  }
});

// Rutas para autenticación
// Registro de usuario/cliente
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, email, password, direccion, telefono } = req.body;

    console.log("Datos recibidos para registro:", { nombre, email, direccion, telefono });

    // Validación básica
    if (!nombre || !email || !password) {
      return res.status(400).json({
        message: 'Por favor, completa todos los campos obligatorios'
      });
    }

    // Verificar si ya existe el email
    const checkEmail = new sql.Request();
    checkEmail.input('email', sql.NVarChar, email);
    const emailExists = await checkEmail.query('SELECT COUNT(*) as count FROM Cliente WHERE email = @email');

    if (emailExists.recordset[0].count > 0) {
      return res.status(400).json({
        message: 'Este correo electrónico ya está registrado'
      });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Crear el cliente
    const request = new sql.Request();
    request.input('nombre', sql.NVarChar, nombre);
    request.input('email', sql.NVarChar, email);
    request.input('password_hash', sql.NVarChar, password_hash);
    request.input('direccion', sql.NVarChar, direccion || null);
    request.input('telefono', sql.NVarChar, telefono || null);

    const result = await request.query(`
      INSERT INTO Cliente (nombre, email, password_hash, direccion, telefono)
      OUTPUT INSERTED.*
      VALUES (@nombre, @email, @password_hash, @direccion, @telefono)
    `);

    const newUser = result.recordset[0];

    // Generar token JWT para autenticación
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'tu_clave_secreta',
      { expiresIn: '24h' }
    );

    // Eliminar el password_hash antes de enviar la respuesta
    delete newUser.password_hash;

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    // Get user by email
    const result = await sql.query`
      SELECT id, nombre, email, direccion, telefono, password_hash, es_admin
      FROM Cliente 
      WHERE email = ${email}
    `;

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = result.recordset[0];

    // SPECIAL HANDLING FOR TEST ACCOUNTS
    if (email === 'usuario@ejemplo.com' && password === 'usuario123') {
      console.log("Using direct password match for test account");
      // Skip bcrypt for this test account
    } else if (email === 'admin@pizzadelicia.com' && password === 'admin123') {
      console.log("Using direct password match for admin account");
      // Skip bcrypt for admin account
    } else {
      // For all other accounts, use bcrypt
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }
    }

    // Generate a token
    const token = 'token_ejemplo_' + Date.now();

    res.json({
      token,
      user: {
        cliente_id: user.id,
        nombre: user.nombre,
        email: user.email,
        direccion: user.direccion,
        telefono: user.telefono,
        es_admin: user.es_admin
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});


// Administración
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Verificar si es un usuario administrador
    const result = await sql.query`
      SELECT id, nombre, email, password_hash
      FROM Cliente 
      WHERE email = ${email} AND es_admin = 1
    `;

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = result.recordset[0];

    // SPECIAL HANDLING FOR ADMIN ACCOUNT
    if (email === 'admin@pizzadelicia.com' && password === 'admin123') {
      // Skip bcrypt for admin test account - SOLO PARA DESARROLLO
      // En producción, todos los usuarios deberían usar bcrypt
    } else {
      // For all other admin accounts, use bcrypt
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }
    }

    // Generate token
    const token = 'admin_token_ejemplo_' + Date.now();

    // Modify the response to include role explicitly
    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: 'admin', // Explicitly add this
        es_admin: true
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión como administrador:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Middleware para verificar autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // En un sistema de producción, este registro sería más detallado
  // y dirigido a un sistema de registro centralizado

  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // En un entorno real, verificaríamos el token JWT
  // Aquí simplemente verificamos si comienza con 'token_ejemplo_'
  if (!token.startsWith('token_ejemplo_') && !token.startsWith('admin_token_ejemplo_')) {
    return res.status(403).json({ error: 'Token inválido' });
  }

  // Inicializa req.user para evitar undefined
  req.user = {};

  // Verifica si el header de admin está presente
  if (req.headers['x-is-admin'] === 'true') {
    req.user.isAdmin = true;
    req.user.role = 'admin';
    req.user.id = 999; // ID ficticio para admin
    req.user.nombre = 'Administrador';
  } else {
    // Para usuarios normales
    const isNormalUser = token.startsWith('token_ejemplo_');
    if (isNormalUser) {
      req.user.id = 1; // ID ficticio para usuario normal
      req.user.role = 'user';
    }
  }

  next();
}

// Ruta protegida para obtener información del usuario autenticado
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    // Check if admin flag is present in token or headers
    const isAdmin = req.user?.isAdmin ||
      req.user?.role === 'admin' ||
      req.headers['x-is-admin'] === 'true';

    // Podríamos registrar acciones importantes en un sistema de logs real

    // Si es un administrador, devuelve información de administrador
    if (isAdmin) {
      // En un sistema real, obtendrías estos datos de la base de datos
      return res.json({
        id: req.user?.id || 999,
        nombre: req.user?.nombre || 'Administrador',
        email: req.user?.email || 'admin@pizzadelicia.com',
        role: 'admin'  // Importante! Establece esto explícitamente
      });
    }

    // De lo contrario, devuelve información de usuario regular
    // Aquí puedes buscar en tu base de datos si es necesario
    res.json({
      cliente_id: req.user?.id || 2,
      nombre: req.user?.nombre || 'Cliente Regular',
      email: req.user?.email || 'cliente@ejemplo.com',
      direccion: req.user?.direccion || 'Calle Cliente 123',
      telefono: req.user?.telefono || '555-123-4567'
    });
  } catch (error) {
    console.error('Error retrieving user information:', error);
    res.status(500).json({ error: 'Error retrieving user information' });
  }
});

// ==================== API DE ÓRDENES ====================

// Obtener todas las órdenes con detalles
app.get('/api/ordenes', async (req, res) => {
  try {
    // Consulta principal para obtener órdenes
    const result = await sql.query`
  SELECT 
    o.id as orden_id, 
    o.cliente_id, 
    c.nombre as cliente_nombre,
    o.fecha_orden as fecha,
    o.estado, -- Asegúrate de que este campo aparezca una sola vez
    o.metodo_pago,
    o.direccion_entrega,
    o.telefono_contacto,
    ISNULL(SUM(d.precio_unitario * d.cantidad), 0) as total
  FROM Orden o
  LEFT JOIN Cliente c ON o.cliente_id = c.id
  LEFT JOIN Detalle_Orden d ON o.id = d.orden_id
  GROUP BY o.id, o.cliente_id, c.nombre, o.fecha_orden, o.estado, o.metodo_pago, o.direccion_entrega, o.telefono_contacto
  ORDER BY o.fecha_orden DESC
`;


    const ordenes = result.recordset;

    // Para cada orden, obtener sus detalles
    for (const orden of ordenes) {
      const detallesResult = await sql.query`
        SELECT 
          d.id as detalle_id,
          d.orden_id,
          d.pizza_id,
          p.nombre as pizza_nombre,
          d.tamano_id,
          d.cantidad,
          d.precio_unitario
        FROM Detalle_Orden d
        JOIN Pizza p ON d.pizza_id = p.id
        WHERE d.orden_id = ${orden.orden_id}
      `;

      orden.items = detallesResult.recordset;
    }

    res.json(ordenes);
  } catch (error) {
    console.error('Error al obtener las órdenes:', error);
    res.status(500).json({ error: 'Error al obtener las órdenes' });
  }
});

// Obtener una orden específica por ID
app.get('/api/ordenes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la orden
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    const ordenResult = await request.query(`
      SELECT 
        o.id as orden_id, 
        o.cliente_id, 
        c.nombre as cliente_nombre,
        o.fecha_orden as fecha,
        o.estado,
        o.metodo_pago,
        o.estado,
        o.direccion_entrega,
        ISNULL((SELECT SUM(precio_unitario * cantidad) FROM Detalle_Orden WHERE orden_id = o.id), 0) as total
      FROM Orden o
      LEFT JOIN Cliente c ON o.cliente_id = c.id
      WHERE o.id = @id
    `);

    if (ordenResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const orden = ordenResult.recordset[0];

    // Obtener los detalles de la orden
    const detallesResult = await request.query(`
      SELECT 
        d.id as detalle_id,
        d.orden_id,
        d.pizza_id,
        p.nombre as pizza_nombre,
        d.tamano_id,
        d.cantidad,
        d.precio_unitario
      FROM Detalle_Orden d
      JOIN Pizza p ON d.pizza_id = p.id
      WHERE d.orden_id = @id
    `);

    orden.items = detallesResult.recordset;

    res.json(orden);
  } catch (error) {
    console.error('Error al obtener la orden:', error);
    res.status(500).json({ error: 'Error al obtener la orden' });
  }
});

// Actualizar el estado de una orden
app.patch('/api/ordenes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar el estado
    const estadosValidos = ['recibido', 'en preparacion', 'en camino', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    // Actualizar el estado
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    request.input('estado', sql.VarChar, estado);

    const result = await request.query(`
      UPDATE Orden
      SET estado = @estado
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al actualizar el estado de la orden:', error);
    res.status(500).json({ error: 'Error al actualizar el estado de la orden' });
  }
});

// Endpoint para generar una factura
app.post('/api/facturas/generar/:ordenId', async (req, res) => {
  try {
    const { ordenId } = req.params;

    // Verificar si la orden existe
    const request = new sql.Request();
    request.input('id', sql.Int, ordenId);
    const ordenResult = await request.query(`
      SELECT * FROM Orden WHERE id = @id
    `);

    if (ordenResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Verificar si ya existe una factura para esta orden
    const facturaResult = await request.query(`
      SELECT * FROM Factura WHERE orden_id = @id
    `);

    if (facturaResult.recordset.length > 0) {
      // Ya existe una factura
      return res.json({
        message: 'La factura ya existe',
        factura_id: facturaResult.recordset[0].id,
        monto_total: facturaResult.recordset[0].monto_total
      });
    }

    // Calcular el total de la orden
    const totalResult = await request.query(`
      SELECT ISNULL(SUM(precio_unitario * cantidad), 0) as total
      FROM Detalle_Orden
      WHERE orden_id = @id
    `);

    const monto_total = totalResult.recordset[0].total;

    // Generar una nueva factura con los campos correctos
    request.input('orden_id', sql.Int, ordenId);
    request.input('fecha_emision', sql.DateTime, new Date());
    request.input('monto_total', sql.Decimal(10, 2), monto_total);
    request.input('numero_factura', sql.NVarChar, `FAC-${Date.now()}`);
    request.input('estado_pago', sql.NVarChar, 'pendiente');
    request.input('metodo_pago', sql.NVarChar, ordenResult.recordset[0].metodo_pago);

    const nuevaFacturaResult = await request.query(`
      INSERT INTO Factura (orden_id, fecha_emision, monto_total, numero_factura, estado_pago, metodo_pago)
      OUTPUT INSERTED.*
      VALUES (@orden_id, @fecha_emision, @monto_total, @numero_factura, @estado_pago, @metodo_pago)
    `);

    const nuevaFactura = nuevaFacturaResult.recordset[0];

    res.status(201).json({
      message: 'Factura generada correctamente',
      factura_id: nuevaFactura.id,
      monto_total: nuevaFactura.monto_total
    });
  } catch (error) {
    console.error('Error al generar la factura:', error);
    res.status(500).json({ error: 'Error al generar la factura' });
  }
});


// =====================GENERACION FACTURA======================
// Ruta para generar y descargar un PDF de la factura
app.get('/api/facturas/descargar/:ordenId', async (req, res) => {
  try {
    const { ordenId } = req.params;

    // 1. Verificar si existe una factura para esta orden
    const requestCheck = new sql.Request();
    requestCheck.input('ordenId', sql.Int, ordenId);
    const facturaResult = await requestCheck.query(`
      SELECT f.id as factura_id, 
             f.fecha_emision,
             f.monto_total, 
             f.estado_pago,
             f.numero_factura,
             o.cliente_id, 
             c.nombre as cliente_nombre, 
             c.email as cliente_email,
             o.fecha_orden, 
             o.direccion_entrega, 
             o.telefono_contacto
      FROM Factura f
      JOIN Orden o ON f.orden_id = o.id
      JOIN Cliente c ON o.cliente_id = c.id
      WHERE f.orden_id = @ordenId
    `);

    // Si no hay factura generada, primero hay que generarla
    if (facturaResult.recordset.length === 0) {
      return res.status(404).json({ error: 'No existe una factura para esta orden. Debe generar la factura primero.' });
    }

    // 2. Obtener los detalles de la factura
    const factura = facturaResult.recordset[0];

    // 3. Obtener los items de la orden
    const requestItems = new sql.Request();
    requestItems.input('ordenId', sql.Int, ordenId);
    const itemsResult = await requestItems.query(`
      SELECT d.id as detalle_id, p.nombre as pizza_nombre, t.nombre as tamano_nombre,
             d.cantidad, d.precio_unitario
      FROM Detalle_Orden d
      JOIN Pizza p ON d.pizza_id = p.id
      JOIN Tamano_Pizza t ON d.tamano_id = t.id
      WHERE d.orden_id = @ordenId
    `);

    const items = itemsResult.recordset;

    // 4. Generar el PDF
    const dirPath = path.join(__dirname, 'facturas');
    await fs.ensureDir(dirPath);

    // Nombre del archivo PDF
    const fileName = `factura_${factura.factura_id}_${Date.now()}.pdf`;
    const filePath = path.join(dirPath, fileName);

    // Crear un nuevo documento PDF
    const doc = new PDFDocument({ margin: 50 });

    // Pipe el PDF a un archivo y a la respuesta
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Añadir encabezado de factura
    doc.fontSize(25).text('FACTURA', { align: 'center' });
    doc.moveDown();

    // Información de la pizzería
    doc.fontSize(12).text('Pizzería Deliciosa', { align: 'center' });
    doc.fontSize(10)
      .text('3ra Calle 4-42 Zona 1, Chimaltenango, Guatemala', { align: 'center' })
      .text('Tel: +(502) 7839-5678', { align: 'center' })
      .text('info@pizzeriadeliciosa.com', { align: 'center' });

    doc.moveDown(2);

    // Detalles de la factura y cliente
    doc.fontSize(12).text(`Factura #: ${factura.numero_factura || factura.factura_id}`, { continued: true })
      .text(`Fecha: ${new Date(factura.fecha_emision).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    doc.fontSize(12).text('Cliente:');
    doc.fontSize(10)
      .text(`Nombre: ${factura.cliente_nombre}`)
      .text(`Teléfono: ${factura.telefono_contacto || 'No especificado'}`)
      .text(`Dirección: ${factura.direccion_entrega || 'No especificada'}`);

    doc.moveDown(0.5);
    doc.fontSize(10)
      .text(`Estado de pago: ${factura.estado_pago || 'Pendiente'}`, { align: 'right' });
    doc.moveDown(2);

    // El resto del código para generar el PDF permanece igual...
    // Crear tabla para los items
    const tableTop = doc.y;
    const itemX = 50;
    const descriptionX = 150;
    const quantityX = 290;
    const priceX = 370;
    const amountX = 450;

    // Encabezados de columnas
    doc.fontSize(10)
      .text('Item', itemX, tableTop)
      .text('Descripción', descriptionX, tableTop)
      .text('Cantidad', quantityX, tableTop)
      .text('Precio', priceX, tableTop)
      .text('Importe', amountX, tableTop);

    // Línea horizontal después de encabezados
    doc.moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Añadir items
    let y = tableTop + 25;
    let totalAmount = 0;

    items.forEach((item, i) => {
      const itemTotal = item.cantidad * item.precio_unitario;
      totalAmount += itemTotal;

      doc.fontSize(10)
        .text(i + 1, itemX, y)
        .text(`${item.pizza_nombre} (${item.tamano_nombre})`, descriptionX, y)
        .text(item.cantidad, quantityX, y)
        .text(`Q${item.precio_unitario.toFixed(2)}`, priceX, y)
        .text(`Q${itemTotal.toFixed(2)}`, amountX, y);

      y += 20;

      // Añadir otra página si es necesario
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });

    // Línea horizontal después de items
    doc.moveTo(50, y)
      .lineTo(550, y)
      .stroke();

    y += 20;

    // Totales
    doc.fontSize(10)
      .text('Subtotal:', 350, y)
      .text(`Q${totalAmount.toFixed(2)}`, amountX, y);

    y += 20;

    doc.fontSize(10)
      .text('IVA (12%):', 350, y)
      .text(`Q${(totalAmount * 0.12).toFixed(2)}`, amountX, y);

    y += 20;

    doc.fontSize(12).font('Helvetica-Bold')
      .text('TOTAL:', 350, y)
      .text(`Q${factura.monto_total.toFixed(2)}`, amountX, y);

    // Pie de página
    doc.fontSize(10).font('Helvetica')
      .text('Gracias por su compra!', { align: 'center' });

    // Finalizar el PDF
    doc.end();

    // Esperar a que el archivo se escriba completamente
    stream.on('finish', () => {
      // Enviar el archivo al cliente
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      fs.createReadStream(filePath).pipe(res);
    });

  } catch (error) {
    console.error('Error al generar el PDF de la factura:', error);
    res.status(500).json({ error: 'Error al generar el PDF de la factura' });
  }
});

// =========================EXPORTACIONES ==========================


// Endpoint para generar reporte de ventas en Excel
app.get('/api/reportes/ventas', async (req, res) => {
  try {
    // Parámetros opcionales para filtrado
    const { fechaInicio, fechaFin } = req.query;

    const request = new sql.Request();

    // Construir consulta SQL con filtros opcionales
    let query = `
      SELECT 
        o.id as orden_id,
        o.fecha_orden as fecha,
        c.nombre as cliente,
        o.metodo_pago,
        o.estado,
        f.numero_factura,
        f.estado_pago,
        o.total
      FROM Orden o
      LEFT JOIN Cliente c ON o.cliente_id = c.id
      LEFT JOIN Factura f ON o.id = f.orden_id
    `;

    const whereConditions = [];

    if (fechaInicio) {
      request.input('fechaInicio', sql.DateTime, new Date(fechaInicio));
      whereConditions.push('o.fecha_orden >= @fechaInicio');
    }

    if (fechaFin) {
      request.input('fechaFin', sql.DateTime, new Date(fechaFin));
      whereConditions.push('o.fecha_orden <= @fechaFin');
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY o.fecha_orden DESC';

    const result = await request.query(query);
    const ventas = result.recordset;

    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Pizzería Deliciosa';
    workbook.created = new Date();

    // Agregar una hoja para el reporte
    const worksheet = workbook.addWorksheet('Reporte de Ventas');

    // Estilo para encabezados
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D72323' } },
      alignment: { horizontal: 'center' }
    };

    // Definir columnas
    worksheet.columns = [
      { header: 'ID Orden', key: 'orden_id', width: 10 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Método de Pago', key: 'metodo_pago', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: '# Factura', key: 'numero_factura', width: 15 },
      { header: 'Estado Pago', key: 'estado_pago', width: 15 },
      { header: 'Total (Q)', key: 'total', width: 12 }
    ];

    // Aplicar estilo a encabezados
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = headerStyle.font;
      cell.fill = headerStyle.fill;
      cell.alignment = headerStyle.alignment;
    });

    // Agregar datos a la hoja
    ventas.forEach(venta => {
      worksheet.addRow({
        orden_id: venta.orden_id,
        fecha: format(new Date(venta.fecha), 'dd/MM/yyyy HH:mm'),
        cliente: venta.cliente,
        metodo_pago: venta.metodo_pago,
        estado: venta.estado,
        numero_factura: venta.numero_factura || 'N/A',
        estado_pago: venta.estado_pago || 'N/A',
        total: venta.total
      });
    });

    // Aplicar formato de moneda a columna de total
    worksheet.getColumn('total').numFmt = '"Q"#,##0.00';

    // Agregar fila de totales
    const totalRow = worksheet.rowCount + 2;
    worksheet.addRow(['', '', '', '', '', '', 'TOTAL:', { formula: `SUM(H2:H${worksheet.rowCount})` }]);
    worksheet.getCell(`H${totalRow}`).numFmt = '"Q"#,##0.00';
    worksheet.getCell(`G${totalRow}`).font = { bold: true };
    worksheet.getCell(`H${totalRow}`).font = { bold: true };

    // Establecer nombre del archivo
    const fechaActual = format(new Date(), 'yyyy-MM-dd_HHmm');
    const filename = `Reporte_Ventas_${fechaActual}.xlsx`;

    // Configurar respuesta HTTP
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Enviar el archivo Excel
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error al generar reporte de ventas:', error);
    res.status(500).json({ error: 'Error al generar reporte de ventas' });
  }
});

// Endpoint para reporte de productos más vendidos
app.get('/api/reportes/productos', async (req, res) => {
  try {
    // Similar al endpoint anterior, pero con diferente consulta SQL y estructura
    const result = await sql.query`
      SELECT 
        p.id as pizza_id,
        p.nombre as pizza_nombre,
        t.nombre as tamano,
        COUNT(*) as cantidad_vendida,
        SUM(d.cantidad) as unidades_vendidas,
        SUM(d.precio_unitario * d.cantidad) as ingresos_totales
      FROM Detalle_Orden d
      JOIN Pizza p ON d.pizza_id = p.id
      JOIN Tamano_Pizza t ON d.tamano_id = t.id
      JOIN Orden o ON d.orden_id = o.id
      WHERE o.estado != 'cancelado'
      GROUP BY p.id, p.nombre, t.nombre
      ORDER BY unidades_vendidas DESC
    `;

    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Pizzería Deliciosa';
    workbook.created = new Date();

    // Agregar una hoja para el reporte
    const worksheet = workbook.addWorksheet('Productos Vendidos');

    // Estilo para encabezados
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D72323' } },
      alignment: { horizontal: 'center' }
    };

    // Definir columnas
    worksheet.columns = [
      { header: 'ID', key: 'pizza_id', width: 8 },
      { header: 'Nombre', key: 'pizza_nombre', width: 25 },
      { header: 'Tamaño', key: 'tamano', width: 15 },
      { header: 'Cantidad Vendida', key: 'cantidad_vendida', width: 15 },
      { header: 'Unidades', key: 'unidades_vendidas', width: 12 },
      { header: 'Ingresos (Q)', key: 'ingresos_totales', width: 15 }
    ];

    // Aplicar estilo a encabezados
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = headerStyle.font;
      cell.fill = headerStyle.fill;
      cell.alignment = headerStyle.alignment;
    });

    // Agregar datos a la hoja
    result.recordset.forEach(item => {
      worksheet.addRow({
        pizza_id: item.pizza_id,
        pizza_nombre: item.pizza_nombre,
        tamano: item.tamano,
        cantidad_vendida: item.cantidad_vendida,
        unidades_vendidas: item.unidades_vendidas,
        ingresos_totales: item.ingresos_totales
      });
    });

    // Aplicar formato de moneda a columna de ingresos
    worksheet.getColumn('ingresos_totales').numFmt = '"Q"#,##0.00';

    // Agregar fila de totales
    const totalRow = worksheet.rowCount + 2;
    worksheet.addRow(['', '', '', 'TOTAL:',
      { formula: `SUM(E2:E${worksheet.rowCount})` },
      { formula: `SUM(F2:F${worksheet.rowCount})` }
    ]);
    worksheet.getCell(`F${totalRow}`).numFmt = '"Q"#,##0.00';
    worksheet.getCell(`D${totalRow}`).font = { bold: true };
    worksheet.getCell(`E${totalRow}`).font = { bold: true };
    worksheet.getCell(`F${totalRow}`).font = { bold: true };

    // Establecer nombre del archivo
    const fechaActual = format(new Date(), 'yyyy-MM-dd_HHmm');
    const filename = `Reporte_Productos_${fechaActual}.xlsx`;

    // Configurar respuesta HTTP
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Enviar el archivo Excel
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error al generar reporte de productos:', error);
    res.status(500).json({ error: 'Error al generar reporte de productos' });
  }
});


// ==================== Automatizacion Correo ====================



const resend = new Resend('re_EmR74UWN_9Wpd4ju5egcwhueLvetKtsYd');
// Función para enviar correo con factura
async function enviarCorreoFactura(clienteEmail, clienteNombre, ordenId, facturaId, facturaPdf) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Pizzería Deliciosa <facturacion@wilson-sistemas.me>', // Cambiar a tu dominio
      to: clienteEmail, // Ya puedes enviar a cualquier correo con tu dominio verificado
      subject: `🍕 Tu Factura #${facturaId} - Pizzería Deliciosa`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #D72323; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Pizzería Deliciosa</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hola <strong>${clienteNombre}</strong>,</p>
            <p>¡Gracias por tu pedido en Pizzería Deliciosa! Adjunto encontrarás la factura correspondiente a tu orden #${ordenId}.</p>
            <p>Si tienes alguna pregunta sobre tu orden o factura, no dudes en contactarnos.</p>
            <p>¡Esperamos que disfrutes tu pizza!</p>
            <p style="margin-top: 30px;">Saludos cordiales,</p>
            <p><strong>El equipo de Pizzería Deliciosa</strong></p>
          </div>
          
          <div style="text-align: center; padding: 10px; color: #666; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px;">
            <p>Pizzería Deliciosa | 3ra Calle 4-42 Zona 1, Chimaltenango, Guatemala</p>
            <p>Tel: +(502) 7839-5678 | info@pizzeriadeliciosa.com</p>
            <p>© ${new Date().getFullYear()} Pizzería Deliciosa. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `factura_${facturaId}.pdf`,
          content: facturaPdf.toString('base64')
        }
      ]
    });

    if (error) {
      console.error('Error al enviar correo de factura:', error);
      return false;
    }

    console.log(`Correo de factura enviado a ${clienteEmail}: ${data.id}`);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de factura:', error);
    return false;
  }
}

// Añadir después de la función enviarCorreoFactura
async function enviarConfirmacionOrden(clienteEmail, clienteNombre, ordenId, items, total, direccionEntrega) {
  try {
    // Crear tabla HTML con los productos
    let tablaProductos = `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Producto</th>
          <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Cantidad</th>
          <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Precio</th>
        </tr>
    `;

    for (const item of items) {
      tablaProductos += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.pizza_nombre} (${item.tamano_nombre || 'Regular'})</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">${item.cantidad}x</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">Q${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
        </tr>
      `;
    }

    tablaProductos += `
        <tr style="font-weight: bold;">
          <td style="padding: 8px; text-align: right;" colspan="2">Total:</td>
          <td style="padding: 8px; text-align: right;">Q${total.toFixed(2)}</td>
        </tr>
      </table>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Pizzería Deliciosa <pedidos@wilson-sistemas.me>', // Cambiar a tu dominio
      to: clienteEmail, // Ya puedes enviar a cualquier correo con tu dominio verificado
      subject: `🍕 Confirmación de tu Orden #${ordenId} - Pizzería Deliciosa`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #D72323; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">¡Gracias por tu Pedido!</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hola <strong>${clienteNombre}</strong>,</p>
            <p>Hemos recibido tu orden correctamente. Aquí está el resumen de tu pedido:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Número de Orden:</strong> #${ordenId}</p>
              <p style="margin: 5px 0;"><strong>Dirección de Entrega:</strong> ${direccionEntrega || 'No especificada'}</p>
              <p style="margin: 5px 0;"><strong>Estado:</strong> Recibido</p>
            </div>
            
            <h3 style="color: #D72323;">Detalle del Pedido:</h3>
            ${tablaProductos}
            
            <p>Te enviaremos actualizaciones sobre el estado de tu pedido. ¡Prepárate para disfrutar de nuestras deliciosas pizzas!</p>
            <p style="margin-top: 30px;">Saludos cordiales,</p>
            <p><strong>El equipo de Pizzería Deliciosa</strong></p>
          </div>
          <div style="text-align: center; padding: 10px; color: #666; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px;">
            <p>Pizzería Deliciosa | 3ra Calle 4-42 Zona 1, Chimaltenango, Guatemala</p>
            <p>Tel: +(502) 7839-5678 | info@pizzeriadeliciosa.com</p>
            <p>© ${new Date().getFullYear()} Pizzería Deliciosa. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Error al enviar confirmación de orden:', error);
      return false;
    }

    console.log(`Confirmación de orden enviada a ${clienteEmail}: ${data.id}`);
    return true;
  } catch (error) {
    console.error('Error al enviar confirmación de orden:', error);
    return false;
  }
}

// Nuevo endpoint específico para enviar la factura por correo
app.post('/api/facturas/:id/enviar-email', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la información de la factura y el cliente
    const request = new sql.Request();
    request.input('id', sql.Int, id);

    const facturaResult = await request.query(`
      SELECT f.id as factura_id, f.orden_id, f.numero_factura, 
             c.email as cliente_email, c.nombre as cliente_nombre
      FROM Factura f
      JOIN Orden o ON f.orden_id = o.id
      JOIN Cliente c ON o.cliente_id = c.id
      WHERE f.id = @id
    `);

    if (facturaResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const factura = facturaResult.recordset[0];

    // Generar el PDF
    const pdfBuffer = await generarPdfFactura(factura.orden_id);

    // Enviar por correo
    const emailEnviado = await enviarCorreoFactura(
      factura.cliente_email,
      factura.cliente_nombre,
      factura.orden_id,
      factura.factura_id,
      pdfBuffer
    );

    if (emailEnviado) {
      res.json({ success: true, message: `Factura enviada a ${factura.cliente_email}` });
    } else {
      res.status(500).json({ error: 'Error al enviar el correo' });
    }

  } catch (error) {
    console.error('Error al enviar factura por correo:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Función para generar el PDF (extractada del código existente)
async function generarPdfFactura(ordenId) {
  try {
    // 1. Verificar si existe una factura para esta orden
    const requestCheck = new sql.Request();
    requestCheck.input('ordenId', sql.Int, ordenId);
    const facturaResult = await requestCheck.query(`
      SELECT f.id as factura_id, 
             f.fecha_emision,
             f.monto_total, 
             f.estado_pago,
             f.numero_factura,
             o.cliente_id, 
             c.nombre as cliente_nombre, 
             c.email as cliente_email,
             o.fecha_orden, 
             o.direccion_entrega, 
             o.telefono_contacto
      FROM Factura f
      JOIN Orden o ON f.orden_id = o.id
      JOIN Cliente c ON o.cliente_id = c.id
      WHERE f.orden_id = @ordenId
    `);

    if (facturaResult.recordset.length === 0) {
      throw new Error('Factura no encontrada');
    }

    // 2. Obtener los detalles de la factura
    const factura = facturaResult.recordset[0];

    // 3. Obtener los items de la orden
    const requestItems = new sql.Request();
    requestItems.input('ordenId', sql.Int, ordenId);
    const itemsResult = await requestItems.query(`
      SELECT d.id as detalle_id, p.nombre as pizza_nombre, t.nombre as tamano_nombre,
             d.cantidad, d.precio_unitario
      FROM Detalle_Orden d
      JOIN Pizza p ON d.pizza_id = p.id
      JOIN Tamano_Pizza t ON d.tamano_id = t.id
      WHERE d.orden_id = @ordenId
    `);

    const items = itemsResult.recordset;

    // 4. Generar el PDF
    const doc = new PDFDocument({ margin: 50 });

    // Generar el PDF como buffer en lugar de archivo
    return new Promise((resolve, reject) => {
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Añadir encabezado de factura
      doc.fontSize(25).text('FACTURA', { align: 'center' });
      doc.moveDown();

      // Información de la pizzería
      doc.fontSize(12).text('Pizzería Deliciosa', { align: 'center' });
      doc.fontSize(10)
        .text('3ra Calle 4-42 Zona 1, Chimaltenango, Guatemala', { align: 'center' })
        .text('Tel: +(502) 7839-5678', { align: 'center' })
        .text('info@pizzeriadeliciosa.com', { align: 'center' });

      doc.moveDown(2);

      // Detalles de la factura y cliente
      doc.fontSize(12).text(`Factura #: ${factura.numero_factura || factura.factura_id}`, { continued: true })
        .text(`Fecha: ${new Date(factura.fecha_emision).toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      doc.fontSize(12).text('Cliente:');
      doc.fontSize(10)
        .text(`Nombre: ${factura.cliente_nombre}`)
        .text(`Teléfono: ${factura.telefono_contacto || 'No especificado'}`)
        .text(`Dirección: ${factura.direccion_entrega || 'No especificada'}`);

      doc.moveDown(0.5);
      doc.fontSize(10)
        .text(`Estado de pago: ${factura.estado_pago || 'Pendiente'}`, { align: 'right' });
      doc.moveDown(2);

      // Crear tabla para los items
      const tableTop = doc.y;
      const itemX = 50;
      const descriptionX = 150;
      const quantityX = 290;
      const priceX = 370;
      const amountX = 450;

      // Encabezados de columnas
      doc.fontSize(10)
        .text('Item', itemX, tableTop)
        .text('Descripción', descriptionX, tableTop)
        .text('Cantidad', quantityX, tableTop)
        .text('Precio', priceX, tableTop)
        .text('Importe', amountX, tableTop);

      // Línea horizontal después de encabezados
      doc.moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Añadir items
      let y = tableTop + 25;
      let totalAmount = 0;

      items.forEach((item, i) => {
        const itemTotal = item.cantidad * item.precio_unitario;
        totalAmount += itemTotal;

        doc.fontSize(10)
          .text(i + 1, itemX, y)
          .text(`${item.pizza_nombre} (${item.tamano_nombre})`, descriptionX, y)
          .text(item.cantidad, quantityX, y)
          .text(`Q${item.precio_unitario.toFixed(2)}`, priceX, y)
          .text(`Q${itemTotal.toFixed(2)}`, amountX, y);

        y += 20;

        // Añadir otra página si es necesario
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
      });

      // Línea horizontal después de items
      doc.moveTo(50, y)
        .lineTo(550, y)
        .stroke();

      y += 20;

      // Totales
      doc.fontSize(10)
        .text('Subtotal:', 350, y)
        .text(`Q${totalAmount.toFixed(2)}`, amountX, y);

      y += 20;

      doc.fontSize(10)
        .text('IVA (12%):', 350, y)
        .text(`Q${(totalAmount * 0.12).toFixed(2)}`, amountX, y);

      y += 20;

      doc.fontSize(12).font('Helvetica-Bold')
        .text('TOTAL:', 350, y)
        .text(`Q${factura.monto_total.toFixed(2)}`, amountX, y);

      // Pie de página
      doc.fontSize(10).font('Helvetica')
        .text('Gracias por su compra!', { align: 'center' });

      // Finalizar el PDF
      doc.end();
    });
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
}


app.get('/api/test-email', async (req, res) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Pizzería Deliciosa <no-reply@wilson-sistemas.me>',
      to: 'wilsoncoc5678@gmail.com', // Tu email para pruebas
      subject: 'Prueba de Conexión - Pizzería Deliciosa',
      html: '<p>Este es un correo de prueba para verificar la conexión con Resend. Si recibes esto, ¡la configuración es correcta!</p>'
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, message: 'Correo de prueba enviado correctamente', id: data.id });
  } catch (error) {
    console.error('Error en prueba de correo:', error);
    res.status(500).json({ error: 'Error al enviar correo de prueba', details: error.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

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
      .input('metodo_pago', sql.VarChar, metodo_pago)  // Add this line
      .input('estado', sql.VarChar, 'pendiente')
      .input('total', sql.Decimal(10, 2), total)
      .input('numero_factura', sql.VarChar, 'FAC-' + Date.now())
      .query(`
    INSERT INTO Factura (orden_id, numero_factura, metodo_pago, estado, monto_total)
    VALUES (@orden_id, @numero_factura, @metodo_pago, @estado, @total)
  `);

    await transaction.commit();

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

// app.patch('/api/ordenes/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { estado } = req.body;

//     if (!['recibido', 'en preparacion', 'en camino', 'entregado', 'cancelado'].includes(estado)) {
//       return res.status(400).json({ error: 'Estado no válido' });
//     }

//     // Fixed: Changed orden_id to id
//     const result = await sql.query`
//       UPDATE Orden
//       SET estado = ${estado}
//       OUTPUT INSERTED.*
//       WHERE id = ${id}
//     `;

//     if (result.recordset.length === 0) {
//       return res.status(404).json({ error: 'Orden no encontrada' });
//     }

//     // Fixed: These are correct since you're using orden_id as the foreign key
//     if (estado === 'entregado') {
//       await sql.query`
//         UPDATE Factura
//         SET estado_pago = 'completado'
//         WHERE orden_id = ${id} AND estado_pago = 'pendiente'
//       `;
//     }

//     if (estado === 'cancelado') {
//       await sql.query`
//         UPDATE Factura
//         SET estado_pago = 'cancelado'
//         WHERE orden_id = ${id}
//       `;
//     }

//     res.json(result.recordset[0]);
//   } catch (error) {
//     console.error('Error al actualizar orden:', error);
//     res.status(500).json({ error: 'Error al actualizar orden' });
//   }
// });

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
      SET estado = ${estado_pago}
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

// Endpoint para generar una factura (simulado)
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

    // Generar una nueva factura
    request.input('orden_id', sql.Int, ordenId);
    request.input('fecha', sql.DateTime, new Date());
    request.input('monto_total', sql.Decimal(10, 2), monto_total);

    const nuevaFacturaResult = await request.query(`
      INSERT INTO Factura (orden_id, fecha, monto_total)
      OUTPUT INSERTED.*
      VALUES (@orden_id, @fecha, @monto_total)
    `);

    const nuevaFactura = nuevaFacturaResult.recordset[0];

    // Actualizar el estado de la orden a "completado" si no lo está
    await request.query(`
      UPDATE Orden
      SET estado = 'completado'
      WHERE id = @id AND estado = 'pendiente'
    `);

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


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
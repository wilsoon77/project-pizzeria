# Documentación Técnica - Sistema de Pizzería Online

Esta documentación está dirigida a desarrolladores y personal técnico que trabaja con el sistema de Pizzería Deliciosa.

## Arquitectura del Sistema

El sistema utiliza una arquitectura cliente-servidor con las siguientes componentes principales:

### Frontend (Cliente)
- **Tecnología:** React 18 con TypeScript
- **Bundler:** Vite
- **Enrutamiento:** React Router v6
- **Estilos:** Tailwind CSS y componentes personalizados
- **Gestión de Estado:** Context API para estados globales (carrito, autenticación)
- **Gráficos:** Recharts para visualización de datos estadísticos
- **Notificaciones:** React Hot Toast
- **Iconos:** Lucide React

### Backend (Servidor)
- **Runtime:** Node.js v16+
- **Framework:** Express.js
- **Base de Datos:** SQL Server
- **Generación de PDFs:** PDFKit
- **Correo Electrónico:** Resend API
- **Exportación de Datos:** ExcelJS para reportes

### Comunicación Cliente-Servidor
- **Protocolo:** HTTP/HTTPS
- **Formato:** JSON
- **Autenticación:** Token-based con roles (cliente/admin)

## Estructura Detallada del Proyecto

```
pizzeria-online/
├── src/                             # Código fuente del frontend
│   ├── api/                         # Funciones para llamadas a la API
│   │   └── statsApi.ts              # API de estadísticas
│   ├── components/                  # Componentes reutilizables
│   │   ├── layout/                  # Componentes de estructura
│   │   │   ├── Navbar.tsx           # Barra de navegación
│   │   │   ├── Footer.tsx           # Pie de página
│   │   │   └── Layout.tsx           # Estructura principal
│   ├── context/                     # Contextos de React
│   │   ├── AuthContext.tsx          # Contexto de autenticación
│   │   ├── CartContext.tsx          # Contexto del carrito
│   │   └── UIContext.tsx            # Contexto de UI (temas, etc)
│   ├── pages/                       # Páginas de la aplicación
│   │   ├── Home.tsx                 # Página principal
│   │   ├── Menu.tsx                 # Página de menú
│   │   ├── Cart.tsx                 # Página de carrito
│   │   ├── Checkout.tsx             # Proceso de checkout
│   │   ├── OrdenConfirmacion.tsx    # Confirmación de orden
│   │   ├── Login.tsx                # Inicio de sesión
│   │   ├── Register.tsx             # Registro de usuario
│   │   └── admin/                   # Páginas del panel admin
│   │       ├── AdminDashboard.tsx   # Dashboard
│   │       ├── AdminPizzas.tsx      # Gestión de pizzas
│   │       ├── AdminOrdenes.tsx     # Gestión de órdenes
│   │       ├── AdminClientes.tsx    # Gestión de clientes
│   │       └── AdminLogin.tsx       # Login del admin
│   ├── App.tsx                      # Componente raíz
│   ├── main.tsx                     # Punto de entrada
│   └── index.css                    # Estilos globales
├── server/                          # Código del servidor
│   ├── config.js                    # Configuración del servidor
│   └── index.js                     # Punto de entrada del servidor
├── database/                        
│   └── db.sql                       # Scripts SQL 
├── documentation/                   # Documentación del proyecto
│   ├── Manual_Tecnico.md            # Este archivo
│   └── Manual_Usuario.md            # Manual de usuario
├── .env                             # Variables de entorno
├── package.json                     # Dependencias
├── tsconfig.json                    # Configuración TypeScript
├── vite.config.ts                   # Configuración Vite
└── README.md                        # Resumen del proyecto
```

## Base de Datos

### Diagrama Entidad-Relación


```mermaid

erDiagram
    CATEGORIA_PIZZA ||--o{ PIZZA : "pertenece_a"
    PIZZA ||--o{ DETALLE_ORDEN : "contiene"
    TAMANO_PIZZA ||--o{ DETALLE_ORDEN : "define_tamano"
    CLIENTE ||--o{ ORDEN : "realiza"
    ORDEN ||--o{ DETALLE_ORDEN : "incluye"
    ORDEN ||--o| FACTURA : "genera"

    CATEGORIA_PIZZA {
        int id PK
        string nombre
        string descripcion
    }

    PIZZA {
        int id PK
        string nombre
        string descripcion
        decimal precio_base
        int categoria_id FK
        string imagen_url
        boolean disponible
    }

    TAMANO_PIZZA {
        int id PK
        string nombre
        decimal factor_precio
        string descripcion
    }

    CLIENTE {
        int id PK
        string nombre
        string email UK
        string password_hash
        string direccion
        string telefono
        datetime fecha_registro
        boolean es_admin
    }

    ORDEN {
        int id PK
        int cliente_id FK
        datetime fecha_orden
        string estado
        string direccion_entrega
        string telefono_contacto
        string metodo_pago
        decimal total
    }

    DETALLE_ORDEN {
        int id PK
        int orden_id FK
        int pizza_id FK
        int tamano_id FK
        int cantidad
        decimal precio_unitario
        decimal subtotal
    }

    FACTURA {
        int id PK
        int orden_id FK
        datetime fecha_emision
        decimal monto_total
        string numero_factura UK
        string estado_pago
        string metodo_pago
    }

```


### Descripción de Tablas

#### Tabla: Categoria_Pizza
Almacena las categorías de pizzas disponibles.

| Campo       | Tipo        | Descripción                    |
|-------------|-------------|--------------------------------|
| id          | INT         | Identificador único (PK)       |
| nombre      | VARCHAR(50) | Nombre de la categoría         |
| descripcion | VARCHAR(255)| Descripción de la categoría    |

#### Tabla: Pizza
Contiene la información de todas las pizzas.

| Campo       | Tipo        | Descripción                     |
|-------------|-------------|---------------------------------|
| id          | INT         | Identificador único (PK)        |
| nombre      | VARCHAR(100)| Nombre de la pizza              |
| descripcion | VARCHAR(255)| Descripción de la pizza         |
| precio_base | DECIMAL(10,2)| Precio base de la pizza        |
| categoria_id| INT         | ID de la categoría (FK)         |
| imagen_url  | VARCHAR(255)| URL de la imagen                |
| disponible  | BOL         | Indica si está disponible       |

#### Tabla: Tamaño_Pizza
Define los tamaños disponibles para las pizzas.

| Campo       | Tipo        | Descripción                     |
|-------------|-------------|---------------------------------|
| id          | INT         | Identificador único (PK)        |
| nombre      | VARCHAR(50) | Nombre del tamaño (Ej: Pequeña) |
| factor_precio| DECIMAL(3,2)| Factor multiplicador del precio |

#### Tabla: Cliente
Almacena la información de los clientes registrados.

| Campo        | Tipo        | Descripción                     |
|-------------|-------------|---------------------------------|
| id          | INT         | Identificador único (PK)        |
| nombre      | VARCHAR(100)| Nombre completo                 |
| email       | VARCHAR(100)| Correo electrónico (único)      |
| password    | VARCHAR(255)| Contraseña cifrada              |
| direccion   | VARCHAR(255)| Dirección de entrega            |
| telefono    | VARCHAR(20) | Número de teléfono              |
| rol         | VARCHAR(20) | Rol (cliente/admin)             |

#### Tabla: Orden
Registra los pedidos realizados.

| Campo           | Tipo        | Descripción                    |
|----------------|-------------|--------------------------------|
| id             | INT         | Identificador único (PK)       |
| cliente_id     | INT         | ID del cliente (FK)            |
| fecha_orden    | DATETIME    | Fecha y hora del pedido        |
| estado         | VARCHAR(50) | Estado del pedido              |
| direccion_entrega | VARCHAR(255) | Dirección de entrega       |
| telefono_contacto | VARCHAR(20) | Teléfono de contacto        |
| metodo_pago    | VARCHAR(50) | Método de pago                 |
| total          | DECIMAL(10,2)| Monto total del pedido        |

#### Tabla: Detalle_Orden
Almacena los ítems de cada pedido.

| Campo           | Tipo        | Descripción                    |
|----------------|-------------|--------------------------------|
| id             | INT         | Identificador único (PK)       |
| orden_id       | INT         | ID de la orden (FK)            |
| pizza_id       | INT         | ID de la pizza (FK)            |
| tamano_id      | INT         | ID del tamaño (FK)             |
| cantidad       | INT         | Cantidad ordenada              |
| precio_unitario| DECIMAL(10,2)| Precio unitario               |
| subtotal       | DECIMAL(10,2)| Subtotal (precio × cantidad)  |

#### Tabla: Factura
Registra las facturas generadas.

| Campo           | Tipo        | Descripción                    |
|----------------|-------------|--------------------------------|
| id             | INT         | Identificador único (PK)       |
| orden_id       | INT         | ID de la orden (FK)            |
| fecha_emision  | DATETIME    | Fecha de emisión               |
| monto_total    | DECIMAL(10,2)| Monto total facturado         |
| numero_factura | VARCHAR(50) | Número de factura              |
| estado_pago    | VARCHAR(50) | Estado del pago                |
| metodo_pago    | VARCHAR(50) | Método de pago                 |

- Contraseña Hasheada para Mayor Seguridad

![image](https://github.com/user-attachments/assets/89d41bd1-093b-4ec9-beed-689cd2222a38)


## API RESTful

### Autenticación

#### `/api/auth/login`
- **Método**: POST
- **Descripción**: Autenticación de usuarios
- **Cuerpo de la petición**:
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "contraseña"
  }
  ```
- **Respuesta**:
  ```json
  {
    "token": "token_de_autenticación",
    "cliente_id": 1,
    "nombre": "Nombre Usuario",
    "email": "usuario@ejemplo.com",
    "rol": "cliente"
  }
  ```

#### `/api/auth/register`
- **Método**: POST
- **Descripción**: Registro de nuevos usuarios
- **Cuerpo de la petición**:
  ```json
  {
    "nombre": "Nombre Usuario",
    "email": "usuario@ejemplo.com",
    "password": "contraseña",
    "direccion": "Dirección",
    "telefono": "1234567890"
  }
  ```
- **Respuesta**: Igual que login

### Catálogo de Pizzas

#### `/api/pizzas`
- **Método**: GET
- **Descripción**: Obtener todas las pizzas
- **Parámetros de consulta**:
  - `categoria`: Filtrar por categoría
  - `disponible`: Filtrar por disponibilidad
- **Respuesta**:
  ```json
  [
    {
      "id": 1,
      "nombre": "pizza",
      "descripcion": "Tomate, mozzarella, albahaca",
      "precio_base": 85.00,
      "categoria_id": 1,
      "imagen_url": "www.imagen.png",
      "disponible": true
    }
  ]
  ```

#### `/api/pizzas/:id`
- **Método**: GET
- **Descripción**: Obtener detalles de una pizza
- **Respuesta**: Una pizza individual

### Gestión de Pedidos

#### `/api/ordenes`
- **Método**: POST
- **Descripción**: Crear un nuevo pedido
- **Cuerpo de la petición**:
  ```json
  {
    "cliente_id": 1,
    "direccion_entrega": "Calle Principal 123",
    "telefono_contacto": "1234567890",
    "metodo_pago": "efectivo",
    "total": 250.50,
    "items": [
      {
        "pizza_id": 1,
        "tamano_id": 2,
        "cantidad": 2,
        "precio_unitario": 95.00,
        "subtotal": 190.00
      }
    ]
  }
  ```
- **Respuesta**:
  ```json
  {
    "mensaje": "Pedido creado correctamente",
    "orden_id": 1
  }
  ```

#### `/api/ordenes/:id`
- **Método**: GET
- **Descripción**: Obtener detalles de un pedido
- **Respuesta**: Detalles completos del pedido

#### `/api/ordenes/:id`
- **Método**: PATCH
- **Descripción**: Actualizar estado de un pedido
- **Cuerpo de la petición**:
  ```json
  {
    "estado": "en_camino"
  }
  ```
- **Respuesta**: Pedido actualizado

### Facturas

#### `/api/facturas/generar/:ordenId`
- **Método**: POST
- **Descripción**: Generar factura para un pedido
- **Respuesta**: Información de la factura generada

#### `/api/facturas/:id/enviar-email`
- **Método**: POST
- **Descripción**: Enviar factura por correo electrónico
- **Respuesta**: Confirmación de envío

#### `/api/facturas/descargar/:ordenId`
- **Método**: GET
- **Descripción**: Descargar factura en PDF
- **Respuesta**: Archivo PDF de la factura

### Estadísticas (Admin)

#### `/api/stats/ingresos`
- **Método**: GET
- **Descripción**: Ingresos mensuales
- **Respuesta**: Datos para gráfico de ingresos

#### `/api/stats/ventas-por-categoria`
- **Método**: GET
- **Descripción**: Distribución de ventas por categoría
- **Respuesta**: Datos para gráfico circular

#### `/api/stats/pedidos-por-dia`
- **Método**: GET
- **Descripción**: Cantidad de pedidos por día
- **Respuesta**: Datos para gráfico de barras

#### `/api/stats/resumen`
- **Método**: GET
- **Descripción**: Resumen de métricas clave
- **Respuesta**: Datos para tarjetas de resumen

## Autenticación y Autorización

### Implementación

El sistema utiliza un esquema de autenticación basado en tokens para manejar los siguientes tipos de usuarios:

1. **Clientes**: Pueden navegar por el catálogo, realizar pedidos y ver su historial
2. **Administradores**: Tienen acceso al panel de administración completo

### Flujo de Autenticación

1. El usuario envía credenciales (email/password) al endpoint `/api/auth/login`
2. El servidor valida las credenciales y devuelve un token
3. El cliente almacena el token en localStorage
4. Para peticiones autenticadas, el token se envía en el header `Authorization`
5. Los roles se evalúan en el middleware para controlar el acceso

### Middleware de Autenticación

```javascript
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado' });
  }

  try {
    
    const decodedToken = validateToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Permiso denegado' });
  }
};
```

## Servicio de Correo Electrónico

El sistema utiliza [Resend](https://resend.com) para el envío de correos electrónicos transaccionales.

### Configuración

```javascript
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
```

### Tipos de Correos

1. **Confirmación de Pedido**: Se envía automáticamente al crear un pedido
2. **Envío de Factura**: Se envía manualmente desde el panel de administración
3. **Correo de Prueba**: Para verificar la configuración

### Plantillas

Las plantillas de correo electrónico utilizan HTML y CSS en línea para garantizar la compatibilidad con los clientes de correo.

## Generación de PDFs

El sistema utiliza PDFKit para generar facturas en formato PDF.

### Implementación

```javascript
const PDFDocument = require('pdfkit');

const generarPdfFactura = async (facturaData, ordenData, detallesOrden) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      // Recoger chunks de datos
      doc.on('data', buffer => buffers.push(buffer));
      
      // Resolver la promesa con el PDF completo cuando termine
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Generar contenido del PDF
      generarContenidoFactura(doc, facturaData, ordenData, detallesOrden);
      
      // Finalizar el documento
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
```

## Exportación Excel

El sistema utiliza ExcelJS para generar reportes en formato Excel.

### Ejemplo de Implementación

```javascript
const ExcelJS = require('exceljs');

const generarReporteVentas = async (startDate, endDate) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte de Ventas');
  
  // Definir columnas
  worksheet.columns = [
    { header: 'Orden ID', key: 'orden_id', width: 10 },
    { header: 'Fecha', key: 'fecha', width: 20 },
    { header: 'Cliente', key: 'cliente', width: 30 },
    { header: 'Total', key: 'total', width: 15 },
    { header: 'Estado', key: 'estado', width: 15 }
  ];

  // Obtener datos de la base de datos
  const ventas = await obtenerVentasPorPeriodo(startDate, endDate);
  
  // Agregar filas
  ventas.forEach(venta => {
    worksheet.addRow({
      orden_id: venta.id,
      fecha: new Date(venta.fecha).toLocaleString(),
      cliente: venta.cliente_nombre,
      total: venta.total,
      estado: venta.estado
    });
  });
  
  // Formato a la columna de total
  worksheet.getColumn('total').numFmt = '"Q"#,##0.00';
  
  // Crear el buffer
  return await workbook.xlsx.writeBuffer();
};
```

## Variables de Entorno

El sistema utiliza las siguientes variables de entorno:

```
# Servidor
PORT=5000
NODE_ENV=development

# Base de Datos
DB_USER=sa
DB_PASSWORD=sql1234
DB_NAME=pizzeria
DB_SERVER=localhost
DB_PORT=5000

# Servicio de Email
RESEND_API_KEY= re_EmR74UWN_9Wpd4ju5egcwhueLvetKtsYd
EMAIL_FROM= facturacion@wilson-sistemas.me

# Frontend
VITE_API_URL=http://localhost:5000/api
```

## Configuración de la Base de Datos SQL Server

### Requisitos del Sistema
- SQL Server 2019 o superior
- SQL Server Management Studio (SSMS) para gestión visual

### Pasos para la Configuración

1. **Instalación de SQL Server**
   - Descargar SQL Server desde el sitio oficial de Microsoft
   - Durante la instalación, habilitar "SQL Server Browser"
   - Habilitar los protocolos TCP/IP
   - Configurar el modo de autenticación mixto

2. **Configuración del Servidor**
   - Abrir SQL Server Configuration Manager
   - En "Protocolos de red", habilitar TCP/IP
   - Configurar el puerto (por defecto 1433)
   - Reiniciar el servicio SQL Server

3. **Creación de la Base de Datos**
   - Abrir SSMS
   - Conectar con credenciales de administrador
   - Ejecutar el script de creación de base de datos (`/database/db.sql`)
   - Ejecutar los scripts de creación de tablas (`/database/db.sql`)
   - Ejecutar el script de datos iniciales (`/database/db.sql`)

4. **Configuración de Usuario**
   ```sql
   -- Crear login
   CREATE LOGIN pizzeria_user WITH PASSWORD = 'sql1234';
   
   -- Crear usuario y asignar permisos
   USE pizzeria;
   CREATE USER pizzeria_user FOR LOGIN pizzeria_user;
   EXEC sp_addrolemember 'db_datareader', 'pizzeria_user';
   EXEC sp_addrolemember 'db_datawriter', 'pizzeria_user';
   ```

## Despliegue en Producción

Consideraciones importantes para desplegar en producción:

1. **Seguridad**:
   - Implementar HTTPS
   - Usar variables de entorno para secretos
   - Implementar límites de tasa para prevenir ataques de fuerza bruta

2. **Optimización**:
   - Minificar y comprimir activos
   - Usar CDN para recursos estáticos
   - Implementar caché para reducir carga del servidor

3. **Monitoreo**:
   - Configurar alertas para errores del servidor
   - Monitorear tiempo de respuesta de la API
   - Registrar y analizar métricas de uso

## Solución de Problemas Comunes

### Problemas de Conexión a la Base de Datos
- Verificar que SQL Server esté ejecutándose
- Validar credenciales en el archivo .env
- Comprobar el firewall para el puerto 1433

### Errores en el Envío de Emails
- Verificar la API key de Resend
- Confirmar que el dominio esté verificado
- Comprobar si hay límites de cuota en la cuenta

### Problemas de Renderizado en el Frontend
- Limpiar caché del navegador
- Verificar que las dependencias estén instaladas
- Consultar la consola del navegador para errores

---

© Pizzería Deliciosa 2025 - Documentación Técnica

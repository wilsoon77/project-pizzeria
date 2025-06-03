# Sistema de Pizzería Online - PizzaDelicia

Este proyecto es un sistema completo para una pizzería online que permite a los usuarios ver el menú, agregar productos a un carrito de compras, realizar pedidos y generar facturas. También incluye un panel de administración para gestionar pizzas, clientes y pedidos.

## Tecnologías Utilizadas

### Frontend
- React con TypeScript
- Vite como bundler y servidor de desarrollo
- Tailwind CSS para estilos
- React Router para la navegación
- Recharts para gráficos en el dashboard
- React Hot Toast para notificaciones
- Lucide React para iconos
- Context API para gestión de estado global
- Axios para comunicación con el backend

### Backend
- Node.js con Express
- SQL Server como base de datos
- Sistema de autenticación con roles (usuario/admin)
- Generación de facturas
- API RESTful para estadísticas y reportes

## Características Principales

### Para Clientes
- Visualización del menú de pizzas con categorías
- Carrito de compras con persistencia
- Proceso de checkout con selección de método de pago
- Seguimiento de estado de pedidos
- Sistema de registro e inicio de sesión
- Historial de pedidos realizados

### Para Administradores
- Dashboard con estadísticas y resúmenes en tiempo real
- Seguimiento de ingresos mensuales con visualización gráfica
- Análisis de ventas por categoría de productos
- Visualización de pedidos por día de la semana
- Métricas clave de negocio (ingresos, pedidos, clientes nuevos, ticket promedio)
- Gestión completa de catálogo de pizzas (CRUD)
- Visualización y gestión de clientes
- Administración de pedidos (cambios de estado)
- Visualización y gestión de facturas

## Estructura de la Base de Datos

El sistema utiliza una base de datos SQL Server llamada `pizzeriaDB` con las siguientes tablas:

- **Categoria_Pizza**: Categorías de pizzas (clásicas, especiales, vegetarianas, etc.)
- **Tamaño_Pizza**: Tamaños disponibles con su factor de precio
- **Pizza**: Información de las pizzas (nombre, descripción, precio base, etc.)
- **Cliente**: Datos de los clientes registrados
- **Orden**: Pedidos realizados por los clientes
- **Detalle_Orden**: Ítems incluidos en cada pedido
- **Factura**: Información de pago y estado de las facturas

## Características Principales

### Área de Cliente
- Catálogo de pizzas organizado por categorías
- Filtros de búsqueda y categorías
- Carrito de compras con gestión de cantidades
- Proceso de checkout con datos de entrega
- Seguimiento de pedidos
- Registro e inicio de sesión de usuarios

### Panel de Administración
- Dashboard con gráficos de ventas e indicadores clave
- Gestión completa de pizzas (CRUD)
- Administración de clientes
- Control de pedidos con actualización de estados
- Generación de facturas

## Instalación y Configuración

### Requisitos Previos
- Node.js (v14 o superior)
- SQL Server instalado y configurado
- NPM o Yarn

### Pasos de Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd pizzeria-online
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar la base de datos:
- Crear la base de datos `pizzeriaDB` en SQL Server
- Ejecutar los scripts de creación de tablas (disponibles en la carpeta `/database`)

4. Configurar variables de entorno:
- Crear un archivo `.env` en la raíz del proyecto con la siguiente información:
```
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=pizzeriaDB
DB_SERVER=localhost
PORT=5000
```

5. Iniciar el servidor backend:
```bash
npm run server
```

6. Iniciar la aplicación frontend:
```bash
npm run dev
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
   - Ejecutar el script de creación de base de datos (`/database/01_create_database.sql`)
   - Ejecutar los scripts de creación de tablas (`/database/02_create_tables.sql`)
   - Ejecutar el script de datos iniciales (`/database/03_initial_data.sql`)

4. **Configuración de Usuario**
   ```sql
   -- Crear login
   CREATE LOGIN pizzeria_user WITH PASSWORD = 'tu_contraseña';
   
   -- Crear usuario y asignar permisos
   USE pizzeriaDB;
   CREATE USER pizzeria_user FOR LOGIN pizzeria_user;
   EXEC sp_addrolemember 'db_datareader', 'pizzeria_user';
   EXEC sp_addrolemember 'db_datawriter', 'pizzeria_user';
   ```

5. **Verificación de Conexión**
   - Probar la conexión desde SSMS con el nuevo usuario
   - Verificar que los scripts de la aplicación pueden conectarse

### Solución de Problemas Comunes

1. **Error de Conexión**
   - Verificar que el servicio SQL Server está ejecutándose
   - Comprobar que el firewall permite conexiones al puerto 1433
   - Validar las credenciales en el archivo .env

2. **Error de Autenticación**
   - Verificar el modo de autenticación del servidor
   - Comprobar los permisos del usuario
   - Validar la contraseña

3. **Problemas de Rendimiento**
   - Revisar los índices de las tablas
   - Optimizar las consultas más frecuentes
   - Monitorear el uso de recursos

## Uso del Sistema

### Acceso al Panel de Administración
- URL: `/admin/login`
- Credenciales por defecto:
  - Usuario: admin
  - Contraseña: admin123

### Flujo de Uso para Clientes
1. Navegar al catálogo de pizzas
2. Seleccionar pizzas, tamaño y cantidad
3. Agregar al carrito
4. Proceder al checkout
5. Completar información de entrega
6. Realizar pedido
7. Seguir estado del pedido

### Flujo de Uso para Administradores
1. Iniciar sesión en el panel de administración
2. Gestionar el catálogo de pizzas (agregar, editar, eliminar)
3. Ver y gestionar clientes
4. Administrar pedidos (actualizar estados, generar facturas)
5. Consultar estadísticas en el dashboard

## Estructura del Proyecto

```
pizzeria-online/
├── public/              # Archivos públicos
├── src/                 # Código fuente del frontend
│   ├── components/      # Componentes reutilizables
│   ├── context/        # Contextos de React (carrito, autenticación)
│   ├── pages/          # Páginas principales y de administración
│   └── index.css       # Estilos globales
├── server/             # Código del servidor Node.js/Express
│   └── index.js        # Punto de entrada del servidor
├── database/           # Scripts SQL para la base de datos
│   ├── 01_create_database.sql
│   ├── 02_create_tables.sql
│   └── 03_initial_data.sql
└── README.md           # Documentación del proyecto
```

## Manual Técnico

### Integración con SQL Server
El sistema se conecta a SQL Server mediante el paquete `mssql`. La configuración de conexión se encuentra en `server/index.js`. Asegúrate de que las credenciales en el archivo `.env` sean correctas.

### Autenticación
- La autenticación de usuarios se maneja a través de tokens (en un entorno de producción se recomienda usar JWT)
- El sistema diferencia entre usuarios normales y administradores

### API RESTful
El backend expone una API RESTful con los siguientes endpoints principales:

- **GET /api/pizzas**: Obtener todas las pizzas
- **POST /api/ordenes**: Crear un nuevo pedido
- **GET /api/ordenes/:id**: Obtener detalles de un pedido
- **PATCH /api/ordenes/:id**: Actualizar estado de un pedido

### Estado del Carrito
El estado del carrito se mantiene utilizando React Context y se persiste en el localStorage del navegador.

## Mejoras Futuras

- Implementación de pasarelas de pago reales
- Sistema de valoraciones y comentarios para las pizzas
- Funcionalidad de pedidos recurrentes
- Aplicación móvil nativa
- Integración con servicios de mapas para seguimiento en tiempo real
- Implementación de autenticación con JWT y roles más específicos
- Notificaciones por correo electrónico/SMS

## Soporte

Para obtener ayuda o reportar problemas, contactar a:
- Email: soporte@pizzadelicia.com
- Teléfono: +34 555 123 456

---

Desarrollado con ❤️ para PizzaDelicia © 2023
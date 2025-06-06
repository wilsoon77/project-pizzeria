# Sistema de Pizzería Online - Pizzería Deliciosa

![Logo de Pizzería Deliciosa](./public/images/logo.png)

## Descripción General

Sistema completo para gestión de pizzería en línea con funcionalidades para clientes y administradores. Permite navegar por el catálogo de pizzas, realizar pedidos, recibir confirmaciones por email y gestionar todo el proceso desde un panel administrativo.

## Características Principales

### Para Clientes
- Catálogo de pizzas con variedad de tamaños y precios
- Carrito de compras con persistencia
- Proceso de checkout simplificado
- Confirmación de pedido por correo electrónico
- Seguimiento del estado de pedidos
- Acceso a facturas electrónicas

### Para Administradores
- Dashboard con estadísticas en tiempo real
- Gestión completa de catálogo de productos
- Administración de pedidos y cambios de estado
- Administración De Clientes
- Generación y envío de facturas
- Exportación de reportes a Excel

## Tecnologías Utilizadas

### Frontend
- React con TypeScript
- Vite como bundler
- Tailwind CSS para estilos
- React Router para navegación
- Recharts para visualización de datos
- Context API para gestión de estado global

### Backend
- Node.js con Express
- SQL Server para base de datos
- API RESTful
- PDFKit para generación de facturas
- ExcelJS para reportes
- Resend para envío de emails

## Capturas de Pantalla

![Pantalla Principal](./screenshots/home.png)
![Panel Administrativo](./screenshots/admin-dashboard.png)
![Carrito](./screenshots/carrito.png)
![Proceso de Pedido](./screenshots/checkout.png)

## Estructura del Proyecto
```
pizzeria/
├── src/                      # Código fuente del frontend
│   ├── components/           # Componentes reutilizables
│   ├── context/              # Contextos de React (carrito, autenticación)
│   ├── pages/                # Páginas principales y de administración
│   │   └── admin/            # Páginas del panel administrativo
│   ├── types/                # Definiciones de tipos TypeScript
│   ├── utils/                # Utilidades y helpers
│   └── index.css             # Estilos globales
│   └── App.tsx               # Componente Principal de la aplicación
├── server/                   # Código del servidor Node.js/Express
│   ├── Facturas
│   └── index.js              # Punto de entrada del servidor/ Endponints Principales del API
├── database/                 # Scripts SQL para la base de datos  
│   └── db.sql
├── documentation/            # Documentación del proyecto
│   ├── Manual_Tecnico.md     # Documentación técnica detallada
│   └── Manual_Usuario.md     # Manual de usuario
├── package.json              # Dependencias del proyecto
├── vite.config.ts            # Configuración de Vite
├── tsconfig.json             # Configuración de TypeScript
└── README.md                 # Documentación General del proyecto
```

## Instalación Rápida

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno 
4. Iniciar servidor: `npm run server`
5. Iniciar cliente: `npm run dev`

## Documentación Adicional

- [Manual Técnico](./documentation/Manual_Tecnico.md) - Detalles técnicos para desarrolladores
- [Manual de Usuario](./documentation/Manual_Usuario.md) - Guía para usuarios finales

## Información de Contacto

- **Dirección**: 3ra Calle 4-42 Zona 1, Chimaltenango, Guatemala
- **Teléfono**: +(502) 7839-5678
- **Email**: info@pizzeriadeliciosa.com
- **NIT**: 1234567-8

## Licencia

Desarrollado para Pizzería Deliciosa © 2025. Todos los derechos reservados.
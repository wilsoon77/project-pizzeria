# Guía de Mantenimiento - Sistema de Pizzería

Este documento contiene información útil para el mantenimiento del sistema de pizzería.

## Estructura del Proyecto

- **`/src`**: Código fuente del frontend (React/TypeScript)
- **`/server`**: API backend (Express/Node.js)
- **`/supabase`**: Scripts de base de datos SQL Server
- **`/src/api`**: APIs para interactuar con el backend

## Autenticación y Autorización

El sistema utiliza un esquema de autenticación basado en tokens para manejar dos tipos de usuarios:

1. **Clientes regulares**: Pueden ver el menú, realizar pedidos y ver su historial
2. **Administradores**: Pueden acceder al panel de administración y gestionar pizzas, clientes y pedidos

### Cómo funciona:

- Los tokens son almacenados en `localStorage`
- Para usuarios administradores, se usa `localStorage.getItem('isAdmin') === 'true'` como flag
- El header `x-is-admin` se envía con todas las peticiones de administradores
- El middleware `authenticateToken` en el backend verifica los permisos

## Componentes Principales

### Frontend:
- **`AuthContext.tsx`**: Gestiona la autenticación y estado del usuario
- **`CartContext.tsx`**: Controla el estado del carrito de compras
- **`ProtectedRoute.tsx`**: Componente para proteger rutas que requieren autenticación
- **`api/statsApi.ts`**: API para obtener estadísticas para el dashboard de administración

### Backend:
- **`server/index.js`**: Servidor Express con todos los endpoints API
  - `/api/auth/*`: Endpoints de autenticación
  - `/api/pizzas/*`: CRUD para pizzas
  - `/api/ordenes/*`: Gestión de pedidos
  - `/api/facturas/*`: Manejo de facturas
  - `/api/stats/*`: Endpoints de estadísticas para el dashboard administrativo

## Endpoints de Estadísticas

El dashboard administrativo ahora utiliza datos reales de la base de datos a través de los siguientes endpoints:

1. **`GET /api/stats/ingresos`**: Retorna los ingresos mensuales del último año
2. **`GET /api/stats/pedidos-por-dia`**: Retorna el número de pedidos por día de la última semana
3. **`GET /api/stats/ventas-por-categoria`**: Retorna los porcentajes de ventas por categoría de pizza
4. **`GET /api/stats/resumen`**: Retorna estadísticas generales (ingresos, pedidos, clientes nuevos y ticket promedio)
5. **`GET /api/stats/pedidos-recientes`**: Retorna los 5 pedidos más recientes para mostrar en el dashboard

Todos estos endpoints requieren autenticación de administrador para acceder a ellos.

## Credenciales para Pruebas

- **Usuario regular**: 
  - Email: usuario@ejemplo.com
  - Password: usuario123

- **Administrador**:
  - Email: admin@pizzadelicia.com
  - Password: admin123

> **IMPORTANTE**: Estas credenciales son solo para desarrollo y pruebas. Deberían cambiarse en un entorno de producción.

## Base de Datos

El sistema utiliza SQL Server. Los principales esquemas se encuentran en:

- `supabase/db.sql`: Esquema completo
- `supabase/migrations/`: Migraciones incrementales

### Tablas principales:

- `Cliente`: Datos de usuarios
- `Pizza`: Catálogo de pizzas
- `Orden`: Pedidos realizados
- `Detalle_Orden`: Items en cada pedido

## Mejoras Futuras

1. Implementar JWT para un sistema de autenticación más seguro
2. Refactorizar el backend para usar una arquitectura más modular
3. Mejorar el dashboard administrativo con datos reales (actualmente muestra datos de ejemplo)
4. Implementar pruebas automatizadas
5. Mejorar la gestión de stock e inventario

## Contacto

Para preguntas sobre el desarrollo, contactar a: soporte@pizzadelicia.com

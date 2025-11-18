# PetStore - Plataforma Web de Tienda de Mascotas
# Test

[![deployment in Vercel](https://github.com/valeop/fluffy-deals-hub/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/valeop/fluffy-deals-hub/actions/workflows/ci-cd.yml)

Una aplicación web de página única (SPA) para gestión de promociones en una tienda de mascotas, construida con React, TypeScript y Tailwind CSS.

**Vercel URL**: https://fluffy-deals-hub.vercel.app/  
**Lovable URL**: https://lovable.dev/projects/a6dc8357-b963-42db-a2d3-197376ce8b20

## 🚀 Características

- ✅ **Sistema de autenticación** con localStorage
- ✅ **Gestión completa de promociones** (CRUD)
- ✅ **Flujo de creación en 2 pasos** con selección múltiple de productos
- ✅ **Sistema de filtros** (Activas, Programadas, Vencidas, Papelera)
- ✅ **Panel de configuración** con sliders de Contraste y Tamaño de letra
- ✅ **Modal de confirmación** para eliminar promociones
- ✅ **Vista de papelera** con restauración de promociones
- ✅ **Persistencia en localStorage**
- ✅ **Diseño responsivo** y accesible
- ✅ **Feedback visual** en selección de productos

## 🛠️ Stack Tecnológico

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **React Router v6** - Enrutamiento
- **shadcn/ui** - Componentes UI
- **react-hook-form + zod** - Gestión de formularios y validación
- **lucide-react** - Iconos

## 📦 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🗂️ Estructura del Proyecto

```
src/
├── assets/              # Imágenes y recursos estáticos
├── components/          # Componentes reutilizables
│   ├── layout/         # Componentes de layout (Navbar, Sidebar, Layout)
│   ├── ui/             # Componentes UI de shadcn
│   ├── DeletePromotionDialog.tsx
│   ├── PromotionFilters.tsx
│   └── SettingsPanel.tsx
├── hooks/              # Custom hooks
│   ├── useAuth.ts
│   ├── usePromotions.ts
│   └── use-toast.ts
├── pages/              # Páginas de la aplicación
│   ├── admin/
│   │   ├── CreatePromotion.tsx
│   │   ├── EditPromotion.tsx
│   │   └── PromotionsList.tsx
│   ├── Home.tsx
│   ├── Login.tsx
│   └── NotFound.tsx
├── services/           # Servicios
│   └── localStorage.service.ts
├── types/              # Tipos TypeScript
│   └── index.ts
├── App.tsx             # Componente principal
└── main.tsx           # Punto de entrada
```

## 🔑 Rutas de la Aplicación

- `/` - Landing Page
- `/login` - Iniciar Sesión
- `/admin/promotions` - Listado de Promociones
- `/admin/promotions/create` - Crear Nueva Promoción
- `/admin/promotions/:id/edit` - Editar Promoción

## 💾 Estructura de localStorage

### Llaves utilizadas:

```typescript
'petstore:users'       // Array de usuarios
'petstore:promotions'  // Array de promociones
'petstore:session'     // Sesión activa del usuario
'petstore:settings'    // Configuraciones (contraste, fontSize)
```

### Estructura de datos:

**User:**
```typescript
{
  email: string;
  password: string;
}
```

**Promotion:**
```typescript
{
  id: string;
  name: string;
  description: string;
  category: string;
  discount: number;
  startDate: string;
  endDate: string;
  image: string;
  isActive: boolean;
  selectedProducts: string[];
}
```

**Settings:**
```typescript
{
  contrast: number;    // 0-100
  fontSize: number;    // 0-100
}
```

## 🔐 Credenciales por Defecto

```
Email: admin@petstore.com
Contraseña: admin123
```

## ⚡ Funcionalidades Principales

### Sistema de Autenticación
- Login/Logout con localStorage
- Validación de credenciales
- Sesión persistente
- Registro de nuevos usuarios

### Gestión de Promociones
1. **Crear Promoción (2 pasos):**
   - Paso 1: Datos generales (nombre, fechas, descripción, categoría, descuento)
   - Paso 2: Selección múltiple de productos con feedback visual

2. **Editar Promoción:**
   - Pre-carga de datos existentes
   - Modificación de productos seleccionados
   - Actualización en tiempo real

3. **Eliminar Promoción:**
   - Modal de confirmación
   - Movimiento a papelera (soft delete)
   - Opción de restauración

4. **Filtros:**
   - Todas las promociones
   - Activas (vigentes)
   - Programadas (futuras)
   - Vencidas (pasadas)
   - Papelera (desactivadas)

### Panel de Configuración
- **Contraste:** Ajusta el factor de contraste visual (0-100%)
- **Tamaño de letra:** Ajusta el tamaño base de fuente (12px - 20px)
- **Persistencia:** Los valores se guardan en localStorage
- **Aplicación en tiempo real:** Los cambios se aplican inmediatamente

## 🎨 Características de Diseño

### Paleta de Colores
- **Fondo:** Beige claro cálido
- **Principal:** Marrón oscuro
- **Acentos:** Marrón claro, verde para acciones positivas
- **Botones:** Redondeados con efectos hover

### Accesibilidad
- ✅ Labels en todos los inputs
- ✅ Roles ARIA apropiados
- ✅ Navegación por teclado
- ✅ Contraste adecuado
- ✅ Mensajes de error claros

### Responsive
- ✅ Mobile-first design
- ✅ Adaptable a desktop
- ✅ Grid system flexible
- ✅ Imágenes responsive

## 🧪 Testing Manual

### 1. Autenticación
- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas
- [ ] Logout
- [ ] Persistencia de sesión al refrescar

### 2. Crear Promoción
- [ ] Paso 1: Validación de formulario
- [ ] Paso 2: Selección múltiple de productos
- [ ] Visual feedback en checkboxes
- [ ] Guardar y redireccionar

### 3. Editar Promoción
- [ ] Cargar datos existentes
- [ ] Modificar campos
- [ ] Cambiar selección de productos
- [ ] Guardar cambios

### 4. Eliminar Promoción
- [ ] Abrir modal de confirmación
- [ ] Confirmar eliminación
- [ ] Verificar en papelera
- [ ] Restaurar desde papelera

### 5. Filtros
- [ ] Filtrar por Activas
- [ ] Filtrar por Programadas
- [ ] Filtrar por Vencidas
- [ ] Ver Papelera

### 6. Configuración
- [ ] Ajustar contraste
- [ ] Ajustar tamaño de letra
- [ ] Refrescar página
- [ ] Verificar persistencia

## 🎯 Decisiones de Diseño

### Selección de Productos
- **Checkboxes controlados:** Estado gestionado con React (`selectedProductIds`)
- **Feedback visual:** Tarjetas con borde/background cuando están seleccionadas
- **Accesibilidad:** Eventos separados para clic en tarjeta y checkbox
- **Validación:** Mínimo 1 producto requerido

### Persistencia
- **localStorage como única fuente de verdad**
- **Inicialización automática** con datos de ejemplo
- **Servicio centralizado** para operaciones de almacenamiento

### Estados de Promoción
- **Activa:** Dentro del rango de fechas
- **Programada:** Fecha de inicio futura
- **Vencida:** Fecha de fin pasada
- **Papelera:** isActive = false

## 📝 Notas Importantes

1. **No hay backend:** Toda la lógica se ejecuta en el navegador
2. **Datos de ejemplo:** Se inicializan automáticamente al primer uso
3. **Credenciales por defecto:** Se crean al inicializar la app
4. **Variables CSS dinámicas:** Contraste y fontSize se aplican al document root
5. **Validación exhaustiva:** zod schema en todos los formularios

## 🐛 Troubleshooting

### La sesión no persiste
- Verificar que localStorage esté habilitado en el navegador
- Revisar que no esté en modo incógnito

### Los cambios no se guardan
- Abrir DevTools > Application > Local Storage
- Verificar llaves `petstore:*`

### Error en checkboxes
- Asegurar que cada producto tenga un `id` único
- Verificar que no se use `defaultChecked` en componentes controlados

## 📄 Edición del Código

Hay varias formas de editar esta aplicación:

### Usar Lovable (Recomendado)
Visita el [Proyecto Lovable](https://lovable.dev/projects/a6dc8357-b963-42db-a2d3-197376ce8b20) y empieza a usar prompts.

### Usar tu IDE Preferido
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

### Editar en GitHub
- Navega al archivo deseado
- Click en "Edit" (icono de lápiz)
- Haz cambios y commit

### GitHub Codespaces
- Click en "Code" > "Codespaces" > "New codespace"

## 🚀 Despliegue

Abre [Lovable](https://lovable.dev/projects/a6dc8357-b963-42db-a2d3-197376ce8b20) y click en Share → Publish.

## 🌐 Dominio Personalizado

Sí, puedes conectar un dominio personalizado en Project > Settings > Domains.

[Más info aquí](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

Desarrollado con ❤️ para PetStore

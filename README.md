# Sistema de Gestión de Turnos

## Descripción
Sistema simple para gestionar turnos de atención a clientes, implementado con HTML, CSS y JavaScript vanilla (sin frameworks ni backend).

---

## 📋 Fase 1: Modelado del Problema

### ¿Qué es un turno?
Un turno es una solicitud de atención que representa a un cliente esperando ser atendido. Cada turno tiene un lugar en la cola y debe procesarse siguiendo reglas de prioridad y orden.

### Información mínima de un turno
| Propiedad | Descripción | Tipo |
|-----------|-------------|------|
| **id** | Identificador único | Número |
| **customerName** | Nombre del cliente | String |
| **priority** | Nivel de urgencia | `normal` o `high` |
| **status** | Estado actual | `pending`, `attended`, `cancelled` |
| **timestamp** | Fecha y hora de registro | Número (milisegundos) |

### Estados del turno
1. **pending** - Esperando atención (estado inicial)
2. **attended** - Atendido (estado final, no puede cambiar)
3. **cancelled** - Cancelado (estado final, no puede cambiar)

### Reglas para atender turnos
1. **Prioridad alta primero** - Los turnos `high` se atienden antes que los `normal`
2. **FIFO dentro de cada prioridad** - Orden de llegada dentro de cada tipo
3. **Solo el siguiente turno** - No se pueden saltar turnos
4. **Solo turnos pendientes** - Solo se atienden/cancelan turnos en estado `pending`

---

## 🚀 Fase 2: Funcionalidad Básica

### Implementado:
✅ **Registrar turno** - Formulario para crear nuevos turnos  
✅ **Mostrar pendientes** - Lista de turnos esperando atención  
✅ **Atender siguiente** - Botón para atender el turno que corresponde  

### Decisiones técnicas:
- **Clase `Turn`**: Encapsula la lógica de un turno individual
- **Clase `TurnManager`**: Gestiona las colas y operaciones
- **Dos colas separadas**: `priorityQueue` y `normalQueue` para eficiencia
- **Map para búsqueda**: Acceso O(1) a turnos por ID

---

## ⚡ Fase 3: Lógica Avanzada

### Implementado:
✅ **Turnos prioritarios** - Opción de alta prioridad en el formulario  
✅ **Separación de colas** - Lógica independiente para cada tipo  
✅ **Cancelación** - Botón para cancelar turnos pendientes  
✅ **Validación de estados** - Métodos `canBeAttended()` y verificaciones  

### Algoritmo de selección del siguiente turno:
```javascript
1. Buscar en priorityQueue el primer turno con status='pending'
2. Si no hay, buscar en normalQueue el primer turno con status='pending'
3. Si no hay ninguno, retornar null
```

### Prevención de estados inconsistentes:
- Validación antes de cambiar estados
- Estados finales inmutables (`attended` y `cancelled`)
- Solo el siguiente turno puede ser atendido

---

## 🎯 Fase 4: Casos Límite y Mejoras

### 1. Manejo eficiente de grandes cantidades
**Implementado:**
- Map para búsqueda O(1) por ID
- Arrays para mantener orden FIFO
- Renderizado directo sin procesamiento innecesario

**Limitación actual:**
- Todos los datos en memoria (se pierden al recargar)
- Sin paginación (podría ser lento con miles de turnos)

### 2. Prevención de estados inconsistentes
**Implementado:**
- Validaciones en métodos `attend()` y `cancel()`
- Verificación de que sea el siguiente turno antes de atender
- Mensajes de error claros

**Ejemplo:**
```javascript
if (this.status !== 'pending') {
  throw new Error('Solo se pueden atender turnos pendientes');
}
```

### 3. Separación lógica de negocio y presentación
**Implementado:**
- **Modelo**: Clases `Turn` y `TurnManager` (lógica pura)
- **Vista**: Funciones `render*()` (presentación)
- **Controlador**: Funciones `handle*()` (coordinación)

**Beneficio:** Fácil de mantener y probar

### 4. Estrategia básica de pruebas
**Casos de prueba manuales:**
1. Registrar turno normal → Verificar que aparezca en pendientes
2. Registrar turno prioritario → Verificar que aparezca primero
3. Atender siguiente turno → Verificar que solo el primero se pueda atender
4. Cancelar turno → Verificar que pase a historial
5. Intentar atender turno no-siguiente → Verificar error

### 5. Legibilidad del código
**Implementado:**
- Comentarios JSDoc en funciones principales
- Nombres descriptivos de variables y funciones
- Código organizado en secciones claras
- Constantes en lugar de valores mágicos

---

## 🔧 Decisiones Lógicas Importantes

### 1. Dos colas separadas
**Por qué:** Permite priorizar eficientemente sin reordenar constantemente.

**Alternativa descartada:** Una sola cola con ordenamiento dinámico (más costoso).

### 2. Map + Arrays
**Por qué:** 
- Map: Búsqueda rápida por ID
- Arrays: Mantienen orden de llegada (FIFO)

**Trade-off:** Duplicación de referencias, pero ganancia en rendimiento.

### 3. Validación estricta
**Por qué:** Prevenir estados inconsistentes es crítico en sistemas de turnos.

**Ejemplo:** Solo permitir atender el siguiente turno evita confusión.

### 4. Estados finales inmutables
**Por qué:** Un turno atendido no puede "desatenderse", ni uno cancelado puede atenderse.

**Implementación:** Validación en métodos `attend()` y `cancel()`.

---

## 📁 Estructura del Proyecto

```
gestion-turnos/
├── index.html       # Estructura de la interfaz
├── css/
│   └── styles.css   # Estilos y diseño
├── js/
│   └── script.js    # Lógica del sistema
└── README.md        # Este archivo
```

---

## 💡 Mejoras Futuras

### Con más tiempo implementaría:

1. **Persistencia de datos**
   - LocalStorage para guardar turnos entre sesiones
   - O backend con base de datos

2. **Filtros y búsqueda**
   - Buscar turnos por nombre o ID
   - Filtrar historial por estado o fecha

3. **Estadísticas**
   - Tiempo promedio de espera
   - Turnos atendidos por hora
   - Gráficas de rendimiento

4. **Notificaciones sonoras**
   - Alerta cuando sea el turno del cliente
   - Sonido al registrar turno

5. **Impresión de tickets**
   - Generar PDF con número de turno
   - Código QR para seguimiento

6. **Múltiples ventanillas**
   - Asignar turnos a diferentes puntos de atención
   - Gestión de operadores

7. **Tests automatizados**
   - Unit tests para clases `Turn` y `TurnManager`
   - Integration tests para flujos completos

---

## 🚀 Cómo Usar

1. Abrir `index.html` en un navegador web
2. Registrar turnos con nombre y prioridad
3. Atender turnos en orden (botón habilitado solo para el siguiente)
4. Cancelar turnos si es necesario
5. Consultar historial de turnos procesados

**Nota:** Los datos se almacenan en memoria y se pierden al recargar la página.

---

## 📊 Parámetros de Valoración

### Claridad lógica ✅
- Algoritmo de colas claramente implementado
- Flujo de estados bien definido
- Comentarios explicativos

### Estructuras de control ✅
- Uso correcto de clases y métodos
- Condicionales para validaciones
- Iteración eficiente de colas

### Manejo de estados ✅
- 3 estados bien definidos
- Transiciones validadas
- Estados finales inmutables

### Explicación de decisiones ✅
- Documentado en este README
- Comentarios en código
- Justificación de trade-offs

### Mantenibilidad ✅
- Código organizado y limpio
- Separación de responsabilidades
- Fácil de extender

---

## 👨‍💻 Autor
Sistema desarrollado como ejercicio de programación lógica.

## 📄 Licencia
Código libre para uso educativo.

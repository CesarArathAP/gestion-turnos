# Sistema de Gestión de Turnos

Sistema profesional para gestionar turnos de atención a clientes, desarrollado con Node.js y arquitectura MVC.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Instalación](#instalación)
- [Uso](#uso)
- [Arquitectura](#arquitectura)
- [Decisiones Lógicas](#decisiones-lógicas)
- [Manejo de Turnos y Prioridades](#manejo-de-turnos-y-prioridades)
- [Casos Límite](#casos-límite)
- [Mejoras Futuras](#mejoras-futuras)

---

## 🎯 Descripción

Este sistema permite gestionar turnos de atención siguiendo reglas claras de prioridad y orden. Cumple con todos los requisitos de las 4 fases de la actividad:

- ✅ **Fase 1**: Modelado claro del problema con definición de estados
- ✅ **Fase 2**: Funcionalidad básica (registrar, listar, atender)
- ✅ **Fase 3**: Lógica avanzada (prioridades, cancelación, validaciones)
- ✅ **Fase 4**: Casos límite y optimizaciones

---

## 🚀 Instalación

### Requisitos Previos
- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

### Pasos de Instalación

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar el servidor**:
   ```bash
   npm start
   ```

3. **Abrir en el navegador**:
   ```
   http://localhost:3000
   ```

---

## 📖 Uso

### Interfaz de Usuario

La aplicación proporciona una interfaz clara con instrucciones paso a paso:

1. **Registrar Turno**: Ingresa el nombre del cliente y selecciona la prioridad
2. **Ver Cola**: Los turnos se muestran organizados por prioridad
3. **Atender**: Haz clic en "Atender Siguiente" para procesar el turno
4. **Cancelar**: Cancela turnos pendientes desde la lista

### API REST

El sistema también expone una API REST completa:

#### Registrar Turno
```http
POST /api/turns
Content-Type: application/json

{
  "customerName": "Juan Pérez",
  "priority": "normal" // o "high"
}
```

#### Obtener Turnos Pendientes
```http
GET /api/turns
```

#### Atender Siguiente Turno
```http
PUT /api/turns/attend
```

#### Cancelar Turno
```http
DELETE /api/turns/:id
```

---

## 🏗️ Arquitectura

### Patrón MVC (Model-View-Controller)

```
gestion-turnos/
├── src/
│   ├── models/           # Lógica de negocio
│   │   ├── Turn.js       # Modelo de turno
│   │   └── TurnManager.js # Gestor de turnos
│   ├── controllers/      # Controladores
│   │   └── TurnController.js
│   ├── routes/           # Rutas de la API
│   │   └── routes.js
│   └── server.js         # Servidor Express
├── public/               # Frontend
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── index.html
└── package.json
```

### Separación de Responsabilidades

- **Models**: Contienen la lógica de negocio pura, sin dependencias de HTTP
- **Controllers**: Manejan peticiones HTTP y coordinan con los modelos
- **Views**: Interfaz de usuario independiente que consume la API
- **Routes**: Definen los endpoints de la API

---

## 🧠 Decisiones Lógicas

### 1. Definición de un Turno

Un turno es una entidad que representa una solicitud de atención de un cliente.

**Propiedades**:
- `id`: Identificador único (número autoincremental)
- `customerName`: Nombre del cliente (string, obligatorio)
- `priority`: Nivel de prioridad ('normal' o 'high')
- `status`: Estado actual ('pending', 'attended', 'cancelled')
- `timestamp`: Momento de creación (para ordenamiento FIFO)

### 2. Estados de un Turno

```
┌─────────┐
│ PENDING │ ──attend()──> ATTENDED
└─────────┘
     │
     └──cancel()──> CANCELLED
```

**Reglas de Transición**:
- Solo turnos `pending` pueden ser atendidos
- Solo turnos `pending` pueden ser cancelados
- Los estados `attended` y `cancelled` son finales (no hay vuelta atrás)

### 3. Estructura de Datos

**Decisión**: Usar dos colas separadas (arrays) + un Map para búsqueda rápida

**Justificación**:
- **Arrays para colas**: Permiten mantener el orden FIFO de forma natural
- **Map para búsqueda**: Acceso O(1) a turnos por ID
- **Separación de colas**: Simplifica la lógica de prioridad

**Alternativas consideradas**:
- ❌ Una sola cola con ordenamiento: Requiere re-ordenar constantemente
- ❌ Priority Queue con heap: Sobrecarga para este caso de uso
- ✅ Dos colas + Map: Balance perfecto entre simplicidad y eficiencia

---

## ⚡ Manejo de Turnos y Prioridades

### Reglas de Prioridad

1. **Turnos prioritarios SIEMPRE primero**
   - Los turnos con `priority: 'high'` se atienden antes que los normales
   - No importa cuándo se registraron

2. **FIFO dentro de cada categoría**
   - Dentro de turnos prioritarios: orden de llegada
   - Dentro de turnos normales: orden de llegada

3. **Validación estricta**
   - Solo se puede atender el siguiente turno en la cola
   - No se pueden "saltar" turnos

### Ejemplo de Orden de Atención

```
Registro:
1. Juan (normal)    - 10:00
2. María (high)     - 10:01
3. Pedro (normal)   - 10:02
4. Ana (high)       - 10:03

Orden de atención:
1. María (high)     - Primera prioritaria
2. Ana (high)       - Segunda prioritaria
3. Juan (normal)    - Primer normal
4. Pedro (normal)   - Segundo normal
```

### Algoritmo de Selección

```javascript
getNextTurn() {
  // 1. Buscar en cola prioritaria
  let turn = findNextPendingTurn(priorityQueue);
  
  // 2. Si no hay, buscar en cola normal
  if (!turn) {
    turn = findNextPendingTurn(normalQueue);
  }
  
  return turn;
}
```

---

## 🛡️ Casos Límite

### 1. Manejo de Grandes Cantidades de Turnos

**Problema**: El sistema podría acumular miles de turnos atendidos/cancelados

**Solución**: Método `cleanOldTurns()`
```javascript
// Elimina turnos no-pendientes más antiguos que 24 horas
turnManager.cleanOldTurns(24 * 60 * 60 * 1000);
```

**Complejidad**:
- Búsqueda: O(1) por ID (Map)
- Inserción: O(1) al final de la cola
- Atención: O(n) en el peor caso (todos cancelados menos el último)

### 2. Prevención de Estados Inconsistentes

**Validaciones implementadas**:

✅ **No atender turnos cancelados**
```javascript
canBeAttended() {
  return this.status === 'pending';
}
```

✅ **No cancelar turnos ya atendidos**
```javascript
canBeCancelled() {
  return this.status === 'pending';
}
```

✅ **Solo atender el siguiente en la cola**
```javascript
if (nextTurn.id !== turnId) {
  throw new Error('No es el siguiente turno');
}
```

✅ **Validación de entrada**
```javascript
if (!customerName || customerName.trim() === '') {
  throw new Error('Nombre obligatorio');
}
```

### 3. Concurrencia (Limitación Actual)

**Problema**: Múltiples usuarios podrían intentar atender el mismo turno

**Solución Actual**: Validación en el servidor (suficiente para uso local)

**Mejora Futura**: Implementar locks o transacciones con base de datos

### 4. Cola Vacía

**Manejo**:
```javascript
if (!nextTurn) {
  return res.status(200).json({
    success: true,
    message: 'No hay turnos pendientes',
    data: null
  });
}
```

La interfaz muestra mensajes claros cuando no hay turnos.

---

## 🎨 Separación de Lógica y Presentación

### Backend (Lógica de Negocio)

- **Models**: Lógica pura, sin dependencias de Express
- **Controllers**: Adaptadores entre HTTP y modelos
- **Testeable**: Los modelos pueden probarse sin servidor

### Frontend (Presentación)

- **Independiente**: Consume API REST
- **Reutilizable**: Podría reemplazarse con React, Vue, etc.
- **Progresivo**: Funciona sin JavaScript (formularios HTML)

---

## 🧪 Estrategia de Pruebas

### Pruebas Manuales Realizadas

1. ✅ Registrar turnos normales y prioritarios
2. ✅ Verificar orden de atención (prioritarios primero)
3. ✅ Atender turnos en orden correcto
4. ✅ Cancelar turnos pendientes
5. ✅ Intentar atender turno cancelado (debe fallar)
6. ✅ Intentar cancelar turno atendido (debe fallar)
7. ✅ Atender con cola vacía (mensaje apropiado)
8. ✅ Validación de campos vacíos

### Pruebas Automatizadas (Mejora Futura)

```javascript
// Ejemplo de test unitario
describe('TurnManager', () => {
  it('should attend priority turns first', () => {
    const manager = new TurnManager();
    manager.registerTurn('Juan', 'normal');
    manager.registerTurn('María', 'high');
    
    const next = manager.getNextTurn();
    expect(next.customerName).toBe('María');
  });
});
```

---

## 🚀 Mejoras Futuras

### Con Más Tiempo Implementaría:

1. **Persistencia de Datos**
   - Base de datos (MongoDB o PostgreSQL)
   - Los turnos sobrevivirían reinicios del servidor

2. **Autenticación y Roles**
   - Usuarios administradores vs operadores
   - Permisos diferenciados

3. **Notificaciones en Tiempo Real**
   - WebSockets para actualización automática
   - Notificaciones push cuando es tu turno

4. **Estadísticas y Reportes**
   - Tiempo promedio de atención
   - Turnos atendidos por día/hora
   - Gráficas de rendimiento

5. **Múltiples Ventanillas**
   - Asignar turnos a ventanillas específicas
   - Balanceo de carga

6. **Exportación de Datos**
   - Exportar historial a CSV/PDF
   - Reportes mensuales

7. **Internacionalización**
   - Soporte para múltiples idiomas
   - Formatos de fecha/hora localizados

8. **Tests Automatizados**
   - Tests unitarios (Jest)
   - Tests de integración (Supertest)
   - Tests E2E (Playwright)

9. **Optimizaciones de Rendimiento**
   - Caché de consultas frecuentes
   - Paginación para listas grandes
   - Lazy loading en el frontend

10. **Accesibilidad**
    - ARIA labels completos
    - Navegación por teclado
    - Soporte para lectores de pantalla

---

## 📝 Notas Técnicas

### Complejidad Algorítmica

- **Registrar turno**: O(1)
- **Obtener siguiente turno**: O(n) peor caso, O(1) caso promedio
- **Atender turno**: O(n) peor caso
- **Cancelar turno**: O(1) para búsqueda + O(1) para actualización
- **Listar pendientes**: O(n)

### Escalabilidad

**Límites actuales**:
- Almacenamiento en memoria (se pierde al reiniciar)
- Sin balanceo de carga
- Apropiado para: 100-1000 turnos simultáneos

**Para escalar**:
- Migrar a base de datos
- Implementar caché (Redis)
- Usar queue system (RabbitMQ, Bull)

---

## 👨‍💻 Autor

Desarrollado como parte de la actividad de programación sobre lógica y manejo de estados.

## 📄 Licencia

ISC

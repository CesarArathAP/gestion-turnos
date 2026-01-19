# Sistema de Gestión de Turnos

## Modelado del Problema

### ¿Qué es un turno?

Un turno es una solicitud de atención registrada en el sistema que representa a un cliente esperando ser atendido. Cada turno tiene un lugar específico en la cola de espera y debe ser procesado siguiendo reglas claras de prioridad y orden.

---

### Información mínima que contiene un turno

Cada turno en el sistema contiene la siguiente información:

| Propiedad | Descripción | Tipo | Ejemplo |
|-----------|-------------|------|---------|
| **ID** | Identificador único del turno | Número | `1`, `2`, `3` |
| **Nombre del Cliente** | Nombre de la persona que solicita atención | Texto | `"Juan Pérez"` |
| **Prioridad** | Nivel de urgencia del turno | `normal` o `high` | `"high"` |
| **Estado** | Situación actual del turno | `pending`, `attended`, `cancelled` | `"pending"` |
| **Timestamp** | Fecha y hora de registro | Número (milisegundos) | `1737318000000` |

---

### Estados que puede tener un turno

Un turno puede estar en uno de los siguientes tres estados:

#### 1. **Pending (Pendiente)** 
- Estado inicial cuando se registra el turno
- El turno está en la cola esperando ser atendido
- Puede ser atendido o cancelado

#### 2. **Attended (Atendido)**
- El turno ha sido procesado y el cliente fue atendido
- **Estado final**: No puede cambiar a otro estado
- No puede ser cancelado después de ser atendido

#### 3. **Cancelled (Cancelado)**
- El turno fue cancelado antes de ser atendido
- **Estado final**: No puede cambiar a otro estado
- No puede ser atendido después de ser cancelado

### Diagrama de Estados

```
┌──────────┐
│ PENDING  │ ──── attend() ───→ ATTENDED (final)
└──────────┘
     │
     └──── cancel() ───→ CANCELLED (final)
```

---

### Reglas para atender turnos

El sistema sigue reglas estrictas para garantizar orden y justicia en la atención:

#### Regla 1: Prioridad Alta Primero
- Los turnos con **prioridad alta** (`high`) siempre se atienden antes que los turnos normales
- No importa cuándo se registraron, los prioritarios van primero

#### Regla 2: FIFO dentro de cada prioridad
- **FIFO** = First In, First Out (Primero en entrar, primero en salir)
- Dentro de los turnos prioritarios: se atienden en orden de llegada
- Dentro de los turnos normales: se atienden en orden de llegada

#### Regla 3: Solo el siguiente turno puede ser atendido
- **No se pueden saltar turnos**
- Solo el turno que está primero en la cola puede ser atendido
- Los demás turnos deben esperar su turno

#### Regla 4: Solo turnos pendientes pueden ser atendidos
- Un turno debe estar en estado `pending` para ser atendido
- Turnos `attended` o `cancelled` no pueden ser atendidos

#### Regla 5: Solo turnos pendientes pueden ser cancelados
- Un turno debe estar en estado `pending` para ser cancelado
- Turnos ya atendidos no pueden ser cancelados

---

### Ejemplo de Orden de Atención

**Registro de turnos:**
```
10:00 → Turno #1: Juan (normal)
10:01 → Turno #2: María (high)
10:02 → Turno #3: Pedro (normal)
10:03 → Turno #4: Ana (high)
```

**Orden de atención:**
```
1º → Turno #2: María (high) - Primera prioritaria
2º → Turno #4: Ana (high) - Segunda prioritaria
3º → Turno #1: Juan (normal) - Primer normal
4º → Turno #3: Pedro (normal) - Segundo normal
```

---

## Instalación y Uso

### Requisitos
- Node.js (versión 14 o superior)

### Instalación
```bash
npm install
```

### Iniciar el servidor
```bash
npm start
```

### Acceder a la aplicación
Abrir en el navegador: `http://localhost:3000`

---

## Estructura del Proyecto

Para más detalles sobre la arquitectura y archivos del proyecto, consulta: [ESTRUCTURA.md](ESTRUCTURA.md)

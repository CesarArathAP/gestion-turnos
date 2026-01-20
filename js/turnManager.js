/**
 * Sistema de Gestión de Turnos - Lógica de Negocio
 * Clases: Turn y TurnManager
 */

// ========== CLASE TURN (Modelo de Turno) ==========
/**
 * Representa un turno individual
 * Estados posibles: pending, attended, cancelled
 */
class Turn {
    constructor(id, customerName, priority = 'normal') {
        this.id = id;
        this.customerName = customerName;
        this.priority = priority; // 'normal' o 'high'
        this.status = 'pending'; // 'pending', 'attended', 'cancelled'
        this.timestamp = Date.now();
    }

    /**
     * Marca el turno como atendido
     */
    attend() {
        if (this.status !== 'pending') {
            throw new Error('Solo se pueden atender turnos pendientes');
        }
        this.status = 'attended';
    }

    /**
     * Marca el turno como cancelado
     */
    cancel() {
        if (this.status !== 'pending') {
            throw new Error('Solo se pueden cancelar turnos pendientes');
        }
        this.status = 'cancelled';
    }

    /**
     * Verifica si el turno puede ser atendido
     */
    canBeAttended() {
        return this.status === 'pending';
    }

    /**
     * Formatea la hora de registro
     */
    getFormattedTime() {
        const date = new Date(this.timestamp);
        return date.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// ========== CLASE TURNMANAGER (Gestor de Turnos) ==========
/**
 * Gestiona la lógica de turnos, colas y prioridades
 */
class TurnManager {
    constructor() {
        this.turns = new Map(); // Almacena todos los turnos por ID
        this.priorityQueue = []; // Cola de turnos prioritarios
        this.normalQueue = []; // Cola de turnos normales
        this.nextId = 1; // Contador de IDs
    }

    /**
     * Registra un nuevo turno
     */
    registerTurn(customerName, priority = 'normal') {
        // Validar nombre
        if (!customerName || customerName.trim() === '') {
            throw new Error('El nombre del cliente es obligatorio');
        }

        // Crear turno
        const turn = new Turn(this.nextId++, customerName.trim(), priority);

        // Guardar en Map
        this.turns.set(turn.id, turn);

        // Agregar a la cola correspondiente
        if (priority === 'high') {
            this.priorityQueue.push(turn);
        } else {
            this.normalQueue.push(turn);
        }

        return turn;
    }

    /**
     * Obtiene el siguiente turno a atender
     * Prioridad: turnos prioritarios primero, luego normales
     */
    getNextTurn() {
        // Buscar en cola prioritaria primero
        for (const turn of this.priorityQueue) {
            if (turn.status === 'pending') {
                return turn;
            }
        }

        // Si no hay prioritarios, buscar en cola normal
        for (const turn of this.normalQueue) {
            if (turn.status === 'pending') {
                return turn;
            }
        }

        return null; // No hay turnos pendientes
    }

    /**
     * Atiende un turno específico
     * Solo permite atender el siguiente turno en la cola
     */
    attendTurn(turnId) {
        const turn = this.turns.get(turnId);

        if (!turn) {
            throw new Error(`Turno #${turnId} no encontrado`);
        }

        // Verificar que sea el siguiente turno
        const nextTurn = this.getNextTurn();
        if (!nextTurn || nextTurn.id !== turnId) {
            throw new Error('Solo puedes atender el siguiente turno en la cola');
        }

        turn.attend();
        return turn;
    }

    /**
     * Cancela un turno
     */
    cancelTurn(turnId) {
        const turn = this.turns.get(turnId);

        if (!turn) {
            throw new Error(`Turno #${turnId} no encontrado`);
        }

        turn.cancel();
        return turn;
    }

    /**
     * Obtiene todos los turnos pendientes
     */
    getPendingTurns() {
        const pending = [];

        // Agregar prioritarios primero
        for (const turn of this.priorityQueue) {
            if (turn.status === 'pending') {
                pending.push(turn);
            }
        }

        // Luego normales
        for (const turn of this.normalQueue) {
            if (turn.status === 'pending') {
                pending.push(turn);
            }
        }

        return pending;
    }

    /**
     * Obtiene el historial (turnos atendidos y cancelados)
     */
    getHistory() {
        const history = [];

        for (const turn of this.turns.values()) {
            if (turn.status !== 'pending') {
                history.push(turn);
            }
        }

        // Ordenar del más reciente al más antiguo
        return history.sort((a, b) => b.timestamp - a.timestamp);
    }
}

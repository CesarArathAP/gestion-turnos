/**
 * TurnManager - Gestor de Turnos
 * 
 * RESPONSABILIDADES:
 * - Mantener dos colas separadas: turnos normales y prioritarios
 * - Garantizar orden FIFO dentro de cada cola
 * - Servir turnos prioritarios antes que los normales
 * - Validar estados y prevenir inconsistencias
 * 
 * DECISIONES DE DISEÑO:
 * - Uso de arrays para las colas (eficiente para este caso de uso)
 * - Map para búsqueda rápida de turnos por ID
 * - Separación clara entre turnos prioritarios y normales
 */

const Turn = require('./Turn');

class TurnManager {
    constructor() {
        this.turns = new Map(); // Almacena todos los turnos por ID
        this.normalQueue = []; // Cola de turnos normales (FIFO)
        this.priorityQueue = []; // Cola de turnos prioritarios (FIFO)
        this.nextId = 1; // Contador para IDs únicos
    }

    /**
     * Registra un nuevo turno en el sistema
     * @param {string} customerName - Nombre del cliente
     * @param {string} priority - 'normal' o 'high'
     * @returns {Turn} El turno creado
     */
    registerTurn(customerName, priority = 'normal') {
        // Validación de entrada
        if (!customerName || customerName.trim() === '') {
            throw new Error('El nombre del cliente es obligatorio');
        }

        if (priority !== 'normal' && priority !== 'high') {
            throw new Error('La prioridad debe ser "normal" o "high"');
        }

        // Crear el turno
        const turn = new Turn(this.nextId++, customerName.trim(), priority);

        // Almacenar en el Map
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
     * REGLA: Turnos prioritarios siempre primero, luego normales
     * @returns {Turn|null} El siguiente turno o null si no hay turnos
     */
    getNextTurn() {
        // Buscar en cola prioritaria primero
        let turn = this._findNextPendingTurn(this.priorityQueue);

        // Si no hay turnos prioritarios, buscar en cola normal
        if (!turn) {
            turn = this._findNextPendingTurn(this.normalQueue);
        }

        return turn;
    }

    /**
     * Busca el siguiente turno pendiente en una cola
     * Ignora turnos cancelados o ya atendidos
     * @private
     */
    _findNextPendingTurn(queue) {
        for (let i = 0; i < queue.length; i++) {
            const turn = queue[i];
            if (turn.status === 'pending') {
                return turn;
            }
        }
        return null;
    }

    /**
     * Atiende un turno específico
     * @param {number} turnId - ID del turno a atender
     * @returns {Turn} El turno atendido
     */
    attendTurn(turnId) {
        const turn = this.turns.get(turnId);

        if (!turn) {
            throw new Error(`Turno #${turnId} no encontrado`);
        }

        // Validar que sea el siguiente turno en la cola
        const nextTurn = this.getNextTurn();
        if (!nextTurn || nextTurn.id !== turnId) {
            throw new Error(`El turno #${turnId} no es el siguiente en la cola`);
        }

        turn.attend();
        return turn;
    }

    /**
     * Cancela un turno
     * @param {number} turnId - ID del turno a cancelar
     * @returns {Turn} El turno cancelado
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
     * Obtiene todos los turnos pendientes ordenados
     * (Prioritarios primero, luego normales, ambos en orden FIFO)
     * @returns {Array<Turn>} Array de turnos pendientes
     */
    getPendingTurns() {
        const pendingPriority = this.priorityQueue.filter(t => t.status === 'pending');
        const pendingNormal = this.normalQueue.filter(t => t.status === 'pending');

        return [...pendingPriority, ...pendingNormal];
    }

    /**
     * Obtiene todos los turnos (para debugging/admin)
     * @returns {Array<Turn>} Todos los turnos
     */
    getAllTurns() {
        return Array.from(this.turns.values());
    }

    /**
     * Obtiene un turno por ID
     * @param {number} turnId - ID del turno
     * @returns {Turn|undefined} El turno o undefined
     */
    getTurnById(turnId) {
        return this.turns.get(turnId);
    }

    /**
     * Limpia turnos antiguos (atendidos/cancelados)
     * Útil para evitar crecimiento infinito en memoria
     * @param {number} maxAge - Edad máxima en milisegundos
     */
    cleanOldTurns(maxAge = 24 * 60 * 60 * 1000) { // 24 horas por defecto
        const now = Date.now();
        const toRemove = [];

        this.turns.forEach((turn, id) => {
            if (turn.status !== 'pending' && (now - turn.timestamp) > maxAge) {
                toRemove.push(id);
            }
        });

        toRemove.forEach(id => this.turns.delete(id));

        // Limpiar colas
        this.priorityQueue = this.priorityQueue.filter(t => this.turns.has(t.id));
        this.normalQueue = this.normalQueue.filter(t => this.turns.has(t.id));
    }
}

module.exports = TurnManager;

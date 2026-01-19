/**
 * Turn Model
 * 
 * Representa un turno en el sistema.
 * 
 * ESTADOS POSIBLES:
 * - pending: Turno registrado, esperando atención
 * - attended: Turno ya atendido
 * - cancelled: Turno cancelado por el usuario
 * 
 * PROPIEDADES:
 * - id: Identificador único del turno
 * - customerName: Nombre del cliente
 * - priority: 'normal' o 'high' (alta prioridad)
 * - status: Estado actual del turno
 * - timestamp: Momento de creación (para ordenamiento FIFO)
 */

class Turn {
    /**
     * Constructor del turno
     * @param {number} id - ID único del turno
     * @param {string} customerName - Nombre del cliente
     * @param {string} priority - Prioridad: 'normal' o 'high'
     */
    constructor(id, customerName, priority = 'normal') {
        this.id = id;
        this.customerName = customerName;
        this.priority = priority; // 'normal' o 'high'
        this.status = 'pending'; // 'pending', 'attended', 'cancelled'
        this.timestamp = Date.now();
    }

    /**
     * Verifica si el turno puede ser atendido
     * Solo turnos con estado 'pending' pueden ser atendidos
     */
    canBeAttended() {
        return this.status === 'pending';
    }

    /**
     * Verifica si el turno puede ser cancelado
     * Solo turnos 'pending' pueden ser cancelados
     */
    canBeCancelled() {
        return this.status === 'pending';
    }

    /**
     * Marca el turno como atendido
     * Valida que el turno esté en estado 'pending'
     */
    attend() {
        if (!this.canBeAttended()) {
            throw new Error(`El turno #${this.id} no puede ser atendido. Estado actual: ${this.status}`);
        }
        this.status = 'attended';
    }

    /**
     * Marca el turno como cancelado
     * Valida que el turno esté en estado 'pending'
     */
    cancel() {
        if (!this.canBeCancelled()) {
            throw new Error(`El turno #${this.id} no puede ser cancelado. Estado actual: ${this.status}`);
        }
        this.status = 'cancelled';
    }

    /**
     * Retorna una representación del turno para la API
     */
    toJSON() {
        return {
            id: this.id,
            customerName: this.customerName,
            priority: this.priority,
            status: this.status,
            timestamp: this.timestamp
        };
    }
}

module.exports = Turn;

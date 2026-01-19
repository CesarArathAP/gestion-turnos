/**
 * Sistema de Gestión de Turnos - Versión Básica
 * Implementación client-side con JavaScript vanilla
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

// ========== INTERFAZ DE USUARIO ==========

// Instancia global del gestor
const turnManager = new TurnManager();

// Elementos del DOM
const elements = {
    registerForm: document.getElementById('registerForm'),
    customerNameInput: document.getElementById('customerName'),
    prioritySelect: document.getElementById('priority'),
    pendingList: document.getElementById('pendingList'),
    historyList: document.getElementById('historyList'),
    turnCount: document.getElementById('turnCount'),
    notification: document.getElementById('notification')
};

/**
 * Inicializa la aplicación
 */
function init() {
    elements.registerForm.addEventListener('submit', handleRegisterTurn);
    render();
}

/**
 * Maneja el registro de un nuevo turno
 */
function handleRegisterTurn(e) {
    e.preventDefault();

    try {
        const customerName = elements.customerNameInput.value;
        const priority = elements.prioritySelect.value;

        const turn = turnManager.registerTurn(customerName, priority);

        showNotification(`Turno #${turn.id} registrado exitosamente`, 'success');

        // Limpiar formulario
        elements.customerNameInput.value = '';
        elements.prioritySelect.value = 'normal';

        render();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Maneja la atención de un turno
 */
function handleAttendTurn(turnId) {
    try {
        const turn = turnManager.attendTurn(turnId);
        showNotification(`Turno #${turn.id} atendido`, 'success');
        render();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Maneja la cancelación de un turno
 */
function handleCancelTurn(turnId) {
    try {
        const turn = turnManager.cancelTurn(turnId);
        showNotification(`Turno #${turn.id} cancelado`, 'success');
        render();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Renderiza toda la interfaz
 */
function render() {
    renderPendingTurns();
    renderHistory();
}

/**
 * Renderiza la lista de turnos pendientes
 */
function renderPendingTurns() {
    const pendingTurns = turnManager.getPendingTurns();
    const nextTurn = turnManager.getNextTurn();

    // Actualizar contador
    elements.turnCount.textContent = `${pendingTurns.length} turno${pendingTurns.length !== 1 ? 's' : ''}`;

    // Si no hay turnos
    if (pendingTurns.length === 0) {
        elements.pendingList.innerHTML = '<p class="empty-state">No hay turnos pendientes</p>';
        return;
    }

    // Renderizar turnos
    let html = '';
    pendingTurns.forEach(turn => {
        const isNext = nextTurn && nextTurn.id === turn.id;
        const priorityClass = turn.priority === 'high' ? 'priority-high' : '';
        const nextClass = isNext ? 'next-turn' : '';

        html += `
      <div class="turn-item ${priorityClass} ${nextClass}">
        <div class="turn-info">
          <div class="turn-number">Turno #${turn.id} ${isNext ? '← Siguiente' : ''}</div>
          <div class="turn-customer">${turn.customerName}</div>
          <div class="turn-meta">
            <span class="badge ${turn.priority === 'high' ? 'badge-priority' : 'badge-normal'}">
              ${turn.priority === 'high' ? 'Alta Prioridad' : 'Normal'}
            </span>
            • ${turn.getFormattedTime()}
          </div>
        </div>
        <div class="turn-actions">
          <button 
            class="btn btn-success" 
            onclick="handleAttendTurn(${turn.id})"
            ${!isNext ? 'disabled' : ''}
          >
            Atender
          </button>
          <button 
            class="btn btn-danger" 
            onclick="handleCancelTurn(${turn.id})"
          >
            Cancelar
          </button>
        </div>
      </div>
    `;
    });

    elements.pendingList.innerHTML = html;
}

/**
 * Renderiza el historial de turnos
 */
function renderHistory() {
    const history = turnManager.getHistory();

    // Si no hay historial
    if (history.length === 0) {
        elements.historyList.innerHTML = '<p class="empty-state">No hay turnos en el historial</p>';
        return;
    }

    // Renderizar historial
    let html = '';
    history.forEach(turn => {
        const statusBadge = turn.status === 'attended' ? 'badge-attended' : 'badge-cancelled';
        const statusText = turn.status === 'attended' ? 'Atendido' : 'Cancelado';

        html += `
      <div class="turn-item">
        <div class="turn-info">
          <div class="turn-number">Turno #${turn.id}</div>
          <div class="turn-customer">${turn.customerName}</div>
          <div class="turn-meta">
            <span class="badge ${turn.priority === 'high' ? 'badge-priority' : 'badge-normal'}">
              ${turn.priority === 'high' ? 'Alta Prioridad' : 'Normal'}
            </span>
            <span class="badge ${statusBadge}">${statusText}</span>
            • ${turn.getFormattedTime()}
          </div>
        </div>
      </div>
    `;
    });

    elements.historyList.innerHTML = html;
}

/**
 * Muestra una notificación
 */
function showNotification(message, type = 'success') {
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type} show`;

    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);

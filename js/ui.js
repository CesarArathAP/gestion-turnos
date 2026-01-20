/**
 * Sistema de Gestión de Turnos - Interfaz de Usuario
 * Maneja toda la lógica de presentación y eventos del DOM
 */

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

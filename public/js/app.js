/**
 * Frontend Application
 * 
 * Maneja la interacción del usuario con la interfaz
 * y la comunicación con la API
 */

// Estado de la aplicación
const state = {
    pendingTurns: [],
    allTurns: [],
    filteredHistory: []
};

// Elementos del DOM
const elements = {
    registerForm: document.getElementById('registerForm'),
    customerNameInput: document.getElementById('customerName'),
    prioritySelect: document.getElementById('priority'),
    pendingTableBody: document.getElementById('pendingTableBody'),
    historyTableBody: document.getElementById('historyTableBody'),
    turnCount: document.getElementById('turnCount'),
    notification: document.getElementById('notification'),
    filterStatus: document.getElementById('filterStatus'),
    filterDate: document.getElementById('filterDate'),
    filterSearch: document.getElementById('filterSearch'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn')
};

/**
 * Inicialización de la aplicación
 */
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadTurns();

    // Auto-refresh cada 5 segundos
    setInterval(loadTurns, 5000);
});

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    elements.registerForm.addEventListener('submit', handleRegisterTurn);

    // Filtros
    elements.filterStatus.addEventListener('change', applyFilters);
    elements.filterDate.addEventListener('change', applyFilters);
    elements.filterSearch.addEventListener('input', applyFilters);
    elements.clearFiltersBtn.addEventListener('click', clearFilters);
}

/**
 * Registrar nuevo turno
 */
async function handleRegisterTurn(e) {
    e.preventDefault();

    const customerName = elements.customerNameInput.value.trim();
    const priority = elements.prioritySelect.value;

    if (!customerName) {
        showNotification('Por favor ingresa un nombre', 'error');
        return;
    }

    try {
        const response = await fetch('/api/turns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customerName, priority })
        });

        const data = await response.json();

        if (data.success) {
            showNotification(`Turno #${data.data.id} registrado exitosamente`, 'success');
            elements.registerForm.reset();
            loadTurns();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error al registrar el turno', 'error');
        console.error(error);
    }
}

/**
 * Atender un turno específico
 */
async function handleAttendTurn(turnId) {
    try {
        // Primero verificar que sea el siguiente turno
        const nextTurnResponse = await fetch('/api/turns/next');
        const nextTurnData = await nextTurnResponse.json();

        if (!nextTurnData.data || nextTurnData.data.id !== turnId) {
            showNotification('Solo puedes atender el siguiente turno en la cola', 'error');
            return;
        }

        const response = await fetch('/api/turns/attend', {
            method: 'PUT'
        });

        const data = await response.json();

        if (data.success) {
            showNotification(data.message, 'success');
            loadTurns();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error al atender el turno', 'error');
        console.error(error);
    }
}

/**
 * Cancelar turno
 */
async function handleCancelTurn(turnId) {
    if (!confirm(`¿Estás seguro de cancelar el turno #${turnId}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/turns/${turnId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showNotification(data.message, 'success');
            loadTurns();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error al cancelar el turno', 'error');
        console.error(error);
    }
}

/**
 * Cargar turnos desde la API
 */
async function loadTurns() {
    try {
        // Cargar turnos pendientes
        const pendingResponse = await fetch('/api/turns');
        const pendingData = await pendingResponse.json();

        if (pendingData.success) {
            state.pendingTurns = pendingData.data;
            renderPendingTurns();
        }

        // Cargar todos los turnos para el historial
        const allResponse = await fetch('/api/turns/all');
        const allData = await allResponse.json();

        if (allData.success) {
            state.allTurns = allData.data;
            applyFilters();
        }
    } catch (error) {
        console.error('Error al cargar turnos:', error);
    }
}

/**
 * Renderizar turnos pendientes en tabla
 */
function renderPendingTurns() {
    // Actualizar contador
    elements.turnCount.textContent = `${state.pendingTurns.length} turno${state.pendingTurns.length !== 1 ? 's' : ''}`;

    if (state.pendingTurns.length === 0) {
        elements.pendingTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5" class="empty-state">No hay turnos pendientes</td>
      </tr>
    `;
        return;
    }

    // Renderizar filas
    elements.pendingTableBody.innerHTML = state.pendingTurns.map((turn, index) => {
        const time = new Date(turn.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const isNext = index === 0;
        const priorityClass = turn.priority === 'high' ? 'priority-high' : 'priority-normal';
        const priorityText = turn.priority === 'high' ? '⚡ Alta' : '📋 Normal';

        return `
      <tr class="${isNext ? 'next-turn' : ''}">
        <td><strong>#${turn.id}</strong>${isNext ? ' <span style="color: var(--success-color); font-size: 0.8rem;">← Siguiente</span>' : ''}</td>
        <td>${turn.customerName}</td>
        <td><span class="priority-badge-table ${priorityClass}">${priorityText}</span></td>
        <td>⏰ ${time}</td>
        <td>
          <button 
            class="btn-action btn-attend" 
            onclick="handleAttendTurn(${turn.id})"
            ${!isNext ? 'disabled' : ''}
            title="${!isNext ? 'Solo puedes atender el siguiente turno' : 'Atender este turno'}"
          >
            ✓ Atender
          </button>
          <button 
            class="btn-action btn-cancel" 
            onclick="handleCancelTurn(${turn.id})"
          >
            ✗ Cancelar
          </button>
        </td>
      </tr>
    `;
    }).join('');
}

/**
 * Aplicar filtros al historial
 */
function applyFilters() {
    const statusFilter = elements.filterStatus.value;
    const dateFilter = elements.filterDate.value;
    const searchFilter = elements.filterSearch.value.toLowerCase();

    state.filteredHistory = state.allTurns.filter(turn => {
        // Filtrar solo turnos no pendientes (atendidos o cancelados)
        if (turn.status === 'pending') return false;

        // Filtro de estado
        if (statusFilter !== 'all' && turn.status !== statusFilter) {
            return false;
        }

        // Filtro de fecha
        if (dateFilter) {
            const turnDate = new Date(turn.timestamp).toISOString().split('T')[0];
            if (turnDate !== dateFilter) {
                return false;
            }
        }

        // Filtro de búsqueda
        if (searchFilter) {
            const searchText = `${turn.id} ${turn.customerName}`.toLowerCase();
            if (!searchText.includes(searchFilter)) {
                return false;
            }
        }

        return true;
    });

    renderHistory();
}

/**
 * Limpiar filtros
 */
function clearFilters() {
    elements.filterStatus.value = 'all';
    elements.filterDate.value = '';
    elements.filterSearch.value = '';
    applyFilters();
}

/**
 * Renderizar historial
 */
function renderHistory() {
    if (state.filteredHistory.length === 0) {
        elements.historyTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5" class="empty-state">No hay turnos en el historial</td>
      </tr>
    `;
        return;
    }

    elements.historyTableBody.innerHTML = state.filteredHistory.map(turn => {
        const time = new Date(turn.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const date = new Date(turn.timestamp).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const priorityClass = turn.priority === 'high' ? 'priority-high' : 'priority-normal';
        const priorityText = turn.priority === 'high' ? '⚡ Alta' : '📋 Normal';

        const statusClass = `status-${turn.status}`;
        const statusText = turn.status === 'attended' ? '✓ Atendido' : '✗ Cancelado';

        return `
      <tr>
        <td><strong>#${turn.id}</strong></td>
        <td>${turn.customerName}</td>
        <td><span class="priority-badge-table ${priorityClass}">${priorityText}</span></td>
        <td>${date} ${time}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      </tr>
    `;
    }).join('');
}

/**
 * Mostrar notificación
 */
function showNotification(message, type = 'info') {
    elements.notification.textContent = message;
    elements.notification.className = `notification notification-${type} show`;

    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

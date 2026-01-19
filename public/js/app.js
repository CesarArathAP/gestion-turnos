/**
 * Frontend Application
 * 
 * Maneja la interacción del usuario con la interfaz
 * y la comunicación con la API
 * 
 * Incluye infinite scroll para tablas grandes
 */

// Configuración de paginación
const PAGINATION_CONFIG = {
    pendingPageSize: 20,  // Mostrar 20 turnos pendientes a la vez
    historyPageSize: 30   // Mostrar 30 turnos de historial a la vez
};

// Estado de la aplicación
const state = {
    pendingTurns: [],
    allTurns: [],
    filteredHistory: [],

    // Paginación
    pendingDisplayCount: PAGINATION_CONFIG.pendingPageSize,
    historyDisplayCount: PAGINATION_CONFIG.historyPageSize,

    // Flags de carga
    loadingMorePending: false,
    loadingMoreHistory: false
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
    setupScrollListeners();
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
    elements.filterStatus.addEventListener('change', () => {
        state.historyDisplayCount = PAGINATION_CONFIG.historyPageSize;
        applyFilters();
    });
    elements.filterDate.addEventListener('change', () => {
        state.historyDisplayCount = PAGINATION_CONFIG.historyPageSize;
        applyFilters();
    });
    elements.filterSearch.addEventListener('input', () => {
        state.historyDisplayCount = PAGINATION_CONFIG.historyPageSize;
        applyFilters();
    });
    elements.clearFiltersBtn.addEventListener('click', clearFilters);
}

/**
 * Configurar listeners de scroll para infinite scroll
 */
function setupScrollListeners() {
    // Scroll para tabla de pendientes
    const pendingContainer = document.querySelector('#pendingTable').closest('.table-container');
    pendingContainer.addEventListener('scroll', () => {
        if (isNearBottom(pendingContainer) && !state.loadingMorePending) {
            loadMorePending();
        }
    });

    // Scroll para tabla de historial
    const historyContainer = document.querySelector('#historyTable').closest('.table-container');
    historyContainer.addEventListener('scroll', () => {
        if (isNearBottom(historyContainer) && !state.loadingMoreHistory) {
            loadMoreHistory();
        }
    });
}

/**
 * Verificar si el scroll está cerca del final
 */
function isNearBottom(element) {
    const threshold = 100; // pixels desde el final
    return element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
}

/**
 * Cargar más turnos pendientes
 */
function loadMorePending() {
    if (state.pendingDisplayCount >= state.pendingTurns.length) {
        return; // Ya se muestran todos
    }

    state.loadingMorePending = true;

    // Simular pequeño delay para UX
    setTimeout(() => {
        state.pendingDisplayCount += PAGINATION_CONFIG.pendingPageSize;
        renderPendingTurns();
        state.loadingMorePending = false;
    }, 300);
}

/**
 * Cargar más turnos de historial
 */
function loadMoreHistory() {
    if (state.historyDisplayCount >= state.filteredHistory.length) {
        return; // Ya se muestran todos
    }

    state.loadingMoreHistory = true;

    // Simular pequeño delay para UX
    setTimeout(() => {
        state.historyDisplayCount += PAGINATION_CONFIG.historyPageSize;
        renderHistory();
        state.loadingMoreHistory = false;
    }, 300);
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
    const totalPending = state.pendingTurns.length;
    elements.turnCount.textContent = `${totalPending} turno${totalPending !== 1 ? 's' : ''}`;

    if (totalPending === 0) {
        elements.pendingTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5" class="empty-state">No hay turnos pendientes</td>
      </tr>
    `;
        return;
    }

    // Obtener solo los turnos a mostrar
    const turnsToDisplay = state.pendingTurns.slice(0, state.pendingDisplayCount);
    const hasMore = state.pendingDisplayCount < totalPending;

    // Renderizar filas
    let html = turnsToDisplay.map((turn, index) => {
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

    // Agregar indicador de "cargando más" si hay más turnos
    if (hasMore) {
        html += `
      <tr class="loading-row">
        <td colspan="5" class="loading-indicator">
          <div class="loading-spinner"></div>
          Mostrando ${turnsToDisplay.length} de ${totalPending} turnos. Desplázate hacia abajo para ver más...
        </td>
      </tr>
    `;
    }

    elements.pendingTableBody.innerHTML = html;
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

        // Filtro de fecha (solo día)
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

    // Ordenar del más reciente al más antiguo
    state.filteredHistory.sort((a, b) => b.timestamp - a.timestamp);

    renderHistory();
}

/**
 * Limpiar filtros
 */
function clearFilters() {
    elements.filterStatus.value = 'all';
    elements.filterDate.value = '';
    elements.filterSearch.value = '';
    state.historyDisplayCount = PAGINATION_CONFIG.historyPageSize;
    applyFilters();
}

/**
 * Renderizar historial
 */
function renderHistory() {
    const totalHistory = state.filteredHistory.length;

    if (totalHistory === 0) {
        elements.historyTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5" class="empty-state">No hay turnos en el historial</td>
      </tr>
    `;
        return;
    }

    // Obtener solo los turnos a mostrar
    const turnsToDisplay = state.filteredHistory.slice(0, state.historyDisplayCount);
    const hasMore = state.historyDisplayCount < totalHistory;

    let html = turnsToDisplay.map(turn => {
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

    // Agregar indicador de "cargando más" si hay más turnos
    if (hasMore) {
        html += `
      <tr class="loading-row">
        <td colspan="5" class="loading-indicator">
          <div class="loading-spinner"></div>
          Mostrando ${turnsToDisplay.length} de ${totalHistory} turnos. Desplázate hacia abajo para ver más...
        </td>
      </tr>
    `;
    }

    elements.historyTableBody.innerHTML = html;
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

/**
 * TurnController
 * 
 * Controlador que maneja las peticiones HTTP y coordina
 * la lógica de negocio con las respuestas al cliente.
 * 
 * RESPONSABILIDADES:
 * - Validar entrada de usuario
 * - Llamar a la lógica de negocio (TurnManager)
 * - Formatear respuestas HTTP
 * - Manejar errores de forma consistente
 */

const TurnManager = require('../models/TurnManager');

class TurnController {
    constructor() {
        this.turnManager = new TurnManager();
    }

    /**
     * Registra un nuevo turno
     * POST /api/turns
     */
    registerTurn(req, res) {
        try {
            const { customerName, priority } = req.body;

            const turn = this.turnManager.registerTurn(customerName, priority);

            res.status(201).json({
                success: true,
                message: 'Turno registrado exitosamente',
                data: turn.toJSON()
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Obtiene todos los turnos pendientes
     * GET /api/turns
     */
    getPendingTurns(req, res) {
        try {
            const turns = this.turnManager.getPendingTurns();

            res.status(200).json({
                success: true,
                data: turns.map(t => t.toJSON()),
                count: turns.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Obtiene el siguiente turno a atender
     * GET /api/turns/next
     */
    getNextTurn(req, res) {
        try {
            const turn = this.turnManager.getNextTurn();

            if (!turn) {
                return res.status(200).json({
                    success: true,
                    message: 'No hay turnos pendientes',
                    data: null
                });
            }

            res.status(200).json({
                success: true,
                data: turn.toJSON()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Atiende el siguiente turno
     * PUT /api/turns/attend
     */
    attendNextTurn(req, res) {
        try {
            const nextTurn = this.turnManager.getNextTurn();

            if (!nextTurn) {
                return res.status(404).json({
                    success: false,
                    message: 'No hay turnos pendientes para atender'
                });
            }

            const turn = this.turnManager.attendTurn(nextTurn.id);

            res.status(200).json({
                success: true,
                message: `Turno #${turn.id} atendido exitosamente`,
                data: turn.toJSON()
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Cancela un turno específico
     * DELETE /api/turns/:id
     */
    cancelTurn(req, res) {
        try {
            const turnId = parseInt(req.params.id);

            if (isNaN(turnId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de turno inválido'
                });
            }

            const turn = this.turnManager.cancelTurn(turnId);

            res.status(200).json({
                success: true,
                message: `Turno #${turn.id} cancelado exitosamente`,
                data: turn.toJSON()
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Obtiene todos los turnos (para debugging)
     * GET /api/turns/all
     */
    getAllTurns(req, res) {
        try {
            const turns = this.turnManager.getAllTurns();

            res.status(200).json({
                success: true,
                data: turns.map(t => t.toJSON()),
                count: turns.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = TurnController;

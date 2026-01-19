/**
 * API Routes
 * 
 * Define todas las rutas de la API REST
 */

const express = require('express');
const TurnController = require('../controllers/TurnController');

const router = express.Router();
const turnController = new TurnController();

// Registrar nuevo turno
router.post('/turns', (req, res) => turnController.registerTurn(req, res));

// Obtener turnos pendientes
router.get('/turns', (req, res) => turnController.getPendingTurns(req, res));

// Obtener siguiente turno
router.get('/turns/next', (req, res) => turnController.getNextTurn(req, res));

// Obtener todos los turnos (debug)
router.get('/turns/all', (req, res) => turnController.getAllTurns(req, res));

// Atender siguiente turno
router.put('/turns/attend', (req, res) => turnController.attendNextTurn(req, res));

// Cancelar turno
router.delete('/turns/:id', (req, res) => turnController.cancelTurn(req, res));

module.exports = router;

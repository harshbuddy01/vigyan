/**
 * Admin API Router - Main Entry Point
 */

const express = require('express');
const router = express.Router();

// Import sub-routers
const dashboardRouter = require('./dashboard');
const studentsRouter = require('./students');
const questionsRouter = require('./questions');
const testsRouter = require('./tests');
const transactionsRouter = require('./transactions');
const resultsRouter = require('./results');

// Mount routers
router.use('/dashboard', dashboardRouter);
router.use('/students', studentsRouter);
router.use('/questions', questionsRouter);
router.use('/tests', testsRouter);
router.use('/transactions', transactionsRouter);
router.use('/results', resultsRouter);

module.exports = router;
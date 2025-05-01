import express from 'express';
import { Router } from 'express';
import CaseController from '../controllers/caseController';
import authMiddleware from '../middleware/auth';
import validateCase from '../middleware/validateCase';

const router: Router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Case routes
router.post('/', validateCase, CaseController.createCase);
router.get('/', CaseController.getCases);
router.get('/:id', CaseController.getCase);
router.put('/:id', validateCase, CaseController.updateCase);
router.delete('/:id', CaseController.deleteCase);

// Case-related operations
router.post('/:caseId/entities/:entityId', CaseController.addEntityToCase);
router.post('/:id/notes', CaseController.addNoteToCase);

export default router; 
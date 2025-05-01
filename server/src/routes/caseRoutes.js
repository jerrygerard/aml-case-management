const express = require('express');
const CaseController = require('../controllers/caseController');
const AttachmentController = require('../controllers/attachmentController');
const CommentController = require('../controllers/commentController');
const { validateCaseCreate, validateCaseUpdate } = require('../middleware/validateCase');

const router = express.Router();

// Case routes
router.post('/', validateCaseCreate, CaseController.createCase);
router.get('/', CaseController.getCases);
router.get('/stats', CaseController.getCaseStats);
router.get('/:id', CaseController.getCase);
router.put('/:id', validateCaseUpdate, CaseController.updateCase);
router.delete('/:id', CaseController.deleteCase);

// Attachment routes
router.post('/:caseId/attachments', 
  AttachmentController.upload.single('file'),
  AttachmentController.uploadAttachment
);
router.get('/:caseId/attachments', AttachmentController.getAttachments);
router.delete('/:caseId/attachments/:attachmentId', AttachmentController.deleteAttachment);

// Comment routes
router.post('/:caseId/comments', CommentController.createComment);
router.get('/:caseId/comments', CommentController.getComments);
router.delete('/:caseId/comments/:commentId', CommentController.deleteComment);

// Case-related operations
router.post('/:caseId/entities/:entityId', CaseController.addEntityToCase);
router.post('/:id/notes', CaseController.addNoteToCase);

module.exports = router; 
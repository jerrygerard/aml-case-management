const CaseAttachment = require('../models/CaseAttachment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/case_attachments';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

class AttachmentController {
  static upload = upload;

  static async uploadAttachment(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const attachmentData = {
        case_id: req.params.caseId,
        filename: req.file.originalname,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        file_path: req.file.path,
        uploaded_by: req.user?.id || 'anonymous',
        description: req.body.description
      };

      const attachment = await CaseAttachment.create(attachmentData);
      res.status(201).json({ data: attachment });
    } catch (error) {
      console.error('Error uploading attachment:', error);
      res.status(500).json({ error: 'Failed to upload attachment' });
    }
  }

  static async getAttachments(req, res) {
    try {
      const caseId = req.params.caseId;
      const attachments = await CaseAttachment.findByCaseId(caseId);
      res.json({ data: attachments });
    } catch (error) {
      console.error('Error fetching attachments:', error);
      res.status(500).json({ error: 'Failed to fetch attachments' });
    }
  }

  static async deleteAttachment(req, res) {
    try {
      const attachmentId = req.params.attachmentId;
      const attachment = await CaseAttachment.findById(attachmentId);

      if (!attachment) {
        return res.status(404).json({ error: 'Attachment not found' });
      }

      // Delete the file from the filesystem
      fs.unlinkSync(attachment.file_path);

      // Delete the record from the database
      await CaseAttachment.delete(attachmentId);
      res.json({ data: { message: 'Attachment deleted successfully' } });
    } catch (error) {
      console.error('Error deleting attachment:', error);
      res.status(500).json({ error: 'Failed to delete attachment' });
    }
  }
}

module.exports = AttachmentController; 
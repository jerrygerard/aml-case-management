const CaseComment = require('../models/CaseComment');

class CommentController {
  static async createComment(req, res) {
    try {
      const commentData = {
        case_id: req.params.caseId,
        author: req.user?.id || 'anonymous',
        content: req.body.content,
        is_private: req.body.is_private || false
      };

      const comment = await CaseComment.create(commentData);
      res.status(201).json({ data: comment });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  }

  static async getComments(req, res) {
    try {
      const caseId = req.params.caseId;
      const comments = await CaseComment.findByCaseId(caseId);
      res.json({ data: comments });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  static async deleteComment(req, res) {
    try {
      const commentId = req.params.commentId;
      const comment = await CaseComment.findById(commentId);

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      await CaseComment.delete(commentId);
      res.json({ data: { message: 'Comment deleted successfully' } });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
}

module.exports = CommentController; 
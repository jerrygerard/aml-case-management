import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Delete as DeleteIcon, Comment as CommentIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';

interface Comment {
  id: string;
  author: string;
  content: string;
  is_private: boolean;
  created_at: string;
}

interface ApiResponse<T> {
  data: T;
}

interface CommentsProps {
  caseId: string;
}

const Comments = ({ caseId }: CommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', caseId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Comment[]>>(`/cases/${caseId}/comments`);
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (commentData: { content: string; is_private: boolean }) => {
      const response = await api.post<ApiResponse<Comment>>(
        `/cases/${caseId}/comments`,
        commentData
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', caseId] });
      setNewComment('');
      setIsPrivate(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/cases/${caseId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', caseId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    createMutation.mutate({
      content: newComment.trim(),
      is_private: isPrivate,
    });
  };

  if (isLoading) {
    return <Typography>Loading comments...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Comments</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
              }
              label="Private comment"
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<CommentIcon />}
              disabled={!newComment.trim() || createMutation.isPending}
            >
              Add Comment
            </Button>
          </Box>
        </form>
      </Paper>

      <List>
        {comments?.map((comment) => (
          <ListItem key={comment.id}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">{comment.author}</Typography>
                  {comment.is_private && (
                    <Typography variant="caption" color="text.secondary">
                      (Private)
                    </Typography>
                  )}
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" component="span">
                    {comment.content}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.created_at).toLocaleString()}
                  </Typography>
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => deleteMutation.mutate(comment.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {comments?.length === 0 && (
          <ListItem>
            <ListItemText primary="No comments" />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default Comments; 
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Delete as DeleteIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';

interface Attachment {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  description: string;
  created_at: string;
}

interface ApiResponse<T> {
  data: T;
}

interface AttachmentsProps {
  caseId: string;
}

const Attachments = ({ caseId }: AttachmentsProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: attachments, isLoading } = useQuery<Attachment[]>({
    queryKey: ['attachments', caseId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Attachment[]>>(`/cases/${caseId}/attachments`);
      return response.data.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post<ApiResponse<Attachment>>(
        `/cases/${caseId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', caseId] });
      setOpenDialog(false);
      setDescription('');
      setFile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      await api.delete(`/cases/${caseId}/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', caseId] });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    uploadMutation.mutate(formData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return <Typography>Loading attachments...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Attachments</Typography>
        <Button
          variant="contained"
          startIcon={<AttachFileIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Attachment
        </Button>
      </Box>

      <Paper>
        <List>
          {attachments?.map((attachment) => (
            <ListItem key={attachment.id}>
              <ListItemText
                primary={attachment.filename}
                secondary={
                  <>
                    <Typography variant="body2" component="span">
                      {formatFileSize(attachment.file_size)} • {attachment.file_type}
                    </Typography>
                    <br />
                    <Typography variant="body2" component="span">
                      Uploaded by {attachment.uploaded_by} on{' '}
                      {new Date(attachment.created_at).toLocaleString()}
                    </Typography>
                    {attachment.description && (
                      <>
                        <br />
                        <Typography variant="body2" component="span">
                          {attachment.description}
                        </Typography>
                      </>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => deleteMutation.mutate(attachment.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {attachments?.length === 0 && (
            <ListItem>
              <ListItemText primary="No attachments" />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Attachment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFileIcon />}
            >
              Select File
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Typography variant="body2">
                Selected: {file.name}
              </Typography>
            )}
            <TextField
              label="Description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || uploadMutation.isPending}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attachments; 
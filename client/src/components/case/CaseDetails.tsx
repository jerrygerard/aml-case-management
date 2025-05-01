import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import Attachments from './Attachments';
import Comments from './Comments';

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  risk_level: string;
  assigned_to: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
}

interface CaseDetailsProps {
  caseId: string;
}

const CaseDetails = ({ caseId }: CaseDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCase, setEditedCase] = useState<Partial<Case>>({});
  const [activeTab, setActiveTab] = useState(0);
  const queryClient = useQueryClient();

  const { data: caseData, isLoading } = useQuery<Case>({
    queryKey: ['case', caseId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Case>>(`/cases/${caseId}`);
      return response.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<Case>) => {
      const response = await api.put<ApiResponse<Case>>(
        `/cases/${caseId}`,
        updatedData
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/cases/${caseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      // Navigate back to cases list
      window.location.href = '/cases';
    },
  });

  const handleEdit = () => {
    setEditedCase(caseData || {});
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editedCase);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      deleteMutation.mutate();
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return <Typography>Loading case details...</Typography>;
  }

  if (!caseData) {
    return <Typography>Case not found</Typography>;
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4">{caseData.title}</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Description
            </Typography>
            <Typography paragraph>{caseData.description}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Status
                </Typography>
                <Typography>{caseData.status}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Priority
                </Typography>
                <Typography>{caseData.priority}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Risk Level
                </Typography>
                <Typography>{caseData.risk_level}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Assigned To
                </Typography>
                <Typography>{caseData.assigned_to}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Created By
                </Typography>
                <Typography>{caseData.created_by}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Created At
                </Typography>
                <Typography>
                  {new Date(caseData.created_at).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Attachments" />
          <Tab label="Comments" />
        </Tabs>

        {activeTab === 0 && <Attachments caseId={caseId} />}
        {activeTab === 1 && <Comments caseId={caseId} />}
      </Paper>

      <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Case</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={editedCase.title}
                onChange={(e) => setEditedCase({ ...editedCase, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={editedCase.description}
                onChange={(e) => setEditedCase({ ...editedCase, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={editedCase.status}
                onChange={(e) => setEditedCase({ ...editedCase, status: e.target.value })}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="under_investigation">Under Investigation</MenuItem>
                <MenuItem value="pending_review">Pending Review</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={editedCase.priority}
                onChange={(e) => setEditedCase({ ...editedCase, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Risk Level"
                value={editedCase.risk_level}
                onChange={(e) => setEditedCase({ ...editedCase, risk_level: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Assigned To"
                value={editedCase.assigned_to}
                onChange={(e) => setEditedCase({ ...editedCase, assigned_to: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseDetails; 
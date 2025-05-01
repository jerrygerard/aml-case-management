import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

interface Case {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  assigned_to: string;
  created_by: string;
  activities: Activity[];
}

interface Activity {
  id: number;
  type: string;
  description: string;
  created_at: string;
  user: string;
}

const CaseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [openDialog, setOpenDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const { data: case_, isLoading } = useQuery<Case>({
    queryKey: ['case', id],
    queryFn: async () => {
      const response = await api.get(`/cases/${id}`);
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { status: string; comment: string }) => {
      await api.post(`/cases/${id}/activities`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', id] });
      setOpenDialog(false);
      setNewStatus('');
      setComment('');
    },
  });

  const handleStatusUpdate = () => {
    if (newStatus && comment) {
      updateStatusMutation.mutate({
        status: newStatus,
        comment,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'closed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4">{case_?.title}</Typography>
              <Button
                variant="contained"
                onClick={() => setOpenDialog(true)}
              >
                Update Status
              </Button>
            </Box>
            <Typography variant="body1" paragraph>
              {case_?.description}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item>
                <Chip
                  label={case_?.status}
                  color={getStatusColor(case_?.status || '')}
                />
              </Grid>
              <Grid item>
                <Chip
                  label={case_?.priority}
                  color={getPriorityColor(case_?.priority || '')}
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Case Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="text.secondary">Created By</Typography>
                <Typography>{case_?.created_by}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary">Assigned To</Typography>
                <Typography>{case_?.assigned_to}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary">Created At</Typography>
                <Typography>
                  {new Date(case_?.created_at || '').toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary">Last Updated</Typography>
                <Typography>
                  {new Date(case_?.updated_at || '').toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity Timeline
            </Typography>
            <Timeline>
              {case_?.activities?.map((activity) => (
                <TimelineItem key={activity.id}>
                  <TimelineOppositeContent color="text.secondary">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">{activity.user}</Typography>
                    <Typography variant="body2">
                      {activity.description}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Case Status</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={!newStatus || !comment}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseDetails; 
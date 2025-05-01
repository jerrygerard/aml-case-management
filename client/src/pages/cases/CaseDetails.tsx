import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import Attachments from '../../components/case/Attachments';
import Comments from '../../components/case/Comments';

interface Activity {
  id: string;
  description: string;
  created_at: string;
  user_id: string;
  activity_type: string;
}

interface Case {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'under_investigation' | 'pending_review' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  created_by: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  activities: Activity[];
}

interface ApiResponse<T> {
  data: T;
}

const CaseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [status, setStatus] = useState<Case['status']>('open');
  const [priority, setPriority] = useState<Case['priority']>('medium');
  const [riskLevel, setRiskLevel] = useState<Case['risk_level']>('medium');
  const [activeTab, setActiveTab] = useState(0);

  const { data: case_, isLoading } = useQuery<Case>({
    queryKey: ['case', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Case>>(`/cases/${id}`);
      return response.data.data;
    },
  });

  useEffect(() => {
    if (case_) {
      setStatus(case_.status);
      setPriority(case_.priority);
      setRiskLevel(case_.risk_level);
    }
  }, [case_]);

  const updateCaseMutation = useMutation({
    mutationFn: async (data: Partial<Case>) => {
      const response = await api.put<ApiResponse<Case>>(`/cases/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', id] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      setOpenDialog(false);
    },
  });

  const handleSave = () => {
    updateCaseMutation.mutate({
      status,
      priority,
      risk_level: riskLevel,
      title: case_?.title,
      description: case_?.description,
      assigned_to: case_?.assigned_to
    });
  };

  const handleStatusChange = (newStatus: Case['status']) => {
    setStatus(newStatus);
  };

  const handlePriorityChange = (newPriority: Case['priority']) => {
    setPriority(newPriority);
  };

  const handleRiskLevelChange = (newRiskLevel: Case['risk_level']) => {
    setRiskLevel(newRiskLevel);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'open':
        return 'info';
      case 'under_investigation':
        return 'warning';
      case 'pending_review':
        return 'warning';
      case 'closed':
        return 'error';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: Case['priority']) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
      gap: 3,
      p: 3
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Chip
              label={case_?.status}
              color={getStatusColor(case_?.status || 'open')}
            />
            <Chip
              label={case_?.priority}
              color={getPriorityColor(case_?.priority || 'medium')}
            />
            <Chip
              label={case_?.risk_level}
              color={getPriorityColor(case_?.risk_level || 'medium')}
            />
          </Box>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2
          }}>
            <Box>
              <Typography color="text.secondary">Created By</Typography>
              <Typography>{case_?.created_by}</Typography>
            </Box>
            <Box>
              <Typography color="text.secondary">Assigned To</Typography>
              <Typography>{case_?.assigned_to}</Typography>
            </Box>
            <Box>
              <Typography color="text.secondary">Created At</Typography>
              <Typography>
                {new Date(case_?.created_at || '').toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography color="text.secondary">Last Updated</Typography>
              <Typography>
                {new Date(case_?.updated_at || '').toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Attachments" />
            <Tab label="Comments" />
          </Tabs>

          {activeTab === 0 && <Attachments caseId={id || ''} />}
          {activeTab === 1 && <Comments caseId={id || ''} />}
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Activity Timeline
        </Typography>
        <Timeline>
          {case_?.activities?.map((activity) => (
            <TimelineItem key={activity.id}>
              <TimelineOppositeContent color="text.secondary">
                {new Date(activity.created_at).toLocaleString()}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="body2" color="text.secondary">
                  User: {activity.user_id}
                </Typography>
                <Typography>{activity.description}</Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
          {(!case_?.activities || case_?.activities.length === 0) && (
            <Typography color="text.secondary">No activities yet</Typography>
          )}
        </Timeline>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Case</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => handleStatusChange(e.target.value as Case['status'])}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="under_investigation">Under Investigation</MenuItem>
                <MenuItem value="pending_review">Pending Review</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => handlePriorityChange(e.target.value as Case['priority'])}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={riskLevel}
                label="Risk Level"
                onChange={(e) => handleRiskLevelChange(e.target.value as Case['risk_level'])}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseDetails; 
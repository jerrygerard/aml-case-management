import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

interface Case {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'under_investigation' | 'pending_review' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  assigned_to: string;
}

interface CasesResponse {
  cases: Case[];
  total: number;
}

interface ApiResponse<T> {
  data: T;
}

type NewCase = Omit<Case, 'id' | 'created_at'>;

const Cases = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [newCase, setNewCase] = useState<NewCase>({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    risk_level: 'medium',
    assigned_to: '1', // Default to admin user
  });

  const { data, isLoading } = useQuery<CasesResponse>({
    queryKey: ['cases', page, rowsPerPage],
    queryFn: async () => {
      const response = await api.get<ApiResponse<CasesResponse>>('/cases', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      return response.data.data;
    },
  });

  const createCaseMutation = useMutation({
    mutationFn: async (caseData: NewCase) => {
      const response = await api.post<ApiResponse<Case>>('/cases', caseData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      setOpen(false);
      setNewCase({
        title: '',
        description: '',
        status: 'open',
        priority: 'medium',
        risk_level: 'medium',
        assigned_to: '1',
      });
    },
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    createCaseMutation.mutate(newCase);
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
    return <Box>Loading...</Box>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Create New Case
        </Button>
      </Box>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.cases?.map((case_: Case) => (
                <TableRow
                  key={case_.id}
                  hover
                  onClick={() => navigate(`/cases/${case_.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{case_.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={case_.status}
                      color={getStatusColor(case_.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={case_.priority}
                      color={getPriorityColor(case_.priority)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={case_.risk_level}
                      color={getPriorityColor(case_.risk_level)}
                    />
                  </TableCell>
                  <TableCell>{case_.assigned_to}</TableCell>
                  <TableCell>
                    {new Date(case_.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Case</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Title"
              value={newCase.title}
              onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newCase.description}
              onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
              fullWidth
              multiline
              rows={4}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newCase.status}
                onChange={(e) => setNewCase({ ...newCase, status: e.target.value as Case['status'] })}
                label="Status"
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
                value={newCase.priority}
                onChange={(e) => setNewCase({ ...newCase, priority: e.target.value as Case['priority'] })}
                label="Priority"
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
                value={newCase.risk_level}
                onChange={(e) => setNewCase({ ...newCase, risk_level: e.target.value as Case['risk_level'] })}
                label="Risk Level"
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Cases; 
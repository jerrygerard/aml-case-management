import { Box, Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

interface DashboardStats {
  totalCases: number;
  openCases: number;
  highPriority: number;
  recentActivity: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
  }>;
}

interface ApiResponse<T> {
  data: T;
}

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardStats>>('/cases/stats');
      return response.data.data;
    },
  });

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 3,
        mb: 3
      }}>
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary" gutterBottom>
            Total Cases
          </Typography>
          <Typography component="p" variant="h4">
            {stats?.totalCases || 0}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary" gutterBottom>
            Open Cases
          </Typography>
          <Typography component="p" variant="h4">
            {stats?.openCases || 0}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary" gutterBottom>
            High Priority
          </Typography>
          <Typography component="p" variant="h4">
            {stats?.highPriority || 0}
          </Typography>
        </Paper>
      </Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {stats?.recentActivity?.map((case_, index) => (
            <Box key={case_.id}>
              <ListItem>
                <ListItemText
                  primary={case_.title}
                  secondary={`Status: ${case_.status} - ${new Date(case_.created_at).toLocaleString()}`}
                />
              </ListItem>
              {index < (stats?.recentActivity?.length || 0) - 1 && (
                <Divider />
              )}
            </Box>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Dashboard; 
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const attackTypeData = [
  { name: 'System Prompt Leak', value: 35 },
  { name: 'Role Confusion', value: 25 },
  { name: 'Data Extraction', value: 20 },
  { name: 'Command Injection', value: 15 },
  { name: 'Context Manipulation', value: 5 },
];

const monthlyData = [
  { name: 'Jan', safe: 400, malicious: 2 },
  { name: 'Feb', safe: 300, malicious: 1 },
  { name: 'Mar', safe: 200, malicious: 3 },
  { name: 'Apr', safe: 278, malicious: 1 },
  { name: 'May', safe: 189, malicious: 2 },
  { name: 'Jun', safe: 239, malicious: 1 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Time Period</InputLabel>
                  <Select defaultValue="30">
                    <MenuItem value="7">Last 7 days</MenuItem>
                    <MenuItem value="30">Last 30 days</MenuItem>
                    <MenuItem value="90">Last 90 days</MenuItem>
                    <MenuItem value="365">Last year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Industry</InputLabel>
                  <Select defaultValue="all">
                    <MenuItem value="all">All Industries</MenuItem>
                    <MenuItem value="tech">Technology</MenuItem>
                    <MenuItem value="finance">Finance</MenuItem>
                    <MenuItem value="healthcare">Healthcare</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Model</InputLabel>
                  <Select defaultValue="all">
                    <MenuItem value="all">All Models</MenuItem>
                    <MenuItem value="gpt-4">GPT-4</MenuItem>
                    <MenuItem value="gpt-3.5">GPT-3.5</MenuItem>
                    <MenuItem value="claude">Claude</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button variant="contained" color="primary" fullWidth>
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Attack Type Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Attack Type Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attackTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attackTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Trends
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="safe" fill="#4caf50" name="Safe Prompts" />
                  <Bar dataKey="malicious" fill="#f44336" name="Malicious Prompts" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Key Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Prompts Analyzed
                  </Typography>
                  <Typography variant="h4">1,606</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Detection Rate
                  </Typography>
                  <Typography variant="h4">99.6%</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Response Time
                  </Typography>
                  <Typography variant="h4">150ms</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    False Positive Rate
                  </Typography>
                  <Typography variant="h4">0.1%</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 
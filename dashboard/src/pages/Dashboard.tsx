import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Jan', safePrompts: 400, maliciousPrompts: 2 },
  { name: 'Feb', safePrompts: 300, maliciousPrompts: 1 },
  { name: 'Mar', safePrompts: 200, maliciousPrompts: 3 },
  { name: 'Apr', safePrompts: 278, maliciousPrompts: 1 },
  { name: 'May', safePrompts: 189, maliciousPrompts: 2 },
  { name: 'Jun', safePrompts: 239, maliciousPrompts: 1 },
];

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Prompts</Typography>
            <Typography variant="h4">1,606</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Safe Prompts</Typography>
            <Typography variant="h4" color="success.main">1,600</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Malicious Prompts</Typography>
            <Typography variant="h4" color="error.main">6</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Success Rate</Typography>
            <Typography variant="h4" color="primary.main">99.6%</Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Prompt Analysis Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="safePrompts"
                    stroke="#4caf50"
                    name="Safe Prompts"
                  />
                  <Line
                    type="monotone"
                    dataKey="maliciousPrompts"
                    stroke="#f44336"
                    name="Malicious Prompts"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ height: 300, overflow: 'auto' }}>
              {[1, 2, 3, 4, 5].map((item) => (
                <Box key={item} sx={{ mb: 2, p: 1, bgcolor: 'background.default' }}>
                  <Typography variant="body2">
                    <strong>User {item}</strong> submitted a prompt
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    2 minutes ago
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Detection Patterns */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Detection Patterns
            </Typography>
            <Box sx={{ height: 300, overflow: 'auto' }}>
              {[
                'System prompt leak detection',
                'Role confusion detection',
                'Data extraction detection',
                'Command injection detection',
                'Context manipulation detection',
              ].map((pattern, index) => (
                <Box key={index} sx={{ mb: 2, p: 1, bgcolor: 'background.default' }}>
                  <Typography variant="body2">{pattern}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: 2 hours ago
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 
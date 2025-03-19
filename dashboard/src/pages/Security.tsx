import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Button,
  TextField,
} from '@mui/material';

const securitySettings = [
  {
    name: 'Enable Real-time Detection',
    description: 'Analyze prompts in real-time before processing',
    enabled: true,
  },
  {
    name: 'Block Malicious Prompts',
    description: 'Automatically block detected malicious prompts',
    enabled: true,
  },
  {
    name: 'Log All Attempts',
    description: 'Log all prompt analysis attempts for auditing',
    enabled: true,
  },
  {
    name: 'Email Notifications',
    description: 'Send email notifications for security incidents',
    enabled: false,
  },
];

const recentIncidents = [
  {
    id: 1,
    timestamp: '2024-03-19 14:30:00',
    type: 'System Prompt Leak Attempt',
    severity: 'High',
    status: 'Blocked',
  },
  {
    id: 2,
    timestamp: '2024-03-19 13:15:00',
    type: 'Role Confusion Attack',
    severity: 'Medium',
    status: 'Blocked',
  },
  {
    id: 3,
    timestamp: '2024-03-19 12:45:00',
    type: 'Data Extraction Attempt',
    severity: 'High',
    status: 'Blocked',
  },
];

const Security = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Security Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Security Configuration
            </Typography>
            {securitySettings.map((setting, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked={setting.enabled} />}
                  label={
                    <Box>
                      <Typography variant="body1">{setting.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {setting.description}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* API Key Management */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              API Key Management
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Current API Key"
                value="••••••••••••••••"
                disabled
                sx={{ mb: 2 }}
              />
              <Button variant="contained" color="primary">
                Generate New API Key
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Last rotated: 2024-03-01
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Security Incidents */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Security Incidents
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>{incident.timestamp}</TableCell>
                      <TableCell>{incident.type}</TableCell>
                      <TableCell>
                        <Typography
                          color={
                            incident.severity === 'High'
                              ? 'error'
                              : incident.severity === 'Medium'
                              ? 'warning.main'
                              : 'success.main'
                          }
                        >
                          {incident.severity}
                        </Typography>
                      </TableCell>
                      <TableCell>{incident.status}</TableCell>
                      <TableCell>
                        <Button size="small" color="primary">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Security; 
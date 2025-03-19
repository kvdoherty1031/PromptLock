import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';

const Settings = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Profile Settings
            </Typography>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                defaultValue="John Doe"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                defaultValue="john.doe@example.com"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Company"
                defaultValue="Acme Inc."
                sx={{ mb: 2 }}
              />
              <Button variant="contained" color="primary">
                Save Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email Notifications"
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Security Alerts"
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={<Switch />}
                label="Weekly Reports"
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="System Updates"
                sx={{ mb: 2 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* API Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              API Settings
            </Typography>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="API Key"
                defaultValue="••••••••••••••••"
                disabled
                sx={{ mb: 2 }}
              />
              <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                Generate New Key
              </Button>
              <Button variant="outlined" color="error">
                Revoke Key
              </Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Last rotated: 2024-03-01
            </Typography>
          </Paper>
        </Grid>

        {/* Billing Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Billing Settings
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    defaultValue="•••• •••• •••• ••••"
                    disabled
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    defaultValue="12/25"
                    disabled
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="CVV"
                    defaultValue="•••"
                    disabled
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
              <Button variant="contained" color="primary">
                Update Payment Method
              </Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Alert severity="info" sx={{ mt: 2 }}>
              Current Plan: Professional
            </Alert>
          </Paper>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: '#fff5f5' }}>
            <Typography variant="h6" gutterBottom color="error">
              Danger Zone
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Once you delete your account, there is no going back. Please be certain.
            </Typography>
            <Button variant="contained" color="error">
              Delete Account
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings; 
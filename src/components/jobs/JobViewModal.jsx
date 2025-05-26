import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  IconButton,
  Link,
} from '@mui/material';
import {
  Edit,
  Close,
  LocationOn,
  Work,
  AttachMoney,
  Email,
  Phone,
  Language,
  CalendarToday,
} from '@mui/icons-material';
import { formatDate, formatCurrency } from '../../utils/helpers';

const JobViewModal = ({ open, job, onClose, onEdit }) => {
  if (!job) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'expired':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Job Details</Typography>
          <Box>
            <IconButton onClick={onEdit} color="primary">
              <Edit />
            </IconButton>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Header Information */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" gutterBottom>
                {job.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {job.company}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={job.status}
                  color={getStatusColor(job.status)}
                  variant="outlined"
                />
                <Chip label={job.category} variant="outlined" />
                <Chip label={job.type} variant="outlined" />
                {job.featured && (
                  <Chip label="Featured" color="primary" variant="outlined" />
                )}
              </Box>
            </Box>
          </Grid>

          {/* Location */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  Location
                </Typography>
                <Typography variant="body2">
                  {job.location?.city}, {job.location?.province}
                  {job.location?.remote && ' (Remote available)'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Salary */}
          {(job.salary?.min || job.salary?.max) && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Salary
                  </Typography>
                  <Typography variant="body2">
                    {job.salary?.min && job.salary?.max
                      ? `${formatCurrency(job.salary.min)} - ${formatCurrency(job.salary.max)}`
                      : job.salary?.min
                      ? `From ${formatCurrency(job.salary.min)}`
                      : `Up to ${formatCurrency(job.salary.max)}`}
                    {job.salary?.period && ` per ${job.salary.period}`}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}

          {/* Description */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Job Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
              {job.description}
            </Typography>
          </Grid>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Requirements
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {job.requirements.map((req, index) => (
                  <Chip key={index} label={req} variant="outlined" />
                ))}
              </Box>
            </Grid>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Benefits
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {job.benefits.map((benefit, index) => (
                  <Chip key={index} label={benefit} variant="outlined" color="success" />
                ))}
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  <Link href={`mailto:${job.contactEmail}`} underline="hover">
                    {job.contactEmail}
                  </Link>
                </Box>
              </Grid>
              
              {job.contactPhone && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    <Link href={`tel:${job.contactPhone}`} underline="hover">
                      {job.contactPhone}
                    </Link>
                  </Box>
                </Grid>
              )}
              
              {job.applicationUrl && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Language sx={{ mr: 1, color: 'text.secondary' }} />
                    <Link href={job.applicationUrl} target="_blank" underline="hover">
                      Apply Online
                    </Link>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Metadata */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Job Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Posted
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(job.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              {job.updatedAt && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(job.updatedAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              
              {job.expiryDate && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Expires
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(job.expiryDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={onEdit} variant="contained" startIcon={<Edit />}>
          Edit Job
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobViewModal;

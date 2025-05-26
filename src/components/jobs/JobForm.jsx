import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Chip,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { addDoc, updateDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useSelector } from 'react-redux';
import { JOB_CATEGORIES, PROVINCES, CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const schema = yup.object({
  title: yup.string().required('Job title is required'),
  company: yup.string().required('Company name is required'),
  description: yup.string().required('Job description is required'),
  category: yup.string().required('Category is required'),
  type: yup.string().required('Job type is required'),
  location: yup.object({
    city: yup.string().required('City is required'),
    province: yup.string().required('Province is required'),
    remote: yup.boolean(),
  }),
  salary: yup.object({
    min: yup.number().min(0, 'Minimum salary must be positive'),
    max: yup.number().min(0, 'Maximum salary must be positive'),
    currency: yup.string().default('CAD'),
    period: yup.string().default('yearly'),
  }),
  contactEmail: yup.string().email('Invalid email').required('Contact email is required'),
  contactPhone: yup.string(),
  applicationUrl: yup.string().url('Invalid URL'),
  requirements: yup.array().of(yup.string()),
  benefits: yup.array().of(yup.string()),
  status: yup.string().required('Status is required'),
  featured: yup.boolean().default(false),
  expiryDate: yup.date(),
});

const JobForm = ({ open, job, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [requirementInput, setRequirementInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      company: '',
      description: '',
      category: '',
      type: 'full-time',
      location: {
        city: '',
        province: '',
        remote: false,
      },
      salary: {
        min: '',
        max: '',
        currency: 'CAD',
        period: 'yearly',
      },
      contactEmail: '',
      contactPhone: '',
      applicationUrl: '',
      requirements: [],
      benefits: [],
      status: 'pending',
      featured: false,
      expiryDate: '',
    },
  });

  const watchedRequirements = watch('requirements');
  const watchedBenefits = watch('benefits');

  useEffect(() => {
    if (job) {
      reset({
        ...job,
        expiryDate: job.expiryDate ? job.expiryDate.toISOString().split('T')[0] : '',
        salary: {
          min: job.salary?.min || '',
          max: job.salary?.max || '',
          currency: job.salary?.currency || 'CAD',
          period: job.salary?.period || 'yearly',
        },
      });
    } else {
      reset({
        title: '',
        company: '',
        description: '',
        category: '',
        type: 'full-time',
        location: {
          city: '',
          province: '',
          remote: false,
        },
        salary: {
          min: '',
          max: '',
          currency: 'CAD',
          period: 'yearly',
        },
        contactEmail: '',
        contactPhone: '',
        applicationUrl: '',
        requirements: [],
        benefits: [],
        status: 'pending',
        featured: false,
        expiryDate: '',
      });
    }
  }, [job, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const jobData = {
        ...data,
        salary: {
          ...data.salary,
          min: data.salary.min ? Number(data.salary.min) : null,
          max: data.salary.max ? Number(data.salary.max) : null,
        },
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        updatedAt: serverTimestamp(),
      };

      if (job) {
        // Update existing job
        await updateDoc(doc(db, 'jobs', job.id), jobData);
        toast.success('Job updated successfully');
      } else {
        // Create new job
        await addDoc(collection(db, 'jobs'), {
          ...jobData,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        toast.success('Job created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setValue('requirements', [...watchedRequirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const removeRequirement = (index) => {
    setValue('requirements', watchedRequirements.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setValue('benefits', [...watchedBenefits, benefitInput.trim()]);
      setBenefitInput('');
    }
  };

  const removeBenefit = (index) => {
    setValue('benefits', watchedBenefits.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {job ? 'Edit Job' : 'Add New Job'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Job Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Company Name"
                    error={!!errors.company}
                    helperText={errors.company?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Job Description"
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {JOB_CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Job Type</InputLabel>
                    <Select {...field} label="Job Type">
                      <MenuItem value="full-time">Full-time</MenuItem>
                      <MenuItem value="part-time">Part-time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="internship">Internship</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="location.city"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>City</InputLabel>
                    <Select {...field} label="City">
                      {CITIES.map((city) => (
                        <MenuItem key={city} value={city}>
                          {city}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="location.province"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Province</InputLabel>
                    <Select {...field} label="Province">
                      {PROVINCES.map((province) => (
                        <MenuItem key={province} value={province}>
                          {province}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="location.remote"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Remote work available"
                  />
                )}
              />
            </Grid>

            {/* Salary */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Salary Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="salary.min"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Minimum Salary"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="salary.max"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Maximum Salary"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="salary.currency"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select {...field} label="Currency">
                      <MenuItem value="CAD">CAD</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="salary.period"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Period</InputLabel>
                    <Select {...field} label="Period">
                      <MenuItem value="hourly">Hourly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="contactEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Contact Email"
                    type="email"
                    error={!!errors.contactEmail}
                    helperText={errors.contactEmail?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="contactPhone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Contact Phone"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="applicationUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Application URL"
                    placeholder="https://company.com/apply"
                  />
                )}
              />
            </Grid>

            {/* Requirements */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Requirements
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Requirement"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                />
                <Button variant="outlined" onClick={addRequirement}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {watchedRequirements.map((req, index) => (
                  <Chip
                    key={index}
                    label={req}
                    onDelete={() => removeRequirement(index)}
                  />
                ))}
              </Box>
            </Grid>

            {/* Benefits */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Benefits
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Benefit"
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                />
                <Button variant="outlined" onClick={addBenefit}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {watchedBenefits.map((benefit, index) => (
                  <Chip
                    key={index}
                    label={benefit}
                    onDelete={() => removeBenefit(index)}
                  />
                ))}
              </Box>
            </Grid>

            {/* Status and Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Status & Settings
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="expired">Expired</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="expiryDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Expiry Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Featured job (appears at top of listings)"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : job ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default JobForm;

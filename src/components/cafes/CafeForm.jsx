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
  Rating,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { addDoc, updateDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useSelector } from 'react-redux';
import { PROVINCES, CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const CAFE_CATEGORIES = [
  'Coffee Shop',
  'Tea House',
  'Bakery Cafe',
  'Internet Cafe',
  'Specialty Coffee',
  'Chain Coffee',
  'Local Cafe',
  'Persian Tea House',
  'Other',
];

const schema = yup.object({
  name: yup.string().required('Cafe name is required'),
  description: yup.string().required('Description is required'),
  specialty: yup.string().required('Specialty is required'),
  category: yup.string().required('Category is required'),
  location: yup.object({
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    province: yup.string().required('Province is required'),
    postalCode: yup.string(),
  }),
  contactInfo: yup.object({
    phone: yup.string(), // Phone number is optional for cafes
    email: yup.string().email('Invalid email'),
    website: yup.string().url('Invalid URL'),
  }),
  hours: yup.object({
    monday: yup.string(),
    tuesday: yup.string(),
    wednesday: yup.string(),
    thursday: yup.string(),
    friday: yup.string(),
    saturday: yup.string(),
    sunday: yup.string(),
  }),
  priceRange: yup.string().required('Price range is required'),
  features: yup.array().of(yup.string()),
  status: yup.string().required('Status is required'),
  featured: yup.boolean().default(false),
});

const CafeForm = ({ open, cafe, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

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
      name: '',
      description: '',
      specialty: '',
      category: '',
      features: [],
      location: {
        address: '',
        city: '',
        province: '',
        postalCode: '',
      },
      contactInfo: {
        phone: '',
        email: '',
        website: '',
      },
      hours: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: '',
      },
      priceRange: '$',
      rating: 0,
      status: 'pending',
      featured: false,
    },
  });

  const watchedFeatures = watch('features') || [];

  useEffect(() => {
    if (cafe) {
      reset({
        ...cafe,
        features: Array.isArray(cafe.features) ? cafe.features : [],
        rating: cafe.rating || 0,
      });
    }
  }, [cafe, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const cafeData = {
        ...data,
        rating: Number(data.rating) || 0,
        updatedAt: serverTimestamp(),
      };

      if (cafe) {
        // Update existing cafe
        await updateDoc(doc(db, 'cafes', cafe.id), cafeData);
        toast.success('Cafe updated successfully');
      } else {
        // Create new cafe
        await addDoc(collection(db, 'cafes'), {
          ...cafeData,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        toast.success('Cafe created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving cafe:', error);
      toast.error('Failed to save cafe');
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    const currentFeatures = Array.isArray(watchedFeatures) ? watchedFeatures : [];
    setValue('features', [...currentFeatures, featureInput.trim()]);
    setFeatureInput('');
  };

  const removeFeature = (index) => {
    const currentFeatures = Array.isArray(watchedFeatures) ? watchedFeatures : [];
    const updatedFeatures = [...currentFeatures];
    updatedFeatures.splice(index, 1);
    setValue('features', updatedFeatures);
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {cafe ? 'Edit Cafe' : 'Add New Cafe'}
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
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Cafe Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="specialty"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Specialty"
                    placeholder="e.g., Espresso, Persian Tea, Pastries"
                    error={!!errors.specialty}
                    helperText={errors.specialty?.message}
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
                    label="Description"
                    multiline
                    rows={3}
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
                      {CAFE_CATEGORIES.map((category) => (
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
                name="priceRange"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Price Range</InputLabel>
                    <Select {...field} label="Price Range">
                      <MenuItem value="$">$ - Budget Friendly</MenuItem>
                      <MenuItem value="$$">$$ - Moderate</MenuItem>
                      <MenuItem value="$$$">$$$ - Premium</MenuItem>
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

            <Grid item xs={12}>
              <Controller
                name="location.address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Address"
                    error={!!errors.location?.address}
                    helperText={errors.location?.address?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={4}>
              <Controller
                name="location.postalCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Postal Code"
                    placeholder="A1A 1A1"
                  />
                )}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="contactInfo.phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number (Optional)"
                    placeholder="(555) 123-4567"
                    error={!!errors.contactInfo?.phone}
                    helperText={errors.contactInfo?.phone?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="contactInfo.email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!errors.contactInfo?.email}
                    helperText={errors.contactInfo?.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="contactInfo.website"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Website"
                    placeholder="https://cafe.com"
                  />
                )}
              />
            </Grid>

            {/* Operating Hours */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Operating Hours
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Format: "7:00 AM - 9:00 PM" or "Closed"
              </Typography>
            </Grid>

            {daysOfWeek.map((day) => (
              <Grid item xs={12} md={6} key={day.key}>
                <Controller
                  name={`hours.${day.key}`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={day.label}
                      placeholder="7:00 AM - 9:00 PM"
                    />
                  )}
                />
              </Grid>
            ))}

            {/* Features */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Features & Amenities
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Feature"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  placeholder="e.g., WiFi, Outdoor Seating, Live Music"
                />
                <Button variant="outlined" onClick={addFeature}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Array.isArray(watchedFeatures) && watchedFeatures.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    onDelete={() => removeFeature(index)}
                  />
                ))}
              </Box>
            </Grid>

            {/* Rating and Status */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Rating & Status
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Rating
                    </Typography>
                    <Rating
                      {...field}
                      value={Number(field.value) || 0}
                      onChange={(event, newValue) => {
                        field.onChange(newValue);
                      }}
                      precision={0.5}
                    />
                  </Box>
                )}
              />
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
                      <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
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
                    label="Featured cafe (appears at top of listings)"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : cafe ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CafeForm;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Fab,
  Rating,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Search,
  LocalCafe,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { setCafes, setLoading, setError } from '../store/cafesSlice';
import CafeForm from '../components/cafes/CafeForm';
import CafeViewModal from '../components/cafes/CafeViewModal';
import { formatDate } from '../utils/helpers';
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

const Cafes = () => {
  const dispatch = useDispatch();
  const { cafes, loading, error } = useSelector((state) => state.cafes);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, cafe: null });
  const [formDialog, setFormDialog] = useState({ open: false, cafe: null });
  const [viewDialog, setViewDialog] = useState({ open: false, cafe: null });

  // Fetch cafes from Firestore
  const fetchCafes = async () => {
    dispatch(setLoading(true));
    try {
      const querySnapshot = await getDocs(collection(db, 'cafes'));
      const cafesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));
      dispatch(setCafes(cafesData));
    } catch (error) {
      console.error('Error fetching cafes:', error);
      dispatch(setError(error.message));
      toast.error('Failed to fetch cafes');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchCafes();
  }, []);

  const handleMenuClick = (event, cafe) => {
    setAnchorEl(event.currentTarget);
    setSelectedCafe(cafe);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCafe(null);
  };

  const handleView = () => {
    setViewDialog({ open: true, cafe: selectedCafe });
    handleMenuClose();
  };

  const handleEdit = () => {
    setFormDialog({ open: true, cafe: selectedCafe });
    handleMenuClose();
  };

  const handleDelete = () => {
    setConfirmDialog({ open: true, cafe: selectedCafe });
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'cafes', confirmDialog.cafe.id));
      await fetchCafes(); // Refresh the list
      toast.success('Cafe deleted successfully');
    } catch (error) {
      console.error('Error deleting cafe:', error);
      toast.error('Failed to delete cafe');
    }
    setConfirmDialog({ open: false, cafe: null });
  };

  const handleAddNew = () => {
    setFormDialog({ open: true, cafe: null });
  };

  const handleFormSuccess = () => {
    setFormDialog({ open: false, cafe: null });
    fetchCafes(); // Refresh the list
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Cafe Name',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.specialty}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value?.city}, {params.value?.province}
        </Typography>
      ),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Rating value={params.value || 0} readOnly size="small" />
          <Typography variant="caption" sx={{ ml: 1 }}>
            ({params.value || 0})
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value)}
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Added',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuClick(e, params.row)}
        >
          <MoreVert />
        </IconButton>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  const filteredCafes = cafes.filter(cafe => {
    const matchesSearch = cafe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cafe.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || cafe.status === statusFilter;
    const matchesCategory = !categoryFilter || cafe.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Cafes Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNew}
        >
          Add Cafe
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search cafes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {CAFE_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <DataGrid
          rows={filteredCafes}
          columns={columns}
          pageSize={25}
          rowsPerPageOptions={[25, 50, 100]}
          loading={loading}
          disableSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
          }}
        />
      </Card>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={handleAddNew}
      >
        <Add />
      </Fab>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          View
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, cafe: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the cafe "{confirmDialog.cafe?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, cafe: null })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cafe Form Dialog */}
      <CafeForm
        open={formDialog.open}
        cafe={formDialog.cafe}
        onClose={() => setFormDialog({ open: false, cafe: null })}
        onSuccess={handleFormSuccess}
      />

      {/* Cafe View Dialog */}
      <CafeViewModal
        open={viewDialog.open}
        cafe={viewDialog.cafe}
        onClose={() => setViewDialog({ open: false, cafe: null })}
        onEdit={() => {
          setViewDialog({ open: false, cafe: null });
          setFormDialog({ open: true, cafe: viewDialog.cafe });
        }}
      />
    </Box>
  );
};

export default Cafes;

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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Search,
  Event as EventIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { setEvents, setLoading, setError } from '../store/eventsSlice';
import EventForm from '../components/events/EventForm';
import EventViewModal from '../components/events/EventViewModal';
import { EVENT_CATEGORIES } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Events = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.events);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, event: null });
  const [formDialog, setFormDialog] = useState({ open: false, event: null });
  const [viewDialog, setViewDialog] = useState({ open: false, event: null });

  // Fetch events from Firestore
  const fetchEvents = async () => {
    dispatch(setLoading(true));
    try {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        eventDate: doc.data().eventDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
      }));
      dispatch(setEvents(eventsData));
    } catch (error) {
      console.error('Error fetching events:', error);
      dispatch(setError(error.message));
      toast.error('Failed to fetch events');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleMenuClick = (event, eventItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(eventItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleView = () => {
    setViewDialog({ open: true, event: selectedEvent });
    handleMenuClose();
  };

  const handleEdit = () => {
    setFormDialog({ open: true, event: selectedEvent });
    handleMenuClose();
  };

  const handleDelete = () => {
    setConfirmDialog({ open: true, event: selectedEvent });
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'events', confirmDialog.event.id));
      await fetchEvents(); // Refresh the list
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
    setConfirmDialog({ open: false, event: null });
  };

  const handleAddNew = () => {
    setFormDialog({ open: true, event: null });
  };

  const handleFormSuccess = () => {
    setFormDialog({ open: false, event: null });
    fetchEvents(); // Refresh the list
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const isEventPast = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  const columns = [
    {
      field: 'title',
      headerName: 'Event Title',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.organizer}
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
      field: 'eventDate',
      headerName: 'Event Date',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {formatDate(params.value)}
          </Typography>
          {isEventPast(params.value) && (
            <Chip label="Past" size="small" color="default" />
          )}
        </Box>
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
      field: 'attendees',
      headerName: 'Attendees',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 0}
        </Typography>
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || event.status === statusFilter;
    const matchesCategory = !categoryFilter || event.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Events Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNew}
        >
          Add Event
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
                placeholder="Search events..."
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
                  <MenuItem value="cancelled">Cancelled</MenuItem>
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
                  {EVENT_CATEGORIES.map((category) => (
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
          rows={filteredEvents}
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
        onClose={() => setConfirmDialog({ open: false, event: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the event "{confirmDialog.event?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, event: null })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Form Dialog */}
      <EventForm
        open={formDialog.open}
        event={formDialog.event}
        onClose={() => setFormDialog({ open: false, event: null })}
        onSuccess={handleFormSuccess}
      />

      {/* Event View Dialog */}
      <EventViewModal
        open={viewDialog.open}
        event={viewDialog.event}
        onClose={() => setViewDialog({ open: false, event: null })}
        onEdit={() => {
          setViewDialog({ open: false, event: null });
          setFormDialog({ open: true, event: viewDialog.event });
        }}
      />
    </Box>
  );
};

export default Events;

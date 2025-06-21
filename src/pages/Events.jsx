import { useState, useEffect, useCallback } from 'react';
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

  // Fetch events from Firestore with improved error handling
  const fetchEvents = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const eventsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Helper function to safely convert Firestore timestamp to ISO string
        const convertTimestamp = (timestamp) => {
          if (!timestamp) return null;
          try {
            if (timestamp.toDate instanceof Function) {
              return timestamp.toDate().toISOString();
            }
            if (timestamp instanceof Date) {
              return timestamp.toISOString();
            }
            if (typeof timestamp === 'string') {
              const date = new Date(timestamp);
              return isNaN(date.getTime()) ? null : date.toISOString();
            }
            return null;
          } catch (error) {
            console.warn('Error converting timestamp:', error);
            return null;
          }
        };

        return {
          id: doc.id,
          ...data,
          // Convert all date fields to ISO strings, with proper fallbacks
          eventDate: convertTimestamp(data.eventDate) || convertTimestamp(data.date),
          endDate: convertTimestamp(data.endDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          // Ensure required fields have defaults
          status: data.status || 'pending',
          category: data.category || 'Other',
          attendees: data.attendees || 0,
        };
      });

      dispatch(setEvents(eventsData));
    } catch (error) {
      console.error('Error fetching events:', error);
      const errorMessage = error.code === 'permission-denied'
        ? 'You do not have permission to access events'
        : 'Failed to fetch events. Please try again.';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

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
    console.log('Opening edit form with event:', selectedEvent);
    setFormDialog({ open: true, event: selectedEvent });
    handleMenuClose();
  };

  const handleDelete = () => {
    setConfirmDialog({ open: true, event: selectedEvent });
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.event?.id) {
      toast.error('Invalid event selected');
      setConfirmDialog({ open: false, event: null });
      return;
    }

    try {
      await deleteDoc(doc(db, 'events', confirmDialog.event.id));
      await fetchEvents(); // Refresh the list
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      const errorMessage = error.code === 'permission-denied'
        ? 'You do not have permission to delete this event'
        : 'Failed to delete event. Please try again.';
      toast.error(errorMessage);
    }
    setConfirmDialog({ open: false, event: null });
  };

  const handleAddNew = () => {
    setFormDialog({ open: true, event: null });
  };

  const handleFormSuccess = () => {
    console.log('Form success callback triggered');
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
    if (!eventDate) return false;
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
            {typeof params.row.organizer === 'object' ? params.row.organizer.name : params.row.organizer}
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
      width: 120,
      renderCell: (params) => {
        const attendees = params.value || 0;
        const maxAttendees = params.row.maxAttendees;

        return (
          <Typography variant="body2">
            {attendees}
            {maxAttendees && maxAttendees > 0 ? ` / ${maxAttendees}` : ' (unlimited)'}
          </Typography>
        );
      },
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
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      event.title?.toLowerCase().includes(searchLower) ||
      event.organizer?.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower) ||
      event.location?.venue?.toLowerCase().includes(searchLower) ||
      event.location?.city?.toLowerCase().includes(searchLower);

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
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
          }}
          pageSizeOptions={[25, 50, 100]}
          loading={loading}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
          }}
          getRowId={(row) => row.id}
          aria-label="Events data grid"
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

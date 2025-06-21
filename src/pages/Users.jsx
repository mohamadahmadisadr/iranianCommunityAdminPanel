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
  Avatar,
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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Search,
  Visibility,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { setUsers, setLoading, setError } from '../store/usersSlice';
import UserForm from '../components/users/UserForm';
import UserViewModal from '../components/users/UserViewModal';
import { formatDate, serializeDates } from '../utils/helpers';
import toast from 'react-hot-toast';

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, user: null });
  const [formDialog, setFormDialog] = useState({ open: false, user: null });
  const [viewDialog, setViewDialog] = useState({ open: false, user: null });

  // Fetch users from Firestore
  const fetchUsers = async () => {
    dispatch(setLoading(true));
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return serializeDates({
          id: doc.id,
          ...data,
          // Ensure registrationDate fallback to createdAt if not present
          registrationDate: data.registrationDate || data.createdAt,
        });
      });
      dispatch(setUsers(usersData));
    } catch (error) {
      console.error('Error fetching users:', error);
      dispatch(setError(error.message));
      toast.error('Failed to fetch users');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleView = () => {
    setViewDialog({ open: true, user: selectedUser });
    handleMenuClose();
  };

  const handleEdit = () => {
    setFormDialog({ open: true, user: selectedUser });
    handleMenuClose();
  };

  const handleAction = (action) => {
    setConfirmDialog({
      open: true,
      action,
      user: selectedUser,
    });
    handleMenuClose();
  };

  const handleAddUser = () => {
    setFormDialog({ open: true, user: null });
  };

  const handleFormSuccess = () => {
    setFormDialog({ open: false, user: null });
    fetchUsers(); // Refresh the list
  };

  const handleConfirmAction = async () => {
    const { action, user } = confirmDialog;

    try {
      if (action === 'suspend') {
        await updateDoc(doc(db, 'users', user.id), {
          status: 'suspended',
          updatedAt: new Date(),
        });
        toast.success('User suspended successfully');
      } else if (action === 'activate') {
        await updateDoc(doc(db, 'users', user.id), {
          status: 'active',
          updatedAt: new Date(),
        });
        toast.success('User activated successfully');
      } else if (action === 'delete') {
        await deleteDoc(doc(db, 'users', user.id));
        toast.success('User deleted successfully');
      }

      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      toast.error(`Failed to ${action} user`);
    }

    setConfirmDialog({ open: false, action: null, user: null });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'moderator':
        return 'info';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <Avatar
          sx={{ width: 32, height: 32 }}
          src={params.row.photoURL}
        >
          {params.row.displayName?.charAt(0) || params.row.firstName?.charAt(0) || params.row.email?.charAt(0)}
        </Avatar>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.displayName || `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim() || 'No Name'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getRoleColor(params.value)}
          variant="outlined"
        />
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
      field: 'registrationDate',
      headerName: 'Registered',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? formatDate(params.value) : 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? formatDate(params.value) : 'Never'}
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.displayName || ''} ${user.firstName || ''} ${user.lastName || ''} ${user.email || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Users Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddUser}
        >
          Add User
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="moderator">Moderator</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <DataGrid
          rows={filteredUsers}
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
        {selectedUser?.status === 'active' ? (
          <MenuItem onClick={() => handleAction('suspend')}>
            <Block sx={{ mr: 1 }} fontSize="small" />
            Suspend
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleAction('activate')}>
            <CheckCircle sx={{ mr: 1 }} fontSize="small" />
            Activate
          </MenuItem>
        )}
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null, user: null })}
      >
        <DialogTitle>
          Confirm {confirmDialog.action}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.action} user "{confirmDialog.user?.displayName || `${confirmDialog.user?.firstName || ''} ${confirmDialog.user?.lastName || ''}`.trim() || confirmDialog.user?.email}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Form Dialog */}
      <UserForm
        open={formDialog.open}
        user={formDialog.user}
        onClose={() => setFormDialog({ open: false, user: null })}
        onSuccess={handleFormSuccess}
      />

      {/* User View Dialog */}
      <UserViewModal
        open={viewDialog.open}
        user={viewDialog.user}
        onClose={() => setViewDialog({ open: false, user: null })}
        onEdit={() => {
          setViewDialog({ open: false, user: null });
          setFormDialog({ open: true, user: viewDialog.user });
        }}
      />
    </Box>
  );
};

export default Users;

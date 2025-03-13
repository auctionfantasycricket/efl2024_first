import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    CircularProgress,
    Box,
    Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from 'react-redux';
import './LeagueManagement.css';

const baseURL = process.env.REACT_APP_BASE_URL;

const LeagueManagement = () => {
    const [teams, setTeams] = useState();
    const [loading, setLoading] = useState(true);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [editTeamId, setEditTeamId] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editTeamName, setEditTeamName] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const leagueId = useSelector((state) => state.league.selectedLeagueId);
    const userProfile = useSelector((state) => state.login.userProfile);
    const leagueinfo = useSelector((state) => state.league.currentLeague);

    const adminEmails = leagueinfo?.admins;
    const isAdmin = adminEmails && adminEmails.includes(userProfile?.email);

    useEffect(() => {
        if (leagueId) {
            fetchTeams();
        }
    }, [leagueId]);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${baseURL}/get_data?leagueId=${leagueId}&collectionName=teams`);
            if (!response.ok) {
                throw new Error('Failed to fetch teams');
            }
            const data = await response.json();
            const processedTeams = data.map(team => ({
                id: team._id.$oid,
                name: team.teamName,
                ...team,
            }));
            setTeams(processedTeams);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Failed to fetch teams.');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeam = async () => {
        setLoading(true); // Start mutation loading
        try {
            const response = await fetch(`${baseURL}/add_team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teamName: newTeamName, leagueId: leagueId }),
            });
            if (!response.ok) {
                throw new Error('Failed to add team');
            }
            fetchTeams();
            handleCloseAddDialog();
            setNewTeamName('');
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Failed to add team.');
            setSnackbarOpen(true);
        } finally {
            setLoading(false); // End mutation loading
        }
    };

    const handleDeleteTeam = async (id) => {
        setLoading(true); // Start mutation loading
        try {
            const response = await fetch(`${baseURL}/delete_team`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teamId: id }),
            });
            if (!response.ok) {
                throw new Error('Failed to delete team');
            }
            fetchTeams();
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Failed to delete team.');
            setSnackbarOpen(true);
        } finally {
            setLoading(false); // End mutation loading
        }
    };

    const handleEditTeam = async () => {
        setLoading(true); // Start mutation loading
        try {
            const response = await fetch(`${baseURL}/edit_team`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teamName: editTeamName, teamId: editTeamId }),
            });
            if (!response.ok) {
                throw new Error('Failed to edit team');
            }
            fetchTeams();
            handleCloseEditDialog();
            setEditTeamId(null);
            setEditTeamName('');
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Failed to edit team.');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddDialog = () => {
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
    };

    const handleOpenEditDialog = (id, name) => {
        setEditTeamId(id);
        setEditTeamName(name);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const columns = [
        { field: 'name', headerName: 'Team Name', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => (
                <>
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        onClick={() => handleOpenEditDialog(params.id, params.row.name)}
                        disabled={!isAdmin}
                    />
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={() => handleDeleteTeam(params.id)}
                        disabled={!isAdmin}
                    />
                </>
            ),
        },
    ];

    return (
        <div className='leaguemgmtbody'>
            <div className='leaguemgmtcontainer'>
                <Card sx={{ marginBottom: '20px' }}>
                    <CardContent>
                        <Typography variant="h8" component="div" gutterBottom>
                            League Name: {leagueinfo?.league_name || 'Loading...'}
                        </Typography>
                        <Typography variant="h9" component="div" gutterBottom>
                            League Id: {leagueinfo?._id || 'Loading...'}
                        </Typography>
                        <Typography sx={{ color: 'black' }}>
                            Admin: {isAdmin ? 'Yes' : 'NO'}
                        </Typography>
                    </CardContent>
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                        sx={{ marginBottom: '10px' }}
                        disabled={!isAdmin}
                    >
                        Add Team
                    </Button>
                </Box>

                {/* DataGrid */}
                <div className="datagrid-container" style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={teams || []} // Handle initial undefined state
                        columns={columns}
                        loading={loading}
                        getRowId={(row) => row.id}
                        disableRowSelectionOnClick
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10 },
                            },
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        sx={{
                            backgroundColor: 'white',
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: 'rgba(21, 18, 97, 0.1)',
                            },
                            '& .MuiDataGrid-row:nth-of-type(even)': {
                                backgroundColor: 'rgba(0, 34, 81, 0.05)',
                            },
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                            autoHeight: true, // Added autoHeight
                        }}
                    />
                </div>

                {/* Add Team Dialog */}
                <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
                    <DialogTitle>Add New Team</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Team Name"
                            fullWidth
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddDialog}>Cancel</Button>
                        <Button onClick={handleAddTeam} variant="contained">
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Team Dialog */}
                <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                    <DialogTitle>Edit Team</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Team Name"
                            fullWidth
                            value={editTeamName}
                            onChange={(e) => setEditTeamName(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditDialog}>Cancel</Button>
                        <Button onClick={handleEditTeam} variant="contained">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for Error Messages */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={5000} // Adjust as needed
                    onClose={handleSnackbarClose}
                    message={snackbarMessage}
                />
            </div>
        </div>
    );
};

export default LeagueManagement;
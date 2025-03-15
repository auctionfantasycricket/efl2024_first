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
    IconButton,
    Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import './LeagueManagement.css';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { setLoginSuccess } from '../components/redux/reducer/authReducer';
import { setselectedLeagueId, setisLeagueadmin, setCurrentLeague, setmemberof } from '../components/redux/reducer/leagueReducer';

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
    const [copysnackbarOpen, setCopySnackbarOpen] = useState(false);
    const dispatch = useDispatch();

    const leagueId = useSelector((state) => state.league.selectedLeagueId);
    const userProfile = useSelector((state) => state.login.userProfile);
    const leagueinfo = useSelector((state) => state.league.currentLeague);

    console.log(leagueId)
    console.log(userProfile)
    console.log(leagueinfo)


    const adminEmails = leagueinfo?.admins;
    const isAdmin = adminEmails && adminEmails.includes(userProfile?.email);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const leaguecode = localStorage.getItem('leagueId');
        const leaguedetailsstring = localStorage.getItem('currentLeague')


        if (token) {
            const user = JSON.parse(atob(token.split('.')[1]));
            dispatch(setLoginSuccess(user));
        }
    
        if (leaguecode){
            dispatch(setselectedLeagueId(leaguecode));
        }
        if (leaguedetailsstring){
            const leaguedetails = JSON.parse(leaguedetailsstring)
            dispatch(setCurrentLeague(leaguedetails))
        }
    }, [dispatch]);

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
        setCopySnackbarOpen(false);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        // Optional: Provide visual feedback (e.g., a snackbar or alert)
        // console.log('Copied to clipboard:', text);
        setCopySnackbarOpen(true)
      };

    const columns = [
        { field: 'name', headerName: 'Team Name', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <>
                    <GridActionsCellItem
                        icon={<EditIcon sx={{color:'rgba(255, 255, 255, 0.7)'}}/>}
                        label="Edit"
                        onClick={() => handleOpenEditDialog(params.id, params.row.name)}
                        disabled={!isAdmin}
                        
                    />
                    <GridActionsCellItem
                        icon={<DeleteIcon sx={{color:'rgba(255, 255, 255, 0.7)'}}/>}
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
                <Card sx={{ marginBottom: '20px', backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                    <CardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 , fontWeight:'bold'}}> {/* Take up available space */}
                            <Typography variant="h8" color="white" component="div" gutterBottom>
                                {leagueinfo?.league_name || 'Loading...'}
                            </Typography>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center',fontWeight:'bold' }}>
                            <Typography variant="h8" color="white" style={{ marginRight: '8px' }}>
                                {leagueinfo?._id || 'Loading...'}
                            </Typography>
                            <IconButton onClick={() => handleCopy(leagueinfo?._id)} style={{color:"rgba(255, 255, 255, 0.7)"}}>
                                <FileCopyIcon />
                            </IconButton>
                        </div>
                    </CardContent>
                    <Snackbar
                        open={copysnackbarOpen}
                        autoHideDuration={3000}
                        onClose={handleSnackbarClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    >
                        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                            League ID copied to clipboard!
                        </Alert>
                    </Snackbar>
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                        sx={{ marginBottom: '10px',
                            '&.Mui-disabled': { // Target the disabled state
                                color: 'rgba(255, 255, 255, 0.5)', // Set the desired disabled color
                                backgroundColor: 'rgba(255, 255, 255, 0.1)', // Optional: Adjust background color
                            },
                         }}
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
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            '& .MuiDataGrid-columnHeaders': {
                                '--DataGrid-containerBackground': '#bfbdbd',
                                '--unstable_DataGrid-headWeight': 'bold',
                                color: 'white',
                                fontSize: '18px'
                            },
                            '& .MuiDataGrid-row': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '&:nth-of-type(even)': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                '&:hover':{
                                    backgroundColor: '#3a3e46'
                                }
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #000',
                                color: 'white'
                             },
                            '& .MuiDataGrid-footer': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                            },
                            '& .MuiTablePagination-selectLabel': {
                                color: 'white',
                            },
                            
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                            autoHeight: true, // Added autoHeight
                        }}
                    />
                </div>

                {/* Add Team Dialog */}
                <Dialog open={openAddDialog} onClose={handleCloseAddDialog} sx={{background:'rgba(255, 255, 255, 0.1)'}}>
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
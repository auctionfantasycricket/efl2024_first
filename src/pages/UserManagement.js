//src/pages/UserManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
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
    Box,
    Snackbar,
    IconButton,
    Alert,
    Select,
    MenuItem,
    FormControl,
    Chip,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useSelector } from 'react-redux';
import './UserManagement.css';
import FileCopyIcon from '@mui/icons-material/FileCopy';

const baseURL = process.env.REACT_APP_BASE_URL;

const UserManagement = () => {
    const [teams, setTeams] = useState();
    const [usersList, setUsersList] = useState([]); // Simple array of {id, name}
    const [loading, setLoading] = useState(true);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [teamMembers, setTeamMembers] = useState({}); // Track members per team: {teamId: [userIds]}
    const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
    const [selectedTeamForMember, setSelectedTeamForMember] = useState(null);
    const [selectedUserForMember, setSelectedUserForMember] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [editTeamId, setEditTeamId] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editTeamName, setEditTeamName] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [copysnackbarOpen, setCopySnackbarOpen] = useState(false);

    const leagueId = useSelector((state) => state.league.selectedLeagueId);
    const userProfile = useSelector((state) => state.login.userProfile);
    const leagueinfo = useSelector((state) => state.league.currentLeague);

    const leagueInviteUrl = `${window.location.origin}/#/join/${leagueinfo?._id}`;

    const adminEmails = leagueinfo?.admins;
    const isAdmin = adminEmails && adminEmails.includes(userProfile?.email);
    const league_type = leagueinfo?.league_type

    const fetchTeams = useCallback(async () => {
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
                members: [], // Initialize empty, will be populated by fetchTeamMembers
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
    }, [leagueId]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${baseURL}/league/users?leagueId=${leagueId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            console.log("Fetched users response:", data);
            
            // Process users - handle both array format and object format
            let processedUsers = [];
            if (Array.isArray(data.users)) {
                // If response has users array property
                processedUsers = data.users.map(user => ({
                    id: user.id || user._id,
                    name: user.name || user.userName,
                }));
            } else if (Array.isArray(data)) {
                // If response is directly an array
                processedUsers = data.map(user => ({
                    id: user.id || user._id?.$oid || user._id,
                    name: user.name || user.userName,
                }));
            }
            
            console.log("Processed users list:", processedUsers);
            setUsersList(processedUsers);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Failed to fetch users.');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    }, [leagueId]);

    const fetchTeamMembers = useCallback(async () => {
        if (!teams || !usersList.length) return;

        try {
            const teamMembersMap = {};

            // Initialize empty arrays for all teams
            teams.forEach(team => {
                teamMembersMap[team.id] = [];
            });

            // For each user, fetch their team info
            const memberPromises = usersList.map(async (user) => {
                try {
                    const response = await fetch(`${baseURL}/teams/my_team?userId=${user.id}&leagueId=${leagueId}`);
                    
                    if (response.status === 404) {
                        // User doesn't have a team, skip
                        return;
                    }
                    
                    if (!response.ok) {
                        console.warn(`Failed to fetch team for user ${user.id}:`, response.status);
                        return;
                    }
                    
                    const data = await response.json();
                    
                    // The API returns team info, add user to the corresponding team
                    if (data.teamId && teamMembersMap[data.teamId] !== undefined) {
                        teamMembersMap[data.teamId].push(user.id);
                    }
                } catch (error) {
                    console.warn(`Error fetching team for user ${user.id}:`, error);
                }
            });

            await Promise.all(memberPromises);
            setTeamMembers(teamMembersMap);
        } catch (error) {
            console.error('Error fetching team members:', error);
            setSnackbarMessage('Failed to load team member assignments.');
            setSnackbarOpen(true);
        }
    }, [teams, usersList, leagueId]);

    useEffect(() => {
        if (leagueId) {
            fetchTeams();
            fetchUsers();
        }
    }, [leagueId, fetchTeams, fetchUsers]);

    // Separate useEffect to fetch team members after teams and users are loaded
    useEffect(() => {
        if (teams && usersList.length > 0) {
            fetchTeamMembers();
        }
    }, [teams, usersList, fetchTeamMembers]);

    const handleAddTeam = async () => {
        setLoading(true); // Start mutation loading
        console.log("lt",league_type)
        try {
            const response = await fetch(`${baseURL}/add_team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teamName: newTeamName, leagueId: leagueId, leagueType: league_type }),
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

    const handleOpenAddMemberDialog = (teamId) => {
        setSelectedTeamForMember(teamId);
        setSelectedUserForMember('');
        setOpenAddMemberDialog(true);
    };

    const handleCloseAddMemberDialog = () => {
        setOpenAddMemberDialog(false);
        setSelectedTeamForMember(null);
        setSelectedUserForMember('');
    };

    const handleAddMember = () => {
        if (selectedUserForMember && selectedTeamForMember) {
            const currentMembers = teamMembers[selectedTeamForMember] || [];
            if (!currentMembers.includes(selectedUserForMember)) {
                setTeamMembers({
                    ...teamMembers,
                    [selectedTeamForMember]: [...currentMembers, selectedUserForMember]
                });
                setHasUnsavedChanges(true);
            }
            handleCloseAddMemberDialog();
        }
    };

    const handleRemoveMember = (teamId, userId) => {
        const currentMembers = teamMembers[teamId] || [];
        setTeamMembers({
            ...teamMembers,
            [teamId]: currentMembers.filter(id => id !== userId)
        });
        setHasUnsavedChanges(true);
    };

    const getAvailableUsers = () => {
        // Get all assigned user IDs
        const assignedUserIds = Object.values(teamMembers).flat();
        // Return users that are not assigned to any team
        return usersList.filter(user => !assignedUserIds.includes(user.id));
    };

    const handleSaveTeamMembers = async () => {
        setLoading(true);
        try {
            // Collect all user-team assignments to save
            const savePromises = [];
            
            // Loop through each team and its members
            Object.entries(teamMembers).forEach(([teamId, memberIds]) => {
                // For each member in the team, create a join request
                memberIds.forEach(userId => {
                    const payload = {
                        userId: userId,
                        teamId: teamId,
                        leagueId: leagueId
                    };
                    
                    const promise = fetch(`${baseURL}/teams/join`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    savePromises.push(promise);
                });
            });

            // Wait for all join requests to complete
            const responses = await Promise.all(savePromises);
            
            // Check if all requests were successful
            const failedRequests = responses.filter(response => !response.ok);
            
            if (failedRequests.length > 0) {
                throw new Error(`${failedRequests.length} team member assignments failed`);
            }

            setHasUnsavedChanges(false);
            setSnackbarMessage('Team members saved successfully.');
            setSnackbarOpen(true);
            
            // Refresh team members data after successful save
            if (teams && usersList.length > 0) {
                fetchTeamMembers();
            }
        } catch (error) {
            console.error('Error saving team members:', error);
            setSnackbarMessage('Failed to save team members.');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
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
        setCopySnackbarOpen(true)
      };

    const columns = [
        { field: 'name', headerName: 'Team Name', width: 200 },
        {
            field: 'members',
            headerName: 'Members',
            width: 400,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {(teamMembers[params.id] || []).map(userId => {
                        const user = usersList.find(u => u.id === userId);
                        return user ? (
                            <Chip
                                key={userId}
                                label={user.name}
                                onDelete={() => handleRemoveMember(params.id, userId)}
                                size="small"
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    '& .MuiChip-deleteIcon': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        '&:hover': {
                                            color: 'white',
                                        },
                                    },
                                }}
                            />
                        ) : null;
                    })}
                    {isAdmin && (
                        <IconButton
                            size="small"
                            onClick={() => handleOpenAddMemberDialog(params.id)}
                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                            <PersonAddIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
            ),
        },
    ];

    return (
        <div className='usermgmtbody'>
            <div className='usermgmtcontainer'>
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
                            {/* <IconButton onClick={() => handleCopy(leagueinfo?._id)} style={{color:"rgba(255, 255, 255, 0.7)"}}> */}
                            {/* <IconButton onClick={() => handleCopy(leagueInviteUrl)} style={{color:"rgba(255, 255, 255, 0.7)"}}>
                                <FileCopyIcon />
                            </IconButton> */}
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
                        onClick={handleSaveTeamMembers}
                        disabled={!isAdmin || !hasUnsavedChanges}
                        sx={{
                            marginBottom: '10px',
                            backgroundColor: hasUnsavedChanges ? '#4caf50' : 'rgba(255, 255, 255, 0.1)',
                            '&.Mui-disabled': {
                                color: 'rgba(255, 255, 255, 0.5)',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&:hover': {
                                backgroundColor: hasUnsavedChanges ? '#45a049' : 'rgba(255, 255, 255, 0.2)',
                            },
                        }}
                    >
                        Save Changes
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

                {/* Add Member Dialog */}
                <Dialog open={openAddMemberDialog} onClose={handleCloseAddMemberDialog}>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth margin="dense">
                            <Select
                                value={selectedUserForMember}
                                onChange={(e) => setSelectedUserForMember(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="">
                                    <em>Select User</em>
                                </MenuItem>
                                {getAvailableUsers().map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddMemberDialog}>Cancel</Button>
                        <Button
                            onClick={handleAddMember}
                            variant="contained"
                            disabled={!selectedUserForMember}
                        >
                            Add Member
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

export default UserManagement;
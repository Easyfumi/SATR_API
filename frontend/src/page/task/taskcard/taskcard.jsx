
import React, { useState } from 'react'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import UserList from '../userlist';
import EditTaskCard from'./edittaskcard';

const role = "ROLE_ADMIN"

const TaskCard = () => {

  const [anchorEl, setAnchorEl] = React.useState(null);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };



  const [openUpdateTask, setOpenUpdateTask] = useState(false);
  const handleCloseUpdateTask = () => {
    setOpenUpdateTask(false)
  };
  const handleOpenUpdateTask = () => {
    setOpenUpdateTask(true);
    handleClose();
  };


  const [openUserList, setOpenUserList] = useState(false);
  const handleOpenUserList = () => {
    setOpenUserList(true);
    handleClose()
  };
  const handleCloseUserList = () => {
    setOpenUserList(false)
  };




  const handleDeleteTask = () => {
    handleClose()
  };

  return (
    <div className='card lg:flex justify-between'>

      <div className='lg:flex gap-5 items-center space-y-2 w-[90%] lg:w-[70%]'>
        <div className='space-y-2'>
          <h1 className='font-bold text-lg'>Task</h1>
          <p className='text-sm'>description</p>
        </div>
      </div>

      <div>
        <IconButton id="basic-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}>
          <EditIcon sx={{ color: "#FFFFFF" }} />
        </IconButton>

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleOpenUpdateTask}>Edit</MenuItem>
          {
            role === "ROLE_ADMIN" ? <>
              <MenuItem onClick={handleOpenUserList}>Assined User</MenuItem>
              <MenuItem onClick={handleDeleteTask}>Delete</MenuItem>
            </> : <>
            </>
          }
        </Menu>

        <UserList open={openUserList} handleClose={handleCloseUserList} />
        <EditTaskCard open={openUpdateTask} handleClose={handleCloseUpdateTask} />
      </div>

    </div>
  )
}

export default TaskCard;
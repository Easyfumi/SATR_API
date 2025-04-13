import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Button, Divider, ListItem, ListItemText } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};


const tasks = [1,1,1,1]

export default function UserList({ handleClose, open }) {

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {
            tasks.map((item, index) =>
              <div>
                <div className='flex items-center justify-between w-full'>
                  <div>
                    <ListItem>
                      <ListItemText
                        primary="primary text"
                        secondary="secondary text" />
                    </ListItem>
                  </div>
                  <div>
                    <Button className='customeButton '>
                      Select
                    </Button>
                  </div>

                </div>
                {
                  index!==tasks.length -1 && <Divider variant='insert' />
                }
                
              </div>


            )
          }
        </Box>
      </Modal>
    </div >
  );
}

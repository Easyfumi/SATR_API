import React, { useState } from 'react'
import { Box, Button, Grid, Modal, TextField } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';



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


export default function CreateNewTask({ handleClose, open }) {

    const [formData, setFormData] = useState({
        title:" ",
        description:" ",
        deadline: new Date(),
    })

    const handleChange=(e)=>{
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    }; 

    const handleDeadlineChange = (date) => {
        setFormData({
            ...formData,
            deadline:date
        })
        
    }

    const formateDate=(input)=>{
        let{
            $y: year,
            $M: month,
            $D: day,
            $H: hours,
            $m: minutes,
            $s: seconds,
            $ms: milliseconds,
        } = input;

        month = month + 1;

        const date = new Date(year, month, day, hours, minutes, seconds, milliseconds);

        const formatedDate = date.toISOString();

        return formatedDate;

    }

    const handleSubmit=(e)=>{
        e.preventDefault();
        const {deadline} = formData;
        formData.deadline = formateDate(deadline);
        console.log("formData",formData,"deadline :", formData.deadline)
        handleClose()
    }
    
    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2} alignItems="center">

                            <Grid item xs={12}>
                                <TextField 
                                label="Title"
                                fullWidth
                                name='title'
                                value={formData.title}
                                onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField 
                                label="Description"
                                fullWidth
                                multiline
                                rows={4}
                                name='description'
                                value={formData.description}
                                onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker 
                                    onChange={handleDeadlineChange}
                                    className="w-full" 
                                    label="Deadline"
                                    renderInput={(params)=><TextField {...params}/>}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={12}>
                                <Button fullWidth
                                className='customeButtom'
                                type="submit"
                                sx={{padding:".9rem"}}>
                                    Create
                                </Button>
                            </Grid>
                            

                        </Grid>
                    </form>
                </Box>
            </Modal>
        </div >
    );
}
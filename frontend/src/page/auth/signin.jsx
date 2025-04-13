import { Button, TextField } from '@mui/material';
import React, { useState } from 'react'

const Signin = () => {

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const handleChange = (e) => {
        const { name, value } = e.targer;
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("login form", formData)
    }

    return (
        <div>
            <h1 className='text-lg font-bold text-center pb-8'>
                Login
            </h1>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='enter your email...'
                />
                <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder='enter your password...'
                />
                <Button fullWidth
                    className='customeButtom'
                    type="submit"
                    sx={{ padding: ".9rem" }}>
                    Login
                </Button>
            </form>
        </div>
    )
}

export default Signin
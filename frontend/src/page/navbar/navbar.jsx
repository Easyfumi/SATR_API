import React from 'react'
import "./navbar.css"
import { ButtonBase } from '@mui/material'

const Navbar = () => {
  const handleLogout=()=> {
    console.log("handle logout")
  }
  return (
    <div className='w-full bg-white shadow-sm'>
    <div className='container max-w-none px-0 lg:px-10 z-10 sticky py-3 flex justify-between items-center'>
        <p className='font-bold text-lg'>
        Межотраслевой фонд "Сертификация автотранспорта САТР" ("САТР-Фонд")
        </p>
        <div className='flex items-center gap-5'>
        <p>bla bla bla</p>
        <ButtonBase onClick={handleLogout} sx={{padding:".7rem", borderRadius:"2rem"}} 
        fullWidth className='logoutButton'>
        Logout
        </ButtonBase>
        </div>
    </div>
    </div>
  )
}

export default Navbar
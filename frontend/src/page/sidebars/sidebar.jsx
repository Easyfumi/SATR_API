
import React, { useState } from 'react'
import "./sidebar.css"

const menu = [
    {name:"Home", value:"Home", role:["ROLE_ADMIN", "ROLE_CUSTOMER"]},
    {name:"DONE", value:"DONE", role:["ROLE_ADMIN", "ROLE_CUSTOMER"]},
    {name:"ASSIGNED", value:"ASSIGNED", role:["ROLE_ADMIN", "ROLE_CUSTOMER"]},
    {name:"NOT ASSIGNED", value:"PENDING", role:["ROLE_ADMIN", "ROLE_CUSTOMER"]},
    {name:"Create New Task", value:"", role:["ROLE_ADMIN", "ROLE_CUSTOMER"]},
    {name:"Notification", value:"NOTIFICATION", role:["ROLE_ADMIN", "ROLE_CUSTOMER"]},
]

const role ="ROLE_ADMIN"


const Sidebar = () => {
    const [activeMenu, setActiveMenu]=useState("Home")
    const handleMenuChange=(item)=>{
        setActiveMenu(item.name)
    }
return (
    <div className='card min-h-[85] flex flex-col justify-center fixed  w-[15vw]'>
        <div className='space-y-5 h-full'>
            <div className='flex justify-center'>
                <p className='text-lg'>
                    НАВИГАЦИЯ
                </p>
            </div>
            {
                menu.filter((item)=>item.role.includes(role))
                .map((item)=><p onClick={()=>handleMenuChange(item)} className={`py-3 px-5 rounded-full text-center 
                cursor-pointer ${activeMenu===item.name?"activeMenuItem":"menuItem"}`}>
                    {item.name}
                </p>)
            }
            
        </div>
        
    </div>
  )
}
  


export default Sidebar
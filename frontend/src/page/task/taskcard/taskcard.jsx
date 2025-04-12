import React from 'react'

const TaskCard = () => {
  return (
    <div>
        <div className='card lg:flex justify-between'>
            <div className='lg:flex gap-5 item-center space-y-2 w-[90%] lg:w-[70%]'>
                <div className='space-y-2'>
                    <h1 className='font-bold taxt-lg'>Task</h1>
                    <p className='text-sm'>discription</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default TaskCard
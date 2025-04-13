import React, { useState } from 'react'
import Signin from './signin';

const Auth = () => {

    const [isRegister, setIsRegister] = useState(false);

    const togglePanel = () => {
        setIsRegister(isRegister)
    }
    return (
        <div className='flex justify-center h-screen items-center overfrow-hidden'>
            <div className='box lg:max-w-4x1'>
                <div className={`cover ${isRegister ? "rotate-active" : ""}`}>
                    <div className='front'>
                        <img src="https://i.pinimg.com/originals/c6/d7/14/c6d7148b6dc5db491db3c6c5d96e402b.jpg" alt="" />
                        <div className='text'>
                            <span className='text-1'>
                                Success is build upon well-oragized tasks
                            </span>
                            <span className='text-2 text-xs'>
                                Let's get connected
                            </span>
                        </div>
                    </div>
                    <div className='back'>
                        <img src="https://i.pinimg.com/originals/bb/a5/5f/bba55f716e3a41b93bb122d13ddf6df8.jpg" alt="" />
                        <div className='text'>
                            <span className='text-1'>
                                Success is build upon well-oragized tasks
                            </span>
                            <span className='text-2 text-xs'>
                                Let's get connected
                            </span>
                        </div>

                    </div>
                </div>
                <div className='forms h-full'>
                    <div className='form-content h-full'>
                        <div className='login-form'>
                            <Signin/>
                        </div>
                        <div className='signup-form'>
                            sign up form
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth
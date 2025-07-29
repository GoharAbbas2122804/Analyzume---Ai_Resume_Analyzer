export const meta = () =>(
    [
        { title : 'Analyzume | Auth'},
        { name : 'description' , content:'Log in to your account'}
    ]
)

import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter'

const Auth = () => {
    const {isLoading , auth} = usePuterStore(); 
    const location = useLocation();
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();


    useEffect( () => {

        if(auth.isAuthenticated) navigate(next);


    }, [auth.isAuthenticated, next])

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
        <div className='gradient-border shadow-lg'>
            <section className='flex flex-col gap-8 bg-white rouded-2xl p-10'>
                <div className='flex flex-col items-center gap-2 text-center'>
                    <h1>Welcome</h1>
                    <h2>Log In to Continue to your job Journey</h2>
                </div>

                <div>
                    {isLoading ? (
                        <button className='auth-button animate-pulse'>Signing you in...</button>
                    ) : (
                    <>
                        {auth.isAuthenticated ? (

                            <button className="auth-button" onClick={auth.signOut}>
                                <p>LogOut</p>
                            </button>

                        ) : (
                            <button className="auth-button" onClick={auth.signIn}>
                               <p>Log In</p>
                            </button>
                        )}
                    </>
                    )}
                </div>
            </section>
        </div> 
    </main>
  )
}

export default Auth
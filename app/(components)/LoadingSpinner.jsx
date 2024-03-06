import React from 'react'
import { Spinner } from 'flowbite-react';

function LoadingSpinner() {
  return (
    <>
    <div className='flex items-center justify-center' >


    <Spinner color="purple"  className=' mt-4' aria-label="Purple spinner example" />
    </div>
    </>
  )
}

export default LoadingSpinner
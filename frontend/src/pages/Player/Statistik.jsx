import React from 'react'

const Statistik = () => {
  return (
    <div className="d-flex justify-content-center align-items-center">
        <div className='col'>
            <div className="p-3 text-center bg-success border text-light"> 10 Answer</div>
            <div className="p-3 text-center bg-danger border text-light"> 5 Answer</div>
        </div>
        <div className='col'>
            <div className="p-3 text-center bg-danger border text-light"> 1 Answer</div>
            <div className="p-3 text-center bg-danger border text-light"> 3 Answer</div>
        </div>
    </div>
  )
}

export default Statistik

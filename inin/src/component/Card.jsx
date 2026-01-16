import { InputNumber } from 'primereact/inputnumber'
import React, { useState } from 'react'
import 'primeflex/primeflex.css';

import { Button } from 'primereact/button';
        


const Card = ({lookvalue, setlookvalue}) => {
    
  return (
   <div className="text-black-500 border-2 flex flex-col m-0 p-0 w-100">
    <div>Select Multiple Rows</div>
    <div>Enter number of rows to select across all pages</div>

    {/* Row container */}
    <div className="flex align-items-center gap-2 mt-2 relative">
        <InputNumber
            value={lookvalue}
            size="small"
            onValueChange={(e) => setlookvalue(e.value)}
            mode="decimal"
            showButtons
            min={0}
            max={100}
        />
        <Button
            label="Submit"
            size="small"
            onClick={() => console.log(lookvalue)}
        />
    </div>
</div>

  )
}

export default Card
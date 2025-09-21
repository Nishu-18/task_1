"use client"
import React, { useState } from 'react'
import "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

const Recognize = () => {
    const [imageUrl,setImageUrl]=useState(null);
    const [loading,setloading]=useState(false); 
    const [predictions,setPredictions]=useState(null);
    const handleImageChange=(e)=>{
        const file=e.target.files[0];
        if(file){
            const image=URL.createObjectURL(file);
            setImageUrl(image);
        }
    }
    const handleClassify=async()=>{
        setloading(true);
        try {
            const imageElement=document.querySelector('#img');
            const model=await mobilenet.load();
            const predictions=await model.classify(imageElement);
            setPredictions(predictions);
            console.log(predictions);
            

            
        } catch (error) {
            
        }finally{
            setloading(false);
        }
        
    }
  return (
    <div className='h-screen w-full flex flex-col gap-5 bg-indigo-400 justify-center items-center'>
        <label>
            <span className=' border-2 border-dashed rounded-lg p-3'>Upload</span>
            <input onChange={handleImageChange} type="file" accept='image/*' hidden />
        </label>
        {imageUrl &&<>
        <img alt='img' id='img' className='w-[300px] rounded-xl' src={imageUrl}/>
        <button onClick={handleClassify} className='px-4 py-2 rounded bg-gray-100/10'>{loading?"loading...":"Classify"}</button>
        
        </> }

        {predictions && <>
            {predictions.map((prediction)=>{
                return <div className='flex justify-center items-center gap-3' key={prediction.className}>
                    <div>{prediction.className}</div>
                    <div>{prediction.probability}</div>
                </div>;
            })}
        </>}
    </div>
  )
}

export default Recognize
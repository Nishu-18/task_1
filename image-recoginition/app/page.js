'use client'
import Image from "next/image";
import { useEffect, useRef } from "react";
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import "@tensorflow/tfjs";

export default function Home() {
  const videoRef=useRef(null);
  const canvasRef=useRef(null);
  const runDetection=()=>{
    console.log('run');
    
    const doesExist=navigator.mediaDevices.getUserMedia({video:true}) instanceof Promise;
    if(!doesExist) return alert('Camera not found!')
      if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
        const webPromise=navigator.mediaDevices.getUserMedia({audio:false,
          video:{facingMode:'user'}}).then((stream)=>{
            videoRef.current.srcObject=stream;
            return new Promise((resolve,reject)=>{
              videoRef.current.onloadedmetadata=()=>{
                resolve();
              }
            })
          })
          const modelPromise=cocoSsd.load();
      Promise.all([modelPromise,webPromise]).then((values)=>{
        detectFrame(videoRef.current,values[0]);
        
      })
      }
      const detectFrame=(video,model)=>{
        model.detect(video).then((predictions)=>{
          requestAnimationFrame(()=>{
            detectFrame(video,model);
          })
          renderPredictions(predictions)
        })
      }
      const renderPredictions=(predictions)=>{
        const ctx=canvasRef.current.getContext('2d');
        ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
        const font="16px sans-serif";
        ctx.font=font;
        ctx.baseline="top";
        predictions.forEach(prediction=>{
          const [x,y,width,height]=prediction.bbox;
          ctx.strokeStyle='#818cf8';
          ctx.lineWidth=4;
          ctx.strokeRect(x,y,width,height);
          ctx.fillStyle='#818cf8';
          const textWidth=ctx.measureText(prediction.class).width;
          ctx.fillRect(x,y,textWidth+4,parseInt(font,10)+4);
          ctx.fillStyle='#000000';
          ctx.fillText(prediction.class,x,y);
        })
        
      }
      
    
    
  }
  useEffect(() => {
        runDetection();
  },[])
  return (
    <div className="relative h-screen flex justify-center items-center bg-indigo-400">
      <video width={500} height={350} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-dashed " autoPlay ref={videoRef}/>
      <canvas width={500} height={350}  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" ref={canvasRef}/>

    </div>
  );
}

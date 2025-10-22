import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [file,setFile] = useState(null)
  const [figures,setfigures] = useState([])
   const [loading,setLoading] = useState(false)
  const [error,setError] = useState(null)
  const handleUpload=async()=>{
    const formData=new FormData();
    formData.append("file",file)
    try {
      setLoading(true)
      const res=await axios.post('https://task-1-v2su.onrender.com/api/upload_pdf',formData);
       setfigures(res.data)
      
    } catch (error) {
      setError(error)
      
    }finally{
      setLoading(false)
    }
    
   
  }

  return (

    <>
    <div className="p-4">
      <h1>PDF Figure Extractor</h1>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      <div className="mt-4">
        {error && <p className="text-red-500">{error.message}</p>}
        {loading && <p>Loading...</p>}
        {figures.map((fig, idx) => (
          <div key={idx} className="flex items-center flex-col gap-2 mb-6 border p-2 rounded shadow">
            <p><strong>Page:</strong> {fig.page}</p>
            <img src={`https://task-1-v2su.onrender.com${fig.image_url}`} alt={fig.caption} style={{ maxWidth: "400px" }} />
            <p><strong>Caption:</strong> {fig.caption}</p>
            <p><strong>Explanation:</strong> {fig.explanations}</p>
          </div>
        ))}
      </div>
    </div>

      
    </>
  )
}

export default App

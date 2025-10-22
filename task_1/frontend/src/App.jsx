import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [file,setFile] = useState(null)
  const [figures,setfigures] = useState([])
  const handleUpload=async()=>{
    const formData=new FormData();
    formData.append("file",file)

    const res=await axios.post('http://127.0.0.1:5000/api/upload_pdf',formData);

    console.log(res.data);
    
    setfigures(res.data)
  }

  return (

    <>
    <div className="p-4">
      <h1>PDF Figure Extractor</h1>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      <div className="mt-4">
        {figures.map((fig, idx) => (
          <div key={idx} className="flex items-center flex-col gap-2 mb-6 border p-2 rounded shadow">
            <p><strong>Page:</strong> {fig.page}</p>
            <img src={`http://127.0.0.1:5000${fig.image_url}`} alt={fig.caption} style={{ maxWidth: "400px" }} />
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

import React, { useState } from 'react';
import axios from 'axios';
import './CreateJSON.css';

function CreateJSON() {

  const [dirPath, setDirPath] = useState('');
  const [outputName, setOutputName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseval,setResponseval] = useState('');
  const [buttonVal,setButtonVal] = useState('Submit');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setButtonVal('Submitting...');
    try {
      const response = await axios.get(`/api/scanDir`, {
        params: {
          dirPath: dirPath,
          outputName: outputName
        }
      })
      .then((res)=>{
        setButtonVal('Submit');
        console.log(res.data.message);
        setResponseval(res.data.message);
      })
      
     
    } catch (error) {
      console.error(error);
      setResponseval(error.message)
    } finally {
      setIsSubmitting(false);
      setButtonVal('Submit');
    }
  }

  return (
    <div className="container">
      <div className="form-container">
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-label">
            Directory Path:
            <input className="form-input" type="text" value={dirPath} onChange={(e) => setDirPath(e.target.value)} />
          </label>
          <label className="form-label">
            Output Name:
            <input className="form-input" type="text" value={outputName} onChange={(e) => setOutputName(e.target.value)} />
          </label>
          <button className="form-button" type="submit" disabled={isSubmitting}>{buttonVal}</button>
        </form>
        <label className="form-label">
          {responseval}
        </label>
      </div>
    </div>
  );
}

export default CreateJSON;

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {

  const [dirPath, setDirPath] = useState('');
  const [outputName, setOutputName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for form submission
  const [responseval,setResponseval] = useState('');
  const [buttonVal,setButtonVal] = useState('Submit');
  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set isSubmitting to true when form is submitted
    setButtonVal('Submitting...');
    try {
      // Make API call with query parameters
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
      setIsSubmitting(false); // Set isSubmitting back to false when API call is completed
      setButtonVal('Submit');
    }
  }

  return (
    <div className="App">
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
          <button className="form-button" type="submit" disabled={isSubmitting}>{buttonVal}</button> {/* Disable button when form is submitting */}
        </form>
        <label className="form-label">
          {responseval}
          </label>
      </div>
    </div>
  );
}

export default App;

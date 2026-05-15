import { useState } from 'react'
import './App.css'
import api from './api/api';


function App() {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await api.get("/fields");
        setFields(res.data.fields);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    fetchFields();
  }, []);

  return (
    <div>
      <h1>Fields</h1>
      {fields.map((field) => (
        <div key={field._id}>
          {field.Name} - {field.fieldStatus}
        </div>
      ))}
    </div>
  );
}

export default App;
import { useState } from 'react'
import './App.css'
import { useMutation } from 'react-query';

const fetchExample = async (count: number) => {
  const res = await fetch(`/api/serverless-example`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ count }),
  });
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  console.log(data.count);
  return data.count; 
};

function App() {
  const [count, setCount] = useState(0)
  const mutation = useMutation(fetchExample, {
    onSuccess: (data) => {
      setCount(data);
    },
  });

  const handleClick = () => {
    mutation.mutate(count);
  };

  return (
    <>
      
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleClick}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

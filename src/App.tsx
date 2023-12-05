import { useState } from 'react'
import { useQuery } from 'react-query';
import TranscriptTool from './components/TranscriptTool';

const fetchTranscript = async (videoUrl: string) => {
  const res = await fetch(`/api/serverless-example`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoUrl }),
  });
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  console.log(data.transcript);
  return data.transcript; 
};

function App() {
  const [inputValue, setInputValue] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const { data: transcript, isLoading } = useQuery(['transcript', videoUrl], () => fetchTranscript(videoUrl), {
    enabled: !!videoUrl,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });


  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSaveClick = () => {
    setVideoUrl(inputValue);
  };

  return (
    <div className="h-screen px-4 flex flex-col justify-center items-center ">
      <h1 className="text-2xl font-bold mb-4 text-center">YouTube Summarizer</h1>
      <div className="w-full max-w-md flex items-center">
        <input
          type="text"
          placeholder="Enter YouTube video URL"
          className={`flex-1 p-2 mr-2 rounded-md border`}
          value={inputValue}
          onChange={handleInputChange}
        />
        {isLoading ? <LoadingSpinner /> : <SaveButton onClick={handleSaveClick} />}
      </div>
      <div className="w-full max-w-xl h-5/6 p-6 flex flex-col bg-white rounded-lg shadow-lg">
        <TranscriptTool transcript={transcript} isLoading={isLoading} />
      </div>
    </div >
  );
}

export default App;

const LoadingSpinner = () => (
  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-gray-500 to-white-500 animate-spin">
    <div className="h-4 w-4 rounded-full bg-gray-200"></div>
  </div>
);

const SaveButton = ({ onClick }) => (
  <button
    className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    onClick={onClick}
  >
    Save
  </button>
);
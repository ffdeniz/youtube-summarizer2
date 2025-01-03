import { useState } from 'react'
import { useQuery } from 'react-query';
import TranscriptTool from './components/TranscriptTool';

const getYouTubeTranscript = async (videoUrl: string) => {
  console.log("Frontend: Attempting to get YouTube transcript directly");
  const res = await fetch(`/api/transcribe-youtube`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoUrl }),
  });

  if (!res.ok) {
    throw new Error('YouTube transcript unavailable');
  }

  const data = await res.json();
  return data.transcript;
};

const getAudioTranscript = async (videoUrl: string) => {
  console.log("Frontend: Falling back to audio download and transcription");
  const res = await fetch(`/api/audiotranscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoUrl, transcribe: true }),
  });

  if (!res.ok) {
    throw new Error('Audio transcription failed');
  }

  const data = await res.json();
  return data.transcript;
};

const getSummary = async (transcript: string) => {
  console.log("Frontend: Getting summary of transcript");
  const res = await fetch(`/api/summarize-transcript`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });

  if (!res.ok) {
    throw new Error('Summary generation failed');
  }

  const data = await res.json();
  return data.summary;
};

const processVideo = async (videoUrl: string) => {
  console.log("Frontend: Starting video processing");
  try {
    // First attempt: Try to get YouTube transcript directly
    const transcript = await getYouTubeTranscript(videoUrl).catch(async (error) => {
      console.log("Frontend: YouTube transcript failed, falling back to audio method", error);
      return await getAudioTranscript(videoUrl);
    });

    if (!transcript) {
      throw new Error('Failed to get transcript through all available methods');
    }

    // Get summary of the transcript
    const summary = await getSummary(transcript);
    if (!summary) {
      throw new Error('Failed to generate summary');
    }
    
    return summary;

  } catch (error) {
    console.error("Frontend: Error in video processing:", error);
    // Rethrow with more user-friendly message
    throw new Error(`Failed to process video: ${error instanceof Error ? error.message : String(error)}`);
  }
};

function App() {
  const [inputValue, setInputValue] = useState('https://www.youtube.com/watch?v=_lzBTBn9kG0');
  const [videoUrl, setVideoUrl] = useState('');

  const { data: summary, isLoading } = useQuery(
    ['summary', videoUrl],
    () => processVideo(videoUrl),
    {
      enabled: !!videoUrl,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSaveClick = () => {
    console.log("Frontend: Save button clicked with URL:", inputValue);
    setVideoUrl(inputValue);
  };

  return (
    <div className="h-screen px-4 flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-4 text-center">YouTube Summarizer</h1>
      <div className="w-full max-w-md flex items-center">
        <input
          type="text"
          placeholder="Enter YouTube video URL"
          className={`flex-1 p-2 mr-2 rounded-md border`}
          value={inputValue}
          onChange={handleInputChange}
        />
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <SaveButton onClick={handleSaveClick} />
        )}
      </div>
      <div className="w-full max-w-xl h-5/6 p-6 flex flex-col bg-white rounded-lg shadow-lg">
        <TranscriptTool transcript={summary} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default App;

const LoadingSpinner = () => (
  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-gray-500 to-white-500 animate-spin">
    <div className="h-4 w-4 rounded-full bg-gray-200"></div>
  </div>
);

const SaveButton = ({ onClick }: { onClick: () => void }) => (
  <button
    className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    onClick={onClick}
  >
    Save
  </button>
);
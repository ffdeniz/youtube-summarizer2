import { useState } from 'react'
import { useQuery } from 'react-query';
import ContentDisplay from './components/ContentDisplay';

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

function App() {
  const [inputValue, setInputValue] = useState('https://www.youtube.com/watch?v=_lzBTBn9kG0');
  const [videoUrl, setVideoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('transcript');

  const { data: processedData, isLoading } = useQuery(
    ['video', videoUrl],
    async () => {
      const transcript = await getYouTubeTranscript(videoUrl).catch(async (error) => {
        console.log("Frontend: YouTube transcript failed, falling back to audio method", error);
        return await getAudioTranscript(videoUrl);
      });

      if (!transcript) {
        throw new Error('Failed to get transcript through all available methods');
      }

      const summary = await getSummary(transcript);
      return { transcript, summary };
    },
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
    <div className="min-h-screen bg-[#F8F8F8] p-4">
      <div className="max-w-lg mx-auto">
        {/* <h1 className="text-2xl font-bold text-center mb-8">YouTube Video Summarizer</h1> */}
        
        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Enter YouTube URL"
            className="w-full p-3 rounded-md border border-gray-300"
            value={inputValue}
            onChange={handleInputChange}
          />
          <button
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-md"
            onClick={handleSaveClick}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Summarize'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 px-4 py-3 text-center ${
                activeTab === 'transcript' 
                  ? 'bg-white font-medium' 
                  : 'bg-gray-50 text-gray-500'
              }`}
              onClick={() => setActiveTab('transcript')}
            >
              Transcription
            </button>
            <button
              className={`flex-1 px-4 py-3 text-center ${
                activeTab === 'summary' 
                  ? 'bg-white font-medium' 
                  : 'bg-gray-50 text-gray-500'
              }`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
          </div>

          <ContentDisplay
            content={activeTab === 'transcript' ? processedData?.transcript || '' : processedData?.summary || ''}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
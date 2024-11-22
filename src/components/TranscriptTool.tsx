import ReactMarkdown from 'react-markdown';

interface TranscriptToolProps {
  transcript: string;
  isLoading: boolean;
}

const TranscriptTool: React.FC<TranscriptToolProps> = ({ transcript, isLoading }) => {

return (
    <div className="h-full w-full flex flex-col">
      
      <div className="space-y-4 mb-4 overflow-auto flex flex-col">
        {isLoading ? (
          <p>Loading transcript...</p>
        ) : transcript ? (
          <div className="w-full p-4  bg-gray-100 rounded-md"
            style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
             <ReactMarkdown>{transcript}</ReactMarkdown>
          </div>
        ) : (
          <p>Please enter a YouTube video URL to get started.</p>
        )}
      </div>
      <h2 className="text-right">DenizAI</h2>
    </div>
  );
};

export default TranscriptTool;
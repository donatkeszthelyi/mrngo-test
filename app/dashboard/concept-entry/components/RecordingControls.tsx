import React from 'react';

type Props = {
  permission: boolean;
  recordingStatus: string;
  getMicrophonePermission: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  audio: string;
};

const RecordingControls: React.FC<Props> = ({
  permission,
  recordingStatus,
  getMicrophonePermission,
  startRecording,
  stopRecording,
  audio,
}) => {
  return (
    <div className="text-center">
      <main className="main-container">
        <div className="voice-recorder">
          <section className="recorder-section">
            {permission ? (
              <button
                onClick={
                  recordingStatus === 'inactive'
                    ? startRecording
                    : stopRecording
                }
                className="start-button"
              >
                {recordingStatus === 'inactive'
                  ? 'Start recording'
                  : 'Stop recording'}
              </button>
            ) : (
              <button onClick={getMicrophonePermission} type="button">
                Get Microphone
              </button>
            )}
          </section>
          {audio ? (
            <section className="audio-playback">
              <audio
                src={audio}
                controls
                preload="auto"
                className="audio-playback m-auto"
              ></audio>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default RecordingControls;

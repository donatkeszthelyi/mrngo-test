'use client';

import React from 'react';
import useConcepts from '../../hooks/useConcepts';
import ConceptAnswerForm from '../../components/ConceptsAnswerForm';
import RecordingControls from '../../components/RecordingControls';

const Home = () => {
  const {
    currentConcept,
    inputFields,
    handleInputChange,
    handleSave,
    isLoading,
    permission,
    getMicrophonePermission,
    recordingStatus,
    startRecording,
    stopRecording,
    audio,
  } = useConcepts();

  return (
    <div>
      {isLoading ? (
        <div></div>
      ) : currentConcept ? (
        <>
          <ConceptAnswerForm
            inputFields={inputFields}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            currentConcept={currentConcept}
          />
          <RecordingControls
            permission={permission}
            recordingStatus={recordingStatus}
            getMicrophonePermission={getMicrophonePermission}
            startRecording={startRecording}
            stopRecording={stopRecording}
            audio={audio}
          />
        </>
      ) : (
        <div>No concepts available to answer.</div>
      )}
    </div>
  );
};

export default Home;

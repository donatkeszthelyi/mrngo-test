import React from 'react';

type Props = {
  inputFields: string[];
  handleInputChange: (index: number, value: string) => void;
  handleSave: (event: React.MouseEvent<HTMLButtonElement>) => void;
  currentConcept: { concept_name: string } | null;
};

const ConceptAnswerForm: React.FC<Props> = ({
  inputFields,
  handleInputChange,
  handleSave,
  currentConcept,
}) => {
  return (
    <div className="answer-container text-center">
      <h2 className="concept-heading">
        Concept:{' '}
        {currentConcept ? currentConcept.concept_name : 'No concept available'}
      </h2>
      <div className="max-w-screen-sm mx-auto grid grid-cols-2 gap-8 px-4">
        {inputFields.map((value, index) => (
          <input
            key={index}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(index, e.target.value)}
            placeholder={`Enter a feature`}
            className="text-xl py-4 px-6 mb-4 rounded-xl bg-white shadow font-bold font-heading text-black w-full"
          />
        ))}
      </div>
      <button type="button" onClick={handleSave} className="save-button mt-4">
        Save Answer
      </button>
    </div>
  );
};

export default ConceptAnswerForm;

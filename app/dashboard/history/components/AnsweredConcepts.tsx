// AnsweredConcept.tsx
import React from 'react';

type Props = {
  concept: Concept;
  toggleVisibility: (concept_id: string) => void;
};

type Concept = {
  concept_id: string;
  concept_name: string;
  user_answer: string;
  answer_timestamp: number;
  answer_time: string;
  visible: boolean;
};

const AnsweredConcept: React.FC<Props> = ({ concept, toggleVisibility }) => {
  return (
    <div key={concept.concept_id}>
      <p
        className={`text-2xl p-5 h-10 inline-flex rounded-full m-auto hover:cursor-pointer justify-center items-center font-bold text-center ${
          concept.visible
            ? 'bg-cyan-200 text-black'
            : 'bg-cyan-700 hover:bg-cyan-400'
        }`}
        onClick={() => toggleVisibility(concept.concept_id)}
      >
        {concept.concept_name}
      </p>
      {concept.visible && (
        <>
          <div className="hidden md:block w-80 h-2"></div>
          <div className="rounded-2xl m-auto bg-cyan-950 w-fit min-h-32 px-10">
            <div className="hidden md:block w-80 h-1"></div>
            <p className="font-extralight">Sent in at {concept.answer_time}</p>
            <div className="hidden md:block w-80 h-2"></div>
            <p className="m-auto max-w-3xl inline-flex text-xl py-4 px-6 rounded-3xl bg-white border border-cyan-400 shadow font-bold font-heading text-black">
              {concept.user_answer !== ''
                ? concept.user_answer
                : '//no answer//'}
            </p>
            <div className="hidden md:block w-80 h-5"></div>
          </div>
        </>
      )}
      <div className="hidden md:block w-80 h-4"></div>
    </div>
  );
};

export default AnsweredConcept;

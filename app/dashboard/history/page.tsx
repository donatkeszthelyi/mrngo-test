'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getDatabase, ref, get } from 'firebase/database';
import { initializeApp } from '@firebase/app';
import { firebaseConfig } from '../../api/firebase';
import AnsweredConcept from '../../components/AnsweredConcepts';

type Concept = {
  concept_id: string;
  concept_name: string;
  user_answer: string;
  answer_timestamp: number;
  answer_time: string;
  visible: boolean;
};

const HistoryPage = () => {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || '';

  const [answeredConcepts, setAnsweredConcepts] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const fetchConcepts = async () => {
      setIsLoading(true);
      try {
        const conceptsRef = ref(db, 'database/categories');
        const conceptsSnapshot = await get(conceptsRef);
        const data = conceptsSnapshot.val();
        const allConcepts: Concept[] = [];

        for (const categoryId in data) {
          const category = data[categoryId];
          for (const conceptId in category.concepts) {
            allConcepts.push({
              concept_id: conceptId,
              concept_name: category.concepts[conceptId].concept_name,
              user_answer: '',
              answer_timestamp: 0,
              answer_time: '',
              visible: false,
            });
          }
        }

        const answered: Concept[] = [];
        const answeredPromises = allConcepts.map((concept) => {
          return new Promise<void>(async (resolve) => {
            const answersRef = ref(
              db,
              `database/categories/${concept.concept_id.slice(0, 6)}/concepts/${
                concept.concept_id
              }/answers`
            );

            const answersSnapshot = await get(answersRef);
            const answers = answersSnapshot.val();

            if (answers) {
              for (const answerId in answers) {
                if (answers[answerId].answer_username === username) {
                  answered.push({
                    ...concept,
                    user_answer: answers[answerId].answer_content,
                    answer_timestamp: answers[answerId].time_in_secs,
                    answer_time: answers[answerId].time_of_save,
                  });
                  break;
                }
              }
            }

            resolve();
          });
        });

        await Promise.all(answeredPromises);
        answered.sort((a, b) => b.answer_timestamp - a.answer_timestamp);
        setAnsweredConcepts(answered);
      } catch (error) {
        console.error('Error fetching concepts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcepts();
  }, [db, username]);

  const toggleAnswerVisibility = (concept_id: string) => {
    setAnsweredConcepts((concepts) =>
      concepts.map((concept) =>
        concept.concept_id === concept_id
          ? { ...concept, visible: !concept.visible }
          : concept
      )
    );
  };

  const handleExpandAll = () => {
    setAnsweredConcepts((concepts) =>
      concepts.map((concept) => ({ ...concept, visible: true }))
    );
  };

  const handleCollapseAll = () => {
    setAnsweredConcepts((concepts) =>
      concepts.map((concept) => ({ ...concept, visible: false }))
    );
  };

  return (
    <>
      <div className="relative text-center">
        <div className="hidden md:block w-80 h-10"></div>
        <h1 className="text-center text-5xl lg:text-5xl font-bold font-heading mb-6 max-w-4xl mx-auto">
          Your Answers
        </h1>
        <div className="hidden md:block w-80 h-2"></div>
        <div className="flex justify-center space-x-4 mb-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-2xl font-semibold"
            onClick={handleExpandAll}
          >
            Expand All
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-2xl font-semibold"
            onClick={handleCollapseAll}
          >
            Collapse All
          </button>
        </div>
        <div className="hidden md:block w-80 h-5"></div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {answeredConcepts.length === 0 ? (
              <p>No answers found.</p>
            ) : (
              answeredConcepts.map((concept) => (
                <AnsweredConcept
                  key={concept.concept_id}
                  concept={concept}
                  toggleVisibility={toggleAnswerVisibility}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryPage;
export type { Concept };

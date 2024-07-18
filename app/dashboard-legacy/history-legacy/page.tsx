'use client'; // This indicates that the component is intended to be used on the client side.

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getDatabase, ref, get } from 'firebase/database';
import { initializeApp } from '@firebase/app';
import { firebaseConfig } from '../../api/firebase'; // Adjust the path as necessary to match your project structure.

type Concept = {
  concept_id: string;
  concept_name: string;
  user_answer: string;
  answer_timestamp: number;
  answer_time: string;
};

const HistoryPage = () => {
  // Initialize the Firebase app with the given configuration.
  const app = initializeApp(firebaseConfig);
  // Get a reference to the Firebase database.
  const db = getDatabase(app);

  // Use the Next.js hook to get query parameters from the URL.
  const searchParams = useSearchParams();
  // Extract the 'username' parameter from the URL, default to an empty string if not present.
  const username = searchParams.get('username') || '';

  // State to hold the list of concepts that have been answered by the user.
  const [answeredConcepts, setAnsweredConcepts] = useState<Concept[]>([]);
  // State to manage loading status.
  const [isLoading, setIsLoading] = useState(true);
  // State to manage the visibility of answers.
  type VisibleAnswersState = {
    [concept_id: string]: boolean;
  };

  type ButtonColorState = {
    [concept_id: string]: boolean;
  };

  const [visibleAnswers, setVisibleAnswers] = useState<VisibleAnswersState>({});
  const [buttonColor, setButtonColor] = useState<ButtonColorState>({});

  useEffect(() => {
    // If no username is provided, skip fetching concepts.
    if (!username) return;

    // Function to fetch concepts from the database.
    const fetchConcepts = async () => {
      setIsLoading(true); // Set loading to true when starting the fetch
      try {
        // Reference to the 'categories' node in the Firebase database.
        const conceptsRef = ref(db, 'database/categories');
        // Get a snapshot of the data at the 'categories' node.
        const conceptsSnapshot = await get(conceptsRef);
        console.log(
          `Concepts for user "${username}" were fetched successfully.`
        );
        const data = conceptsSnapshot.val();
        const allConcepts: Concept[] = [];

        // Loop through each category to collect all concepts.
        for (const categoryId in data) {
          const category = data[categoryId];
          for (const conceptId in category.concepts) {
            // Add each concept to the list with an initial answer count of 0.
            allConcepts.push({
              concept_id: conceptId,
              concept_name: category.concepts[conceptId].concept_name,
              user_answer: '',
              answer_timestamp: 0,
              answer_time: '',
            });
          }
        }

        const answered: Concept[] = [];
        // Create an array of promises to check if each concept has been answered by the user.
        const answeredPromises = allConcepts.map((concept) => {
          return new Promise<void>(async (resolve) => {
            // Reference to the 'answers' node for each concept.
            const answersRef = ref(
              db,
              `database/categories/${concept.concept_id.slice(0, 6)}/concepts/${
                concept.concept_id
              }/answers`
            );

            // Get a snapshot of the answers for the concept.
            const answersSnapshot = await get(answersRef);
            const answers = answersSnapshot.val();

            if (answers) {
              // Check if the user has already answered the concept.
              for (const answerId in answers) {
                if (answers[answerId].answer_username === username) {
                  // Add the answered concept to the list with the user's answer and timestamp.
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

            resolve(); // Resolve the promise to indicate completion.
          });
        });

        // Wait for all promises to complete.
        await Promise.all(answeredPromises);

        // Sort answered concepts based on answer timestamp (newest first).
        answered.sort((a, b) => b.answer_timestamp - a.answer_timestamp);

        // Update the state with the list of answered concepts.
        setAnsweredConcepts(answered);
      } catch (error) {
        console.error('Error fetching concepts:', error);
      } finally {
        setIsLoading(false); // Set loading to false after the fetch is complete
      }
    };

    fetchConcepts(); // Fetch the concepts when the component mounts or when 'db' or 'username' changes.
  }, [db, username]); // Dependencies array for useEffect.

  // Function to toggle the visibility of an answer.
  const toggleAnswerVisibility = (concept_id: string) => {
    setVisibleAnswers((prevState) => ({
      ...prevState,
      [concept_id]: !prevState[concept_id],
    }));
    setButtonColor((prevState) => ({
      ...prevState,
      [concept_id]: !prevState[concept_id],
    }));
  };

  const handleExpandAll = () => {
    const expandedState: VisibleAnswersState = {};
    const newButtonColorState: ButtonColorState = {}; // Define new state object for button colors

    answeredConcepts.forEach((concept) => {
      expandedState[concept.concept_id] = true;
      newButtonColorState[concept.concept_id] = true; // Set button color state to true for all concepts
    });

    setVisibleAnswers(expandedState);
    setButtonColor(newButtonColorState); // Update buttonColor state with new state object
  };

  const handleCollapseAll = () => {
    setVisibleAnswers({});
    setButtonColor({}); // Reset buttonColor state
  };

  return (
    <>
      <div className="relative text-center">
        <div className="hidden md:block w-80 h-10"></div>
        <h1 className="text-center text-5xl lg:text-5xl font-bold font-heading mb-6 max-w-4xl mx-auto">
          Your Answers
        </h1>
        <div className="hidden md:block w-80 h-2"></div>
        {/* Expand All and Collapse All buttons */}
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
        {/* Loading or answered concepts */}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {answeredConcepts.length === 0 ? (
              <p>No answers found.</p>
            ) : (
              answeredConcepts.map((concept) => (
                <div key={concept.concept_id}>
                  <p
                    className={`text-2xl p-5 h-10 inline-flex rounded-full m-auto hover:cursor-pointer justify-center items-center font-bold text-center ${
                      buttonColor[concept.concept_id]
                        ? 'bg-cyan-200 text-black'
                        : 'bg-cyan-700 hover:bg-cyan-400'
                    }`}
                    onClick={() => toggleAnswerVisibility(concept.concept_id)}
                  >
                    {concept.concept_name}
                  </p>
                  {visibleAnswers[concept.concept_id] && (
                    <>
                      <div className="hidden md:block w-80 h-2"></div>
                      <div className="rounded-2xl m-auto bg-cyan-950 w-fit min-h-32 px-10">
                        <div className="hidden md:block w-80 h-1"></div>
                        <p className="font-extralight">
                          Sent in at {concept.answer_time}
                        </p>
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
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryPage;

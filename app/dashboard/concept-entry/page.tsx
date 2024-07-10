'use client'; // This indicates that the component is intended to be used on the client side.

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getDatabase, ref, push, update, get } from 'firebase/database';
import { initializeApp } from '@firebase/app';
import { firebaseConfig } from '../../api/firebase'; // Adjust the path as necessary to match your project structure.

type Concept = {
  concept_id: string;
  concept_name: string;
  answer_count: number; // Field to track the number of answers associated with each concept.
};

type Answers = {
  answer_content: string;
  answer_id: string;
  answer_username: string;
};

const ConceptEntry = () => {
  // Initialize the Firebase app with the given configuration.
  const app = initializeApp(firebaseConfig);
  // Get a reference to the Firebase database.
  const db = getDatabase(app);

  // Use the Next.js hook to get query parameters from the URL.
  const searchParams = useSearchParams();
  // Extract the 'username' parameter from the URL, default to an empty string if not present.
  const username = searchParams.get('username') || '';

  // State to hold the list of concepts that have not been answered by the user.
  const [unansweredConcepts, setUnansweredConcepts] = useState<Concept[]>([]);
  // State to hold the currently selected concept to display.
  const [currentConcept, setCurrentConcept] = useState<Concept | null>(null);
  // State to hold the user's input for the answer text.
  const [answerText, setAnswerText] = useState('');
  // State to manage loading status.
  const [isLoading, setIsLoading] = useState(true);

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
              answer_count: category.concepts[conceptId].answer_count,
            });
          }
        }

        const unanswered: Concept[] = [];
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
            let hasAnswered = false;
            let answerCount = 0;

            if (answers) {
              // Calculate the number of answers, subtracting one for the current user.
              answerCount = concept.answer_count;
              for (const answerId in answers) {
                // Check if the user has already answered the concept.
                if (answers[answerId].answer_username === username) {
                  hasAnswered = true;
                  break;
                }
              }
            }

            // If the user hasn't answered this concept, add it to the list of unanswered concepts.
            if (!hasAnswered) {
              unanswered.push({ ...concept, answer_count: answerCount });
            }
            resolve(); // Resolve the promise to indicate completion.
          });
        });

        // Wait for all promises to complete.
        await Promise.all(answeredPromises);

        // Sort the unanswered concepts by the number of answers in ascending order.
        unanswered.sort((a, b) => a.answer_count - b.answer_count);

        // Group concepts by their answer counts.
        const randomizedConcepts = unanswered.reduce((acc, concept) => {
          const count = concept.answer_count;
          if (!acc[count]) acc[count] = [];
          acc[count].push(concept);
          return acc;
        }, {} as Record<number, Concept[]>);

        // Flatten the array and randomize the order of concepts within each answer count group.
        const finalUnanswered = Object.values(randomizedConcepts).flatMap(
          (concepts) => concepts.sort(() => Math.random() - 0.5)
        );

        // Update the state with the final list of unanswered concepts.
        setUnansweredConcepts(finalUnanswered);
        // Select a random concept to display.
        getRandomConcept(finalUnanswered);
        console.log(randomizedConcepts);
      } catch (error) {
        console.error('Error fetching concepts:', error);
      } finally {
        setIsLoading(false); // Set loading to false after the fetch is complete
      }
    };

    fetchConcepts(); // Fetch the concepts when the component mounts or when 'db' or 'username' changes.
  }, [db, username]); // Dependencies array for useEffect.

  // Function to get a random concept from the list of unanswered concepts.
  const getRandomConcept = (concepts: Concept[]) => {
    if (concepts.length > 0) {
      // Get the minimum answer count from the concepts.
      const minAnswerCount = concepts[0].answer_count;
      // Filter concepts to include only those with the minimum answer count.
      const leastAnsweredConcepts = concepts.filter(
        (concept) => concept.answer_count === minAnswerCount
      );
      // Choose a random concept from the least answered concepts.
      const randomIndex = Math.floor(
        Math.random() * leastAnsweredConcepts.length
      );
      const selectedConcept = leastAnsweredConcepts[randomIndex];

      // Update the state with the selected concept and remove it from the list of unanswered concepts.
      setCurrentConcept(selectedConcept);
      setUnansweredConcepts(
        concepts.filter(
          (concept) => concept.concept_id !== selectedConcept.concept_id
        )
      );
    } else {
      // If no concepts are left, set the current concept to null.
      setCurrentConcept(null);
    }
  };

  // Function to handle saving the user's answer to the database.
  const handleSave = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent the default button action.

    if (!currentConcept) {
      alert('Concept not found!');
      return;
    }

    // Reference to the 'answers' node for the current concept.
    const conceptAnswersRef = ref(
      db,
      `database/categories/${currentConcept.concept_id.slice(0, 6)}/concepts/${
        currentConcept.concept_id
      }/answers`
    );

    // Reference to the current concept's node.
    const conceptRef = ref(
      db,
      `database/categories/${currentConcept.concept_id.slice(0, 6)}/concepts/${
        currentConcept.concept_id
      }`
    );

    // Create a new answer reference.
    const newAnswerRef = push(conceptAnswersRef);

    // Data structure for the new answer.
    const newAnswerData = {
      answer_id: newAnswerRef.key,
      answer_content: answerText,
      answer_username: username,
    };

    try {
      // Save the new answer to the database.
      await update(newAnswerRef, newAnswerData);
      console.log(
        `Answer "${answerText}" for concept "${currentConcept.concept_id}" was saved for user "${username}".`
      );
      // Clear the answer text input.
      setAnswerText('');
      // Get a new random concept after saving the answer.
      getRandomConcept(
        unansweredConcepts.filter(
          (concept) => concept.concept_id !== currentConcept.concept_id
        )
      );
    } catch (error) {
      console.error('Error updating database: ', error);
      alert('Failed to add answer.');
    }

    // Get the current concept's data from the database.
    const conceptSnapshot = await get(conceptRef);
    const concept = conceptSnapshot.val();
    // If the concept exists and the answer count is defined, increment the answer count.
    if (concept && concept.answer_count !== undefined && answerText !== '') {
      const updatedAnswerCount = concept.answer_count + 1;
      await update(conceptRef, {
        ...concept,
        answer_count: updatedAnswerCount,
      });
      console.log(
        `Answer count for concept "${currentConcept.concept_id}" was incremented.`
      );
    } else {
      console.log(
        `Answer count for concept "${currentConcept.concept_id}" was NOT incremented.`
      );
    }
  };

  return (
    <>
      <div className="relative text-center">
        {isLoading ? (
          <div className="text-center text-4xl lg:text-4xl font-bold font-heading mb-6 max-w-4xl mx-auto">
            Loading concepts...
          </div>
        ) : currentConcept ? (
          <>
            <div className="hidden md:block w-80 h-10"></div>
            <h1 className="text-center text-5xl lg:text-5xl font-bold font-heading mb-6 max-w-4xl mx-auto">
              Explain the concept below!
            </h1>
            <div className="hidden md:block w-80 h-20"></div>
            <h2 className="text-center text-4xl lg:text-4xl font-bold font-heading mb-6 max-w-4xl mx-auto text-orange-600">
              {currentConcept.concept_id}
            </h2>
            <div className="hidden md:block w-80 h-5"></div>
            <textarea
              placeholder="Enter your answer"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="text-2xl w-1/2 h-80 py-4 px-6 rounded-3xl bg-white border border-orange-800 shadow font-bold font-heading text-black hover:bg-white focus:ring focus:ring-orange-100 transition duration-200"
            />

            <div className="hidden md:block w-80 h-5"></div>
            <button
              type="button"
              onClick={handleSave}
              className="text-2xl w-full sm:w-auto text-center h-20 flex-box items-center justify-center py-4 px-6 rounded-full bg-orange-700 border border-orange-800 shadow font-bold font-heading text-white hover:bg-orange-900 focus:ring focus:ring-orange-200 transition duration-200"
            >
              Save answer
            </button>
          </>
        ) : (
          <>
            <div className="hidden md:block w-80 h-60"></div>
            <h1 className="text-center text-7xl lg:text-7xl font-bold font-heading mb-6 max-w-8xl mx-auto">
              You have answered all the concepts!
            </h1>
            <div className="hidden md:block w-80 h-20"></div>
            <h1 className="text-center text-5xl lg:text-5xl font-bold font-heading mb-6 max-w-6xl mx-auto text-orange-600">
              &#127881; CONGRATULATIONS! &#127881;
            </h1>
          </>
        )}
      </div>
    </>
  );
};

export default ConceptEntry;

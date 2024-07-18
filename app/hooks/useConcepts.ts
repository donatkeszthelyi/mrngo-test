import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getDatabase, ref, update, get } from 'firebase/database';
import { initializeApp } from '@firebase/app';
import { firebaseConfig } from '../api/firebase';
import { getStorage, uploadBytes } from 'firebase/storage';
import { ref2 } from '../utils/firebaseStorageRef';

type Concept = {
  concept_id: string;
  concept_name: string;
  answer_count: number;
};

type Answers = {
  answer_content: string[];
  answer_id: string;
  answer_username: string;
  time_of_save: string;
  time_in_secs: number;
};

const useConcepts = () => {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || '';

  const [unansweredConcepts, setUnansweredConcepts] = useState<Concept[]>([]);
  const [currentConcept, setCurrentConcept] = useState<Concept | null>(null);
  const [inputFields, setInputFields] = useState<string[]>(Array(10).fill(''));
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingStatus, setRecordingStatus] = useState('inactive');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audio, setAudio] = useState<string | any>('');
  const [audioFile, setAudioFile] = useState<Blob>(audio);

  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
              answer_count: category.concepts[conceptId].answer_count,
            });
          }
        }

        const unanswered: Concept[] = [];
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
            let hasAnswered = false;

            if (answers) {
              for (const answerId in answers) {
                if (answers[answerId].answer_username === username) {
                  hasAnswered = true;
                  break;
                }
              }
            }

            if (!hasAnswered) {
              unanswered.push(concept);
            }
            resolve();
          });
        });

        await Promise.all(answeredPromises);
        unanswered.sort((a, b) => a.answer_count - b.answer_count);

        const randomizedConcepts = unanswered.reduce((acc, concept) => {
          const count = concept.answer_count;
          if (!acc[count]) acc[count] = [];
          acc[count].push(concept);
          return acc;
        }, {} as Record<number, Concept[]>);

        const finalUnanswered = Object.values(randomizedConcepts).flatMap(
          (concepts) => concepts.sort(() => Math.random() - 0.5)
        );

        setUnansweredConcepts(finalUnanswered);
        getRandomConcept(finalUnanswered);
      } catch (error) {
        console.error('Error fetching concepts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcepts();
  }, [db, username]);

  const getRandomConcept = (concepts: Concept[]) => {
    if (concepts.length > 0) {
      const minAnswerCount = concepts[0].answer_count;
      const leastAnsweredConcepts = concepts.filter(
        (concept) => concept.answer_count === minAnswerCount
      );
      const randomIndex = Math.floor(
        Math.random() * leastAnsweredConcepts.length
      );
      const selectedConcept = leastAnsweredConcepts[randomIndex];
      setCurrentConcept(selectedConcept);
      setUnansweredConcepts(
        concepts.filter(
          (concept) => concept.concept_id !== selectedConcept.concept_id
        )
      );
    } else {
      setCurrentConcept(null);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputFields = [...inputFields];
    newInputFields[index] = value;
    setInputFields(newInputFields);
  };

  const handleSave = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!currentConcept) {
      alert('Concept not found!');
      return;
    }

    const conceptAnswersRef = ref(
      db,
      `database/categories/${currentConcept.concept_id.slice(0, 6)}/concepts/${
        currentConcept.concept_id
      }/answers/${username}`
    );

    const conceptRef = ref(
      db,
      `database/categories/${currentConcept.concept_id.slice(0, 6)}/concepts/${
        currentConcept.concept_id
      }`
    );

    const newAnswerRef = conceptAnswersRef;
    const timeOfSave = new Date().toLocaleString();
    const timeInSecs = Date.now();

    const concatenatedAnswerContent = inputFields
      .filter((i) => i !== '')
      .join('; ');

    const newAnswerData = {
      answer_id: newAnswerRef.key,
      answer_content: audio ? '//audio response//' : concatenatedAnswerContent,
      answer_username: username,
      time_of_save: timeOfSave,
      time_in_secs: timeInSecs,
    };

    try {
      await update(newAnswerRef, newAnswerData);
      setInputFields(Array(10).fill(''));
      getRandomConcept(
        unansweredConcepts.filter(
          (concept) => concept.concept_id !== currentConcept.concept_id
        )
      );
    } catch (error) {
      console.error('Error updating database: ', error);
      alert('Failed to add answer.');
    }

    const saveAudio = () => {
      const storage = getStorage();
      const storageRef = ref2(
        storage,
        `user-voice-recordings/${username}/${currentConcept.concept_id}.mp3`
      );
      uploadBytes(storageRef, audioFile).then(() => {
        console.log(`Uploaded audio file!`);
      });
    };

    const conceptSnapshot = await get(conceptRef);
    const concept = conceptSnapshot.val();
    if (
      concept &&
      concept.answer_count !== undefined &&
      concatenatedAnswerContent !== ''
    ) {
      const updatedAnswerCount = concept.answer_count + 1;
      await update(conceptRef, {
        ...concept,
        answer_count: updatedAnswerCount,
      });
    } else if (
      concept &&
      concept.answer_count !== undefined &&
      concatenatedAnswerContent === '' &&
      audio
    ) {
      const updatedAnswerCount = concept.answer_count + 1;
      await update(conceptRef, {
        ...concept,
        answer_count: updatedAnswerCount,
      });
      saveAudio();
      setAudio('');
    }
    setPermission(false);
  };

  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.');
    }
  };

  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const stopRecording = () => {
    setRecordingStatus('inactive');
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudio(audioUrl);
        setAudioChunks([]);
        setAudioFile(audioBlob);
      };
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  const startRecording = async () => {
    if (!stream) {
      console.error('Stream not available');
      return;
    }

    setRecordingStatus('recording');

    const media = new MediaRecorder(stream, {
      audioBitsPerSecond: 10000,
    });
    mediaRecorder.current = media;

    let localAudioChunks: Blob[] = [];

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        localAudioChunks.push(event.data);
      }
    };

    mediaRecorder.current.start();
    setAudioChunks(localAudioChunks);

    recordingTimeoutRef.current = setTimeout(() => {
      setRecordingStatus('inactive');
      if (mediaRecorder.current) {
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(localAudioChunks, { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudio(audioUrl);
          setAudioChunks([]);
          setAudioFile(audioBlob);
        };
      }
    }, 30000);
  };

  return {
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
  };
};

export default useConcepts;

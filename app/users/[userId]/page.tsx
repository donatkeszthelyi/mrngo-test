// app/users/[userId]/page.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface UserData {
  id: string;
  name: string;
  email: string;
  // Add other user fields here as needed
}

const UserPage: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data: UserData = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Details</h1>
      <p>Name: {userData.name}</p>
      <p>Email: {userData.email}</p>
      {/* Display other user details as needed */}
    </div>
  );
};

export default UserPage;

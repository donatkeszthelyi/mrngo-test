import { NextApiRequest, NextApiResponse } from 'next';

interface UserData {
  id: string;
  name: string;
  email: string;
  // Add other user fields here as needed
}

const fetchUserDataFromDatabase = async (
  userId: string
): Promise<UserData | null> => {
  // Replace this with your actual data fetching logic
  // Example dummy data
  const users: UserData[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  return users.find((user) => user.id === userId) || null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;

  try {
    if (typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const user = await fetchUserDataFromDatabase(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

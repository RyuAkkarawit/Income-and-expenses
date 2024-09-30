'use client';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ExpenseTracker from '../components/ExpenseTracker'; 
import { SessionProvider } from 'next-auth/react';

const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; 
    if (!session) router.push('/auth/signin'); 
  }, [session, status, router]);

  return (
    <div>
      {session ? <ExpenseTracker /> : <p>Loading...</p>}
    </div>
  );
};

const App = () => {
  return (
    <SessionProvider>
      <Home />
    </SessionProvider>
  );
};

export default App;

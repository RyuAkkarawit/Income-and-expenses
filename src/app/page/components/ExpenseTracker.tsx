import React, { useEffect, useState } from 'react';
import { Button, TextField, List, ListItem, ListItemText, Typography } from '@mui/material';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface Record {
  amount: number;
  date: string;
  type: 'income' | 'expense';
  note: string;
  userId?: string; 
}

const ExpenseTracker: React.FC = () => {
  const { data: session } = useSession();
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [note, setNote] = useState<string>('');
  const [records, setRecords] = useState<Record[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);

  const handleSave = async () => {
    const userId = session?.user?.email; 
    if (!userId) {
      console.error('User is not logged in');
      return;
    }

    const newRecord: Record = { amount, date, type, note, userId };
    try {
      await axios.post('/api/records', newRecord);
      setRecords([...records, newRecord]);
      calculateTotals([...records, newRecord]);
    } catch (error) {
      console.error('Error saving data', error);
    }
  };

  const calculateTotals = (records: Record[]) => {
    const income = records
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + record.amount, 0);
    const expense = records
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0);
    setTotalIncome(income);
    setTotalExpense(expense);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (session && session.user) { 
        try {
          const response = await axios.get(`/api/records?userId=${session.user.email}`);
          setRecords(response.data);
          calculateTotals(response.data);
        } catch (error) {
          console.error('Error fetching data', error);
        }
      }
    };
    fetchData();
  }, [session]);

  return (
    <div>
      <Typography variant="h4">Expense Tracker</Typography>
      <TextField
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <TextField
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Type"
        select
        value={type}
        onChange={(e) => setType(e.target.value as 'income' | 'expense')}
      >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </TextField>
      <TextField
        label="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button onClick={handleSave}>Save</Button>

      <Typography variant="h6">Total Income: {totalIncome}</Typography>
      <Typography variant="h6">Total Expense: {totalExpense}</Typography>

      <List>
        {records.map((record, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={`Amount: ${record.amount}, Type: ${record.type}, Date: ${record.date}`}
              secondary={record.note}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default ExpenseTracker;

import './App.css'
import { useEffect, useState } from 'react';

function App() {
  const [name, setName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16))
  const [description, setDescription] = useState('')
  const [transactions, setTransactions] = useState([])
  const [editing, setEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  useEffect(() => {
    getTransactions().then(setTransactions)
  }, [])
  async function getTransactions() {
    const url = import.meta.env.VITE_APP_API_URL + 'api/transactions'
    const response = await fetch(url)
    return await response.json()
  }

  function addNewTransaction(e) {
    e.preventDefault()
    const url = import.meta.env.VITE_APP_API_URL + 'api/transactions'
    const price = name.split(' ')[0]
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.substring(price.length + 1),
        price,
        date,
        description
      })
    }).then(response => response.json().then(data => {
      setName('')
      setDate(new Date().toISOString().slice(0, 16))
      setDescription('')
      setTransactions([...transactions, data])
      console.log(data);
    }))
  }

  async function deleteTransaction(id) {
    const url = import.meta.env.VITE_APP_API_URL + `api/transactions/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });
    if (response.ok) {
      setTransactions(transactions.filter(transaction => transaction._id !== id));
    }
  }
  function editTransaction(transaction) {
    setEditing(true);
    setCurrentTransaction(transaction);
    setName(transaction.name);
    setDate(transaction.date);
    setDescription(transaction.description);
  }

  function updateTransaction(e) {
    e.preventDefault();
    const url = import.meta.env.VITE_APP_API_URL + `api/transactions/${currentTransaction._id}`;
    const price = name.split(' ')[0];
    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.substring(price.length + 1),
        price,
        date,
        description
      })
    }).then(response => response.json().then(data => {
      setTransactions(transactions.map(transaction =>
        transaction._id === data._id ? data : transaction
      ));
      setEditing(false);
      setCurrentTransaction(null);
      setName('');
      setDate(new Date().toISOString().slice(0, 16));
      setDescription('');
    }));
  }

  let balance = 0
  transactions.forEach(transaction => {
    balance += transaction.price
  })

  balance = balance.toFixed(2)
  const fraction = balance.split('.')[1]
  balance = balance.split('.')[0]

  return (
    <main className=" max-w-3xl mx-auto mt-10">
      {/* Balance */}
      <h1 className='text-4xl font-bold text-center my-5 '>${balance}<span className='text-lg ml-1'>.{fraction}</span></h1>
      {/* Form  */}
      <form onSubmit={editing ? updateTransaction : addNewTransaction} >
        <div className="flex gap-2">
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-transparent border-2 border-gray-600" placeholder="Enter transaction title"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="datetime-local"
            className=" w-full px-4 py-2 rounded-lg bg-transparent border-2 border-gray-600 "
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="my-2">
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-transparent border-2 border-gray-600" placeholder="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button className='w-full font-semibold px-4 py-2 rounded-lg bg-green-600' type="submit">{editing ? 'Update transaction' : 'Add new transaction'}</button>
      </form>
      {/* Form end */}
      {/* Transactions */}
      {
        transactions.length > 0 && transactions.map(transaction => (
          <div className="mt-3 border-gray-500 border-b-2 pb-3" key={transaction._id}>
            <div className="flex gap-2 justify-between">
              <div>
                <div className="text-xl">{transaction.name}</div>
                <div className="text-sm mt-1 text-gray-400">{transaction.description}</div>
              </div>
              <div className='text-right'>
                <div className={(transaction.price < 0 ? 'text-xl font-semibold text-red-500' : 'text-xl font-semibold text-green-500')}>{transaction.price}</div>
                <div className="text-sm mt-1 text-gray-400">{transaction.date}</div>
              </div>
              <button onClick={() => editTransaction(transaction)} className="text-blue-500 mr-2">Edit</button>
              <button onClick={() => deleteTransaction(transaction._id)} className="text-red-500">Delete</button>
            </div>
          </div>
        ))
      }

    </main >
  )
}

export default App

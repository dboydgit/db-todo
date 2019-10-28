import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as db from './db';
import TodoItem from './Components/TodoItem';
import TodoAdd from './Components/TodoAdd'

function App() {

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("")

  useEffect(() => {
    // set initial items from the remote DB - only runs once
    function getData() {
      db.remoteDB.allDocs({ include_docs: true }).then(res => {
        let fetchedItems = [];
        res.rows.map(row => fetchedItems.unshift(row.doc));
        setItems([...fetchedItems]);
      });
    }
    getData();
  }, [])

  // This effect handles changes to the db from other clients
  useEffect(() => {

    const handleRemoteDelete = (id) => {
      let newItems = [...items];
      let delIndex = newItems.findIndex(el => el._id === id);
      if (delIndex === -1) return;
      newItems.splice(delIndex, 1);
      setItems(newItems);
      console.log(`Deleted: ${id}`);
    }

    const handleRemoteUpdate = (doc) => {
      let newItems = [...items];
      let updateIndex = newItems.findIndex(el => el._id === doc._id);
      if (updateIndex !== -1) {
        newItems[updateIndex] = doc;
        setItems(newItems);
        return;
      } else {
        newItems.unshift(doc);
        setItems(newItems);
      }
    }

    let dbSync = db.localDB.sync(db.remoteDB, {
      live: true,
      retry: true,
      include_docs: true,
    }).on('change', (e) => {
      console.log('Database Changed');
      console.log(e);
      let itemChanged = e.change.docs[0];
      if (itemChanged._deleted && e.direction === 'pull') {
        console.log(`Item deleted: ${itemChanged._id}`)
        handleRemoteDelete(itemChanged._id);
      } else if (e.direction === 'pull') {
        // Handle update or insert
        handleRemoteUpdate(itemChanged);
        console.log(`Updataed or Inserted: ${itemChanged._id}`)
      } else {
        console.log('This was a local change');
      }
    }).on('active', () => {
      console.log('sync active')
    }).on('error', () => {
      console.log('Database Error')
    });
    return () => {
      dbSync.cancel();
    };
  }, [items])

  const handleLocalAdd = (e) => {
    // check if event came from keydown but not enter key => do nothing
    if (e.keyCode && e.keyCode !== 13) return;
    let itemToAdd = {
      _id: new Date().toISOString(),
      todo: newItem,
      completed: false,
    }
    db.addItem(itemToAdd)
    setItems([itemToAdd, ...items]);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    })
    setNewItem("");
    e.preventDefault();
  }

  // update items in state when typing
  const handleItemChange = (e) => {
    let newItems = [...items];
    let changeIndex = newItems.findIndex(el => el._id === e.target.id);
    newItems[changeIndex].todo = e.target.value;
    setItems(newItems);
  }

  // send updated items to DB when unfocused
  const handleItemUpdate = (e) => {
    let copyItems = [...items];
    // find updated item
    let updatedIndex = copyItems.findIndex(el => el._id === e.target.id);
    if (updatedIndex === -1) return //item not found
    // check if deleted and process
    if (e.keyCode === 8 && !e.target.value) {
      // delete item from DB
      db.deleteItem(copyItems[updatedIndex]).then(() => {
        // remove from local state
        copyItems.splice(updatedIndex, 1);
        setItems(copyItems);
        return;
      }).catch(err => "Error removing from DB" + err);
    } else {
      db.updateItem(copyItems[updatedIndex]);
    }
    // check if enter and add new blank todo below
    // COME BACK TO THIS WHEN DOING SORTABLE
    // if (e.keyCode === 13) {
    //   let newBlank = {
    //     _id: new Date().toISOString(),
    //     todo: newItem,
    //     completed: false,
    //   }
    //   copyItems.splice(updatedIndex + 1, 0, newBlank);
    //   setItems(copyItems);
    //   db.addItem(newBlank);
    //   return;
    // }
    // update item in DB
  }

  // update newItem state on input change
  const handleNewChange = (e) => {
    setNewItem(e.target.value);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="app-title">DB Todo App</h1>
      </header>
      <section className="todo-items">
        {items.map(item => {
          return <TodoItem
            key={item._id}
            item={item}
            checked={item.completed}
            handleItemUpdate={handleItemUpdate}
            handleLocalAdd={handleLocalAdd}
            handleItemChange={handleItemChange}>
          </TodoItem>
        })}
      </section>
      <TodoAdd
        newItem={newItem}
        handleNewChange={handleNewChange}
        handleLocalAdd={handleLocalAdd}>
      </TodoAdd>
    </div>
  );
}

export default App;

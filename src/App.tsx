import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import './App.css';

const client = generateClient<Schema>();

type Todo = Schema["Todo"]["type"];
type FilterType = 'all' | 'active' | 'completed';

function App() {
  const { signOut, user } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newTodoContent, setNewTodoContent] = useState('');

  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => subscription.unsubscribe();
  }, []);

  async function createTodo() {
    if (!newTodoContent.trim()) return;
    try {
      await client.models.Todo.create({ 
        content: newTodoContent.trim(),
        isDone: false 
      });
      setNewTodoContent('');
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  }

  async function toggleTodo(id: string, currentStatus: boolean) {
    try {
      await client.models.Todo.update({ 
        id, 
        isDone: !currentStatus 
      });
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }

  async function updateTodoContent(id: string) {
    if (!editContent.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await client.models.Todo.update({ 
        id, 
        content: editContent.trim() 
      });
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }

  async function deleteTodo(id: string) {
    try {
      await client.models.Todo.delete({ id });
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }

  function startEditing(todo: Todo) {
    setEditingId(todo.id);
    setEditContent(todo.content || '');
  }

  function cancelEditing() {
    setEditingId(null);
    setEditContent('');
  }

  const filteredTodos = todos.filter(todo => {
    const matchesFilter = filter === 'all' 
      || (filter === 'active' && !todo.isDone)
      || (filter === 'completed' && todo.isDone);
    
    const matchesSearch = !searchQuery.trim() 
      || todo.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const activeCount = todos.filter(t => !t.isDone).length;
  const completedCount = todos.filter(t => t.isDone).length;

  return (
    <div className="app-container">
      <div className="todo-app">
        <header className="app-header">
          <div className="header-content">
            <h1>✨ My Todo App</h1>
            <div className="user-info">
              <span className="user-email">{user?.signInDetails?.loginId || 'User'}</span>
              <button className="sign-out-btn" onClick={signOut}>Sign Out</button>
            </div>
          </div>
        </header>

        <div className="todo-stats">
          <div className="stat-card">
            <span className="stat-number">{todos.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card active">
            <span className="stat-number">{activeCount}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-card completed">
            <span className="stat-number">{completedCount}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="todo-input-section">
          <div className="input-container">
            <input
              type="text"
              className="todo-input"
              placeholder="What needs to be done?"
              value={newTodoContent}
              onChange={(e) => setNewTodoContent(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createTodo()}
            />
            <button 
              className="add-btn"
              onClick={createTodo}
              disabled={!newTodoContent.trim()}
            >
              <span className="plus-icon">+</span>
              Add Todo
            </button>
          </div>
        </div>

        <div className="filter-section">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search todos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="todos-container">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p className="empty-text">
                {searchQuery ? 'No todos match your search' : 'No todos yet. Add one above!'}
              </p>
            </div>
          ) : (
            <ul className="todo-list">
              {filteredTodos.map((todo) => (
                <li 
                  key={todo.id} 
                  className={`todo-item ${todo.isDone ? 'completed' : ''}`}
                >
                  <div className="todo-content-wrapper">
                    <input
                      type="checkbox"
                      className="todo-checkbox"
                      checked={todo.isDone || false}
                      onChange={() => toggleTodo(todo.id, todo.isDone || false)}
                    />
                    {editingId === todo.id ? (
                      <input
                        type="text"
                        className="todo-edit-input"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') updateTodoContent(todo.id);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                        onBlur={() => updateTodoContent(todo.id)}
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="todo-text"
                        onDoubleClick={() => startEditing(todo)}
                      >
                        {todo.content}
                      </span>
                    )}
                  </div>
                  <div className="todo-actions">
                    {editingId !== todo.id && (
                      <>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => startEditing(todo)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteTodo(todo.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {completedCount > 0 && (
          <div className="footer-actions">
            <button
              className="clear-completed-btn"
              onClick={async () => {
                const completedTodos = todos.filter(t => t.isDone);
                await Promise.all(
                  completedTodos.map(todo => client.models.Todo.delete({ id: todo.id }))
                );
              }}
            >
              Clear Completed ({completedCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

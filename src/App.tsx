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
  
  // Diagnostic: Check if todos have isDone field
  useEffect(() => {
    if (todos.length > 0) {
      const firstTodo = todos[0];
      const hasIsDoneField = 'isDone' in firstTodo;
      console.log('Schema check - First todo:', {
        id: firstTodo.id,
        hasIsDoneField,
        isDoneValue: firstTodo.isDone,
        allFields: Object.keys(firstTodo)
      });
      
      if (!hasIsDoneField) {
        console.warn('⚠️ WARNING: isDone field not found in todos. The backend schema may need to be updated.');
        console.warn('Please restart the Amplify sandbox: npx ampx sandbox');
      }
    }
  }, [todos]);

  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => subscription.unsubscribe();
  }, []);

zz  async function createTodo() {
    if (!newTodoContent.trim()) return;
    try {
      // Try to create with isDone field, but handle gracefully if it doesn't exist
      const todoData: any = { 
        content: newTodoContent.trim()
      };
      
      // Check if any existing todo has isDone field to determine if we should include it
      const hasIsDoneField = todos.length === 0 || todos.some(todo => 'isDone' in todo);
      if (hasIsDoneField) {
        todoData.isDone = false;
      }
      
      await client.models.Todo.create(todoData);
      setNewTodoContent('');
    } catch (error: any) {
      console.error('Error creating todo:', error);
      const errorMessage = error?.message || 'Unknown error';
      if (errorMessage.includes('isDone') || errorMessage.includes('isReadOnly') || errorMessage.includes('fields7')) {
        // Retry without isDone field
        try {
          await client.models.Todo.create({ 
            content: newTodoContent.trim()
          });
          setNewTodoContent('');
        } catch (retryError: any) {
          alert(`Failed to create todo: ${retryError?.message || 'Unknown error'}`);
        }
      } else {
        alert(`Failed to create todo: ${errorMessage}`);
      }
    }
  }

  async function toggleTodo(id: string, currentStatus: boolean | null | undefined) {
    try {
      // Check if isDone field exists in the schema by checking if any todo has it
      const hasIsDoneField = todos.some(todo => 'isDone' in todo);
      
      if (!hasIsDoneField) {
        alert('⚠️ Schema Update Required!\n\nThe isDone field is not available yet. Please:\n\n1. Stop the Amplify sandbox (Ctrl+C)\n2. Run: npx ampx sandbox\n3. Wait for deployment to complete\n4. Refresh this page');
        return;
      }
      
      // Ensure we have a proper boolean value - if undefined/null, default to false
      const current = currentStatus === true;
      const newStatus = !current;
      
      console.log('Toggling todo:', { id, current, newStatus });
      
      const result = await client.models.Todo.update({ 
        id, 
        isDone: newStatus 
      });
      
      console.log('Update result:', result);
      
      if (result.errors && result.errors.length > 0) {
        console.error('GraphQL errors:', result.errors);
        const errorMessage = result.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ');
        alert(`Failed to update todo: ${errorMessage}`);
        return;
      }
      
      if (!result.data) {
        console.error('No data returned from update');
        alert('Update completed but no data returned. Please refresh the page.');
      }
    } catch (error: any) {
      console.error('Error updating todo:', error);
      console.error('Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        cause: error?.cause
      });
      
      // Check for the specific schema error
      const errorMessage = error?.message || '';
      const isSchemaError = errorMessage.includes('isReadOnly') || 
                           errorMessage.includes('fields7') || 
                           errorMessage.includes('Cannot destructure');
      
      if (isSchemaError) {
        alert('⚠️ Schema Mismatch Detected!\n\nThe backend schema needs to be updated.\n\nPlease:\n1. Stop the Amplify sandbox (Ctrl+C in the terminal)\n2. Run: npx ampx sandbox\n3. Wait for the deployment to complete\n4. Refresh this page\n\nThis will add the isDone field to your database.');
      } else if (errorMessage.includes('isDone')) {
        alert('The isDone field may not exist in the database yet. Please restart the Amplify sandbox to apply schema changes.');
      } else if (errorMessage) {
        alert(`Failed to update todo: ${errorMessage}`);
      } else {
        alert('Failed to update todo. Please check the browser console for details.');
      }
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
    const isCompleted = todo.isDone === true;
    const matchesFilter = filter === 'all' 
      || (filter === 'active' && !isCompleted)
      || (filter === 'completed' && isCompleted);
    
    const matchesSearch = !searchQuery.trim() 
      || todo.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const activeCount = todos.filter(t => t.isDone !== true).length;
  const completedCount = todos.filter(t => t.isDone === true).length;
  
  // Check if isDone field is available in the schema
  const isDoneFieldAvailable = todos.length === 0 || todos.some(todo => 'isDone' in todo);

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

        {!isDoneFieldAvailable && todos.length > 0 && (
          <div className="schema-warning">
            ⚠️ <strong>Schema Update Required:</strong> The completion feature requires a backend update. 
            Please restart the Amplify sandbox (<code>npx ampx sandbox</code>) and refresh this page.
          </div>
        )}

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
                  className={`todo-item ${todo.isDone === true ? 'completed' : ''}`}
                >
                  <div className="todo-content-wrapper">
                    <input
                      type="checkbox"
                      className="todo-checkbox"
                      checked={todo.isDone === true}
                      disabled={!isDoneFieldAvailable}
                      title={!isDoneFieldAvailable ? 'Schema update required - restart Amplify sandbox' : 'Mark as complete'}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (isDoneFieldAvailable) {
                          toggleTodo(todo.id, todo.isDone);
                        }
                      }}
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
                const completedTodos = todos.filter(t => t.isDone === true);
                try {
                  await Promise.all(
                    completedTodos.map(todo => client.models.Todo.delete({ id: todo.id }))
                  );
                } catch (error) {
                  console.error('Error clearing completed todos:', error);
                  alert('Failed to clear completed todos. Please try again.');
                }
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

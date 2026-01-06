import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import './App.css';

const client = generateClient<Schema>();

type Todo = Schema["Todo"]["type"];
type User = Schema["User"]["type"];
type FilterType = 'all' | 'active' | 'completed';
type PriorityType = 'low' | 'medium' | 'high';

function App() {
  const { signOut, user } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [users, setUsers] = useState<Array<User>>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newTodoContent, setNewTodoContent] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [priority, setPriority] = useState<PriorityType>('medium');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Initialize user and request notification permission
  useEffect(() => {
    const initUser = async () => {
      const userEmail = user?.signInDetails?.loginId || user?.username;
      if (!userEmail) return;

      // Check if user exists
      const existingUsers = await client.models.User.list({
        filter: { email: { eq: userEmail } }
      });

      if (existingUsers.data.length > 0) {
        setCurrentUser(existingUsers.data[0]);
        setNotificationsEnabled(existingUsers.data[0].notificationsEnabled || false);
      } else {
        // Create new user
        const newUser = await client.models.User.create({
          email: userEmail,
          isAdmin: false,
          notificationsEnabled: true,
          createdAt: new Date().toISOString(),
        });
        if (newUser.data) {
          setCurrentUser(newUser.data);
          setNotificationsEnabled(true);
        }
      }
    };

    initUser();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  // Observe todos
  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => subscription.unsubscribe();
  }, []);

  // Observe users (for admin)
  useEffect(() => {
    if (currentUser?.isAdmin) {
      const subscription = client.models.User.observeQuery().subscribe({
        next: (data) => setUsers([...data.items]),
      });
      return () => subscription.unsubscribe();
    }
  }, [currentUser]);

  // Check reminders
  useEffect(() => {
    const checkReminders = setInterval(() => {
      const now = new Date();
      todos.forEach(todo => {
        if (todo.reminderDate && !todo.reminderSent && !todo.isDone) {
          const reminderTime = new Date(todo.reminderDate);
          if (reminderTime <= now) {
            sendReminderNotification(todo);
            markReminderSent(todo.id);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(checkReminders);
  }, [todos, notificationsEnabled]);

  async function sendReminderNotification(todo: Todo) {
    const userEmail = user?.signInDetails?.loginId || user?.username;
    
    // Browser notification
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('📅 Todo Reminder', {
        body: `${todo.content}${todo.dueDate ? `\nDue: ${new Date(todo.dueDate).toLocaleString()}` : ''}`,
        icon: '/vite.svg',
        tag: todo.id,
      });
    }

    // Send email via Lambda (if configured)
    try {
      const response = await fetch('YOUR_LAMBDA_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          todoContent: todo.content,
          dueDate: todo.dueDate,
          reminderDate: todo.reminderDate,
        }),
      });
      console.log('Email reminder sent:', response.ok);
    } catch (error) {
      console.error('Failed to send email reminder:', error);
    }
  }

  async function markReminderSent(todoId: string) {
    try {
      await client.models.Todo.update({
        id: todoId,
        reminderSent: true,
      });
    } catch (error) {
      console.error('Error marking reminder as sent:', error);
    }
  }

  async function createTodo() {
    if (!newTodoContent.trim()) return;
    try {
      const todoData: any = {
        content: newTodoContent.trim(),
        isDone: false,
        createdBy: user?.signInDetails?.loginId || user?.username,
        priority: priority,
      };

      if (dueDate) {
        todoData.dueDate = new Date(dueDate).toISOString();
      }
      if (reminderDate) {
        todoData.reminderDate = new Date(reminderDate).toISOString();
      }

      await client.models.Todo.create(todoData);
      setNewTodoContent('');
      setDueDate('');
      setReminderDate('');
      setPriority('medium');
      setShowDatePicker(false);
    } catch (error) {
      console.error('Error creating todo:', error);
      alert('Failed to create todo. Please try again.');
    }
  }

  async function toggleTodo(id: string, currentStatus: boolean | null | undefined) {
    try {
      const current = currentStatus === true;
      await client.models.Todo.update({
        id,
        isDone: !current,
      });
    } catch (error) {
      console.error('Error toggling todo:', error);
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
        content: editContent.trim(),
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

  async function toggleUserAdmin(userId: string, currentStatus: boolean | null | undefined) {
    try {
      await client.models.User.update({
        id: userId,
        isAdmin: !currentStatus,
      });
    } catch (error) {
      console.error('Error updating user admin status:', error);
    }
  }

  async function deleteUser(userId: string) {
    if (userId === currentUser?.id) {
      alert("You cannot delete yourself!");
      return;
    }
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await client.models.User.delete({ id: userId });
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  }

  async function toggleNotifications() {
    if (currentUser) {
      const newStatus = !notificationsEnabled;
      try {
        await client.models.User.update({
          id: currentUser.id,
          notificationsEnabled: newStatus,
        });
        setNotificationsEnabled(newStatus);

        if (newStatus && 'Notification' in window) {
          Notification.requestPermission();
        }
      } catch (error) {
        console.error('Error updating notification settings:', error);
      }
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
  }).sort((a, b) => {
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPriority = priorityOrder[a.priority as PriorityType] ?? 1;
    const bPriority = priorityOrder[b.priority as PriorityType] ?? 1;
    return aPriority - bPriority;
  });

  const activeCount = todos.filter(t => t.isDone !== true).length;
  const completedCount = todos.filter(t => t.isDone === true).length;
  const isDoneFieldAvailable = todos.length === 0 || todos.some(todo => 'isDone' in todo);

  const getPriorityColor = (priority: string | null | undefined) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="app-container">
      <div className="todo-app">
        <header className="app-header">
          <div className="header-content">
            <h1>✨ My Todo App</h1>
            <div className="user-info">
              <span className="user-email">
                {user?.signInDetails?.loginId || 'User'}
                {currentUser?.isAdmin && <span className="admin-badge">👑 Admin</span>}
              </span>
              <button
                className="notification-btn"
                onClick={toggleNotifications}
                title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
              >
                {notificationsEnabled ? '🔔' : '🔕'}
              </button>
              {currentUser?.isAdmin && (
                <button
                  className="admin-btn"
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                >
                  ⚙️ Admin
                </button>
              )}
              <button className="sign-out-btn" onClick={signOut}>Sign Out</button>
            </div>
          </div>
        </header>

        {showAdminPanel && currentUser?.isAdmin && (
          <div className="admin-panel">
            <h2>👥 Admin Panel - User Management</h2>
            <div className="admin-stats">
              <div className="admin-stat">
                <span className="stat-number">{users.length}</span>
                <span className="stat-label">Total Users</span>
              </div>
              <div className="admin-stat">
                <span className="stat-number">{users.filter(u => u.isAdmin).length}</span>
                <span className="stat-label">Admins</span>
              </div>
              <div className="admin-stat">
                <span className="stat-number">{todos.length}</span>
                <span className="stat-label">Total Todos</span>
              </div>
            </div>
            <div className="users-list">
              {users.map(u => (
                <div key={u.id} className="user-item">
                  <div className="user-details">
                    <span className="user-email-admin">{u.email}</span>
                    <span className={`user-status ${u.isAdmin ? 'admin' : 'regular'}`}>
                      {u.isAdmin ? '👑 Admin' : '👤 User'}
                    </span>
                    <span className="user-notifications">
                      {u.notificationsEnabled ? '🔔 Enabled' : '🔕 Disabled'}
                    </span>
                  </div>
                  <div className="admin-actions">
                    <button
                      className="toggle-admin-btn"
                      onClick={() => toggleUserAdmin(u.id, u.isAdmin)}
                      disabled={u.id === currentUser?.id}
                    >
                      {u.isAdmin ? '⬇️ Remove Admin' : '⬆️ Make Admin'}
                    </button>
                    <button
                      className="delete-user-btn"
                      onClick={() => deleteUser(u.id)}
                      disabled={u.id === currentUser?.id}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              onKeyPress={(e) => e.key === 'Enter' && !showDatePicker && createTodo()}
            />
            <button
              className="date-toggle-btn"
              onClick={() => setShowDatePicker(!showDatePicker)}
              title="Add reminder"
            >
              {showDatePicker ? '📅✓' : '📅'}
            </button>
            <button
              className="add-btn"
              onClick={createTodo}
              disabled={!newTodoContent.trim()}
            >
              <span className="plus-icon">+</span>
              Add Todo
            </button>
          </div>

          {showDatePicker && (
            <div className="date-picker-section">
              <div className="priority-section">
                <label>Priority:</label>
                <div className="priority-buttons">
                  <button
                    className={`priority-btn ${priority === 'low' ? 'active' : ''}`}
                    onClick={() => setPriority('low')}
                  >
                    🟢 Low
                  </button>
                  <button
                    className={`priority-btn ${priority === 'medium' ? 'active' : ''}`}
                    onClick={() => setPriority('medium')}
                  >
                    🟡 Medium
                  </button>
                  <button
                    className={`priority-btn ${priority === 'high' ? 'active' : ''}`}
                    onClick={() => setPriority('high')}
                  >
                    🔴 High
                  </button>
                </div>
              </div>
              <div className="date-input-group">
                <label>📅 Due Date:</label>
                <input
                  type="datetime-local"
                  className="date-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="date-input-group">
                <label>⏰ Reminder:</label>
                <input
                  type="datetime-local"
                  className="date-input"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                />
              </div>
            </div>
          )}
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
                      onChange={() => toggleTodo(todo.id, todo.isDone)}
                    />
                    <div className="todo-text-wrapper">
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
                        <>
                          <div className="todo-text-row">
                            <span
                              className="todo-text"
                              onDoubleClick={() => startEditing(todo)}
                            >
                              {todo.content}
                            </span>
                            {todo.priority && (
                              <span
                                className="priority-badge"
                                style={{ backgroundColor: getPriorityColor(todo.priority) }}
                              >
                                {todo.priority}
                              </span>
                            )}
                          </div>
                          <div className="todo-dates">
                            {todo.dueDate && (
                              <span className="todo-date due-date">
                                📅 Due: {formatDate(todo.dueDate)}
                              </span>
                            )}
                            {todo.reminderDate && (
                              <span className={`todo-date reminder-date ${todo.reminderSent ? 'sent' : ''}`}>
                                {todo.reminderSent ? '✓' : '⏰'} Reminder: {formatDate(todo.reminderDate)}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
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

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type User = {
  id: number
  name: string
  email: string
}

type UserForm = {
  name: string
  email: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const emptyForm: UserForm = { name: '', email: '' }

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const isEditing = Boolean(editingUser)

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => b.id - a.id),
    [users],
  )

  async function fetchUsers() {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/users`)

      if (!response.ok) {
        throw new Error('Unable to load users')
      }

      const data = (await response.json()) as User[]
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    fetch(`${API_URL}/users`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load users')
        }

        return response.json() as Promise<User[]>
      })
      .then((data) => {
        if (isMounted) {
          setUsers(data)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load users')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  function updateForm(field: keyof UserForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingUser(null)
  }

  function startEditing(user: User) {
    setEditingUser(user)
    setForm({
      name: user.name,
      email: user.email,
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = form.name.trim()
    const email = form.email.trim()

    if (!name || !email) {
      setError('Name and email are required')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(
        isEditing ? `${API_URL}/users/${editingUser?.id}` : `${API_URL}/users`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email }),
        },
      )

      if (!response.ok) {
        throw new Error(isEditing ? 'Unable to update user' : 'Unable to add user')
      }

      const savedUser = (await response.json()) as User

      setUsers((currentUsers) => {
        if (isEditing) {
          return currentUsers.map((user) =>
            user.id === savedUser.id ? savedUser : user,
          )
        }

        return [savedUser, ...currentUsers]
      })

      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save user')
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteUser(userId: number) {
    const shouldDelete = window.confirm('Delete this user?')

    if (!shouldDelete) {
      return
    }

    setError('')

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Unable to delete user')
      }

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      )

      if (editingUser?.id === userId) {
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete user')
    }
  }

  return (
    <main className="app-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Docker fullstack app</p>
          <h1>User CRUD</h1>
        </div>
        <a className="docs-link" href={`${API_URL}/api-docs`} target="_blank">
          API Docs
        </a>
      </section>

      <section className="content-grid">
        <form className="user-form" onSubmit={handleSubmit}>
          <div className="section-title">
            <h2>{isEditing ? 'Edit user' : 'Add user'}</h2>
            {isEditing && (
              <button className="ghost-button" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>

          <label>
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              placeholder="Enter name"
            />
          </label>

          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateForm('email', event.target.value)}
              placeholder="Enter email"
            />
          </label>

          {error && <p className="error-message">{error}</p>}

          <button className="primary-button" type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditing ? 'Update user' : 'Create user'}
          </button>
        </form>

        <section className="users-panel">
          <div className="section-title">
            <div>
              <h2>Users</h2>
              <p>{users.length} total records</p>
            </div>
            <button className="ghost-button" type="button" onClick={fetchUsers}>
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="empty-state">Loading users...</div>
          ) : sortedUsers.length === 0 ? (
            <div className="empty-state">No users found</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="small-button"
                            type="button"
                            onClick={() => startEditing(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="danger-button"
                            type="button"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default App

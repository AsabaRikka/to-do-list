import React, { useState, useEffect } from 'react'
import { 
  Sun, 
  Star, 
  Calendar, 
  Home, 
  Plus, 
  CheckCircle2, 
  Circle,
  Menu,
  Search,
  Trash2,
  X,
  Bell,
  Clock,
  ChevronRight,
  ListTodo,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Users
} from 'lucide-react'
import useTodoStore from './store'

function App() {
  const { 
    tasks, lists, isAuthenticated, isAdmin, allUsers, login, register, logout, 
    fetchTasks, fetchLists, fetchAdminData, deleteUser, addTask, addList, deleteList, 
    toggleTask, toggleImportant, deleteTask, updateTask, 
    addSubTask, toggleSubTask, deleteSubTask, loading, error 
  } = useTodoStore()
  
  const [isLoginView, setIsLoginView] = useState(true)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'important', 'planned', or list ID
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [isAddingList, setIsAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')

  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks()
      fetchLists()
      if (isAdmin) fetchAdminData()
    }
  }, [isAuthenticated, isAdmin])

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-ms-blue rounded-xl flex items-center justify-center text-white mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Microsoft To Do</h1>
            <p className="text-gray-500">登录以同步您的任务</p>
          </div>

          <form 
            onSubmit={async (e) => {
              e.preventDefault()
              try {
                if (isLoginView) {
                  await login(email, password)
                } else {
                  await register(email, password)
                  setIsLoginView(true)
                  alert('注册成功，请登录')
                }
              } catch (err) {
                // Error handled by store
              }
            }}
            className="space-y-4"
          >
            {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded border border-red-100">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
              <input 
                required
                type="email" 
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-ms-blue focus:border-transparent outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input 
                required
                type="password" 
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-ms-blue focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-ms-blue text-white py-2 rounded font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? '正在处理...' : (isLoginView ? '登录' : '注册')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setIsLoginView(!isLoginView)
                useTodoStore.setState({ error: null })
              }}
              className="text-sm text-ms-blue hover:underline"
            >
              {isLoginView ? '没有账号？立即注册' : '已有账号？返回登录'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'important') return task.is_important
    if (activeFilter === 'completed') return task.is_completed
    if (activeFilter === 'planned') return task.due_date !== null
    if (activeFilter === 'tasks') return !task.todo_list_id
    if (typeof activeFilter === 'number') return task.todo_list_id === activeFilter
    return true
  }).sort((a, b) => {
    if (activeFilter === 'planned') {
      return new Date(a.due_date) - new Date(b.due_date)
    }
    return 0
  })

  const currentListName = () => {
    if (activeFilter === 'all') return '我的一天'
    if (activeFilter === 'important') return '重要'
    if (activeFilter === 'planned') return '计划内'
    const list = lists.find(l => l.id === activeFilter)
    return list ? list.name : '任务'
  }

  const handleAddTask = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      const listId = typeof activeFilter === 'number' ? activeFilter : null
      addTask(inputValue, listId)
      setInputValue('')
    }
  }

  const handleAddList = (e) => {
    e.preventDefault()
    if (newListTitle.trim()) {
      addList(newListTitle).then(newList => {
        if (newList) {
          setActiveFilter(newList.id)
          setNewListTitle('')
          setIsAddingList(false)
        }
      })
    }
  }

  const importantCount = tasks.filter(t => t.is_important && !t.is_completed).length
  const plannedCount = tasks.filter(t => t.due_date && !t.is_completed).length
  const taskCount = tasks.filter(t => !t.is_completed && !t.todo_list_id).length

  return (
    <div className="flex h-screen w-full bg-white text-gray-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 flex flex-col border-r border-gray-200 shrink-0">
        <div className="p-4 flex items-center gap-3">
          <Menu size={20} className="text-gray-500 cursor-pointer" />
          <span className="font-semibold text-ms-blue">Microsoft To Do</span>
        </div>

        <div className="px-2 py-4 space-y-1 overflow-y-auto flex-1">
          <SidebarItem 
            icon={<Sun size={18} />} 
            label="我的一天" 
            active={activeFilter === 'all' && !showAdminPanel} 
            onClick={() => {
              setActiveFilter('all')
              setShowAdminPanel(false)
            }}
          />
          <SidebarItem 
            icon={<Star size={18} />} 
            label="重要" 
            active={activeFilter === 'important' && !showAdminPanel} 
            count={importantCount > 0 ? importantCount : undefined}
            onClick={() => {
              setActiveFilter('important')
              setShowAdminPanel(false)
            }}
          />
          <SidebarItem 
            icon={<Calendar size={18} />} 
            label="计划内" 
            active={activeFilter === 'planned' && !showAdminPanel} 
            count={plannedCount > 0 ? plannedCount : undefined}
            onClick={() => {
              setActiveFilter('planned')
              setShowAdminPanel(false)
            }}
          />
          <SidebarItem 
            icon={<Home size={18} />} 
            label="任务" 
            active={activeFilter === 'tasks' && !showAdminPanel} 
            count={taskCount > 0 ? taskCount : undefined}
            onClick={() => {
              setActiveFilter('tasks')
              setShowAdminPanel(false)
            }}
          />

          {isAdmin && (
            <>
              <div className="my-4 border-t border-gray-200"></div>
              <SidebarItem 
                icon={<ShieldCheck size={18} className="text-red-500" />} 
                label="用户管理" 
                active={showAdminPanel}
                onClick={() => setShowAdminPanel(true)}
              />
            </>
          )}

          <div className="my-4 border-t border-gray-200"></div>

          {/* Custom Lists */}
          {lists.map(list => (
            <div key={list.id} className="group flex items-center pr-2">
              <SidebarItem 
                icon={<ListTodo size={18} />} 
                label={list.name} 
                active={activeFilter === list.id && !showAdminPanel} 
                onClick={() => {
                  setActiveFilter(list.id)
                  setShowAdminPanel(false)
                }}
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  deleteList(list.id)
                  if (activeFilter === list.id) setActiveFilter('all')
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-300"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded hover:bg-red-50 text-red-500 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>退出登录</span>
          </button>
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          {isAddingList ? (
            <form onSubmit={handleAddList} className="flex items-center gap-2">
              <ListTodo size={20} className="text-ms-blue" />
              <input 
                autoFocus
                type="text"
                placeholder="新列表"
                className="bg-transparent border-none outline-none text-sm flex-1"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onBlur={() => !newListTitle && setIsAddingList(false)}
              />
            </form>
          ) : (
            <button 
              onClick={() => setIsAddingList(true)}
              className="flex items-center gap-2 text-ms-blue hover:bg-gray-100 w-full p-2 rounded transition-colors"
            >
              <Plus size={20} />
              <span className="text-sm">新建列表</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden transition-colors duration-500 bg-opacity-5">
        {showAdminPanel ? (
          <AdminPanel 
            users={allUsers} 
            onDeleteUser={deleteUser} 
            loading={loading}
          />
        ) : (
          <>
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 text-ms-blue">
                  {currentListName()}
                </h1>
                <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
              {typeof activeFilter === 'number' && (
                <button 
                  onClick={() => {
                    deleteList(activeFilter)
                    setActiveFilter('all')
                  }}
                  className="p-2 hover:bg-red-50 rounded text-red-400 flex items-center gap-2 text-sm"
                >
                  <Trash2 size={18} />
                  <span>删除列表</span>
                </button>
              )}
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto px-8 space-y-2">
              {loading && <div className="text-gray-400 py-4">正在加载任务...</div>}
              {error && <div className="text-red-400 py-4">{error}</div>}
              {!loading && filteredTasks.length === 0 && (
                <div className="text-gray-400 py-10 text-center">
                  这里还没有任务，开始添加一个吧！
                </div>
              )}
              {filteredTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`flex items-center gap-3 p-4 bg-white border border-gray-100 rounded shadow-sm hover:bg-gray-50 transition-colors group cursor-pointer ${selectedTaskId === task.id ? 'bg-blue-50/50 border-blue-100' : ''}`}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTask(task.id)
                    }}
                  >
                    {task.is_completed ? (
                      <CheckCircle2 size={20} className="text-ms-blue" />
                    ) : (
                      <Circle size={20} className="text-gray-300 group-hover:text-gray-400" />
                    )}
                  </button>
                  <div className={`flex-1 ${task.is_completed ? 'line-through text-gray-400' : ''}`}>
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {task.subtasks?.length > 0 && (
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <span>
                            {task.subtasks.filter(s => s.is_completed).length} / {task.subtasks.length}
                          </span>
                        </div>
                      )}
                      {task.due_date && (
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{new Date(task.due_date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTask(task.id)
                        if (selectedTaskId === task.id) setSelectedTaskId(null)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleImportant(task.id)
                      }}
                    >
                      <Star 
                        size={18} 
                        className={task.is_important ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-400'} 
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Task Input */}
            <div className="p-8">
              <form 
                onSubmit={handleAddTask}
                className="flex items-center gap-3 p-4 bg-white rounded border border-gray-200 focus-within:border-ms-blue transition-colors shadow-sm"
              >
                <Plus size={20} className="text-ms-blue" />
                <input 
                  type="text" 
                  placeholder="添加任务"
                  className="bg-transparent border-none outline-none flex-1 text-gray-700 placeholder-gray-400"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </form>
            </div>
          </>
        )}
      </div>

      {/* Detail Sidebar */}
      {selectedTask && (
        <DetailPanel 
          task={selectedTask} 
          onClose={() => setSelectedTaskId(null)} 
          updateTask={updateTask}
          deleteTask={deleteTask}
          addSubTask={addSubTask}
          toggleSubTask={toggleSubTask}
          deleteSubTask={deleteSubTask}
        />
      )}
    </div>
  )
}

function DetailPanel({ task, onClose, updateTask, deleteTask, addSubTask, toggleSubTask, deleteSubTask }) {
  const [note, setNote] = useState(task.notes || '')
  const [subTaskInput, setSubTaskInput] = useState('')
  
  // Sync note with task when task changes
  useEffect(() => {
    setNote(task.notes || '')
  }, [task.id, task.notes])

  const handleNoteBlur = () => {
    if (note !== task.notes) {
      updateTask(task.id, { notes: note })
    }
  }

  const handleAddSubTask = (e) => {
    e.preventDefault()
    if (subTaskInput.trim()) {
      addSubTask(task.id, subTaskInput)
      setSubTaskInput('')
    }
  }

  return (
    <div className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
      <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-white">
        <span className="text-sm font-medium text-gray-500">详情</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-500">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Task Title Area */}
        <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex items-start gap-3">
          <button onClick={() => updateTask(task.id, { is_completed: !task.is_completed })}>
            {task.is_completed ? (
              <CheckCircle2 size={22} className="text-ms-blue" />
            ) : (
              <Circle size={22} className="text-gray-300" />
            )}
          </button>
          <input 
            type="text"
            className={`flex-1 font-semibold text-lg bg-transparent border-none outline-none ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
            value={task.title}
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
          />
          <button onClick={() => updateTask(task.id, { is_important: !task.is_important })}>
            <Star 
              size={20} 
              className={task.is_important ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
            />
          </button>
        </div>

        {/* Subtasks */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden p-2 space-y-1">
          {task.subtasks?.map(sub => (
            <div key={sub.id} className="flex items-center gap-3 p-2 group hover:bg-gray-50 rounded">
              <button onClick={() => toggleSubTask(task.id, sub.id)}>
                {sub.is_completed ? (
                  <CheckCircle2 size={16} className="text-ms-blue" />
                ) : (
                  <Circle size={16} className="text-gray-300" />
                )}
              </button>
              <input 
                type="text"
                className={`flex-1 text-sm bg-transparent border-none outline-none ${sub.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}`}
                value={sub.title}
                onChange={(e) => {}} // TODO: implement subtask rename if needed
              />
              <button 
                onClick={() => deleteSubTask(task.id, sub.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-300 hover:text-red-400"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <form onSubmit={handleAddSubTask} className="flex items-center gap-3 p-2">
            <Plus size={16} className="text-ms-blue" />
            <input 
              type="text"
              placeholder="下一步"
              className="flex-1 text-sm bg-transparent border-none outline-none placeholder-ms-blue text-ms-blue"
              value={subTaskInput}
              onChange={(e) => setSubTaskInput(e.target.value)}
            />
          </form>
        </div>

        {/* Detail Options */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <DetailOption icon={<Sun size={18} />} label="添加到“我的一天”" />
        </div>

        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 text-gray-600 text-sm">
            <Bell size={18} />
            <div className="flex-1 flex items-center justify-between">
              <span>提醒我</span>
              <input 
                type="datetime-local" 
                className="bg-transparent border-none outline-none text-xs"
                value={task.reminder_at ? new Date(task.reminder_at).toISOString().slice(0, 16) : ''}
                onChange={(e) => updateTask(task.id, { reminder_at: e.target.value || null })}
              />
            </div>
          </div>
          <div className="h-px bg-gray-100 ml-12"></div>
          <div className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 text-gray-600 text-sm">
            <Calendar size={18} />
            <div className="flex-1 flex items-center justify-between">
              <span>添加截止日期</span>
              <input 
                type="date" 
                className="bg-transparent border-none outline-none text-xs"
                value={task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''}
                onChange={(e) => updateTask(task.id, { due_date: e.target.value || null })}
              />
            </div>
          </div>
          <div className="h-px bg-gray-100 ml-12"></div>
          <DetailOption icon={<Clock size={18} />} label="重复" />
        </div>

        {/* Notes */}
        <div className="bg-white rounded border border-gray-200 shadow-sm p-4">
          <textarea
            placeholder="添加备注"
            className="w-full min-h-[150px] bg-transparent border-none outline-none text-gray-700 resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-white">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded text-gray-500">
          <ChevronRight size={20} />
        </button>
        <span className="text-xs text-gray-400">创建于 {new Date().toLocaleDateString()}</span>
        <button 
          onClick={() => {
            deleteTask(task.id)
            onClose()
          }}
          className="p-2 hover:bg-red-50 rounded text-red-400"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  )
}

function DetailOption({ icon, label }) {
  return (
    <button className="flex items-center gap-4 w-full p-4 hover:bg-gray-50 transition-colors text-gray-600 text-sm">
      {icon}
      <span>{label}</span>
    </button>
  )
}

function AdminPanel({ users, onDeleteUser, loading }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="p-8 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-red-600">
          <ShieldCheck size={28} />
          用户管理 (管理员)
        </h1>
        <p className="text-gray-500 text-sm">查看和管理系统内所有注册用户</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">邮箱</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">注册时间</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">角色</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{user.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-600 rounded">管理员</span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">普通用户</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!user.is_admin && (
                      <button 
                        onClick={() => {
                          if (window.confirm(`确定要删除用户 ${user.email} 吗？`)) {
                            onDeleteUser(user.id)
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <div className="p-10 text-center text-gray-400">暂无用户信息</div>
          )}
          {loading && (
            <div className="p-10 text-center text-gray-400">正在加载...</div>
          )}
        </div>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active = false, count, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${active ? 'bg-blue-50 text-ms-blue' : 'hover:bg-gray-100 text-gray-700'}`}
    >
      <div className={active ? 'text-ms-blue' : 'text-gray-500'}>
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {count !== undefined && <span className="text-xs text-gray-400">{count}</span>}
    </div>
  )
}

export default App

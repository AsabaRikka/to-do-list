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
  Trash2
} from 'lucide-react'
import useTodoStore from './store'

function App() {
  const { tasks, fetchTasks, addTask, toggleTask, toggleImportant, deleteTask, loading, error } = useTodoStore()
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleAddTask = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      addTask(inputValue)
      setInputValue('')
    }
  }

  return (
    <div className="flex h-screen w-full bg-white text-gray-800 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 flex flex-col border-r border-gray-200">
        <div className="p-4 flex items-center gap-3">
          <Menu size={20} className="text-gray-500 cursor-pointer" />
          <span className="font-semibold text-ms-blue">Microsoft To Do</span>
        </div>

        <div className="px-2 py-4 space-y-1">
          <SidebarItem icon={<Sun size={18} />} label="我的一天" active count={3} />
          <SidebarItem icon={<Star size={18} />} label="重要" />
          <SidebarItem icon={<Calendar size={18} />} label="计划内" />
          <SidebarItem icon={<Home size={18} />} label="任务" />
        </div>

        <div className="mt-auto p-4 border-t border-gray-200">
          <button className="flex items-center gap-2 text-ms-blue hover:bg-gray-100 w-full p-2 rounded">
            <Plus size={20} />
            <span>新建列表集</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            我的一天
          </h1>
          <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-8 space-y-2">
          {loading && <div className="text-gray-400 py-4">正在加载任务...</div>}
          {error && <div className="text-red-400 py-4">{error}</div>}
          {!loading && tasks.length === 0 && (
            <div className="text-gray-400 py-10 text-center">
              这里还没有任务，开始添加一个吧！
            </div>
          )}
          {tasks.map(task => (
            <div 
              key={task.id}
              className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded shadow-sm hover:bg-gray-50 transition-colors group"
            >
              <button onClick={() => toggleTask(task.id)}>
                {task.is_completed ? (
                  <CheckCircle2 size={20} className="text-ms-blue" />
                ) : (
                  <Circle size={20} className="text-gray-300 group-hover:text-gray-400" />
                )}
              </button>
              <span className={`flex-1 ${task.is_completed ? 'line-through text-gray-400' : ''}`}>
                {task.title}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all text-red-400"
                >
                  <Trash2 size={16} />
                </button>
                <button onClick={() => toggleImportant(task.id)}>
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
            className="flex items-center gap-3 p-4 bg-gray-50 rounded border border-gray-200 focus-within:border-ms-blue transition-colors"
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
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active = false, count }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${active ? 'bg-blue-50 text-ms-blue' : 'hover:bg-gray-100 text-gray-700'}`}>
      <div className={active ? 'text-ms-blue' : 'text-gray-500'}>
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {count !== undefined && <span className="text-xs text-gray-400">{count}</span>}
    </div>
  )
}

export default App

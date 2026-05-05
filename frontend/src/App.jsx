import { useState, useEffect } from 'react'
import TagView, { assignIds } from './components/TagView'

const API_BASE = 'https://aimonk-six.vercel.app/'

// Default initial tree shown when no saved data yet
const DEFAULT_TREE = assignIds({
  name: 'root',
  children: [
    {
      name: 'child1',
      children: [
        { name: 'child1-child1', data: 'c1-c1 Hello' },
        { name: 'child1-child2', data: 'c1-c2 JS' },
      ],
    },
    { name: 'child2', data: 'c2 World' },
  ],
})

// Recursively strip all keys except name, children, data
function cleanTree(node) {
  const result = { name: node.name }
  if ('data' in node) result.data = node.data
  if ('children' in node) result.children = node.children.map(cleanTree)
  return result
}

export default function App() {
  // savedTrees: array of { id, tree_data } from backend
  const [savedTrees, setSavedTrees] = useState([])
  // localTree: the tree currently being edited (new or loaded)
  const [localTree, setLocalTree] = useState(DEFAULT_TREE)
  const [activeTreeId, setActiveTreeId] = useState(null)
  const [exportStr, setExportStr] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [loading, setLoading] = useState(true)

  // ── On mount: fetch all saved trees ────────────────────────────────
  useEffect(() => {
    fetchTrees()
  }, [])

  const fetchTrees = async () => {
    try {
      const res = await fetch(`${API_BASE}/trees/`)
      if (res.ok) {
        const data = await res.json()
        setSavedTrees(data)
        if (data.length > 0) {
          // Load the most recent tree
          setLocalTree(assignIds(data[0].tree_data))
          setActiveTreeId(data[0].id)
        }
      }
    } catch (err) {
      console.warn('Backend not reachable, working offline.')
    } finally {
      setLoading(false)
    }
  }

  // ── Export + Save ────────────────────────────────────────────────────
  const handleExport = async () => {
    const cleaned = cleanTree(localTree)
    const jsonStr = JSON.stringify(cleaned)
    setExportStr(jsonStr)

    try {
      let res
      if (activeTreeId) {
        // PUT to update existing
        res = await fetch(`${API_BASE}/trees/${activeTreeId}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tree_data: cleaned }),
        })
      } else {
        // POST to create new
        res = await fetch(`${API_BASE}/trees/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tree_data: cleaned }),
        })
      }

      if (res && res.ok) {
        const saved = await res.json()
        setActiveTreeId(saved.id)
        setStatusMsg(`✅ Saved to database (ID: ${saved.id})`)
        fetchTrees()
      } else {
        setStatusMsg('⚠️ Exported locally (backend not available)')
      }
    } catch {
      setStatusMsg('⚠️ Exported locally (backend not reachable)')
    }

    setTimeout(() => setStatusMsg(''), 4000)
  }

  // ── Load a saved tree ─────────────────────────────────────────────
  const loadTree = (saved) => {
    setLocalTree(assignIds(saved.tree_data))
    setActiveTreeId(saved.id)
    setExportStr('')
  }

  // ── New tree ──────────────────────────────────────────────────────
  const newTree = () => {
    setLocalTree(assignIds({ name: 'root', data: 'Data' }))
    setActiveTreeId(null)
    setExportStr('')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-blue-700 text-white px-6 py-4 shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">AIMonk — Nested Tags Tree</h1>
        <p className="text-blue-200 text-sm mt-0.5">Full Stack React + Django Assignment</p>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Saved trees panel */}
        {savedTrees.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-3">
              Saved Trees ({savedTrees.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {savedTrees.map(t => (
                <button
                  key={t.id}
                  onClick={() => loadTree(t)}
                  className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
                    activeTreeId === t.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  #{t.id} — {t.tree_data?.name || 'Tree'}
                </button>
              ))}
              <button
                onClick={newTree}
                className="px-3 py-1.5 rounded text-sm font-medium border border-dashed border-gray-400 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + New Tree
              </button>
            </div>
          </div>
        )}

        {/* Main tree editor */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">
              {activeTreeId ? `Editing Tree #${activeTreeId}` : 'New Tree'}
            </span>
            {savedTrees.length === 0 && (
              <button
                onClick={newTree}
                className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-600"
              >
                + New
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : (
            <div className="p-4">
              <TagView
                node={localTree}
                depth={0}
                onChange={setLocalTree}
              />
            </div>
          )}

          {/* Export button + output */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <button
              onClick={handleExport}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-sm rounded shadow-sm transition-colors"
            >
              Export
            </button>

            {statusMsg && (
              <span className="ml-4 text-sm text-green-700 font-medium">{statusMsg}</span>
            )}

            {exportStr && (
              <div className="mt-3 p-3 bg-white border border-gray-300 rounded text-xs font-mono text-gray-700 break-all whitespace-pre-wrap">
                {exportStr}
              </div>
            )}
          </div>
        </div>

        {/* All saved trees displayed below (as per requirement) */}
        {savedTrees.length > 1 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-700 mb-4">All Saved Trees</h2>
            {savedTrees.map(t => (
              <div key={t.id} className="bg-white rounded-lg shadow mb-4 overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-700">
                    Tree #{t.id} — {t.tree_data?.name}
                  </span>
                  <button
                    onClick={() => loadTree(t)}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Load & Edit
                  </button>
                </div>
                <div className="p-4 pointer-events-none opacity-70">
                  <TagView
                    node={t.tree_data}
                    depth={0}
                    onChange={() => {}}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'

// Generate a stable random ID for each node so React keys stay stable
// when children are added/removed (avoids collapsed-state mixing)
export function assignIds(node) {
  if (!node._id) node._id = Math.random().toString(36).slice(2)
  if (node.children) node.children.forEach(assignIds)
  return node
}

// Depth-based indentation colors for visual hierarchy
const DEPTH_COLORS = [
  'bg-blue-500',
  'bg-blue-400',
  'bg-blue-300',
  'bg-blue-200',
]

function getDepthColor(depth) {
  return DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)]
}

/**
 * TagView - Recursive component that renders a single Tag node.
 *
 * Props:
 *   node     - the tag data object { name, data?, children? }
 *   depth    - current nesting depth (for indentation)
 *   onChange - callback(updatedNode) to notify parent of changes
 */
function TagView({ node, depth = 0, onChange }) {
  const [collapsed, setCollapsed] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(node.name)
  const nameInputRef = useRef(null)

  // Toggle collapse
  const toggleCollapse = () => setCollapsed(prev => !prev)

  // ── Name editing (Bonus) ─────────────────────────────────────────────
  const handleNameClick = () => {
    setEditingName(true)
    setNameInput(node.name)
    setTimeout(() => nameInputRef.current?.focus(), 0)
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      const trimmed = nameInput.trim() || node.name
      setEditingName(false)
      onChange({ ...node, name: trimmed })
    }
    if (e.key === 'Escape') {
      setEditingName(false)
      setNameInput(node.name)
    }
  }

  // ── Data editing ────────────────────────────────────────────────────
  const handleDataChange = (e) => {
    onChange({ ...node, data: e.target.value })
  }

  // ── Add Child ────────────────────────────────────────────────────────
  const handleAddChild = () => {
    const newChild = { _id: Math.random().toString(36).slice(2), name: 'New Child', data: 'Data' }
    // If node currently has data, replace it with children
    if ('data' in node) {
      const { data: _removed, ...rest } = node
      onChange({ ...rest, children: [newChild] })
    } else {
      const existingChildren = node.children || []
      onChange({ ...node, children: [...existingChildren, newChild] })
    }
    // Auto-expand when adding child
    setCollapsed(false)
  }

  // ── Child changed ────────────────────────────────────────────────────
  const handleChildChange = (index, updatedChild) => {
    const newChildren = [...(node.children || [])]
    newChildren[index] = updatedChild
    onChange({ ...node, children: newChildren })
  }

  const indent = depth * 24

  return (
    <div className="w-full" style={{ paddingLeft: `${indent}px` }}>
      {/* Header row */}
      <div className={`flex items-center justify-between px-3 py-2 mb-px ${getDepthColor(depth)} text-white`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="min-w-[28px] h-7 bg-white/20 hover:bg-white/40 text-white text-sm font-bold rounded px-1 transition-colors"
          >
            {collapsed ? '>' : 'v'}
          </button>

          {/* Tag name – click to edit (Bonus) */}
          {editingName ? (
            <input
              ref={nameInputRef}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={() => {
                setEditingName(false)
                setNameInput(node.name)
              }}
              className="flex-1 min-w-0 px-2 py-0.5 rounded text-gray-800 text-sm font-semibold outline-none"
            />
          ) : (
            <span
              onClick={handleNameClick}
              className="font-semibold text-sm cursor-pointer hover:underline select-none truncate"
              title="Click to rename"
            >
              {node.name}
            </span>
          )}
        </div>

        {/* Add Child button */}
        <button
          onClick={handleAddChild}
          className="ml-2 px-3 py-1 text-xs font-semibold bg-white text-blue-600 hover:bg-blue-50 rounded shadow-sm transition-colors whitespace-nowrap"
        >
          Add Child
        </button>
      </div>

      {/* Collapsible content */}
      {!collapsed && (
        <div>
          {/* Data field */}
          {'data' in node && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 mb-px" style={{ marginLeft: 0 }}>
              <span className="text-xs font-semibold text-gray-500 min-w-[36px]">Data</span>
              <input
                type="text"
                value={node.data}
                onChange={handleDataChange}
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
              />
            </div>
          )}

          {/* Children */}
          {'children' in node && node.children.map((child, i) => (
            <TagView
              key={child._id || i}
              node={child}
              depth={depth + 1}
              onChange={(updated) => handleChildChange(i, updated)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TagView

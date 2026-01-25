'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '../components/Navigation'
import { Footer } from '../components/Footer'
import { Button } from '../components/ui/Button'
import {
  FolderIcon,
  FileIcon,
  UploadIcon,
  SearchIcon,
  PlusIcon,
  ShareIcon,
  TagIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  XIcon,
  UsersIcon,
  LockIcon,
  EyeIcon
} from 'lucide-react'

// Types
interface VaultItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  lastModified: Date
  tags: string[]
  permissions: 'private' | 'shared' | 'public'
  thumbnail?: string
  collaborators?: Collaborator[]
}

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  avatar?: string
}

interface Folder {
  id: string
  name: string
  items: VaultItem[]
  path: string[]
}

export default function VaultsPage() {
  const [currentFolder, setCurrentFolder] = useState<Folder>({
    id: 'root',
    name: 'My Vaults',
    path: [],
    items: [
      {
        id: '1',
        name: 'Project Assets',
        type: 'folder',
        lastModified: new Date('2025-12-06'),
        tags: ['work', 'design'],
        permissions: 'shared',
        collaborators: [
          { id: '1', name: 'John Smith', email: 'john@company.com', role: 'editor' },
          { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'viewer' }
        ]
      },
      {
        id: '2',
        name: 'Brand Guidelines.pdf',
        type: 'file',
        size: 2048000,
        lastModified: new Date('2025-12-05'),
        tags: ['brand', 'guidelines', 'marketing'],
        permissions: 'public',
        thumbnail: '/api/placeholder/150/200'
      },
      {
        id: '3',
        name: 'Social Media Templates',
        type: 'folder',
        lastModified: new Date('2025-12-04'),
        tags: ['marketing', 'templates'],
        permissions: 'private'
      }
    ]
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [draggedOver, setDraggedOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Analytics tracking
  const trackEvent = useCallback((event: string, data: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, data)
    }
    console.log('Analytics:', event, data)
  }, [])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDraggedOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDraggedOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDraggedOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [])

  const handleFileUpload = useCallback((files: File[]) => {
    files.forEach(file => {
      trackEvent('file_upload_started', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      // Simulate upload
      const newItem: VaultItem = {
        id: Date.now().toString(),
        name: file.name,
        type: 'file',
        size: file.size,
        lastModified: new Date(),
        tags: [],
        permissions: 'private',
        thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }

      setCurrentFolder(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }))

      trackEvent('file_uploaded', {
        fileId: newItem.id,
        fileName: file.name,
        vaultId: currentFolder.id
      })
    })
  }, [currentFolder.id, trackEvent])

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(Array.from(files))
    }
  }, [handleFileUpload])

  const handleCreateVault = useCallback(() => {
    const vaultName = prompt('Enter vault name:')
    if (vaultName) {
      const newVault: VaultItem = {
        id: Date.now().toString(),
        name: vaultName,
        type: 'folder',
        lastModified: new Date(),
        tags: [],
        permissions: 'private'
      }

      setCurrentFolder(prev => ({
        ...prev,
        items: [...prev.items, newVault]
      }))

      trackEvent('vault_created', {
        vaultId: newVault.id,
        vaultName: newVault.name
      })
    }
  }, [trackEvent])

  const handleShareVault = useCallback(() => {
    const email = prompt('Enter email to share with:')
    if (email && selectedItems.length > 0) {
      selectedItems.forEach(itemId => {
        const item = currentFolder.items.find(item => item.id === itemId)
        if (item) {
          trackEvent('collaboration_invite_sent', {
            itemId,
            itemName: item.name,
            recipientEmail: email
          })
        }
      })
    }
  }, [selectedItems, currentFolder.items, trackEvent])

  const handleItemSelect = useCallback((itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }, [])

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'private': return <LockIcon className="w-4 h-4 text-text-secondary" />
      case 'shared': return <UsersIcon className="w-4 h-4 text-accent-primary" />
      case 'public': return <EyeIcon className="w-4 h-4 text-accent-success" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <Navigation />

      <main className="pt-24 pb-16">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Vaults</h1>
              <p className="text-text-secondary">Secure file storage and collaboration</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </Button>
              <Button variant="primary" onClick={handleCreateVault}>
                <PlusIcon className="w-4 h-4 mr-2" />
                New Vault
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background-surface border border-border-default rounded-lg focus:border-accent-primary focus:outline-none"
                aria-label="Search files and folders"
              />
            </div>
            <select
              className="px-4 py-3 bg-background-surface border border-border-default rounded-lg focus:border-accent-primary focus:outline-none"
              aria-label="Filter by permissions"
            >
              <option value="">All Permissions</option>
              <option value="private">Private</option>
              <option value="shared">Shared</option>
              <option value="public">Public</option>
            </select>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-text-secondary">
            <span className="cursor-pointer hover:text-accent-primary">Home</span>
            {currentFolder.path.map((segment, index) => (
              <span key={index} className="flex items-center gap-2">
                <span>/</span>
                <span className="cursor-pointer hover:text-accent-primary">{segment}</span>
              </span>
            ))}
            <span>/</span>
            <span className="text-text-primary font-medium">{currentFolder.name}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6">
          {/* Upload Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 mb-8 transition-all ${
              draggedOver
                ? 'border-accent-primary bg-accent-primary/5'
                : 'border-border-default hover:border-accent-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
              accept="image/*,application/pdf,.doc,.docx,.txt"
            />
            <div className="text-center">
              <UploadIcon className={`w-12 h-12 mx-auto mb-4 ${draggedOver ? 'text-accent-primary' : 'text-text-tertiary'}`} />
              <h3 className="text-lg font-semibold mb-2">
                {draggedOver ? 'Drop files here' : 'Drag & drop files to upload'}
              </h3>
              <p className="text-text-secondary mb-4">or</p>
              <Button variant="secondary" onClick={handleFileSelect}>
                <UploadIcon className="w-4 h-4 mr-2" />
                Select Files
              </Button>
            </div>
          </div>

          {/* Selected Items Actions */}
          <AnimatePresence>
            {selectedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-3 mb-6 p-4 bg-background-surface border border-border-default rounded-lg"
              >
                <span className="font-medium">{selectedItems.length} item(s) selected</span>
                <Button variant="secondary" size="sm" onClick={handleShareVault}>
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="secondary" size="sm">
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="secondary" size="sm">
                  <TagIcon className="w-4 h-4 mr-2" />
                  Add Tags
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Items Grid/List */}
          <div className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
              : 'grid-cols-1'
          }`}>
            <AnimatePresence>
              {currentFolder.items
                .filter(item =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((item) => (
                  <VaultItemCard
                    key={item.id}
                    item={item}
                    viewMode={viewMode}
                    isSelected={selectedItems.includes(item.id)}
                    onSelect={() => handleItemSelect(item.id)}
                    onClick={() => item.type === 'folder' && console.log('Navigate to folder:', item.id)}
                  />
                ))}
            </AnimatePresence>
          </div>

          {currentFolder.items.length === 0 && (
            <div className="text-center py-12">
              <FolderIcon className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No files yet</h3>
              <p className="text-text-secondary mb-4">Create your first vault or upload some files</p>
              <Button variant="primary" onClick={handleCreateVault}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Vault
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Vault Item Card Component
interface VaultItemCardProps {
  item: VaultItem
  viewMode: 'grid' | 'list'
  isSelected: boolean
  onSelect: () => void
  onClick: () => void
}

function VaultItemCard({ item, viewMode, isSelected, onSelect, onClick }: VaultItemCardProps) {
  const Icon = item.type === 'folder' ? FolderIcon : FileIcon

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`flex items-center gap-4 p-4 bg-background-surface border rounded-lg cursor-pointer hover:shadow-md transition-all ${
          isSelected ? 'border-accent-primary ring-2 ring-accent-primary/20' : 'border-border-default'
        }`}
        onClick={onClick}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-border-default"
          aria-label={`Select ${item.name}`}
        />
        <Icon className="w-8 h-8 text-accent-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate" title={item.name}>{item.name}</h3>
          <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
            <span>{item.type === 'folder' ? 'Folder' : 'File'}</span>
            {item.size && <span>{formatFileSize(item.size)}</span>}
            <span>{item.lastModified.toLocaleDateString()}</span>
          </div>
          {item.tags.length > 0 && (
            <div className="flex gap-2 mt-2">
              {item.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-1 bg-accent-primary/10 text-accent-primary text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getPermissionIcon(item.permissions)}
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Open context menu
            }}
            className="p-1 hover:bg-background-primary rounded"
            aria-label="More options"
          >
            <MoreHorizontalIcon className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative bg-background-surface border rounded-lg cursor-pointer hover:shadow-lg transition-all overflow-hidden ${
        isSelected ? 'border-accent-primary ring-2 ring-accent-primary/20' : 'border-border-default'
      }`}
      onClick={onClick}
    >
      {isSelected && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={true}
            readOnly
            className="rounded border-border-default bg-accent-primary text-white"
          />
        </div>
      )}

      <div className="aspect-square p-4 flex items-center justify-center bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.name}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <Icon className="w-12 h-12 text-accent-primary" />
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm truncate mb-1" title={item.name}>
          {item.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>{item.type === 'folder' ? 'Folder' : 'File'}</span>
          <div className="flex items-center gap-1">
            {getPermissionIcon(item.permissions)}
            {item.collaborators && item.collaborators.length > 0 && (
              <span className="text-accent-primary">({item.collaborators.length})</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Helper functions
function formatFileSize(bytes?: number) {
  if (!bytes) return ''
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

function getPermissionIcon(permission: string) {
  switch (permission) {
    case 'private': return <LockIcon className="w-3 h-3" />
    case 'shared': return <UsersIcon className="w-3 h-3" />
    case 'public': return <EyeIcon className="w-3 h-3" />
    default: return null
  }
}

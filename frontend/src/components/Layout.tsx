import React, { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Calendar, BookOpen, Code2, Brain, FolderGit2,
  Dumbbell, UtensilsCrossed, Moon, Music, BookMarked, Target,
  BarChart3, FileText, Settings, LogOut, Zap, ChevronLeft, Menu,
  User, Bell, X, GraduationCap, Briefcase, DollarSign, Lightbulb, Camera, Mic, Users, Trophy, Sparkles, Search, Check
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import logoIcon from '@/assets/logo-icon.svg'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/planner', icon: Calendar, label: 'Daily Planner' },
  { divider: 'STUDY' },
  { path: '/study', icon: BookOpen, label: 'Data Science' },
  { path: '/dsa', icon: Code2, label: 'DSA Practice' },
  { path: '/interview', icon: Brain, label: 'Interview Prep' },
  { path: '/projects', icon: FolderGit2, label: 'Projects' },
  { path: '/masters', icon: GraduationCap, label: "Master's Prep" },
  { path: '/placement', icon: Briefcase, label: 'Placement Prep' },
  { divider: 'HEALTH' },
  { path: '/fitness', icon: Dumbbell, label: 'Fitness' },
  { path: '/diet', icon: UtensilsCrossed, label: 'Diet & Nutrition' },
  { path: '/sleep', icon: Moon, label: 'Sleep' },
  { divider: 'LIFE' },
  { path: '/singing', icon: Music, label: 'Singing' },
  { path: '/reading', icon: BookMarked, label: 'Reading' },
  { path: '/habits', icon: Zap, label: 'Habits' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/journal', icon: FileText, label: 'Journal' },
  { path: '/finance', icon: DollarSign, label: 'Finance' },
  { path: '/knowledge', icon: Lightbulb, label: 'Knowledge Vault' },
  { path: '/timeline', icon: Camera, label: 'Progress Photos' },
  { path: '/sharing', icon: Users, label: 'Family Sharing' },
  { path: '/gamification', icon: Trophy, label: 'Gamification' },
  { divider: 'INSIGHTS' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/ai-dashboard', icon: Sparkles, label: 'AI Dashboard' },
  { path: '/ai-chat', icon: Brain, label: 'AI Assistant' },
  { path: '/voice', icon: Mic, label: 'Voice Center' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

const mobileBottomItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/planner', icon: Calendar, label: 'Planner' },
  { path: '/study', icon: BookOpen, label: 'Study' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Profile' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024)
  
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Habits reminder', message: 'You have not checked in your habits today.', read: false, time: '10m ago' },
    { id: 2, title: 'Data Science progress', message: 'Congratulations! You completed the Pandas basics module.', read: false, time: '2h ago' },
    { id: 3, title: 'Coaching insight', message: 'Your average sleep duration this week is 7.2 hours. Looking solid!', read: true, time: '1d ago' },
  ])

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      if (width >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowSearch(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isMobile, isTablet, setSidebarOpen])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const searchResults = searchQuery.trim() === '' ? [] : navItems.filter(item => 
    !('divider' in item) && item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Mobile Top Bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 56,
          backgroundColor: '#09090b', borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', zIndex: 30
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 4 }}
          >
            <Menu size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={logoIcon} alt="Atlas One logo" style={{ width: 24, height: 24, borderRadius: 4 }} />
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15, color: '#ffffff' }}>Atlas One</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setShowSearch(true)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
              <Search size={18} />
            </button>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', position: 'relative' }}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2, width: 6, height: 6, borderRadius: '50%',
                  backgroundColor: '#ef4444'
                }} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || (!isMobile && !isTablet)) && (
          <>
            {(isMobile || isTablet) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)', zIndex: 40
                }}
              />
            )}

            <motion.div
              initial={isMobile || isTablet ? { x: -240 } : false}
              animate={isMobile || isTablet ? { x: 0 } : { width: sidebarOpen ? 240 : 64 }}
              exit={isMobile || isTablet ? { x: -240 } : undefined}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: isMobile || isTablet ? 'fixed' : 'sticky',
                top: 0, left: 0, bottom: 0,
                width: isMobile || isTablet ? 240 : undefined,
                height: '100vh',
                backgroundColor: '#09090b',
                borderRight: '1px solid rgba(255, 255, 255, 0.04)',
                display: 'flex', flexDirection: 'column',
                zIndex: isMobile || isTablet ? 50 : 20,
                overflow: 'hidden'
              }}
            >
              {/* Logo / Header */}
              <div style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: (sidebarOpen || isMobile || isTablet) ? 'space-between' : 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
              }}>
                {(sidebarOpen || isMobile || isTablet) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={logoIcon} alt="Atlas One logo" style={{ width: 28, height: 28, borderRadius: 6 }} />
                    <div>
                      <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 14, color: '#ffffff', letterSpacing: '0.2px' }}>Atlas One</div>
                      <div style={{ fontSize: 8, color: '#71717a', letterSpacing: 0.5, fontWeight: 600 }}>PERSONAL ANALYTICS & INSIGHTS</div>
                    </div>
                  </div>
                ) : (
                  <img src={logoIcon} alt="Atlas One logo" style={{ width: 24, height: 24, borderRadius: 4 }} />
                )}
                
                {(isMobile || isTablet) ? (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 4 }}
                  >
                    <X size={18} />
                  </button>
                ) : (
                  <button
                    onClick={toggleSidebar}
                    style={{
                      background: 'rgba(255,255,255,0.02)', border: 'none', borderRadius: 4,
                      padding: 5, cursor: 'pointer', color: '#71717a', display: 'flex', alignItems: 'center'
                    }}
                  >
                    {sidebarOpen ? <ChevronLeft size={13} /> : <Menu size={13} />}
                  </button>
                )}
              </div>

              {/* Navigation Items */}
              <nav style={{
                flex: 1, padding: '12px 0', overflowY: 'auto',
                scrollbarWidth: 'none', msOverflowStyle: 'none'
              }}>
                {navItems.map((item, idx) => {
                  if ('divider' in item) {
                    return (sidebarOpen || isMobile || isTablet) ? (
                      <div key={idx} style={{
                        padding: '16px 20px 6px', fontSize: 9, fontWeight: 700,
                        color: '#52525b', letterSpacing: 1.2, textTransform: 'uppercase'
                      }}>
                        {item.divider}
                      </div>
                    ) : <div key={idx} style={{ margin: '8px auto', width: 16, height: 1, background: 'rgba(255,255,255,0.04)' }} />
                  }

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path!}
                      end={item.path === '/'}
                      style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: (sidebarOpen || isMobile || isTablet) ? '8px 12px' : '8px',
                        borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s ease',
                        color: isActive ? '#ffffff' : '#a1a1aa',
                        background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                        border: isActive ? '1px solid rgba(255, 255, 255, 0.04)' : '1px solid transparent',
                        margin: '1px 8px', textDecoration: 'none', fontWeight: 500, fontSize: 13,
                        justifyContent: (sidebarOpen || isMobile || isTablet) ? 'flex-start' : 'center',
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon size={15} color={isActive ? '#ffffff' : '#71717a'} style={{ flexShrink: 0 }} />
                          {(sidebarOpen || isMobile || isTablet) && (
                            <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                          )}
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </nav>

              {/* User profile footer */}
              <div style={{
                padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)',
                backgroundColor: 'rgba(255,255,255,0.01)'
              }}>
                {(sidebarOpen || isMobile || isTablet) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: '#27272a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: 12, color: 'white', flexShrink: 0
                    }}>
                      {user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.full_name}
                      </div>
                      <div style={{ fontSize: 9, color: '#52525b' }}>@{user?.username}</div>
                    </div>
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', padding: 4 }}>
                      <LogOut size={13} />
                    </button>
                  </div>
                ) : (
                  <button onClick={handleLogout} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#52525b', width: '100%', display: 'flex', justifyContent: 'center', padding: 6
                  }}>
                    <LogOut size={15} />
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
        paddingTop: isMobile ? 56 : 0, paddingBottom: isMobile ? 64 : 0,
        height: '100vh', overflowY: 'auto'
      }}>
        
        {/* Desktop Header */}
        {!isMobile && (
          <header style={{
            height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            backgroundColor: 'rgba(9, 9, 11, 0.7)', backdropFilter: 'blur(16px)',
            position: 'sticky', top: 0, zIndex: 10
          }}>
            {/* Global Search trigger bar */}
            <div
              onClick={() => setShowSearch(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: 8, padding: '6px 12px',
                width: 280, color: '#71717a', cursor: 'pointer', fontSize: 12, userSelect: 'none'
              }}
            >
              <Search size={13} />
              <span>Search metrics, habits...</span>
              <span style={{ marginLeft: 'auto', fontSize: 9, background: 'rgba(255, 255, 255, 0.05)', padding: '1px 5px', borderRadius: 3 }}>Ctrl+K</span>
            </div>

            {/* Right Header Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Notification icon */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', position: 'relative', padding: 4 }}
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 0, right: 0, width: 6, height: 6, borderRadius: '50%',
                      backgroundColor: '#ef4444'
                    }} />
                  )}
                </button>

                {/* Notifications Dropdown menu */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      style={{
                        position: 'absolute', right: 0, marginTop: 8, width: 300,
                        backgroundColor: '#121214', border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 10, boxShadow: '0 12px 30px rgba(0,0,0,0.7)', zIndex: 100,
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>Inbox Alerts</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#a5b4fc', fontSize: 10, cursor: 'pointer', fontWeight: 600 }}>
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '20px 14px', textAlign: 'center', color: '#52525b', fontSize: 11 }}>
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => markAsRead(notif.id)}
                              style={{
                                padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                                background: notif.read ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: notif.read ? '#a1a1aa' : '#ffffff' }}>{notif.title}</span>
                                <span style={{ fontSize: 8, color: '#52525b' }}>{notif.time}</span>
                              </div>
                              <p style={{ fontSize: 10, color: '#71717a', lineHeight: 1.4, margin: 0 }}>{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User profile bubble */}
              <NavLink to="/settings" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: '#27272a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: 12, color: 'white'
                  }}>
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </NavLink>
            </div>
          </header>
        )}

        {/* Content Outlet */}
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: 64,
          backgroundColor: '#09090b',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          zIndex: 30, paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
          {mobileBottomItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, textDecoration: 'none', color: isActive ? '#ffffff' : '#71717a',
                  fontSize: 10, fontWeight: 500, flex: 1, padding: '8px 0'
                }}
              >
                <item.icon size={16} color={isActive ? '#ffffff' : '#71717a'} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      )}

      {/* Floating AI Assistant Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/ai-chat')}
        style={{
          position: 'fixed',
          bottom: isMobile ? 80 : 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: 10,
          background: '#121214',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#818cf8',
          cursor: 'pointer',
          zIndex: 99
        }}
      >
        <Sparkles size={20} />
      </motion.button>

      {/* Global Search Modal Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSearch(false)}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex',
              alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh'
            }}
          >
            <motion.div
              initial={{ scale: 0.97, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '90%', maxWidth: 500, backgroundColor: '#121214',
                borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 32px 64px rgba(0,0,0,0.8)', overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <Search size={16} color="#71717a" style={{ marginRight: 10 }} />
                <input
                  type="text"
                  placeholder="Search dashboard features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    color: '#ffffff', fontSize: 14
                  }}
                />
                <button
                  onClick={() => setShowSearch(false)}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: 'none', borderRadius: 4,
                    padding: 3, color: '#71717a', cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ padding: '8px 0', maxHeight: 260, overflowY: 'auto' }}>
                {searchQuery.trim() === '' ? (
                  <div style={{ padding: '14px 18px', color: '#52525b', fontSize: 12 }}>
                    Type to search for active features (e.g. study, sleep, habits, goals...)
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '14px 18px', color: '#52525b', fontSize: 12 }}>
                    No results found matching "{searchQuery}"
                  </div>
                ) : (
                  searchResults.map((item) => (
                    <div
                      key={item.path}
                      onClick={() => {
                        navigate(item.path!)
                        setShowSearch(false)
                        setSearchQuery('')
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px',
                        cursor: 'pointer', transition: 'background 0.15s'
                      }}
                      className="hover:bg-[rgba(255,255,255,0.02)]"
                    >
                      {item.icon && <item.icon size={14} color="#a1a1aa" />}
                      <span style={{ color: '#ffffff', fontSize: 13 }}>{item.label}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

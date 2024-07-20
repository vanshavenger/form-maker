import { Outlet } from 'react-router'
import { Navbar } from './navbar/navbar'

export const Layout = () => {
  return (
    <div className='flex flex-col h-screen'>
      <header className='flex-shrink-0'>
        <Navbar />
      </header>
      <main className='flex-grow'>
        <Outlet />
      </main>
    </div>
  )
}

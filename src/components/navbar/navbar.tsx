import { NavbarCenter } from './navbar-center'
import { NavbarEnd } from './navbar-end'
import { NavbarStart } from './navbar-start'

export const Navbar = () => {
  return (
    <div className='fixed h-14 inset-x-0 w-full backdrop-blur-lg transition-all top-0 right-0 left-0 p-4 flex items-center justify-between z-[100]'>
      <NavbarStart />
      <NavbarCenter />
      <NavbarEnd />
    </div>
  )
}

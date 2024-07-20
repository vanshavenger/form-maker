import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export const NavbarStart = () => {
  return (
    <aside className='flex items-center gap-2'>
      <Link
        to='/'
        className={cn(
          'font-bold flex flex-row gap-2 justify-center items-center'
        )}
      >
        <img
          src='https://kjvgbbazyyuyzxfovxfa.supabase.co/storage/v1/object/public/dsandev/forDarkMode.webp'
          alt='logo'
          width={40}
          height={40}
        />
        <p className={cn('ml-2 font-bold flex')}>DSA & DEV</p>
      </Link>
    </aside>
  )
}

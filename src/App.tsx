import { ThemeProvider } from '@/components/theme-provider'

import { Route, Routes } from 'react-router'
// import { BrowserRouter } from 'react-router-dom'
import { HomePage } from './components/Homepage'
import FormBuilder from './components/FormBuilder'
import { Layout } from './components/layout'

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      {/* <BrowserRouter> */}
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<HomePage />} />
          <Route path='/build' element={<FormBuilder />} />
        </Route>
      </Routes>
      {/* </BrowserRouter> */}
    </ThemeProvider>
  )
}

export default App

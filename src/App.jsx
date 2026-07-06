import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './components/Dashboard.jsx'
import DishEditor from './components/DishEditor.jsx'
import IngredientsManager from './components/IngredientsManager.jsx'
import PreparedItemsList from './components/PreparedItemsList.jsx'
import PreparedItemEditor from './components/PreparedItemEditor.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dish/:id" element={<DishEditor />} />
        <Route path="/ingredients" element={<IngredientsManager />} />
        <Route path="/prepared-items" element={<PreparedItemsList />} />
        <Route path="/prepared-items/:id" element={<PreparedItemEditor />} />
      </Route>
    </Routes>
  )
}

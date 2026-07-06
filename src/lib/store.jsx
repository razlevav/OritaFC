import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './api'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [ingredients, setIngredients] = useState([])
  const [preparedItems, setPreparedItems] = useState([])
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const state = await api.getState()
      setIngredients(state.ingredients || [])
      setPreparedItems(state.preparedItems || [])
      setDishes(state.dishes || [])
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const ingredientActions = {
    create: async (data) => {
      const item = await api.create('ingredients', data)
      setIngredients((prev) => [...prev, item])
      return item
    },
    update: async (id, data) => {
      const item = await api.update('ingredients', id, data)
      setIngredients((prev) => prev.map((i) => (i.id === id ? item : i)))
      return item
    },
    remove: async (id) => {
      await api.remove('ingredients', id)
      setIngredients((prev) => prev.filter((i) => i.id !== id))
    },
  }

  const preparedItemActions = {
    create: async (data) => {
      const item = await api.create('prepared-items', data)
      setPreparedItems((prev) => [...prev, item])
      return item
    },
    update: async (id, data) => {
      const item = await api.update('prepared-items', id, data)
      setPreparedItems((prev) => prev.map((p) => (p.id === id ? item : p)))
      return item
    },
    remove: async (id) => {
      await api.remove('prepared-items', id)
      setPreparedItems((prev) => prev.filter((p) => p.id !== id))
    },
  }

  const dishActions = {
    create: async (data) => {
      const item = await api.create('dishes', data)
      setDishes((prev) => [...prev, item])
      return item
    },
    update: async (id, data) => {
      const item = await api.update('dishes', id, data)
      setDishes((prev) => prev.map((d) => (d.id === id ? item : d)))
      return item
    },
    remove: async (id) => {
      await api.remove('dishes', id)
      setDishes((prev) => prev.filter((d) => d.id !== id))
    },
  }

  const value = {
    loading,
    error,
    ingredients,
    preparedItems,
    dishes,
    ingredientActions,
    preparedItemActions,
    dishActions,
    reload,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore חייב לרוץ בתוך StoreProvider')
  return ctx
}

import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export const holidayLeaveService = {
  // Get all holidays and leaves for a user in a given month
  async getHolidaysAndLeaves(year, month, userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let targetUserId = user.id

      if (userId) {
        // Only admins can view other users' holidays/leaves
        if (user.email !== 'nilesh_patil@acedataanalytics.com') {
          throw new Error('Unauthorized: Admin access required')
        }
        targetUserId = userId
      }

      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('holidays_leaves')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching holidays and leaves:', error)
      return { success: false, error: error.message }
    }
  },

  // Add a new holiday or leave
  async addHolidayLeave(holidayData, userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let targetUserId = user.id

      if (userId) {
        // Only admins can add holidays/leaves for other users
        if (user.email !== 'nilesh_patil@acedataanalytics.com') {
          throw new Error('Unauthorized: Admin access required')
        }
        targetUserId = userId
      }

      const entry = {
        user_id: targetUserId,
        date: holidayData.date,
        type: holidayData.type, // 'holiday' or 'leave'
        title: holidayData.title,
        description: holidayData.description || null,
        is_approved: holidayData.isApproved || false,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('holidays_leaves')
        .insert(entry)
        .select()
        .single()

      if (error) throw error
      
      console.log('Holiday/Leave added for user:', targetUserId)
      return { success: true, data }
    } catch (error) {
      console.error('Error adding holiday/leave:', error)
      return { success: false, error: error.message }
    }
  },

  // Update a holiday or leave
  async updateHolidayLeave(id, holidayData, userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if user has permission to update this entry
      const { data: existingEntry, error: fetchError } = await supabase
        .from('holidays_leaves')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Check permission (own entry or admin)
      const isAdmin = user.email === 'nilesh_patil@acedataanalytics.com'
      if (existingEntry.user_id !== user.id && !isAdmin) {
        throw new Error('Unauthorized: Cannot update this entry')
      }

      const updateData = {
        date: holidayData.date,
        type: holidayData.type,
        title: holidayData.title,
        description: holidayData.description || null,
        is_approved: holidayData.isApproved || false,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('holidays_leaves')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      console.log('Holiday/Leave updated:', id)
      return { success: true, data }
    } catch (error) {
      console.error('Error updating holiday/leave:', error)
      return { success: false, error: error.message }
    }
  },

  // Delete a holiday or leave
  async deleteHolidayLeave(id, userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if user has permission to delete this entry
      const { data: existingEntry, error: fetchError } = await supabase
        .from('holidays_leaves')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Check permission (own entry or admin)
      const isAdmin = user.email === 'nilesh_patil@acedataanalytics.com'
      if (existingEntry.user_id !== user.id && !isAdmin) {
        throw new Error('Unauthorized: Cannot delete this entry')
      }

      const { error } = await supabase
        .from('holidays_leaves')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      console.log('Holiday/Leave deleted:', id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting holiday/leave:', error)
      return { success: false, error: error.message }
    }
  },

  // Get holidays and leaves for all users (admin only)
  async getAllHolidaysLeaves(year, month) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Only admins can view all holidays/leaves
      if (user.email !== 'nilesh_patil@acedataanalytics.com') {
        throw new Error('Unauthorized: Admin access required')
      }

      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('holidays_leaves')
        .select(`
          *,
          user_profiles:user_id (
            email,
            full_name
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching all holidays and leaves:', error)
      return { success: false, error: error.message }
    }
  },

  // Check if a date is a holiday or leave for a user
  async isHolidayOrLeave(date, userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let targetUserId = user.id
      if (userId) {
        targetUserId = userId
      }

      const dateStr = format(new Date(date), 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('holidays_leaves')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('date', dateStr)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      
      return { success: true, data: data || null }
    } catch (error) {
      console.error('Error checking holiday/leave:', error)
      return { success: false, error: error.message }
    }
  }
} 
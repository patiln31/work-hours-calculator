import { supabase } from '../lib/supabase'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export const timeEntriesService = {
  // Save or update a time entry for today
  async saveTimeEntry(timeData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const today = format(new Date(), 'yyyy-MM-dd')
      
      // Parse time data from the calculator
      const entry = {
        user_id: user.id,
        date: today,
        check_in: timeData.checkIn || null,
        check_out: timeData.checkOut || null,
        break_in: timeData.breakIn || null,
        break_out: timeData.breakOut || null,
        total_hours: timeData.totalHours || null,
        break_duration_minutes: timeData.breakDurationMinutes || null,
        break_credit_minutes: timeData.breakCreditMinutes || null,
        expected_leave_time: timeData.expectedLeaveTime || null,
        updated_at: new Date().toISOString()
      }

      // Use upsert to insert or update
      const { data, error } = await supabase
        .from('time_entries')
        .upsert(entry, { 
          onConflict: 'user_id,date',
          returning: 'minimal'
        })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error saving time entry:', error)
      return { success: false, error: error.message }
    }
  },

  // Get time entries for a specific month
  async getMonthlyEntries(year, month, userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Use provided userId for admin view, otherwise use current user
      const targetUserId = userId || user.id

      const startDate = startOfMonth(new Date(year, month - 1))
      const endDate = endOfMonth(new Date(year, month - 1))

      let query = supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching monthly entries:', error)
      return { success: false, error: error.message }
    }
  },

  // Get time entry for a specific date
  async getEntryByDate(date, userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const targetUserId = userId || user.id

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('date', format(new Date(date), 'yyyy-MM-dd'))
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching entry by date:', error)
      return { success: false, error: error.message }
    }
  },

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if user is admin
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
      if (user.email !== adminEmail) {
        throw new Error('Unauthorized: Admin access required')
      }

      // Get unique users from time_entries
      const { data, error } = await supabase
        .from('time_entries')
        .select('user_id')
        .order('user_id')

      if (error) throw error

      // Get unique user IDs
      const uniqueUserIds = [...new Set(data.map(entry => entry.user_id))]
      
      // Fetch user details from auth.users (if accessible) or return user IDs
      return { success: true, data: uniqueUserIds }
    } catch (error) {
      console.error('Error fetching all users:', error)
      return { success: false, error: error.message }
    }
  },

  // Calculate monthly statistics
  calculateMonthlyStats(entries) {
    if (!entries || entries.length === 0) {
      return {
        totalDaysWorked: 0,
        averageHours: 0,
        totalHours: 0,
        daysUnder8_5: 0
      }
    }

    const validEntries = entries.filter(entry => entry.total_hours != null)
    const totalHours = validEntries.reduce((sum, entry) => sum + parseFloat(entry.total_hours || 0), 0)
    const daysUnder8_5 = validEntries.filter(entry => parseFloat(entry.total_hours || 0) < 8.5).length

    return {
      totalDaysWorked: validEntries.length,
      averageHours: validEntries.length > 0 ? totalHours / validEntries.length : 0,
      totalHours,
      daysUnder8_5
    }
  },

  // Save or update manual time entry for any date
  async saveManualTimeEntry(entryData, selectedDate, userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // For admin editing other users' entries
      const targetUserId = userId || user.id
      const dateStr = format(new Date(selectedDate), 'yyyy-MM-dd')

      // Calculate total hours
      const totalHours = this.calculateTotalHours(entryData)

      const entry = {
        user_id: targetUserId,
        date: dateStr,
        check_in: entryData.checkIn || null,
        check_out: entryData.checkOut || null,
        break_in: entryData.breakIn || null,
        break_out: entryData.breakOut || null,
        total_hours: totalHours,
        break_duration_minutes: entryData.breakDurationMinutes || null,
        break_credit_minutes: entryData.breakCreditMinutes || null,
        expected_leave_time: entryData.expectedLeaveTime || null,
        updated_at: new Date().toISOString()
      }

      // Use upsert to insert or update
      const { data, error } = await supabase
        .from('time_entries')
        .upsert(entry, { 
          onConflict: 'user_id,date',
          returning: 'representation'
        })

      if (error) throw error
      return { success: true, data: data?.[0] }
    } catch (error) {
      console.error('Error saving manual time entry:', error)
      return { success: false, error: error.message }
    }
  },

  // Calculate total working hours from time inputs
  calculateTotalHours(timeData) {
    if (!timeData.checkIn || !timeData.checkOut) return null

    try {
      const parseTime = (timeStr) => {
        if (!timeStr) return null
        const [hours, minutes] = timeStr.split(':').map(Number)
        return hours * 60 + minutes // minutes since midnight
      }

      const checkInMinutes = parseTime(timeData.checkIn)
      const checkOutMinutes = parseTime(timeData.checkOut)
      const breakInMinutes = parseTime(timeData.breakIn)
      const breakOutMinutes = parseTime(timeData.breakOut)

      if (checkInMinutes === null || checkOutMinutes === null) return null

      let workedMinutes = checkOutMinutes - checkInMinutes
      
      // Handle overnight shifts
      if (workedMinutes < 0) {
        workedMinutes += 24 * 60 // Add 24 hours
      }

      // Subtract break time
      if (breakInMinutes !== null && breakOutMinutes !== null && breakOutMinutes > breakInMinutes) {
        const breakDuration = breakOutMinutes - breakInMinutes
        workedMinutes -= breakDuration
      }

      // Convert to hours with 2 decimal places
      return Math.round((workedMinutes / 60) * 100) / 100
    } catch (error) {
      console.error('Error calculating total hours:', error)
      return null
    }
  },

  // Delete a time entry
  async deleteTimeEntry(entryId, userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if user has permission to delete this entry
      const { data: entry, error: fetchError } = await supabase
        .from('time_entries')
        .select('user_id')
        .eq('id', entryId)
        .single()

      if (fetchError) throw fetchError

      // Check permission (own entry or admin)
      const isAdmin = user.email === import.meta.env.VITE_ADMIN_EMAIL
      if (entry.user_id !== user.id && !isAdmin) {
        throw new Error('Unauthorized: Cannot delete this entry')
      }

      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting time entry:', error)
      return { success: false, error: error.message }
    }
  },

  // Get edit history for a time entry
  async getEditHistory(timeEntryId, userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('time_entries_history')
        .select('*')
        .eq('time_entry_id', timeEntryId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching edit history:', error)
      return { success: false, error: error.message }
    }
  },

  // Undo last edit (restore to previous version)
  async undoLastEdit(timeEntryId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get the most recent edit history
      const { data: history, error: historyError } = await supabase
        .from('time_entries_history')
        .select('*')
        .eq('time_entry_id', timeEntryId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (historyError) throw historyError
      if (!history || history.length === 0) {
        throw new Error('No edit history found')
      }

      const lastEdit = history[0]
      const previousData = lastEdit.previous_data

      // Restore to previous state
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          check_in: previousData.check_in,
          check_out: previousData.check_out,
          break_in: previousData.break_in,
          break_out: previousData.break_out,
          total_hours: previousData.total_hours,
          break_duration_minutes: previousData.break_duration_minutes,
          break_credit_minutes: previousData.break_credit_minutes,
          expected_leave_time: previousData.expected_leave_time,
          updated_at: new Date().toISOString()
        })
        .eq('id', timeEntryId)
        .select()

      if (error) throw error
      return { success: true, data: data?.[0] }
    } catch (error) {
      console.error('Error undoing last edit:', error)
      return { success: false, error: error.message }
    }
  },

  // Get users for admin view
  async getUsersWithEntries() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if user is admin
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
      if (user.email !== adminEmail) {
        throw new Error('Unauthorized: Admin access required')
      }

      // Get unique users with their emails from time_entries and auth.users
      // Since we can't directly query auth.users, we'll get user_ids and fetch profiles
      const { data: entries, error } = await supabase
        .from('time_entries')
        .select('user_id')
        .order('user_id')

      if (error) throw error

      // Get unique user IDs
      const uniqueUserIds = [...new Set(entries.map(entry => entry.user_id))]
      
      return { success: true, data: uniqueUserIds }
    } catch (error) {
      console.error('Error fetching users with entries:', error)
      return { success: false, error: error.message }
    }
  },

  // Parse calculator data for saving
  parseCalculatorData(calculationResults, timeInputs) {
    if (!calculationResults || calculationResults.error) return null

    // Extract numeric hours from formatted time strings
    const parseHours = (timeStr) => {
      if (!timeStr) return null
      const match = timeStr.match(/(\d+)h\s*(\d+)m/)
      if (match) {
        return parseFloat(match[1]) + parseFloat(match[2]) / 60
      }
      return null
    }

    // Format expected leave time for database (HH:MM format)
    const formatExpectedLeaveTime = (dateObj) => {
      if (!dateObj || !(dateObj instanceof Date)) return null
      const hours = dateObj.getHours().toString().padStart(2, '0')
      const minutes = dateObj.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }

    // Parse break duration and credit
    const breakDurationMinutes = calculationResults.breakInfo ? 
      Math.round((calculationResults.breakInfo.actualBreak || 0) / (1000 * 60)) : null
    
    const breakCreditMinutes = calculationResults.breakInfo ? 
      Math.round((calculationResults.breakInfo.credit || 0) / (1000 * 60)) : null

    return {
      checkIn: timeInputs.checkIn || null,
      checkOut: timeInputs.checkOut || null,
      breakIn: timeInputs.breakIn || null,
      breakOut: timeInputs.breakOut || null,
      totalHours: parseHours(calculationResults.totalWorked),
      breakDurationMinutes,
      breakCreditMinutes,
      expectedLeaveTime: formatExpectedLeaveTime(calculationResults.expectedLeaveTimeRaw)
    }
  }
} 
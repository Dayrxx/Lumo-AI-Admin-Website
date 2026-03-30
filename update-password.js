import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qxjreybnwdddfuhewmpt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4anJleWJud2RkZGZ1aGV3bXB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODYzOTk2MiwiZXhwIjoyMDg0MjE1OTYyfQ.XTYLdyRBh1k0pqlX-Onf7RwLxzCf4mj5YL9XmHThWnM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateAdminPassword() {
  // First, find the user
  const { data: usersData, error: fetchError } = await supabase.auth.admin.listUsers()
  
  if (fetchError) {
    console.error('Error fetching users:', fetchError)
    return
  }

  const user = usersData.users.find(u => u.email === 'dje.appdevelopment@gmail.com')

  if (user) {
    // Update the user's password and confirm email
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        password: 'DeikJustus2006!!!',
        email_confirm: true
      }
    )

    if (error) {
      console.error('Error updating password:', error.message)
    } else {
      console.log('Successfully updated password for:', data.user.email)
    }
  } else {
    console.log('User not found. Creating new user...')
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'dje.appdevelopment@gmail.com',
      password: 'DeikJustus2006!!!',
      email_confirm: true
    })
    if (error) console.error('Error creating:', error.message)
    else console.log('Created:', data.user.email)
  }
}

updateAdminPassword()

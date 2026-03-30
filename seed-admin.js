import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qxjreybnwdddfuhewmpt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4anJleWJud2RkZGZ1aGV3bXB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODYzOTk2MiwiZXhwIjoyMDg0MjE1OTYyfQ.XTYLdyRBh1k0pqlX-Onf7RwLxzCf4mj5YL9XmHThWnM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'dje.appdevelopment@gmail.com',
    password: 'DeikJustus2006!!!',
    email_confirm: true
  })

  if (error) {
    console.error('Error creating admin user:', error.message)
  } else {
    console.log('Admin user created successfully:', data.user.email)
  }
}

seedAdmin()

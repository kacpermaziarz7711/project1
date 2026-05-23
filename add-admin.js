const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Brak VITE_SUPABASE_URL lub VITE_SUPABASE_ANON_KEY w .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addAdmin(email) {
  try {
    console.log(`Szukanie użytkownika: ${email}...`);
    
    // Najpierw spróbuj znaleźć użytkownika po emailu
    // Używamy RPC lub bezpośredniego zapytania jeśli możliwe
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Alternatywa: użyj listUsers jeśli dostępne (wymaga service role)
    // Ponieważ nie mamy service role key, spróbujemy innej metody
    
    console.log('\nMetoda 1: Rejestracja użytkownika (jeśli nie istnieje)');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: 'Admin123!', // Tymczasowe hasło
    });
    
    if (signUpError && !signUpError.message.includes('already registered')) {
      console.error('Błąd rejestracji:', signUpError.message);
    } else if (signUpData.user) {
      console.log('✓ Użytkownik zarejestrowany:', signUpData.user.id);
      
      // Dodaj do admin_users
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({ user_id: signUpData.user.id });
      
      if (insertError) {
        if (insertError.code === '23505') {
          console.log('✓ Użytkownik jest już administratorem');
        } else {
          console.error('Błąd dodawania admina:', insertError.message);
        }
      } else {
        console.log('✓ Pomyślnie dodano użytkownika jako administratora');
      }
    } else {
      console.log('Użytkownik już istnieje. Musisz się zalogować w aplikacji.');
      console.log('Następnie uruchom to SQL w Supabase Dashboard:');
      console.log(`INSERT INTO admin_users (user_id) SELECT id FROM auth.users WHERE email = '${email}';`);
    }
    
  } catch (error) {
    console.error('Błąd:', error.message);
  }
}

// Domyślny admin
const DEFAULT_ADMIN_EMAIL = 'kacper.maziarz2004@gmail.com';

// Użycie: node add-admin.js [opcjonalny_email]
const email = process.argv[2] || DEFAULT_ADMIN_EMAIL;

if (!email) {
  console.log('Użycie: node add-admin.js [opcjonalny_email]');
  console.log('\nLub użyj SQL w Supabase Dashboard:');
  console.log(`INSERT INTO admin_users (user_id) SELECT id FROM auth.users WHERE email = '${DEFAULT_ADMIN_EMAIL}';`);
} else {
  console.log(`Dodawanie admina: ${email}`);
  console.log('\nNajprostszy sposób - uruchom to SQL w Supabase Dashboard:');
  console.log(`INSERT INTO admin_users (user_id) SELECT id FROM auth.users WHERE email = '${email}';`);
  console.log('\nLub zaloguj się w aplikacji i podaj hasło poniżej:');
  addAdmin(email);
}

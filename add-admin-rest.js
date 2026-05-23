const SUPABASE_URL = 'https://pwivwqtlztnyligrxznz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aXZ3cXRsenRueWxpZ3J4em56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDg0ODQsImV4cCI6MjA5NDE4NDQ4NH0.r4mESirwVqqnNblr3OxmrFoy9w_23obRxCR7LAnnO_U';
const ADMIN_EMAIL = 'kacper.maziarz2004@gmail.com';

async function addAdmin() {
  try {
    console.log('Rejestracja użytkownika...');
    
    // Krok 1: Rejestracja użytkownika
    const signUpResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: 'Admin123!',
        options: {
          data: {}
        }
      })
    });

    const signUpData = await signUpResponse.json();
    
    if (signUpResponse.ok && signUpData.user) {
      console.log('✓ Użytkownik zarejestrowany:', signUpData.user.id);
      
      // Krok 2: Dodanie do admin_users
      console.log('Dodawanie do admin_users...');
      
      const adminResponse = await fetch(`${SUPABASE_URL}/rest/v1/admin_users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: signUpData.user.id
        })
      });

      if (adminResponse.ok) {
        console.log('✓ Pomyślnie dodano użytkownika jako administratora!');
        console.log('\nMożesz się teraz zalogować w aplikacji używając:');
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log('Hasło: Admin123!');
      } else {
        const adminError = await adminResponse.json();
        console.error('Błąd dodawania admina:', adminError);
        
        // Sprawdź czy to duplikat
        if (adminError.code === '23505') {
          console.log('✓ Użytkownik jest już administratorem');
        }
      }
    } else {
      console.log('Użytkownik prawdopodobnie już istnieje');
      console.log('Błąd:', signUpData);
      
      // Spróbuj zalogować istniejącego użytkownika
      console.log('\nPróba logowania...');
      const signInResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: 'Admin123!'
        })
      });

      const signInData = await signInResponse.json();
      
      if (signInResponse.ok && signInData.user) {
        console.log('✓ Zalogowano pomyślnie:', signInData.user.id);
        
        // Dodaj do admin_users
        const adminResponse = await fetch(`${SUPABASE_URL}/rest/v1/admin_users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${signInData.access_token}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: signInData.user.id
          })
        });

        if (adminResponse.ok) {
          console.log('✓ Pomyślnie dodano użytkownika jako administratora!');
        } else {
          const adminError = await adminResponse.json();
          if (adminError.code === '23505') {
            console.log('✓ Użytkownik jest już administratorem');
          } else {
            console.error('Błąd dodawania admina:', adminError);
          }
        }
      } else {
        console.log('Nie udało się zalogować. Użytkownik może nie istnieć lub ma inne hasło.');
        console.log('\nMusisz ręcznie dodać admina w Supabase Dashboard.');
        console.log('SQL do uruchomienia:');
        console.log(`INSERT INTO admin_users (user_id) SELECT id FROM auth.users WHERE email = '${ADMIN_EMAIL}';`);
      }
    }
  } catch (error) {
    console.error('Błąd:', error.message);
  }
}

addAdmin();

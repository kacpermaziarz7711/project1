# Jak dodać konto administratora - Instrukcja krok po kroku

## Krok 1: Zaloguj się do Supabase
1. Otwórz przeglądarkę i wejdź na: https://supabase.com/dashboard
2. Zaloguj się na swoje konto Supabase

## Krok 2: Wybierz swój projekt
1. Po zalogowaniu zobaczysz listę swoich projektów
2. Kliknij na projekt używany w tej aplikacji (powinien być widoczny po nazwie)

## Krok 3: Otwórz SQL Editor
1. W lewym menu kliknij na "SQL Editor" (ikona bazy danych)
2. Może być też pod nazwą "Database" → "SQL Editor"

## Krok 4: Uruchom polecenie SQL
1. W oknie edytora SQL wklej poniższe polecenie:

```sql
INSERT INTO admin_users (user_id) 
SELECT id FROM auth.users WHERE email = 'kacper.maziarz2004@gmail.com';
```

2. Kliknij przycisk "Run" (lub "Run query") w prawym dolnym rogu
3. Poczekaj na wynik - powinien pojawić się komunikat "Success"

## Krok 5: Zarejestruj się w aplikacji
1. Otwórz aplikację lokalnie (jeśli jeszcze nie działa)
2. Przejdź do strony logowania
3. Kliknij "Nie masz konta? Zarejestruj się"
4. Wpisz email: `kacper.maziarz2004@gmail.com`
5. Wpisz hasło (dowolne, zapamiętaj je!)
6. Kliknij "ZAREJESTRUJ SIE"

## Krok 6: Zaloguj się jako admin
1. Po rejestracji zaloguj się używając tego samego emaila i hasła
2. Przejdź do strony "Admin" w aplikacji
3. Powinieneś teraz mieć pełny dostęp do panelu administratora

---

## Co jeśli użytkownik już istnieje?

Jeśli przy próbie rejestracji zobaczysz komunikat, że użytkownik już istnieje:
1. Zaloguj się na istniejące konto (jeśli znasz hasło)
2. Lub zresetuj hasło w Supabase Dashboard:
   - W Supabase Dashboard przejdź do "Authentication"
   - Kliknij "Users"
   - Znajdź `kacper.maziarz2004@gmail.com`
   - Kliknij ikonę użytkownika → "Reset password"

---

## Sprawdzenie czy admin został dodany

Aby sprawdzić czy admin został poprawnie dodany, w SQL Editor uruchom:

```sql
SELECT * FROM admin_users;
```

Powinieneś zobaczyć wiersz z user_id dla `kacper.maziarz2004@gmail.com`.

// Validate Email Format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  // Validate that Password and Context are not the same
  function validatePasswordContext(p, c) {
    return p !== c;
  }
  
  // Compute SHA-256 hash using Web Crypto API
  async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
             .map(b => b.toString(16).padStart(2, '0'))
             .join('');
  }
  
  // Compute R1, R2, and key
async function computeHashes(p, email, c) {
    const d = window.location.host; // Current domain
    const u_id = email; // Using email as user identifier
    
    const R1 = await sha256(p + d + c);
    const R2 = await sha256(p + u_id + c);
    const key = await sha256(p + u_id + d + c);
    
    return { R1, R2, key };
  }
  
  // Toggle to show registration form
  function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
  }
  
  // Toggle to show login form
  function showLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
  }
  
  // Registration Function
async function register() {
    const email = document.getElementById('registerEmail').value;
    const p = document.getElementById('registerPassword').value;
    const c = document.getElementById('registerContext').value;
  
    if (!validateEmail(email)) {
      alert('Invalid email format');
      return;
    }
    
    if (!validatePasswordContext(p, c)) {
      alert('Password and Context must be different');
      return;
    }
    
    try {
      // 1. Validate inputs
      if (!email || !p || !c) {
        throw new Error('All fields are required');
      }
      
      // 2. Compute hashes
      const { R1, R2, key } = await computeHashes(p, email, c);
      
      // 3. Debugging logs
      console.log('Registration Hashes:', { R1, R2, key });
  
      // 4. Send request
      const response = await fetch('http://localhost/LoginPage/LoginPage/server/register.php', {
    method: 'POST',
    mode: 'cors',  // Explicitly enable CORS
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, R1, R2, key })
});
  
      // 5. Handle response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
  
      const result = await response.json();
      console.log('Registration Response:', result);
      
      if (result.success) {
        alert('Registration successful! Please login');
        showForm('login');  // Switch to login form
        clearRegistrationFields();
      } else {
        throw new Error(result.message || 'Unknown error');
      }
  
    } catch (error) {
      console.error('Registration Error:', error);
      alert(`Registration failed: ${error.message}`);
    }
}
  
function clearRegistrationFields() {
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerContext').value = '';
}
  // Login Function
  async function login() {
    const email = document.getElementById('loginEmail').value;
    const p = document.getElementById('loginPassword').value;
    const c = document.getElementById('loginContext').value;

    // Client-side validation
    if (!validateEmail(email)) {
        alert('Invalid email format');
        return;
    }

    if (!p || !c) {
        alert('Password and Context are required');
        return;
    }

    try {
        // 1. Compute hashes
        const { R1, R2, key } = await computeHashes(p, email, c);
        
        // 2. Debugging logs
        console.log('Login Hashes:', { R1, R2, key });

        // 3. Send request - Note the corrected path
        const response = await fetch('http://localhost/LoginPage/LoginPage/server/login.php', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                R1: R1,
                R2: R2,
                key: key
            })
        });

        // 4. Handle empty responses
        if (response.status === 204) {
            return;
        }

        // 5. Parse response safely
        const result = await response.json();
        console.log('Login Response:', result);
        
        // Modified success check
        if (response.ok && result.message === 'Login successful!') {
            alert('Login successful!');
            clearLoginFields();
        } else {
            throw new Error(result.message || 'Authentication failed');
        }

    } catch (error) {
        console.error('Login Error:', error);
        alert(`Login failed: ${error.message}`);
    }
}

function clearLoginFields() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginContext').value = '';
}
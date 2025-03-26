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
  
    const { R1, R2, key } = await computeHashes(p, email, c);
  
    // Send data to server for login verification
    const response = await fetch('../server/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, R1, R2, key })
    });
  
    const result = await response.json();
console.log(result);
alert(result.message);
}
  
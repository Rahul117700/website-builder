export const formTemplates = {
  contact: (siteId: string) => `
<!-- Contact Form -->
<div id="contact-form-${siteId}" class="contact-form-container">
  <h3>Contact Us</h3>
  <form id="contact-form" class="contact-form">
    <div class="form-group">
      <label for="name">Name *</label>
      <input type="text" id="name" name="name" required>
    </div>
    <div class="form-group">
      <label for="email">Email *</label>
      <input type="email" id="email" name="email" required>
    </div>
    <div class="form-group">
      <label for="subject">Subject *</label>
      <input type="text" id="subject" name="subject" required>
    </div>
    <div class="form-group">
      <label for="message">Message *</label>
      <textarea id="message" name="message" rows="5" required></textarea>
    </div>
    <button type="submit">Send Message</button>
  </form>
  <div id="form-status"></div>
</div>

<script>
document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message')
  };
  
  const statusDiv = document.getElementById('form-status');
  statusDiv.innerHTML = '<p style="color: #059669;">Sending...</p>';
  
  try {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteId: '${siteId}',
        formType: 'contact',
        data: data,
      }),
    });
    
    if (response.ok) {
      statusDiv.innerHTML = '<p style="color: #059669;">Thank you! Your message has been sent successfully.</p>';
      this.reset();
    } else {
      statusDiv.innerHTML = '<p style="color: #dc2626;">Sorry, there was an error sending your message. Please try again.</p>';
    }
  } catch (error) {
    statusDiv.innerHTML = '<p style="color: #dc2626;">Sorry, there was an error sending your message. Please try again.</p>';
  }
});
</script>

<style>
.contact-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.contact-form-container h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

button[type="submit"] {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

button[type="submit"]:hover {
  background: #7c3aed;
}

#form-status {
  margin-top: 1rem;
  text-align: center;
}

#form-status p {
  margin: 0;
  font-weight: 500;
}
</style>
  `,

  signup: (siteId: string) => `
<!-- Sign Up Form -->
<div id="signup-form-${siteId}" class="signup-form-container">
  <h3>Sign Up</h3>
  <form id="signup-form" class="signup-form">
    <div class="form-row">
      <div class="form-group">
        <label for="firstName">First Name *</label>
        <input type="text" id="firstName" name="firstName" required>
      </div>
      <div class="form-group">
        <label for="lastName">Last Name *</label>
        <input type="text" id="lastName" name="lastName" required>
      </div>
    </div>
    <div class="form-group">
      <label for="email">Email *</label>
      <input type="email" id="email" name="email" required>
    </div>
    <div class="form-group">
      <label for="phone">Phone Number</label>
      <input type="tel" id="phone" name="phone">
    </div>
    <div class="form-group">
      <label for="company">Company</label>
      <input type="text" id="company" name="company">
    </div>
    <div class="form-group">
      <label for="password">Password *</label>
      <input type="password" id="password" name="password" required>
    </div>
    <div class="form-group">
      <label for="confirmPassword">Confirm Password *</label>
      <input type="password" id="confirmPassword" name="confirmPassword" required>
    </div>
    <button type="submit">Sign Up</button>
  </form>
  <div id="form-status"></div>
</div>

<script>
document.getElementById('signup-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    company: formData.get('company')
  };
  
  const statusDiv = document.getElementById('form-status');
  statusDiv.innerHTML = '<p style="color: #059669;">Creating account...</p>';
  
  try {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteId: '${siteId}',
        formType: 'signup',
        data: data,
      }),
    });
    
    if (response.ok) {
      statusDiv.innerHTML = '<p style="color: #059669;">Thank you for signing up! We\'ll be in touch soon.</p>';
      this.reset();
    } else {
      statusDiv.innerHTML = '<p style="color: #dc2626;">Sorry, there was an error processing your signup. Please try again.</p>';
    }
  } catch (error) {
    statusDiv.innerHTML = '<p style="color: #dc2626;">Sorry, there was an error processing your signup. Please try again.</p>';
  }
});
</script>

<style>
.signup-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.signup-form-container h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

button[type="submit"] {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

button[type="submit"]:hover {
  background: #7c3aed;
}

#form-status {
  margin-top: 1rem;
  text-align: center;
}

#form-status p {
  margin: 0;
  font-weight: 500;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
  `,

  login: (siteId: string) => `
<!-- Login Form -->
<div id="login-form-${siteId}" class="login-form-container">
  <h3>Login</h3>
  <form id="login-form" class="login-form">
    <div class="form-group">
      <label for="email">Email *</label>
      <input type="email" id="email" name="email" required>
    </div>
    <div class="form-group">
      <label for="password">Password *</label>
      <input type="password" id="password" name="password" required>
    </div>
    <div class="form-options">
      <label class="checkbox-label">
        <input type="checkbox" name="rememberMe">
        <span>Remember me</span>
      </label>
      <a href="#" class="forgot-password">Forgot your password?</a>
    </div>
    <button type="submit">Sign In</button>
  </form>
  <div class="signup-link">
    <p>Don't have an account? <a href="#">Sign up here</a></p>
  </div>
  <div id="form-status"></div>
</div>

<script>
document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = {
    email: formData.get('email'),
    rememberMe: formData.get('rememberMe') === 'on'
  };
  
  const statusDiv = document.getElementById('form-status');
  statusDiv.innerHTML = '<p style="color: #059669;">Signing in...</p>';
  
  try {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteId: '${siteId}',
        formType: 'login',
        data: data,
      }),
    });
    
    if (response.ok) {
      statusDiv.innerHTML = '<p style="color: #059669;">Login attempt recorded. Please check your credentials.</p>';
      this.reset();
    } else {
      statusDiv.innerHTML = '<p style="color: #dc2626;">Sorry, there was an error processing your login. Please try again.</p>';
    }
  } catch (error) {
    statusDiv.innerHTML = '<p style="color: #dc2626;">Sorry, there was an error processing your login. Please try again.</p>';
  }
});
</script>

<style>
.login-form-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.login-form-container h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.forgot-password {
  font-size: 0.875rem;
  color: #8b5cf6;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

button[type="submit"] {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

button[type="submit"]:hover {
  background: #7c3aed;
}

.signup-link {
  margin-top: 1rem;
  text-align: center;
}

.signup-link p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.signup-link a {
  color: #8b5cf6;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}

#form-status {
  margin-top: 1rem;
  text-align: center;
}

#form-status p {
  margin: 0;
  font-weight: 500;
}
</style>
  `
}; 
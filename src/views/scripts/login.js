const loginForm = document.getElementById('loginForm');
const errorElement = document.getElementById('Error');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get form data
    const formData = new FormData(loginForm);

    // Make a POST request to your server
    try {
        const response = await fetch('/login', {
            method: 'POST',
            body: new URLSearchParams(formData) // It's often better to send as x-www-form-urlencoded
        });

        if (response.ok) {
            // *** MODIFIED PART ***
            // Parse the JSON response from the server
            const data = await response.json();
            // Redirect the user to the URL provided by the backend
            window.location.href = data.redirectUrl;
        } else {
            // Form submission failed, display the error message from the response
            const errorData = await response.text(); // Assuming error is rendered HTML
            // This part might need adjustment if your error response is also JSON
            document.body.innerHTML = errorData; // If you're rendering a full error page
            // Or if you just want to display a message:
            // const errorJson = await response.json();
            // errorElement.textContent = errorJson.errorMessage;
            // errorElement.style.display = 'block';
        }
    } catch (error) {
        // Handle any network or other errors
        console.error(error);
        errorElement.textContent = 'An error occurred.';
        errorElement.style.display = 'block';
    }
});

const passwordInput = document.getElementById('password');
const passwordToggle = document.getElementById('passwordToggle');

passwordToggle.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.innerHTML = '<i class="bi bi-eye-slash-fill"></i>';
    } else {
        passwordInput.type = 'password';
        passwordToggle.innerHTML = '<i class="bi bi-eye-fill"></i>';
    }
});

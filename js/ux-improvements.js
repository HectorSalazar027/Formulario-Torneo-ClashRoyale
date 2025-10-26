document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('epicForm');
    const formSteps = document.querySelectorAll('.form-step');
    const prevBtns = document.querySelectorAll('.prev-step-btn');
    const nextBtns = document.querySelectorAll('.next-step-btn');
    const progressBar = document.querySelector('.progress-bar');
    const progressBarContainer = document.querySelector('.progress-container'); // <-- AÑADE ESTA LÍNEA
    const totalSteps = formSteps.length - 1;
    let currentStep = 0;

    function updateProgressBar() {
        const progress = (currentStep / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function showStep(stepIndex) {
        formSteps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        currentStep = stepIndex;

        // Oculta la barra en el primer paso (index 0), la muestra en los demás.
        if (progressBarContainer) {
            if (currentStep === 0) {
                progressBarContainer.style.display = 'none';
            } else {
                progressBarContainer.style.display = 'block';
            }
        }


        if (currentStep > 0 && currentStep < totalSteps) {
            updateProgressBar();
        } else if (currentStep === 0) {
            progressBar.style.width = '0%';
        } else if (currentStep === totalSteps) {
            progressBar.style.width = '100%';
        }
    }

    // --- MEJORA 2: NUEVA FUNCIÓN DE VALIDACIÓN ---
    function validateStep(stepIndex) {
        const currentFormStep = formSteps[stepIndex];
        const inputs = currentFormStep.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            input.classList.add('was-validated');

            let errorMessageSpan;


            if (input.type === 'radio') {
                errorMessageSpan = input.closest('.form-step').querySelector('.radio-group:last-of-type + .error-message');
            } else if (input.type === 'checkbox') {
                errorMessageSpan = input.closest('.checkbox-group').nextElementSibling;
            } else {
                errorMessageSpan = input.nextElementSibling;
            }

            if (errorMessageSpan) {
                if (!input.checkValidity()) {
                    isValid = false;
                    if (input.type === 'email' && input.value) {
                        errorMessageSpan.textContent = 'Por favor, ingresa un correo válido.';
                    } else {
                        errorMessageSpan.textContent = 'Este campo es obligatorio.';
                    }
                    errorMessageSpan.classList.add('visible');
                } else {
                    // Si es válido, oculta el error
                    // Para radios, solo oculta si uno del grupo es válido
                    if (input.type === 'radio') {
                        const radioGroup = document.getElementsByName(input.name);
                        if (Array.from(radioGroup).some(radio => radio.checked)) {
                            errorMessageSpan.classList.remove('visible');
                        }
                    } else {
                        errorMessageSpan.classList.remove('visible');
                    }
                }
            }
        });
        return isValid;
    }

    // Navegación de botones
    nextBtns.forEach(button => {
        button.addEventListener('click', () => {
            // MEJORA 2: Marca todos los inputs como validados al hacer clic
            const currentInputs = formSteps[currentStep].querySelectorAll('[required]');
            currentInputs.forEach(input => input.classList.add('was-validated'));

            if (validateStep(currentStep)) {
                if (currentStep < formSteps.length - 1) {
                    showStep(currentStep + 1);
                }
            }
        });
    });

    prevBtns.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                showStep(currentStep - 1);
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;

        const currentInputs = formSteps[currentStep].querySelectorAll('[required]');
        currentInputs.forEach(input => input.classList.add('was-validated'));

        if (validateStep(currentStep)) {
            // Deshabilitar botón y mostrar spinner
            submitButton.disabled = true;
            submitButton.innerHTML = `<span class="spinner"></span> Enviando...`;

            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData, // <-- CORREGIDO
                    headers: { 'Accept': 'application/json' } // <-- CORREGIDO
                });

                if (response.ok) {
                    showStep(formSteps.length - 1);
                    form.reset();

                    const countdownElement = document.getElementById('countdown');
                    let seconds = 5;

                    const interval = setInterval(() => {
                        seconds--;
                        if (seconds <= 0) {
                            clearInterval(interval);
                            window.location.href = 'https://discord.gg/Vnphm9s3', "_blank";
                        } else {
                            if (countdownElement) {
                                countdownElement.textContent = seconds;
                            }
                        }
                    }, 1000);
                } else {
                    alert('¡Oh no! Hubo un problema al enviar tu registro. Intenta de nuevo.');
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                alert('¡Oh no! Hubo un error de conexión. Por favor, verifica tu internet e intenta de nuevo.');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        }
    });

    showStep(0);
});
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('generatorForm');
    const fileInput = document.getElementById('resume');
    const fileNameDisplay = document.getElementById('fileName');
    const resultSection = document.getElementById('resultSection');
    const resultContent = document.getElementById('resultContent');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    const copyBtn = document.getElementById('copyBtn');

    // File Input UI update
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = e.target.files[0].name;
            fileNameDisplay.style.color = 'var(--text-light)';
        } else {
            fileNameDisplay.textContent = 'Drag & drop or click to upload PDF';
            fileNameDisplay.style.color = 'var(--text-dim)';
        }
    });

    // Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Loading State
        setLoading(true);
        resultSection.classList.add('hidden');

        try {
            const formData = new FormData(form);

            // Level 1: Mock Response (Will replace with Level 2 API call)
            // For now, we are jumping straight to Level 2/3 structure but calling the real API

            const response = await fetch('/api/generate', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to generate cover letter');
            }

            const data = await response.json();

            // Show Result
            resultContent.textContent = data.coverLetter;
            resultSection.classList.remove('hidden');

            // Smooth scroll to result on mobile
            if (window.innerWidth < 900) {
                resultSection.scrollIntoView({ behavior: 'smooth' });
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error generating cover letter: ' + error.message);
        } finally {
            setLoading(false);
        }
    });

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        const textToCopy = resultContent.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
            copyBtn.style.color = 'var(--success-color)';

            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                copyBtn.style.color = '';
            }, 2000);
        });
    });

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.textContent = 'Generating...';
            loader.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Generate Cover Letter';
            loader.classList.add('hidden');
        }
    }
});

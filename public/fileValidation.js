const fileInput = document.getElementById('image');
fileInput.addEventListener('change', function () {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    for (const file of fileInput.files) {
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload valid image files (jpeg, png, jpg).');
            fileInput.value = ''; // Clear invalid files
            break;
        }
    }
});

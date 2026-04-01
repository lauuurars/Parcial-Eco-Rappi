// cambiando roles en el form

const roleInputs = document.querySelectorAll('input[name="role"]');
const extraStore = document.getElementById('extra-store');
const extraDelivery = document.getElementById('extra-delivery');

function updateExtras() {
    const val = document.querySelector('input[name="role"]:checked').value;
    extraStore.classList.toggle('active', val === 'store');
    extraDelivery.classList.toggle('active', val === 'delivery');
}

roleInputs.forEach(r => r.addEventListener('change', updateExtras));
updateExtras();
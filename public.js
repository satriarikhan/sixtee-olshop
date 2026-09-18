(function () {
  function showToast(data) {
    if (!data || !data.message) return;
    var toast = document.createElement('div');
    toast.className = 'user-toast user-toast--' + (data.type || 'info');
    toast.setAttribute('role', 'status');
    toast.innerHTML = '<span class="user-toast__mark">&#10003;</span><span></span><button type="button" aria-label="Tutup">&times;</button>';
    toast.querySelector('span:nth-child(2)').textContent = data.message;
    toast.querySelector('button').addEventListener('click', function () { toast.remove(); });
    document.body.appendChild(toast);
    window.setTimeout(function () {
      toast.classList.add('user-toast--hide');
      window.setTimeout(function () { toast.remove(); }, 300);
    }, 4200);
  }

  var pending = sessionStorage.getItem('sixteeToast');
  if (pending) {
    sessionStorage.removeItem('sixteeToast');
    try { showToast(JSON.parse(pending)); } catch (error) { sessionStorage.removeItem('sixteeToast'); }
  }

  window.showUserToast = showToast;
}());

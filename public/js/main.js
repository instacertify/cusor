// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('menuToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  // Cost calculator (client-side estimate)
  var calc = document.getElementById('calcForm');
  if (calc) {
    var select = document.getElementById('calcProduct');
    var out = document.getElementById('calcResult');
    calc.addEventListener('submit', function (e) {
      e.preventDefault();
      var opt = select.options[select.selectedIndex];
      if (!opt || !opt.value) return;
      document.getElementById('resName').textContent = opt.dataset.name;
      document.getElementById('resScheme').textContent = opt.dataset.scheme;
      document.getElementById('resCost').textContent = opt.dataset.cost;
      document.getElementById('resTime').textContent = opt.dataset.timeline;
      out.style.display = 'block';
      out.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
});

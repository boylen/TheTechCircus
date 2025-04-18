document.getElementById('update-button').addEventListener('click', updateFailures);

function updateFailures() {
  fetch('failures.json')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('failures-container');
      container.innerHTML = ''; // Clear existing content

      data.forEach(failure => {
        const section = document.createElement('div');
        section.className = 'fail-section';

        section.innerHTML = `
          <div class="fail-title">${failure.title}</div>
          <div class="fail-tagline">${failure.tagline}</div>
          <div class="fail-content">
            <strong>Description:</strong> ${failure.description}<br><br>
            <strong>Why It Failed:</strong> ${failure.why_failed}<br><br>
            <strong>Resources Wasted:</strong><br>
            - Money: ${failure.resources_wasted.money}<br>
            - Manpower: ${failure.resources_wasted.manpower}<br><br>
            <strong>Legal or Constitutional Issues:</strong> ${failure.legal_issues}<br><br>
            <strong>Outcome:</strong> ${failure.outcome}
          </div>
        `;

        container.appendChild(section);
      });
    })
    .catch(error => console.error('Error fetching failures:', error));
}

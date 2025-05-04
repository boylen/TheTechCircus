document.addEventListener('DOMContentLoaded', () => {
    const loadData = async () => {
      try {
        // First try the regular fetch approach
        let fails, wins;
        
        try {
          // Load both datasets with correct paths
          [fails, wins] = await Promise.all([
            fetch('/oopsies/data/general/oopsies.json').then(r => {
              if (!r.ok) throw new Error(`Failed to fetch oopsies.json (${r.status})`);
              return r.json();
            }),
            fetch('/oopsies/data/trump/brainfarts.json').then(r => {
              if (!r.ok) throw new Error(`Failed to fetch brainfarts.json (${r.status})`);
              return r.json();
            })
          ]);
        } catch (fetchError) {
          console.warn('Fetch failed, trying fallback method:', fetchError);
          
          // Fallback method for local testing or if fetch fails
          [fails, wins] = await Promise.all([
            new Promise((resolve) => {
              const xhr = new XMLHttpRequest();
              xhr.overrideMimeType('application/json');
              xhr.open('GET', '/data/general/oopsies.json', true);
              xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                  if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                  } else {
                    console.error('Failed to load oopsies.json using XHR');
                    resolve([]);
                  }
                }
              };
              xhr.send(null);
            }),
            new Promise((resolve) => {
              const xhr = new XMLHttpRequest();
              xhr.overrideMimeType('application/json');
              xhr.open('GET', '/data/trump/brainfarts.json', true);
              xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                  if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                  } else {
                    console.error('Failed to load brainfarts.json using XHR');
                    resolve([]);
                  }
                }
              };
              xhr.send(null);
            })
          ]);
        }
        
        // Check if we have valid data
        if (!fails || !Array.isArray(fails)) {
          console.error('Invalid oopsies data:', fails);
          fails = [];
        }
        
        if (!wins || !Array.isArray(wins)) {
          console.error('Invalid brainfarts data:', wins);
          wins = [];
        }
  
        // Populate tables
        populateWasteoramaTable('wasteorama-table', fails);
        populateAccidentalWinsTable('accidental-wins-table', 
          wins.filter(item => item.category === "Accidental Hit"));
  
        // Set up modal functionality
        setupModals();
      } catch (error) {
        console.error('Error loading data:', error);
        showError('wasteorama-table', error);
        showError('accidental-wins-table', error);
      }
    };
  
    function showError(tableId, error) {
      const table = document.getElementById(tableId);
      if (!table) return;
      
      const tbody = table.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = `<tr class="error-row"><td colspan="5">Error loading data: ${error.message}</td></tr>`;
      } else {
        table.innerHTML = `<tr class="error-row"><td colspan="5">Error loading data: ${error.message}</td></tr>`;
      }
    }
  
    function createLabel(text, labelClass) {
      const span = document.createElement('span');
      span.className = `label ${labelClass}`;
      span.textContent = text;
      return span;
    }
  
    function populateWasteoramaTable(tableId, data) {
      const tableBody = document.getElementById(tableId).querySelector('tbody');
      tableBody.innerHTML = '';
      
      if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr class="error-row"><td colspan="5">No data available</td></tr>';
        return;
      }
      
      data.forEach(item => {
        const row = document.createElement('tr');
  
        // Initiative
        const initiativeCell = document.createElement('td');
        initiativeCell.textContent = item.title;
        row.appendChild(initiativeCell);
  
        // Labels
        const labelCell = document.createElement('td');
        if (item.labels && Array.isArray(item.labels)) {
          item.labels.forEach(label => {
            const labelClass = label.toLowerCase().replace(/\s+/g, '-');
            labelCell.appendChild(createLabel(label, labelClass));
          });
        }
        row.appendChild(labelCell);
  
        // Description
        const descCell = document.createElement('td');
        descCell.textContent = item.description;
        row.appendChild(descCell);
  
        // Estimated Cost/Impact
        const impactCell = document.createElement('td');
        impactCell.textContent = item.impact || 'N/A';
        row.appendChild(impactCell);
  
        // More Info button
        const moreInfoCell = document.createElement('td');
        const button = document.createElement('button');
        button.className = 'see-more';
        button.textContent = 'See More';
        button.dataset.id = item.id;
        button.addEventListener('click', () => showDetails(item));
        moreInfoCell.appendChild(button);
        row.appendChild(moreInfoCell);
  
        tableBody.appendChild(row);
      });
    }
  
    function populateAccidentalWinsTable(tableId, data) {
      const tableBody = document.getElementById(tableId).querySelector('tbody');
      tableBody.innerHTML = '';
      
      if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr class="error-row"><td colspan="5">No data available</td></tr>';
        return;
      }
      
      data.forEach(item => {
        const row = document.createElement('tr');
  
        // Initiative
        const initiativeCell = document.createElement('td');
        initiativeCell.textContent = item.title;
        row.appendChild(initiativeCell);
  
        // Labels
        const labelCell = document.createElement('td');
        if (item.labels && Array.isArray(item.labels)) {
          item.labels.forEach(label => {
            const labelClass = label.toLowerCase().replace(/\s+/g, '-');
            labelCell.appendChild(createLabel(label, labelClass));
          });
        }
        row.appendChild(labelCell);
  
        // Description
        const descCell = document.createElement('td');
        descCell.textContent = item.description;
        row.appendChild(descCell);
  
        // Positive Impact
        const impactCell = document.createElement('td');
        impactCell.textContent = item.positiveImpact || 'N/A';
        row.appendChild(impactCell);
  
        // More Info button with custom text from winButton property
        const moreInfoCell = document.createElement('td');
        const button = document.createElement('button');
        button.className = 'see-more-win';
        button.textContent = item.winButton || 'See More';
        button.dataset.id = item.id;
        button.addEventListener('click', () => showDetails(item));
        moreInfoCell.appendChild(button);
        row.appendChild(moreInfoCell);
  
        tableBody.appendChild(row);
      });
    }
  
    function showDetails(item) {
      const modal = document.getElementById('oopsies-modal');
      const contentContainer = document.getElementById('modal-content-container');
      
      if (!modal || !contentContainer) {
        console.error('Modal or content container not found');
        return;
      }
      
      if (item.fullDetails) {
        // Convert markdown-style formatting to HTML
        const formattedDetails = item.fullDetails
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n\n/g, '<br><br>')
          .replace(/\n/g, '<br>');
          
        contentContainer.innerHTML = `
          <h2>${item.title}</h2>
          <div class="full-details">
            <p>${formattedDetails}</p>
            ${item.category === "Accidental Hit" 
              ? `<p><strong>Positive Impact:</strong> ${item.positiveImpact || 'Not specified'}</p>` 
              : `<p><strong>Impact:</strong> ${item.impact || 'Not specified'}</p>`}
            <p><strong>Date:</strong> ${item.date || 'Not specified'}</p>
          </div>
          ${item.source 
            ? `<p><strong>Source:</strong> <a href="${item.source}" target="_blank">${item.source}</a></p>` 
            : ''}
        `;
      } else {
        contentContainer.innerHTML = `<p>Details not found for this item.</p>`;
      }
      
      modal.style.display = 'block';
    }
  
    function setupModals() {
      const modal = document.getElementById('oopsies-modal');
      if (!modal) {
        console.error('Modal element not found');
        return;
      }
      
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }
      
      window.addEventListener('click', (event) => {
        if (event.target === modal) {
          modal.style.display = 'none';
        }
      });
      
      // ESC key to close modal
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
          modal.style.display = 'none';
        }
      });
    }
  
    // Start loading data
    loadData();
  });
  
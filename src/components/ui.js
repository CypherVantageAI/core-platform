// ==========================================================================
// Cypher Vantage - Reusable UI Components (ES6 Module)
// ==========================================================================

/**
 * Reusable sortable, searchable, filterable Table Component
 * @param {string} containerId - DOM container ID
 * @param {Array} data - Array of objects
 * @param {Array} columns - Column configurations [{ key, label, render }]
 * @param {Object} options - Custom table settings
 */
export function createTable(containerId, data, columns, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const searchPlaceholder = options.searchPlaceholder || 'Search...';
  const showSearch = options.showSearch !== false;
  const paginationSize = options.pageSize || 10;
  
  let currentSearch = '';
  let currentSortKey = options.defaultSortKey || '';
  let currentSortDir = options.defaultSortDir || 'asc'; // 'asc' | 'desc'
  let currentPage = 1;

  function render() {
    // 1. Filter data based on search query
    let processedData = [...data];
    if (showSearch && currentSearch) {
      const query = currentSearch.toLowerCase();
      processedData = processedData.filter(row => {
        return columns.some(col => {
          const val = row[col.key];
          return val !== undefined && String(val).toLowerCase().includes(query);
        });
      });
    }

    // 2. Sort data
    if (currentSortKey) {
      processedData.sort((a, b) => {
        let valA = a[currentSortKey];
        let valB = b[currentSortKey];
        
        // Handle numeric or string conversion
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return currentSortDir === 'asc' ? -1 : 1;
        if (valA > valB) return currentSortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 3. Paginate data
    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / paginationSize);
    const startIndex = (currentPage - 1) * paginationSize;
    const paginatedData = processedData.slice(startIndex, startIndex + paginationSize);

    // 4. Construct HTML
    let tableHtml = `
      <div class="enterprise-table-wrapper" style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
        ${showSearch ? `
          <div style="display: flex; gap: 10px; width: 100%;">
            <input type="text" class="table-search-input" placeholder="${searchPlaceholder}" value="${currentSearch}" 
              style="flex: 1; padding: 6px 12px; border-radius: 4px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.25); color: var(--text-primary); font-size: 0.76rem;" />
          </div>
        ` : ''}
        
        <div style="overflow-x: auto; width: 100%; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px;">
          <table class="compliance-grid" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.76rem;">
            <thead>
              <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05);">
                ${columns.map(col => {
                  const isSorted = currentSortKey === col.key;
                  const sortIcon = isSorted ? (currentSortDir === 'asc' ? ' 🔼' : ' 🔽') : '';
                  return `
                    <th class="sortable-header" data-key="${col.key}" style="padding: 10px 12px; color: var(--text-secondary); font-weight: 600; cursor: pointer; user-select: none;">
                      ${col.label}${sortIcon}
                    </th>
                  `;
                }).join('')}
              </tr>
            </thead>
              ${paginatedData.length > 0 ? paginatedData.map((row, rIdx) => {
                const isSelected = options.selectedRowId && String(row.id) === String(options.selectedRowId);
                const bg = isSelected ? 'rgba(139, 92, 246, 0.08)' : (rIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)');
                const borderLeft = isSelected ? '3px solid var(--color-violet)' : '3px solid transparent';
                return `
                  <tr class="${options.onRowClick ? 'clickable-row' : ''}" data-id="${row.id}" style="border-bottom: 1px solid rgba(255,255,255,0.03); background: ${bg}; border-left: ${borderLeft}; cursor: ${options.onRowClick ? 'pointer' : 'default'}; transition: all 0.2s;">
                    ${columns.map(col => {
                      const cellContent = col.render ? col.render(row) : (row[col.key] !== undefined ? row[col.key] : '--');
                      return `<td style="padding: 10px 12px; color: var(--text-primary);">${cellContent}</td>`;
                    }).join('')}
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="${columns.length}" style="padding: 20px; text-align: center; color: var(--text-muted);">No records found.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        ${totalPages > 1 ? `
          <div class="table-pagination" style="display: flex; justify-content: space-between; align-items: center; padding: 4px; font-size: 0.7rem; color: var(--text-muted);">
            <span>Showing ${startIndex + 1} to ${Math.min(startIndex + paginationSize, totalItems)} of ${totalItems} entries</span>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-xs prev-btn" ${currentPage === 1 ? 'disabled' : ''} style="padding: 2px 6px;">Prev</button>
              <span style="align-self: center;">Page ${currentPage} of ${totalPages}</span>
              <button class="btn btn-secondary btn-xs next-btn" ${currentPage === totalPages ? 'disabled' : ''} style="padding: 2px 6px;">Next</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    container.innerHTML = tableHtml;

    // 5. Wire up event listeners
    if (options.onRowClick) {
      container.querySelectorAll('tbody tr').forEach(tr => {
        tr.onclick = (e) => {
          const isActionButton = (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'A');
          const isSelectButton = e.target.classList.contains('select-srv-btn') || 
                                 e.target.classList.contains('select-sup-btn') || 
                                 e.target.closest('.select-srv-btn') || 
                                 e.target.closest('.select-sup-btn');
          if (isActionButton && !isSelectButton) {
            return;
          }
          const rowId = tr.getAttribute('data-id');
          const clickedRow = processedData.find(item => String(item.id) === String(rowId));
          if (clickedRow) {
            options.onRowClick(clickedRow);
          }
        };
      });
    }

    const searchInput = container.querySelector('.table-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        currentSearch = e.target.value;
        currentPage = 1;
        render();
      };
    }

    container.querySelectorAll('.sortable-header').forEach(header => {
      header.onclick = () => {
        const key = header.getAttribute('data-key');
        if (currentSortKey === key) {
          currentSortDir = currentSortDir === 'asc' ? 'desc' : 'asc';
        } else {
          currentSortKey = key;
          currentSortDir = 'asc';
        }
        render();
      };
    });

    const prevBtn = container.querySelector('.prev-btn');
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (currentPage > 1) {
          currentPage--;
          render();
        }
      };
    }

    const nextBtn = container.querySelector('.next-btn');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (currentPage < totalPages) {
          currentPage++;
          render();
        }
      };
    }
  }

  render();
}

/**
 * Reusable Glassmorphic KPI/Info Card Component
 * @param {string} containerId - DOM container ID
 * @param {Object} options - Config options { title, value, subtext, icon, trendClass, borderLeftColor }
 */
export function createCard(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const borderLeft = options.borderLeftColor ? `border-left: 4px solid ${options.borderLeftColor};` : '';
  const trendHtml = options.trendText ? `<span class="trend-badge ${options.trendClass || 'positive'}" style="font-size: 0.58rem; margin-left: 6px; font-weight: 700;">${options.trendText}</span>` : '';
  const tooltipAttr = options.tooltip ? `title="${options.tooltip}"` : '';
  const cursorStyle = (options.onClick || options.onclick) ? 'cursor: pointer; transform: translateY(0); transition: all 0.2s ease;' : '';

  container.innerHTML = `
    <div class="dashboard-card" ${tooltipAttr} style="position: relative; display: flex; flex-direction: column; padding: 12px 16px; margin: 0; min-height: 80px; justify-content: center; ${borderLeft} ${cursorStyle}">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span style="font-size: 0.6rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
          ${options.title || 'Metrics'}
        </span>
        ${options.icon ? `<span style="font-size: 1.1rem;">${options.icon}</span>` : ''}
      </div>
      <div style="display: flex; align-items: baseline; gap: 4px; margin-top: 4px;">
        <span style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); text-shadow: 0 0 10px rgba(255,255,255,0.05);">
          ${options.value || '--'}
        </span>
        ${trendHtml}
      </div>
      ${options.subtext ? `<div style="font-size: 0.64rem; color: var(--text-muted); margin-top: 2px;">${options.subtext}</div>` : ''}
    </div>
  `;

  const cardElement = container.querySelector('.dashboard-card');
  if (cardElement && (options.onClick || options.onclick)) {
    const handler = options.onClick || options.onclick;
    cardElement.onclick = handler;
    // Add simple hover scale effect
    cardElement.onmouseenter = () => { cardElement.style.transform = 'translateY(-2px)'; cardElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'; };
    cardElement.onmouseleave = () => { cardElement.style.transform = 'translateY(0)'; cardElement.style.boxShadow = 'none'; };
  }
}

/**
 * Custom SVG Drawing Pipeline for Donut, Radial Progress, Line and Bar Charts
 * @param {string} containerId - DOM container ID
 * @param {string} type - 'donut' | 'radial' | 'bar'
 * @param {Array|Object} data - Chart dataset
 * @param {Object} options - Configuration overrides
 */
export function createSVGChart(containerId, type, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = options.width || 220;
  const height = options.height || 220;
  const thickness = options.thickness || 24;

  if (type === 'radial') {
    const score = data.score || 0; // 0..100
    const color = options.color || '#10b981';
    const title = options.title || 'Readiness';
    const radius = 60;
    const strokeDash = 2 * Math.PI * radius;
    const offset = strokeDash - (score / 100) * strokeDash;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
        <svg width="${width}" height="${height}" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
          <!-- Background circle -->
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="${thickness}" />
          <!-- Animated progress circle -->
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="${color}" stroke-width="${thickness}" 
            stroke-dasharray="${strokeDash}" stroke-dashoffset="${offset}" stroke-linecap="round"
            style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);" />
        </svg>
        <div style="position: absolute; text-align: center;">
          <span style="font-size: 1.7rem; font-weight: 800; color: var(--text-primary); display: block;">${score}%</span>
          <span style="font-size: 0.58rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; display: block; margin-top: -2px;">${title}</span>
        </div>
      </div>
    `;
  } 
  
  else if (type === 'donut') {
    // data format: [{ label, value, color }]
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = 55;
    const strokeDash = 2 * Math.PI * radius;
    
    let currentOffset = 0;
    const segmentsHtml = data.map(item => {
      const percentage = total > 0 ? item.value / total : 0;
      const length = percentage * strokeDash;
      const offsetVal = strokeDash - length + currentOffset;
      currentOffset -= length; // advance offset clockwise
      
      return `
        <circle cx="85" cy="85" r="${radius}" fill="none" stroke="${item.color}" stroke-width="${thickness}" 
          stroke-dasharray="${strokeDash}" stroke-dashoffset="${offsetVal}"
          style="transition: stroke-dashoffset 0.6s ease;" />
      `;
    }).join('');

    const legendHtml = data.map(item => `
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.68rem; color: var(--text-secondary);">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${item.color};"></span>
        <span style="font-weight: 500;">${item.label}: <b>${item.value}</b></span>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-around; width: 100%; flex-wrap: wrap; gap: 10px;">
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 160px; height: 160px;">
          <svg width="150" height="150" viewBox="0 0 170 170" style="transform: rotate(-90deg);">
            <circle cx="85" cy="85" r="${radius}" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="${thickness}" />
            ${segmentsHtml}
          </svg>
          <div style="position: absolute; text-align: center;">
            <span style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">${total}</span>
            <span style="font-size: 0.58rem; color: var(--text-muted); display: block; text-transform: uppercase; font-weight: 700; margin-top: -2px;">Total</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; min-width: 110px;">
          ${legendHtml}
        </div>
      </div>
    `;
  }
}

/**
 * Reusable Form Generator
 * @param {string} containerId - DOM container ID
 * @param {Array} schema - Form schema [{ name, label, type, required, options, placeholder }]
 * @param {Function} onSubmit - Form submit handler callback
 */
export function createForm(containerId, schema, onSubmit) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const fieldsHtml = schema.map(f => {
    const requiredAttr = f.required ? 'required' : '';
    const placeholderText = f.placeholder || '';
    
    let inputHtml = '';
    if (f.type === 'select') {
      inputHtml = `
        <select name="${f.name}" class="dropdown-control mt-1" ${requiredAttr} style="width: 100%; font-size: 0.76rem;">
          ${f.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
        </select>
      `;
    } else if (f.type === 'textarea') {
      inputHtml = `
        <textarea name="${f.name}" class="textarea-input mt-1" rows="${f.rows || 3}" placeholder="${placeholderText}" ${requiredAttr} style="width: 100%; font-size: 0.76rem;"></textarea>
      `;
    } else {
      inputHtml = `
        <input type="${f.type || 'text'}" name="${f.name}" class="text-input mt-1" placeholder="${placeholderText}" ${requiredAttr} style="width: 100%; font-size: 0.76rem;" />
      `;
    }

    return `
      <div class="form-group mb-3" style="display: flex; flex-direction: column; width: 100%;">
        <label style="font-size: 0.72rem; font-weight: 600; color: var(--text-secondary);">${f.label}${f.required ? ' <span style="color: #ef4444;">*</span>' : ''}</label>
        ${inputHtml}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <form class="compliance-form" style="width: 100%; display: flex; flex-direction: column;">
      ${fieldsHtml}
      <div style="display: flex; gap: 8px; margin-top: 10px; justify-content: flex-end;">
        <button type="submit" class="btn btn-primary btn-sm" style="padding: 5px 12px; font-size: 0.72rem;">Submit Form</button>
      </div>
    </form>
  `;

  container.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const result = {};
    formData.forEach((value, key) => {
      result[key] = value;
    });
    onSubmit(result);
  };
}

/**
 * Reusable Status Indicators / Badge Generator
 * @param {string} statusText - Status title text
 * @returns {string} - Styled HTML string for status badge
 */
export function createStatusBadge(statusText) {
  let badgeStyle = 'background: rgba(16, 185, 129, 0.08); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);';
  
  const text = String(statusText).toUpperCase();
  if (text.includes('URGENT') || text.includes('CRITICAL') || text.includes('9H') || text.includes('FAILED') || text.includes('NON-COMPLIANT') || text.includes('DISRUPTED') || text.includes('7D')) {
    badgeStyle = 'background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);';
  } else if (text.includes('HIGH') || text.includes('WARNING') || text.includes('24H') || text.includes('DEGRADED') || text.includes('GAP') || text.includes('EXPIRED') || text.includes('30D')) {
    badgeStyle = 'background: rgba(249, 115, 22, 0.12); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.2);';
  } else if (text.includes('MEDIUM') || text.includes('48H') || text.includes('PARTIAL') || text.includes('REMEDIATING') || text.includes('UNDER REVIEW')) {
    badgeStyle = 'background: rgba(234, 179, 8, 0.12); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.2);';
  } else if (text.includes('MINT') || text.includes('7D SLA') || text.includes('TEAL')) {
    badgeStyle = 'background: rgba(20, 184, 166, 0.12); color: #14b8a6; border: 1px solid rgba(20, 184, 166, 0.2);';
  } else if (text.includes('PURPLE') || text.includes('30D SLA')) {
    badgeStyle = 'background: rgba(139, 92, 246, 0.12); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2);';
  }
  
  return `
    <span class="badge" style="font-size: 0.58rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; ${badgeStyle}">
      ${statusText}
    </span>
  `;
}

/**
 * Reusable 5x5 SVG Risk Heatmap Matrix Component
 * @param {string} containerId - DOM container ID
 * @param {Array} risks - Array of risk objects [{ likelihood, impact }]
 * @param {Function} onCellClick - Cell click callback (likelihood, impact)
 */
export function createRiskHeatmap(containerId, risks, onCellClick, thresholds) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Initialize a 5x5 matrix
  const matrix = Array.from({ length: 5 }, () => Array(5).fill(0));
  
  // Count risks in each coordinate cell (Likelihood vs Impact)
  risks.forEach(r => {
    const l = Math.max(1, Math.min(5, parseInt(r.likelihood) || 1));
    const i = Math.max(1, Math.min(5, parseInt(r.impact) || 1));
    // Index mapping: Row = 5 - Likelihood (Y-axis), Col = Impact - 1 (X-axis)
    matrix[5 - l][i - 1]++;
  });

  // Cell color helper based on risk severity score (likelihood * impact)
  function getCellBg(l, i) {
    const score = l * i;
    const med = thresholds ? thresholds.medium : 5;
    const high = thresholds ? thresholds.high : 10;
    const crit = thresholds ? thresholds.critical : 15;
    if (score >= crit) return 'rgba(239, 68, 68, 0.55)'; // Critical (Red)
    if (score >= high) return 'rgba(249, 115, 22, 0.5)';  // High (Orange)
    if (score >= med) return 'rgba(234, 179, 8, 0.4)';   // Medium (Yellow)
    return 'rgba(16, 185, 129, 0.3)';                  // Low (Green)
  }

  // Draw 5x5 matrix grids
  let cellsHtml = '';
  for (let row = 0; row < 5; row++) {
    const likelihood = 5 - row;
    for (let col = 0; col < 5; col++) {
      const impact = col + 1;
      const count = matrix[row][col];
      const bg = getCellBg(likelihood, impact);
      const isSelectable = count > 0;
      
      cellsHtml += `
        <div class="heatmap-cell ${isSelectable ? 'clickable' : ''}" 
          data-likelihood="${likelihood}" 
          data-impact="${impact}" 
          style="display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1px solid rgba(255,255,255,0.06); aspect-ratio: 1; font-weight: 700; font-size: 0.9rem; color: #fff; cursor: ${isSelectable ? 'pointer' : 'default'}; position: relative; transition: all 0.2s;"
          title="Likelihood ${likelihood} x Impact ${impact} (${count} Risks)">
          ${count > 0 ? count : ''}
        </div>
      `;
    }
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; width: 100%; max-width: 320px; align-self: center; background: rgba(0,0,0,0.15); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
      <div style="text-align: center; font-size: 0.6rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">ICT RISK HEATMAP MATRIX</div>
      <div style="display: grid; grid-template-columns: 20px 1fr; gap: 8px; align-items: center; width: 100%;">
        <!-- Y-Axis label -->
        <div style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 0.6rem; color: var(--text-muted); font-weight: 600; text-align: center; text-transform: uppercase; letter-spacing: 0.05em; height: 180px;">Likelihood ➔</div>
        
        <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
          <!-- Grid cells -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; width: 100%;">
            ${cellsHtml}
          </div>
          <!-- X-Axis label -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; text-align: center; font-size: 0.58rem; color: var(--text-muted); margin-top: 2px;">
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
          </div>
          <div style="text-align: center; font-size: 0.6rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Impact ➔</div>
        </div>
      </div>
    </div>
  `;

  // Bind cell clicks
  container.querySelectorAll('.heatmap-cell.clickable').forEach(cell => {
    cell.onclick = () => {
      const l = parseInt(cell.getAttribute('data-likelihood'));
      const i = parseInt(cell.getAttribute('data-impact'));
      onCellClick(l, i);
    };
  });
}

/**
 * Show a dynamic visual modal dialog on top of the viewport
 * @param {string} title - Title of the modal
 * @param {string} contentHtml - HTML content
 */
export function showModal(title, contentHtml) {
  let modal = document.getElementById('cv-dynamic-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cv-dynamic-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '2000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.backdropFilter = 'blur(4px)';
    
    modal.innerHTML = `
      <div class="modal-box" style="max-width: 500px; width: 90%; background: #0c101b; border: 1px solid rgba(139, 92, 246, 0.3); box-shadow: 0 0 25px rgba(139, 92, 246, 0.2); border-radius: 8px; display: flex; flex-direction: column; overflow: hidden;">
        <div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.06); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <h3 id="cv-dynamic-modal-title" style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">Modal Title</h3>
          <button id="cv-dynamic-modal-close" style="background: none; border: none; color: var(--text-secondary); font-size: 1.4rem; cursor: pointer; line-height: 1;">&times;</button>
        </div>
        <div id="cv-dynamic-modal-body" style="padding: 16px; font-size: 0.76rem; color: var(--text-secondary); max-height: 400px; overflow-y: auto; line-height: 1.4;">
          <!-- Content -->
        </div>
        <div class="modal-footer" style="padding: 10px 16px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: flex-end; background: rgba(0,0,0,0.15);">
          <button id="cv-dynamic-modal-btn-close" class="btn btn-secondary btn-xs" style="padding: 4px 10px;">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    const closeFn = () => {
      modal.style.display = 'none';
      modal.classList.add('hidden');
    };
    modal.querySelector('#cv-dynamic-modal-close').onclick = closeFn;
    modal.querySelector('#cv-dynamic-modal-btn-close').onclick = closeFn;
    modal.onclick = (e) => {
      if (e.target === modal) closeFn();
    };
  }
  
  modal.querySelector('#cv-dynamic-modal-title').innerText = title;
  modal.querySelector('#cv-dynamic-modal-body').innerHTML = contentHtml;
  modal.style.display = 'flex';
  modal.classList.remove('hidden');
}

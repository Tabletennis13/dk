console.log('🔥 ФАЙЛ matches-fix.js ЗАГРУЖЕН!');

// ============================================
// ПЕРЕЗАПИСЫВАЕМ ФУНКЦИЮ updateMatchesTable
// ============================================
function updateMatchesTable() {
    const container = document.getElementById('matchesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (matches.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 25px; background: #f8f9fa; border-radius: 10px; margin: 15px 0;">
                <h3 style="font-size: 16px; margin-bottom: 10px;">🎾 Матчей пока нет</h3>
                <p style="font-size: 14px;">Войдите как администратор и добавьте первый матч</p>
            </div>
        `;
        return;
    }
    
    const matchesByDay = {};
    
    matches.forEach(match => {
        const dateKey = match.date.toDateString();
        if (!matchesByDay[dateKey]) {
            matchesByDay[dateKey] = [];
        }
        matchesByDay[dateKey].push(match);
    });
    
    const sortedDays = Object.keys(matchesByDay).sort((a, b) => {
        return new Date(b) - new Date(a);
    });
    
    const today = new Date().toDateString();
    
    // КНОПКИ УПРАВЛЕНИЯ
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = 'display: flex; gap: 5px; margin: 10px 0;';
    
    const expandBtn = document.createElement('button');
    expandBtn.className = 'action-btn add-btn';
    expandBtn.style.cssText = 'padding: 3px 8px; font-size: 11px;';
    expandBtn.textContent = '📂 Развернуть все';
    expandBtn.onclick = () => {
        document.querySelectorAll('.match-day-group').forEach(g => g.classList.remove('collapsed'));
        document.querySelectorAll('.match-day-header').forEach(h => h.classList.remove('collapsed'));
    };
    
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'action-btn penalty-btn';
    collapseBtn.style.cssText = 'padding: 3px 8px; font-size: 11px;';
    collapseBtn.textContent = '📁 Свернуть все';
    collapseBtn.onclick = () => {
        document.querySelectorAll('.match-day-group').forEach(g => g.classList.add('collapsed'));
        document.querySelectorAll('.match-day-header').forEach(h => h.classList.add('collapsed'));
    };
    
    controlsDiv.appendChild(expandBtn);
    controlsDiv.appendChild(collapseBtn);
    container.appendChild(controlsDiv);
    
    // Добавляем CSS прямо в функцию
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        .match-day-group {
            max-height: none !important;
            overflow: visible !important;
        }
        .table-container {
            overflow-y: visible !important;
            max-height: none !important;
        }
    `;
    document.head.appendChild(styleTag);
    
    sortedDays.forEach((dayKey) => {
        const dayMatches = matchesByDay[dayKey];
        const dayDate = new Date(dayKey);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let displayDate;
        if (dayDate.toDateString() === today) {
            displayDate = 'СЕГОДНЯ';
        } else if (dayDate.toDateString() === yesterday.toDateString()) {
            displayDate = 'ВЧЕРА';
        } else {
            displayDate = dayDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short'
            });
        }
        
        const dayId = 'day_' + dayKey.replace(/\s/g, '_');
        
        const dayGroup = document.createElement('div');
        dayGroup.id = dayId;
        dayGroup.className = 'match-day-group';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'match-day-header';
        
        // ТОЛЬКО сегодня развернуто
        if (dayKey !== today) {
            dayGroup.classList.add('collapsed');
            dayHeader.classList.add('collapsed');
        }
        
        dayHeader.innerHTML = `
            <div class="day-info">
                <span class="toggle-icon">▼</span>
                <span class="day-date">${displayDate}</span>
            </div>
            <span class="match-count">${dayMatches.length}</span>
        `;
        
        dayHeader.onclick = () => {
            dayGroup.classList.toggle('collapsed');
            dayHeader.classList.toggle('collapsed');
        };
        
        // УПРОЩЕННАЯ ТАБЛИЦА - МИНИМУМ КОЛОНОК
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        const table = document.createElement('table');
        table.style.fontSize = '11px';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th style="padding: 3px;">Время</th>
                    <th style="padding: 3px;">Игрок 1</th>
                    <th style="padding: 3px;">Игрок 2</th>
                    <th style="padding: 3px;">Счет</th>
                    <th style="padding: 3px;"></th>
                </tr>
            </thead>
            <tbody>
                ${dayMatches.map(match => {
                    const time = match.date.toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    return `
                        <tr>
                            <td style="padding: 2px;">${time}</td>
                            <td style="padding: 2px;">
                                <div style="display: flex; align-items: center; gap: 3px;" onclick="showPlayerProfile('${match.player1}')">
                                    <img src="${players[match.player1]?.avatar || 'https://i.pravatar.cc/150?img=3'}" 
                                         style="width: 20px; height: 20px; border-radius: 50%;">
                                    <span style="font-size: 10px;">${match.player1}</span>
                                </div>
                            </td>
                            <td style="padding: 2px;">
                                <div style="display: flex; align-items: center; gap: 3px;" onclick="showPlayerProfile('${match.player2}')">
                                    <img src="${players[match.player2]?.avatar || 'https://i.pravatar.cc/150?img=3'}" 
                                         style="width: 20px; height: 20px; border-radius: 50%;">
                                    <span style="font-size: 10px;">${match.player2}</span>
                                </div>
                            </td>
                            <td style="padding: 2px; font-weight: bold;">${match.score || '-'}</td>
                            <td style="padding: 2px;">
                                ${isAdmin ? 
                                    `<button onclick="deleteMatch('${match.id}')" 
                                        style="padding: 1px 3px; font-size: 9px;">🗑️</button>` : 
                                    '-'}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        
        tableContainer.appendChild(table);
        dayGroup.appendChild(tableContainer);
        container.appendChild(dayHeader);
        container.appendChild(dayGroup);
    });
}

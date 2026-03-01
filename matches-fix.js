// ============================================
// ПРОСТОЕ РЕШЕНИЕ - УБИРАЕМ ОГРАНИЧЕНИЕ ВЫСОТЫ
// ============================================

// Добавляем CSS, который переопределит ограничение
const style = document.createElement('style');
style.textContent = `
    /* Убираем максимальную высоту у таблиц с матчами */
    .match-day-group {
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
    }
    
    /* Убираем скролл, если он был */
    .table-container {
        overflow-x: auto !important;
        overflow-y: visible !important;
        max-height: none !important;
    }
    
    /* Делаем таблицу чуть компактнее */
    .match-day-group td {
        padding: 6px 4px !important;
    }
    
    .match-day-group .avatar {
        width: 28px !important;
        height: 28px !important;
    }
    
    .match-day-group .player-cell span {
        font-size: 11px !important;
    }
`;
document.head.appendChild(style);

// ============================================
// ВСЯ ФУНКЦИЯ updateMatchesTable (ПОЛНОСТЬЮ)
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
    
    // Счетчик матчей
    const totalMatches = document.createElement('div');
    totalMatches.style.cssText = 'background: #e8f5e9; padding: 8px 12px; border-radius: 6px; margin: 10px 0; text-align: center; font-weight: bold;';
    totalMatches.innerHTML = `📊 Всего матчей: ${matches.length} • Сегодня: ${matchesByDay[today]?.length || 0}`;
    container.appendChild(totalMatches);
    
    // Кнопки управления
    const controlsDiv = document.createElement('div');
    controlsDiv.style.display = 'flex';
    controlsDiv.style.gap = '10px';
    controlsDiv.style.margin = '15px 0';
    controlsDiv.style.flexWrap = 'wrap';
    
    const expandAllBtn = document.createElement('button');
    expandAllBtn.className = 'action-btn add-btn';
    expandAllBtn.textContent = '📂 Развернуть все дни';
    expandAllBtn.onclick = function() {
        document.querySelectorAll('.match-day-group').forEach(g => g.classList.remove('collapsed'));
        document.querySelectorAll('.match-day-header').forEach(h => h.classList.remove('collapsed'));
    };
    
    const collapseAllBtn = document.createElement('button');
    collapseAllBtn.className = 'action-btn penalty-btn';
    collapseAllBtn.textContent = '📁 Свернуть все дни';
    collapseAllBtn.onclick = function() {
        document.querySelectorAll('.match-day-group').forEach(g => g.classList.add('collapsed'));
        document.querySelectorAll('.match-day-header').forEach(h => h.classList.add('collapsed'));
    };
    
    controlsDiv.appendChild(expandAllBtn);
    controlsDiv.appendChild(collapseAllBtn);
    container.appendChild(controlsDiv);
    
    sortedDays.forEach((dayKey) => {
        const dayMatches = matchesByDay[dayKey];
        const dayDate = new Date(dayKey);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let displayDate;
        if (dayDate.toDateString() === today) {
            displayDate = 'Сегодня';
        } else if (dayDate.toDateString() === yesterday.toDateString()) {
            displayDate = 'Вчера';
        } else {
            displayDate = dayDate.toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            displayDate = displayDate.charAt(0).toUpperCase() + displayDate.slice(1);
        }
        
        const dayId = 'matchDay_' + dayKey.replace(/\s+/g, '_').replace(/,/g, '');
        
        const dayGroup = document.createElement('div');
        dayGroup.id = dayId;
        dayGroup.className = 'match-day-group';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'match-day-header';
        dayHeader.setAttribute('data-day-id', dayId);
        
        // Сегодня развернуто, остальные свернуты
        if (dayKey !== today) {
            dayGroup.classList.add('collapsed');
            dayHeader.classList.add('collapsed');
        }
        
        dayHeader.innerHTML = `
            <div class="day-info">
                <div class="toggle-icon">▼</div>
                <div class="day-date">${displayDate}</div>
            </div>
            <div class="match-count">${dayMatches.length} матч${getPluralForm(dayMatches.length)}</div>
        `;
        
        dayHeader.addEventListener('click', function() {
            dayGroup.classList.toggle('collapsed');
            this.classList.toggle('collapsed');
        });
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        // Сортируем матчи внутри дня по времени
        const sortedDayMatches = [...dayMatches].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const table = document.createElement('table');
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Время</th>
                    <th>Игрок 1</th>
                    <th>Игрок 2</th>
                    <th>Победитель</th>
                    <th>Счет</th>
                    <th>Изменения</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${sortedDayMatches.map(match => {
                    const matchTime = match.date.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const deleteButton = isAdmin ? 
                        `<td><button class="delete-btn action-btn" onclick="deleteMatch('${match.id}')" title="Удалить матч">🗑️</button></td>` : 
                        `<td>-</td>`;
                    
                    return `
                        <tr>
                            <td>${matchTime}</td>
                            <td>
                                <div class="player-cell" onclick="showPlayerProfile('${match.player1}')" style="cursor: pointer;">
                                    <img src="${players[match.player1]?.avatar || 'https://i.pravatar.cc/150?img=3'}" 
                                         class="avatar">
                                    <span>${match.player1}</span>
                                </div>
                            </td>
                            <td>
                                <div class="player-cell" onclick="showPlayerProfile('${match.player2}')" style="cursor: pointer;">
                                    <img src="${players[match.player2]?.avatar || 'https://i.pravatar.cc/150?img=3'}" 
                                         class="avatar">
                                    <span>${match.player2}</span>
                                </div>
                            </td>
                            <td><strong>${match.winner === 'draw' ? 'Ничья' : (match.winner || '-')}</strong></td>
                            <td>${match.score || '-'}</td>
                            <td>
                                <span style="color: ${match.change1 > 0 ? '#4CAF50' : '#f44336'}">
                                    ${match.change1 > 0 ? '+' : ''}${match.change1}
                                </span> / 
                                <span style="color: ${match.change2 > 0 ? '#4CAF50' : '#f44336'}">
                                    ${match.change2 > 0 ? '+' : ''}${match.change2}
                                </span>
                            </td>
                            ${deleteButton}
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

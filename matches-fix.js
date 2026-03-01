// ============================================
// ИСПРАВЛЕННАЯ ФУНКЦИЯ: Обновить таблицу матчей с группировкой по дням
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
    
    // СОЗДАЕМ КНОПКИ УПРАВЛЕНИЯ
    const controlsDiv = document.createElement('div');
    controlsDiv.style.display = 'flex';
    controlsDiv.style.gap = '10px';
    controlsDiv.style.margin = '15px 0';
    controlsDiv.style.flexWrap = 'wrap';
    
    const expandAllBtn = document.createElement('button');
    expandAllBtn.className = 'action-btn add-btn';
    expandAllBtn.textContent = '📂 Развернуть все дни';
    expandAllBtn.onclick = function() {
        const allDayGroups = document.querySelectorAll('.match-day-group');
        const allDayHeaders = document.querySelectorAll('.match-day-header');
        allDayGroups.forEach(group => group.classList.remove('collapsed'));
        allDayHeaders.forEach(header => header.classList.remove('collapsed'));
    };
    
    const collapseAllBtn = document.createElement('button');
    collapseAllBtn.className = 'action-btn penalty-btn';
    collapseAllBtn.textContent = '📁 Свернуть все дни';
    collapseAllBtn.onclick = function() {
        const allDayGroups = document.querySelectorAll('.match-day-group');
        const allDayHeaders = document.querySelectorAll('.match-day-header');
        allDayGroups.forEach(group => {
            group.classList.add('collapsed');
        });
        allDayHeaders.forEach(header => {
            header.classList.add('collapsed');
        });
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
        
        const dayId = 'matchDay_' + dayKey.replace(/\s+/g, '_');
        
        const dayGroup = document.createElement('div');
        dayGroup.id = dayId;
        dayGroup.className = 'match-day-group';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'match-day-header';
        dayHeader.setAttribute('data-day-id', dayId);
        
        // сворачиваем все дни, кроме сегодняшнего
        if (dayDate.toDateString() !== today) {
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
            const targetDayId = this.getAttribute('data-day-id');
            const targetDay = document.getElementById(targetDayId);
            if (targetDay) {
                if (targetDay.classList.contains('collapsed')) {
                    targetDay.classList.remove('collapsed');
                    this.classList.remove('collapsed');
                } else {
                    targetDay.classList.add('collapsed');
                    this.classList.add('collapsed');
                }
            }
        });
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        const table = document.createElement('table');
        table.style.fontSize = '12px';
        
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
                ${dayMatches.map(match => {
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
                                         class="avatar" style="width: 32px; height: 32px;">
                                    <span>${match.player1}</span>
                                </div>
                            </td>
                            <td>
                                <div class="player-cell" onclick="showPlayerProfile('${match.player2}')" style="cursor: pointer;">
                                    <img src="${players[match.player2]?.avatar || 'https://i.pravatar.cc/150?img=3'}" 
                                         class="avatar" style="width: 32px; height: 32px;">
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

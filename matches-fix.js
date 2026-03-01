// ============================================
// ПРОСТАЯ ФУНКЦИЯ: Показывать ВСЕ матчи за сегодня
// ============================================
function updateMatchesTable() {
    const container = document.getElementById('matchesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (matches.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 25px;">🎾 Матчей пока нет</div>';
        return;
    }
    
    // Группируем матчи по дням
    const matchesByDay = {};
    matches.forEach(match => {
        const dateKey = match.date.toDateString();
        if (!matchesByDay[dateKey]) matchesByDay[dateKey] = [];
        matchesByDay[dateKey].push(match);
    });
    
    // Сортируем дни от новых к старым
    const sortedDays = Object.keys(matchesByDay).sort((a, b) => new Date(b) - new Date(a));
    
    // Проходим по всем дням
    sortedDays.forEach((dayKey, index) => {
        const dayMatches = matchesByDay[dayKey];
        const dayDate = new Date(dayKey);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Название дня
        let displayDate;
        if (dayDate.toDateString() === today.toDateString()) {
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
        }
        
        // Заголовок дня
        const dayHeader = document.createElement('div');
        dayHeader.className = 'match-day-header';
        dayHeader.innerHTML = `
            <div class="day-info">
                <div class="toggle-icon">▼</div>
                <div class="day-date">${displayDate}</div>
            </div>
            <div class="match-count">${dayMatches.length} матчей</div>
        `;
        
        // Контейнер для матчей дня
        const dayGroup = document.createElement('div');
        dayGroup.className = 'match-day-group';
        
        // ВАЖНО: сегодняшний день НЕ сворачиваем, остальные сворачиваем
        if (dayDate.toDateString() !== today.toDateString()) {
            dayGroup.classList.add('collapsed');
            dayHeader.classList.add('collapsed');
        }
        
        // Клик по заголовку
        dayHeader.addEventListener('click', function() {
            dayGroup.classList.toggle('collapsed');
            dayHeader.classList.toggle('collapsed');
        });
        
        // Таблица с матчами
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
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
                ${dayMatches.map(match => {
                    const matchTime = match.date.toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    const deleteBtn = isAdmin ? 
                        `<td><button class="delete-btn action-btn" onclick="deleteMatch('${match.id}')">🗑️</button></td>` : 
                        '<td>-</td>';
                    
                    return `
                        <tr>
                            <td>${matchTime}</td>
                            <td>
                                <div class="player-cell" onclick="showPlayerProfile('${match.player1}')">
                                    <img src="${players[match.player1]?.avatar || 'https://i.pravatar.cc/150?img=3'}" class="avatar">
                                    <span>${match.player1}</span>
                                </div>
                            </td>
                            <td>
                                <div class="player-cell" onclick="showPlayerProfile('${match.player2}')">
                                    <img src="${players[match.player2]?.avatar || 'https://i.pravatar.cc/150?img=3'}" class="avatar">
                                    <span>${match.player2}</span>
                                </div>
                            </td>
                            <td><strong>${match.winner === 'draw' ? 'Ничья' : match.winner}</strong></td>
                            <td>${match.score || '-'}</td>
                            <td>
                                <span style="color: ${match.change1 > 0 ? '#4CAF50' : '#f44336'}">
                                    ${match.change1 > 0 ? '+' : ''}${match.change1}
                                </span> / 
                                <span style="color: ${match.change2 > 0 ? '#4CAF50' : '#f44336'}">
                                    ${match.change2 > 0 ? '+' : ''}${match.change2}
                                </span>
                            </td>
                            ${deleteBtn}
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

// ============================================
// УМЕНЬШЕННАЯ ТАБЛИЦА - ВСЕ МАТЧИ ПОМЕСТЯТСЯ
// ============================================

// Сначала добавляем стили для компактной таблицы
const style = document.createElement('style');
style.textContent = `
    /* Супер компактная таблица для матчей */
    .match-day-group table {
        font-size: 10px !important;
    }
    
    .match-day-group th {
        padding: 4px 2px !important;
        font-size: 10px !important;
    }
    
    .match-day-group td {
        padding: 3px 2px !important;
        font-size: 10px !important;
    }
    
    .match-day-group .avatar {
        width: 20px !important;
        height: 20px !important;
        border-width: 1px !important;
    }
    
    .match-day-group .player-cell span {
        font-size: 9px !important;
        max-width: 70px !important;
    }
    
    .match-day-group .delete-btn {
        padding: 2px 4px !important;
        font-size: 8px !important;
        min-height: 20px !important;
    }
    
    .match-day-group .rating-badge {
        padding: 2px 4px !important;
        font-size: 8px !important;
    }
    
    /* Убираем лишние отступы */
    .match-day-group .table-container {
        margin: 0 !important;
    }
    
    /* Уменьшаем заголовок дня */
    .match-day-header {
        padding: 5px 8px !important;
        font-size: 11px !important;
        margin: 5px 0 0 0 !important;
    }
    
    .match-day-header .match-count {
        font-size: 9px !important;
        padding: 1px 4px !important;
    }
`;
document.head.appendChild(style);

// ============================================
// ФУНКЦИЯ ОБНОВЛЕНИЯ ТАБЛИЦЫ МАТЧЕЙ
// ============================================
function updateMatchesTable() {
    const container = document.getElementById('matchesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (matches.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; font-size: 12px;">🎾 Матчей пока нет</div>';
        return;
    }
    
    // Группируем по дням
    const matchesByDay = {};
    matches.forEach(match => {
        const dateKey = match.date.toDateString();
        if (!matchesByDay[dateKey]) matchesByDay[dateKey] = [];
        matchesByDay[dateKey].push(match);
    });
    
    const sortedDays = Object.keys(matchesByDay).sort((a, b) => new Date(b) - new Date(a));
    const today = new Date().toDateString();
    
    // Кнопки управления (маленькие)
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = 'display: flex; gap: 5px; margin: 5px 0;';
    
    const expandBtn = document.createElement('button');
    expandBtn.className = 'action-btn add-btn';
    expandBtn.style.cssText = 'padding: 3px 6px; font-size: 10px; min-height: 25px;';
    expandBtn.textContent = '📂 Развернуть все';
    expandBtn.onclick = () => {
        document.querySelectorAll('.match-day-group').forEach(g => g.classList.remove('collapsed'));
        document.querySelectorAll('.match-day-header').forEach(h => h.classList.remove('collapsed'));
    };
    
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'action-btn penalty-btn';
    collapseBtn.style.cssText = 'padding: 3px 6px; font-size: 10px; min-height: 25px;';
    collapseBtn.textContent = '📁 Свернуть все';
    collapseBtn.onclick = () => {
        document.querySelectorAll('.match-day-group').forEach(g => g.classList.add('collapsed'));
        document.querySelectorAll('.match-day-header').forEach(h => h.classList.add('collapsed'));
    };
    
    controlsDiv.appendChild(expandBtn);
    controlsDiv.appendChild(collapseBtn);
    container.appendChild(controlsDiv);
    
    // Счетчик матчей
    const todayMatches = matchesByDay[today]?.length || 0;
    const counter = document.createElement('div');
    counter.style.cssText = 'background: #e8f5e9; padding: 5px; border-radius: 4px; margin: 5px 0; text-align: center; font-size: 11px; font-weight: bold;';
    counter.innerHTML = `📊 Всего: ${matches.length} матчей • Сегодня: ${todayMatches}`;
    container.appendChild(counter);
    
    sortedDays.forEach(dayKey => {
        const dayMatches = matchesByDay[dayKey];
        const dayDate = new Date(dayKey);
        
        let displayDate;
        if (dayKey === today) {
            displayDate = 'СЕГОДНЯ';
        } else if (dayKey === new Date(new Date().setDate(new Date().getDate()-1)).toDateString()) {
            displayDate = 'ВЧЕРА';
        } else {
            displayDate = dayDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        }
        
        const dayId = 'day_' + dayKey.replace(/\s/g, '_');
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'match-day-header';
        dayHeader.style.cssText = 'padding: 5px 8px !important; font-size: 11px !important;';
        dayHeader.innerHTML = `
            <div class="day-info">
                <span class="toggle-icon" style="font-size: 10px;">▼</span>
                <span class="day-date" style="font-weight: bold;">${displayDate}</span>
            </div>
            <span class="match-count" style="font-size: 9px; padding: 1px 4px;">${dayMatches.length}</span>
        `;
        
        const dayGroup = document.createElement('div');
        dayGroup.className = 'match-day-group';
        dayGroup.id = dayId;
        
        // Сегодня развернуто, остальные свернуты
        if (dayKey !== today) {
            dayGroup.classList.add('collapsed');
            dayHeader.classList.add('collapsed');
        }
        
        dayHeader.onclick = () => {
            dayGroup.classList.toggle('collapsed');
            dayHeader.classList.toggle('collapsed');
        };
        
        // Таблица с минимальными размерами
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        tableContainer.style.cssText = 'margin: 0 !important;';
        
        const table = document.createElement('table');
        table.style.cssText = 'font-size: 10px !important; min-width: 500px;';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th style="padding: 3px 2px; font-size: 9px;">Время</th>
                    <th style="padding: 3px 2px; font-size: 9px;">Игрок 1</th>
                    <th style="padding: 3px 2px; font-size: 9px;">Игрок 2</th>
                    <th style="padding: 3px 2px; font-size: 9px;">Счет</th>
                    <th style="padding: 3px 2px; font-size: 9px;">±</th>
                    <th style="padding: 3px 2px; font-size: 9px;"></th>
                </tr>
            </thead>
            <tbody>
                ${dayMatches.map(match => {
                    const time = match.date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                    
                    return `
                        <tr>
                            <td style="padding: 2px; font-size: 9px;">${time}</td>
                            <td style="padding: 2px;">
                                <div class="player-cell" style="gap: 3px;" onclick="showPlayerProfile('${match.player1}')">
                                    <img src="${players[match.player1]?.avatar || 'https://i.pravatar.cc/150?img=3'}" 
                                         style="width: 18px; height: 18px; border-radius: 50%; border: 1px solid #4CAF50;">
                                    <span style="font-size: 9px; max-width: 60px;">${match.player1}</span>
                                </div>
                            </td>
                            <td style="padding: 2px;">
                                <div class="player-cell" style="gap: 3px;" onclick="showPlayerProfile('${match.player2}')">
                                    <img src="${players[match.player2]?.avatar || 'https://i.pravatar.cc/150?img=3'}" 
                                         style="width: 18px; height: 18px; border-radius: 50%; border: 1px solid #4CAF50;">
                                    <span style="font-size: 9px; max-width: 60px;">${match.player2}</span>
                                </div>
                            </td>
                            <td style="padding: 2px; font-size: 9px; font-weight: bold;">${match.score || '-'}</td>
                            <td style="padding: 2px; font-size: 9px;">
                                <span style="color: ${match.change1 > 0 ? '#4CAF50' : '#f44336'}">${match.change1}</span>/
                                <span style="color: ${match.change2 > 0 ? '#4CAF50' : '#f44336'}">${match.change2}</span>
                            </td>
                            <td style="padding: 2px;">
                                ${isAdmin ? 
                                    `<button class="delete-btn" onclick="deleteMatch('${match.id}')" 
                                            style="padding: 1px 3px; font-size: 8px; min-height: 18px;">🗑️</button>` : 
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

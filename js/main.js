const EMOTION_ICONS = {
    'positive': '😊',
    'negative': '😠',
    'neutral': '😐',
};

const EMOTION_LABELS_RU = {
    'positive': 'Позитив',
    'negative': 'Негатив',
    'neutral': 'Нейтрально',
};

const CATEGORY_LABELS_RU = {
    'complaint': 'Жалоба',
    'suggestion': 'Предложение',
    'question': 'Вопрос',
    'praise': 'Похвала',
    'bugreport': 'Баг-репорт',
};

const PRIORITY_LABELS_RU = {
    'low': 'Низкий',
    'medium': 'Средний',
    'high': 'Высокий',
    'critical': 'Критический',
};

const PRIORITY_CLASSES = {
    'low': 'priority-low',
    'medium': 'priority-medium',
    'high': 'priority-high',
    'critical': 'priority-critical',
};

document.addEventListener('DOMContentLoaded', function () {
    updateAuthUI();
    if (!isAuthenticated()) {
        document.getElementById('analyzeBtn').disabled = true;
    }
});

async function handleAnalyze() {
    if (!isAuthenticated()) {
        showToast('Пожалуйста, войдите в систему для анализа', 'error');
        setTimeout(() => { window.location.href = '/auth.html'; }, 1500);
        return;
    }

    const text = document.getElementById('messageText').value.trim();
    if (!text || text.length < 2) {
        showToast('Введите текст обращения (минимум 2 символа)', 'error');
        return;
    }

    const btn = document.getElementById('analyzeBtn');
    const btnText = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.spinner');
    btn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';

    try {
        const result = await analyzeText(text);

        const resultEl = document.getElementById('analysisResult');

        const emotionIcon = EMOTION_ICONS[result.emotion] || '😐';
        const emotionLabel = EMOTION_LABELS_RU[result.emotion] || result.emotion;
        document.getElementById('resultEmotion').innerHTML = `
            <span class="emotion-badge ${result.emotion}">${emotionIcon} ${emotionLabel}</span>
            <span class="score">${(result.emotion_score * 100).toFixed(1)}% уверенность</span>
        `;

        const categoryLabel = CATEGORY_LABELS_RU[result.category] || result.category;
        document.getElementById('resultCategory').innerHTML = `
            <span class="category-badge">${categoryLabel}</span>
        `;

        const priorityLabel = PRIORITY_LABELS_RU[result.priority] || result.priority;
        document.getElementById('resultPriority').innerHTML = `
            <span class="priority-badge ${PRIORITY_CLASSES[result.priority] || ''}">${priorityLabel}</span>
        `;

        const kwContainer = document.getElementById('resultKeywords');
        const kwList = document.getElementById('keywordsList');
        if (result.keywords && result.keywords.length > 0) {
            kwList.innerHTML = result.keywords.map(kw =>
                `<span class="keyword-tag">${kw}</span>`
            ).join('');
            kwContainer.style.display = 'block';
        } else {
            kwContainer.style.display = 'none';
        }

        const summaryContainer = document.getElementById('resultSummary');
        const summaryText = document.getElementById('summaryText');
        if (result.summary) {
            summaryText.textContent = result.summary;
            summaryContainer.style.display = 'block';
        } else {
            summaryContainer.style.display = 'none';
        }

        resultEl.classList.add('visible');
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        showToast('Анализ успешно выполнен', 'success');

    } catch (err) {
        showToast(err.message || 'Ошибка при анализе', 'error');
    } finally {
        btn.disabled = false;
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

document.addEventListener('scroll', function () {
    const header = document.getElementById('header');
    if (window.scrollY > 20) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

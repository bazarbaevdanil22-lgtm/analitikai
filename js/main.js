const EMOTION_CONFIG = {
    'позитив': { icon: '😊', class: 'positive' },
    'негатив': { icon: '😠', class: 'negative' },
    'нейтрально': { icon: '😐', class: 'neutral' },
};

const PRIORITY_CLASSES = {
    'низкий': 'priority-low',
    'средний': 'priority-medium',
    'высокий': 'priority-high',
    'критический': 'priority-critical',
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
        const response = await analyzeText(text);
        const result = response.data;

        const resultEl = document.getElementById('analysisResult');

        const emotionCfg = EMOTION_CONFIG[result.emotion] || { icon: '😐', class: 'neutral' };
        document.getElementById('resultEmotion').innerHTML = `
            <span class="emotion-badge ${emotionCfg.class}">${emotionCfg.icon} ${result.emotion}</span>
        `;

        document.getElementById('resultCategory').innerHTML = `
            <span class="category-badge">${result.category}</span>
        `;

        const priorityClass = PRIORITY_CLASSES[result.priority] || '';
        document.getElementById('resultPriority').innerHTML = `
            <span class="priority-badge ${priorityClass}">${result.priority}</span>
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

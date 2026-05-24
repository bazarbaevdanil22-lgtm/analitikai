const EMOTION_EMOJIS = {
    'joy': '😊',
    'anger': '😠',
    'sadness': '😢',
    'fear': '😨',
    'surprise': '😲',
    'disgust': '🤢',
    'neutral': '😐',
};

const EMOTION_LABELS_RU = {
    'joy': 'Радость',
    'anger': 'Гнев',
    'sadness': 'Грусть',
    'fear': 'Страх',
    'surprise': 'Удивление',
    'disgust': 'Отвращение',
    'neutral': 'Нейтрально',
};

const SENTIMENT_LABELS_RU = {
    'positive': 'Позитивная',
    'negative': 'Негативная',
    'neutral': 'Нейтральная',
};

const CATEGORY_LABELS_RU = {
    'delivery': 'Доставка',
    'support': 'Поддержка',
    'payment': 'Оплата',
    'quality': 'Качество',
    'other': 'Другое',
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
        document.getElementById('resultEmotion').innerHTML = `
            ${EMOTION_EMOJIS[result.emotion] || '😐'} ${EMOTION_LABELS_RU[result.emotion] || result.emotion}
            <span class="score">${(result.emotion_score * 100).toFixed(1)}%</span>
        `;

        const sentimentClass = result.sentiment;
        const sentimentLabel = SENTIMENT_LABELS_RU[result.sentiment] || result.sentiment;
        document.getElementById('resultSentiment').innerHTML = `
            <span class="sentiment-badge ${sentimentClass}">${sentimentLabel}</span>
            <span class="score">${(result.sentiment_score * 100).toFixed(1)}% уверенность</span>
        `;

        document.getElementById('resultScore').innerHTML = `
            ${(result.emotion_score * 100).toFixed(1)}%
            <span class="score">вероятность эмоции</span>
        `;

        const categoryLabel = CATEGORY_LABELS_RU[result.complaint_category] || result.complaint_category;
        document.getElementById('resultCategory').innerHTML = `
            ${categoryLabel}
            <span class="score">категория жалобы</span>
        `;

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

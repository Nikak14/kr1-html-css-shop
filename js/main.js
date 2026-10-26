// Получаем модальное окно по id.
const orderDialog = document.getElementById('order-dialog');

// Получаем все кнопки заказа в карточках товаров.
const orderButtons = document.querySelectorAll('.product-card__button');

// Получаем кнопку закрытия модального окна.
const closeDialogButton = document.getElementById('close-order-dialog');

// Получаем скрытое поле, в которое будет записан выбранный товар.
const selectedProductInput = document.getElementById('selected-product');

// Перебираем все кнопки «Заказать».
orderButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // Получаем название товара из data-атрибута.
    const productName = button.dataset.product;

    // Записываем название товара в скрытое поле формы.
    selectedProductInput.value = productName;

    // Открываем модальное окно.
    orderDialog.showModal();
  });
});

// Закрываем модальное окно по кнопке «Закрыть».
if (closeDialogButton && orderDialog) {
  closeDialogButton.addEventListener('click', () => {
    orderDialog.close();
  });
}

// Получаем форму заявки.
const orderForm = document.getElementById('order-form');

// Получаем сообщение об успешной отправке.
const successMessage = document.getElementById('success-message');

// Обрабатываем отправку формы.
orderForm.addEventListener('submit', (event) => {
  // Отменяем стандартную отправку формы,
  // потому что backend пока не подключён.
  event.preventDefault();

  // Сбрасываем предыдущие признаки ошибок.
  const formElements = Array.from(orderForm.elements);

  formElements.forEach((element) => {
    if (element.willValidate) {
      element.removeAttribute('aria-invalid');
    }
  });

  // Проверяем встроенные HTML-ограничения формы.
  if (!orderForm.checkValidity()) {
    formElements.forEach((element) => {
      if (element.willValidate && !element.checkValidity()) {
        element.setAttribute('aria-invalid', 'true');
      }
    });

    // Показываем стандартные сообщения браузера.
    orderForm.reportValidity();
    return;
  }

  // Показываем сообщение об успешной отправке.
  successMessage.hidden = false;

  // Очищаем форму.
  orderForm.reset();

  // Закрываем модальное окно.
  if (orderDialog) {
    orderDialog.close();
  }
});

const reviewForm = document.getElementById('review-form');

if (reviewForm) {
  const reviewsList = document.getElementById('reviews-list');
  const reviewsEmpty = document.getElementById('reviews-empty');
  const storageNote = document.getElementById('reviews-storage-note');
  const reviewText = document.getElementById('review-text');
  const storageKey = 'shopproject-reviews';
  let reviews = [];

  try {
    const savedReviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(savedReviews)) {
      reviews = savedReviews.filter((review) =>
        review &&
        typeof review.author === 'string' &&
        typeof review.product === 'string' &&
        typeof review.rating === 'string' &&
        typeof review.text === 'string'
      ).slice(0, 20);
    }
  } catch {
    storageNote.textContent = 'Сохранение в браузере недоступно. Отзыв будет виден до обновления страницы.';
  }

  const addReviewToPage = (review, toBeginning = false) => {
    const card = document.createElement('article');
    card.className = 'review-card';

    const meta = document.createElement('div');
    meta.className = 'review-card__meta';

    const author = document.createElement('strong');
    author.className = 'review-card__author';
    author.textContent = review.author;

    const rating = document.createElement('span');
    rating.className = 'review-card__rating';
    rating.textContent = `Оценка: ${review.rating} из 5`;

    const product = document.createElement('p');
    product.className = 'review-card__product';
    product.textContent = review.product;

    const text = document.createElement('p');
    text.className = 'review-card__text';
    text.textContent = review.text;

    meta.append(author, rating);
    card.append(meta, product, text);
    if (toBeginning) {
      reviewsList.prepend(card);
    } else {
      reviewsList.append(card);
    }
    reviewsEmpty.hidden = true;
    return card;
  };

  reviews.forEach((review) => addReviewToPage(review));

  reviewText.addEventListener('input', () => reviewText.setCustomValidity(''));

  reviewForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!reviewForm.reportValidity()) return;

    const text = reviewText.value.trim();
    if (text.length < 10) {
      reviewText.setCustomValidity('Напишите не менее 10 символов отзыва.');
      reviewText.reportValidity();
      return;
    }

    const review = {
      author: document.getElementById('review-author').value.trim() || 'Гость',
      product: document.getElementById('review-product').value,
      rating: document.getElementById('review-rating').value,
      text,
    };

    reviews.unshift(review);
    reviews = reviews.slice(0, 20);
    const newCard = addReviewToPage(review, true);
    if (reviewsList.children.length > 20) reviewsList.lastElementChild.remove();
    reviewForm.reset();
    newCard.tabIndex = -1;
    newCard.focus();

    try {
      localStorage.setItem(storageKey, JSON.stringify(reviews));
    } catch {
      storageNote.textContent = 'Сохранение в браузере недоступно. Отзыв будет виден до обновления страницы.';
    }
  });
}

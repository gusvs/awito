'use strict'

const modalAdd = document.querySelector('.modal__add'),
  addAd = document.querySelector('.add__ad'),
  modalBtnSubmit = document.querySelector('.modal__btn-submit'),
  modalSubmit = document.querySelector('.modal__submit'),
  catalog = document.querySelector('.catalog'),
  modalItem = document.querySelector('.modal__item'),
  modalBtnWarning = document.querySelector('.modal__btn-warning'),
  modalFileInput = document.querySelector('.modal__file-input'),
  modalFileBtn = document.querySelector('.modal__file-btn'),
  modalImageAdd = document.querySelector('.modal__image-add'),
  modalImageItem = document.querySelector('.modal__image-item'),
  modalHeaderItem = document.querySelector('.modal__header-item'),
  modalStatusItem = document.querySelector('.modal__status-item'),
  modalDescriptionItem = document.querySelector('.modal__description-item'),
  modalCostItem = document.querySelector('.modal__cost-item'),
  searchInput = document.querySelector('.search__input'),
  menuContainer = document.querySelector('.menu__container')

const infoPhoto = {},
  textFileBtn = modalFileBtn.textContent,
  srcModalImage = modalImageAdd.src,
  dataBase = JSON.parse(localStorage.getItem('awito')) || []
let counter = dataBase.length

/*****************************************/
/*****   ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ФОРМЫ   *****/
/*****************************************/

const elementsModalSubmit = [...modalSubmit.elements].filter(
  (elem) => elem.tagName !== 'BUTTON'
)
// в полном варианте:
// const elementsModalSubmit = [...modalSubmit.elements].filter((elem) => {
//     return elem.tagName !== 'BUTTON' && elem.type !== 'submit'
// });
// console.log(elementsModalSubmit);

/********************************************/
/*****   СОХРАНЕНИЕ ДБ В LOCALSTORAGE   *****/
/********************************************/

const saveDB = () => localStorage.setItem('awito', JSON.stringify(dataBase))

//*****   ВАЛИДАЦИЯ ФОРМЫ   *****/

const checkForm = () => {
  const validForm = elementsModalSubmit.every((elem) => elem.value) // проверяем каждый пункт на заполнение
  modalBtnSubmit.disabled = !validForm // Вкл/Откл кнопку отправить
  modalBtnWarning.style.display = validForm ? 'none' : '' // Убираем надпить "Заполните все поля"
}

/***********************************************/
/*****   ФУНКЦИЯ ЗАКРЫТИЯ МОДАЛЬНЫХ ОКОН   *****/
/***********************************************/

const closeModal = (event) => {
  const target = event.target
  if (
    target.closest('.modal__close') ||
    target.classList.contains('modal') ||
    event.code === 'Escape'
  ) {
    modalAdd.classList.add('hide')
    modalItem.classList.add('hide')
    document.removeEventListener('keydown', closeModal) // когда окно закрыто, удаляем слушатель клавиатуры
    modalSubmit.reset()
    modalImageAdd.src = srcModalImage
    modalFileBtn.textContent = textFileBtn
    checkForm()
  }
}

/*********************************************/
/*****   РЕНДЕР КАРТОЧЕК ТОВАРОВ ИЗ БД   *****/
/*********************************************/

const renderCard = (DB = dataBase) => {
  catalog.textContent = ''
  DB.forEach((item) => {
    catalog.insertAdjacentHTML(
      'beforeend',
      `
        <li class="card" data-id="${item.id}">
            <img class="card__image" src="data:image/jpeg;base64,${item.image}" alt="test">
            <div class="card__description">
                <h3 class="card__header">${item.nameItem}</h3>
                <div class="card__price">${item.costItem} ₽</div>
            </div>
        </li>
        `
    )
  })
}

/*****************************/
/*****   ПОИСК ТОВАРОВ   *****/
/*****************************/

searchInput.addEventListener('input', () => {
  const valueSearch = searchInput.value.trim().toLowerCase()
  if (valueSearch.length > 2) {
    const result = dataBase.filter(
      (item) =>
        item.nameItem.toLowerCase().includes(valueSearch) ||
        item.descriptionItem.toLowerCase().includes(valueSearch)
    )
    renderCard(result)
  }
})

/**********************************************/
/*****   ДОБАЛЕНИЕ ТОВАРА В БАЗУ ДАННЫХ   *****/
/**********************************************/

modalSubmit.addEventListener('submit', (event) => {
  event.preventDefault()
  const itemObject = {}

  for (const elem of elementsModalSubmit) {
    itemObject[elem.name] = elem.value
  }
  itemObject.id = counter++
  console.log(itemObject.id)
  itemObject.image = infoPhoto.base64
  dataBase.push(itemObject)
  closeModal({ target: modalAdd })
  saveDB()
  renderCard()
})

/***********************************************/
/*****   ОТКРЫТИЕ ОКНА ПОДАТЬ ОБЪЯВЛЕНИЕ   *****/
/***********************************************/

addAd.addEventListener('click', () => {
  modalAdd.classList.remove('hide')
  modalBtnSubmit.disabled = true
  document.addEventListener('keydown', closeModal) // когда окно открыто, слушаем клавиатуру
})

/****************************************/
/*****   ОТКРЫТИЕ КАРТОЧКИ ТОВАРА   *****/
/****************************************/

catalog.addEventListener('click', (event) => {
  const target = event.target
  const card = target.closest('.card')
  if (card) {
    let item = dataBase.find((item) => item.id === +card.dataset.id)
    modalImageItem.src = `data:image/jpeg;base64,${item.image}`
    modalHeaderItem.textContent = item.nameItem
    modalStatusItem.textContent = item.status === 'new' ? 'Новый' : 'Б/У'
    modalDescriptionItem.textContent = item.descriptionItem
    modalCostItem.textContent = item.costItem
    modalItem.classList.remove('hide')
    document.addEventListener('keydown', closeModal) // когда окно открыто, слушаем клавиатуру
  }
})

/*********************************************************/
/*****   ЗАГРУЗКА КАРТИНКИ ТОВАРА В МОДАЛЬНОМ ОКНЕ   *****/
/*********************************************************/

modalFileInput.addEventListener('change', (event) => {
  const target = event.target
  const reader = new FileReader()
  const file = target.files[0]
  infoPhoto.filename = file.name
  infoPhoto.size = file.size
  reader.readAsBinaryString(file)
  reader.addEventListener('load', (event) => {
    if (infoPhoto.size < 200000) {
      modalFileBtn.textContent = infoPhoto.filename
      infoPhoto.base64 = btoa(event.target.result)
      modalImageAdd.src = `data:image/jpeg;base64,${infoPhoto.base64}`
    } else {
      modalFileBtn.textContent = 'Большой размер файла'
      modalFileInput.value = ''
      checkForm()
    }
  })
})

/********************************************/
/*****   ФИЛЬТР ТОВАРОВ ПО КАТЕГОРИЯМ   *****/
/********************************************/

menuContainer.addEventListener('click', (event) => {
  const target = event.target
  if (target.tagName === 'A') {
    const result = dataBase.filter(
      (item) => item.category === target.dataset.category
    )
    renderCard(result)
  }
})

/***************************************/
/*****   ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН   *****/
/***************************************/

modalAdd.addEventListener('click', closeModal)
modalItem.addEventListener('click', closeModal)
modalSubmit.addEventListener('input', checkForm)

renderCard()

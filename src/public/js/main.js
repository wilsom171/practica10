const btnRedactar = document.getElementById('btn-redactar')
const contentRedactar = document.getElementById('content-redactar')
const redactarClose = document.getElementById('redactar-header')

const itemInbox = document.getElementById('itemInbox')
const itemTrash = document.getElementById('itemTrash')
const itemStore = document.getElementById('itemStore')

const titlePage = document.getElementById('item-menu-actual')

const contentMessages = document.getElementById('content-messages')

let ventanaActual = 'inbox'

itemInbox.addEventListener('click', () => {
  itemInbox.classList.add('active-item')
  itemTrash.classList.remove('active-item')
  itemStore.classList.remove('active-item')

  titlePage.children[0].classList.add('fa-inbox')
  titlePage.children[0].classList.remove('fa-trash')
  titlePage.children[0].classList.remove('fa-archive')
  titlePage.children[1].textContent = 'Recibidos'

  ventanaActual = 'inbox'

  Array.from(contentMessages.children).map(message => {
    if (Array.from(message.classList).includes('classInbox')) {
      message.style.display = 'flex'
    } else {
      message.style.display = 'none'
    }
  })
})

itemTrash.addEventListener('click', () => {
  itemTrash.classList.add('active-item')
  itemInbox.classList.remove('active-item')
  itemStore.classList.remove('active-item')

  titlePage.children[0].classList.remove('fa-inbox')
  titlePage.children[0].classList.add('fa-trash')
  titlePage.children[0].classList.remove('fa-archive')
  titlePage.children[1].textContent = 'Eliminados'

  ventanaActual = 'trash'

  Array.from(contentMessages.children).map(message => {
    if (Array.from(message.classList).includes('classTrash')) {
      message.style.display = 'flex'
    } else {
      message.style.display = 'none'
    }
  })
})

itemStore.addEventListener('click', () => {
  itemStore.classList.add('active-item')
  itemTrash.classList.remove('active-item')
  itemInbox.classList.remove('active-item')

  titlePage.children[0].classList.remove('fa-inbox')
  titlePage.children[0].classList.remove('fa-trash')
  titlePage.children[0].classList.add('fa-archive')
  titlePage.children[1].textContent = 'Archivados'

  ventanaActual = 'store'

  Array.from(contentMessages.children).map(message => {
    if (Array.from(message.classList).includes('classStore')) {
      message.style.display = 'flex'
    } else {
      message.style.display = 'none'
    }
  })
})

contentMessages.addEventListener('click', e => {
  if (e.target.id === 'buttonStore' && ventanaActual !== 'store') {
    e.target.parentElement.parentElement.classList.remove('classInbox')
    e.target.parentElement.parentElement.classList.remove('classTrash')
    e.target.parentElement.parentElement.classList.add('classStore')
    e.target.parentElement.parentElement.style.display = 'none'
  } else if (e.target.id === 'buttonTrash' && ventanaActual !== 'trash') {
    e.target.parentElement.parentElement.classList.remove('classInbox')
    e.target.parentElement.parentElement.classList.add('classTrash')
    e.target.parentElement.parentElement.classList.remove('classStore')
    e.target.parentElement.parentElement.style.display = 'none'
  } else if (e.target.id === 'buttonUnread') {
    e.target.parentElement.parentElement.classList.toggle('UNREAD')
  }
})

btnRedactar.addEventListener('click', () => {
  contentRedactar.classList.add('show-content-redactar')
})

redactarClose.addEventListener('click', () => {
  contentRedactar.classList.remove('show-content-redactar')
})

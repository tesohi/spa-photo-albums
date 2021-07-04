import Store from './store.js'
import modal from './modal.js'
const store = new Store()



async function openFullSizePhoto(photoId) {
  const photo = await store.getPhotoById(photoId)
  
  modal.create(`
    <img 
      src="${photo.url}"
      alt="photo"
    >
  `)
}
function closeFullSizePhoto() {
  modal.destroy()
}



/* catalogue page */
const catalogue = {
  async load() {
    await this.renderUsers(document.querySelector('#app'))
  },

  async renderUsers(nodeToInsert) {
    const users = await store.getUsers()

    users.forEach(u => {
      nodeToInsert.insertAdjacentHTML('beforeEnd', `
        <div class="spoiler">
          <div
            data-toggle
            data-user="${u.id}"
            class="spoiler__title"
          >
            <span class="spoiler__arrow">
              &#5171;
            </span>
            ${u.name}
          </div>

          <div class="spoiler__content"></div>
        </div>
      `)
    })
  },

  async renderAlbums(userId, nodeToInsert) {
    const albums = await store.getAlbumsByUserId(userId)

    albums.forEach(al => {
      nodeToInsert.insertAdjacentHTML('beforeEnd', `
        <div class="spoiler">
          <div
            data-toggle
            data-album="${al.id}"
            class="spoiler__title"
          >
            <span class="spoiler__arrow">
              &#5171;
            </span>
            ${al.title}
          </div>

          <div class="spoiler__content"></div>
        </div>
      `)
    })
  },

  async renderPhotos(albumId, nodeToInsert) {
    const photos = await store.getPhotosByAlbumId(albumId)
    const favPhotos = await store.getFavoritePhotos()

    function renderFavoritesToggle(photo) {
      if (favPhotos.find(fp => fp.id === photo.id)) {
        return `
          <span
            data-favorites-toggle="true"
            data-photo-id="${photo.id}"
            class="photo-card__favorite-toggle photo-card__favorite-toggle_active"
          >
            &#9733;
          </span>
        `
      } else {
        return `
          <span
            data-favorites-toggle="false"
            data-photo-id="${photo.id}"
            class="photo-card__favorite-toggle"
          >
            &#9733;
          </span>
        `
      }
    }

    photos.forEach(ph => {
      nodeToInsert.insertAdjacentHTML('beforeEnd', `
        <div 
          data-photo="${ph.id}" 
          class="photo-card"
        >
          <div>
            ${renderFavoritesToggle(ph)}
          </div>
          <div class="photo-card__image">
            <img 
              src="${ph.thumbnailUrl}"
              data-photo-id="${ph.id}"
              title="${ph.title}"
              alt="photo"
            >
          </div>
        </div>
      `)
    })
  }
}



/* favorites page */
const favorites = {
  async load() {
    document.querySelector('#app').innerHTML = '<div class="photo-album"></div>'
    await this.renderFavoritePhotos(document.querySelector('.photo-album'))
  },

  async updateFavorites(nodeToInsert) {
    nodeToInsert.innerHTML = ''

    await this.renderFavoritePhotos(nodeToInsert)
  },

  async renderFavoritePhotos(nodeToInsert) {
    const favPhotos = await store.getFavoritePhotos()

    if (!favPhotos.length) {
      return
    }

    favPhotos.forEach(fp => {
      nodeToInsert.insertAdjacentHTML('beforeEnd', `
        <div 
          class="photo-card"
        >
          <div
            data-favorites-toggle="true"
            data-photo-id="${fp.id}"
            class="photo-card__favorite-toggle photo-card__favorite-toggle_active"
          >
            &#9733;
          </div>

          <div class="photo-card__image">
            <img 
              src="${fp.thumbnailUrl}"
              data-photo-id="${fp.id}"
              alt="photo"
            >
          </div>

          <div class="photo-card__title">
            ${fp.title}
          </div>
        </div>
      `)
    })
  }
}



/* router */
const router = {
  routes: [
    { path: '/', view: catalogue, title: 'Каталог' },
    { path: '/favorites', view: favorites, title: 'Избранное' }
  ],

  async locationResolver(url) {
    history.pushState(null, null, url)

    let route = this.routes.find(r => r.path === location.pathname)

    document.title = route.title

    document.querySelector('#app').innerHTML = ''
    route.view.load()
  }
}



/* events and handlers */
document.addEventListener('DOMContentLoaded', async () => {
  
  /* click handler */
  document.body.addEventListener('click', async (e) => {

    /* spoiler */
    if (e.target.matches('[data-toggle]')) {
      /* управление отображением спойлеров */
      const content = e.target.parentElement.querySelector('.spoiler__content')
      const arrow = e.target.querySelector('.spoiler__arrow')
      content.classList.toggle('spoiler__content_shown')
      arrow.classList.toggle('spoiler__arrow_opened')

      /* albums of user */
      if (e.target.matches('[data-user]')) {
        if (content.innerHTML) {
          return
        }

        const userId = e.target.dataset.user
        await catalogue.renderAlbums(userId, content)
      }

      /* photos in album */
      if (e.target.matches('[data-album]')) {
        if (content.innerHTML) {
          return
        }

        const albumId = e.target.dataset.album
        await catalogue.renderPhotos(albumId, content)
      }
    }

    /* favorites button */
    if (e.target.matches('[data-favorites-toggle]')) {
      e.target.classList.toggle('photo-card__favorite-toggle_active') //управление отображением переключателя
      const photoId = e.target.dataset.photoId

      /* обработка добавлени/удаления элемента из local storage */
      if (e.target.dataset.favoritesToggle === 'false') {
        await store.addFavoritePhoto(photoId)
        e.target.dataset.favoritesToggle = 'true'
      } else {
        await store.removeFavoritePhoto(photoId)
        e.target.dataset.favoritesToggle = 'false'
      }

      /* удаление объекта со страницы */
      if (document.querySelector('.photo-album')) {
        /* можно заменить на удаление элемента из DOM,
         и это было бы сильно лучше в случае если бы здесь происходила работа с сервером, вместо local storage */
        await favorites.updateFavorites(document.querySelector('.photo-album'))
      }
    }

    /* open/close full size photo */
    if (e.target.matches('img[data-photo-id]')) {
      await openFullSizePhoto(e.target.dataset.photoId)
    }
    if (e.target.matches('[data-modal-close]')) {
      closeFullSizePhoto()
    }

    /* router links */
    if (e.target.matches('[data-link]')) {
      router.locationResolver(e.target.dataset.link)
    }
  })

  /* event: dom loaded */
  await router.locationResolver(location.pathname)
})
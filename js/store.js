export default class {
  /* state */
  users = []
  albums = []
  photos = []


  /* actions */
  async fetchUsers() {
    try {
      const response = await fetch('https://json.medrating.org/users/')
      if (!response.ok) {
        console.log('response status:', response.status)
        return
      }
      const json = await response.json()
      const users = []
    
      json.forEach(el => {
        if (el.name) {
          users.push(el)
        }
      })
      this.users = users
      return users

    } catch (error) {
      console.log('fetch users error:', error)
    }
  }

  async fetchAlbumsByUserId(id) {
    try {
      const response = await fetch(`https://json.medrating.org/albums?userId=${id}`)
      if (!response.ok) {
        console.log('response status:', response.status)
        return
      }
      const json = await response.json()
      const albums = []
    
      json.forEach(el => {
        if (el.title) {
          albums.push(el)
        }
      })
      this.albums.push(...albums)
      return albums

    } catch (error) {
      console.log('fetch albums error:', error)
    } 
  }
  
  async fetchPhotosByAlbumId(id) {
    try {
      const response = await fetch(`https://json.medrating.org/photos?albumId=${id}`)
      if (!response.ok) {
        console.log('response status:', response.status)
        return
      }
      const json = await response.json()
      const photos = []
    
      json.forEach(el => {
        if (el.url) {
          photos.push(el)
        }
      })
      this.photos.push(...photos)
      return photos
      
    } catch (error) {
      console.log('fetch photos error:', error)
    }
  }

  async fetchPhotoById(id) {
    try {
      const response = await fetch(`https://json.medrating.org/photos?id=${id}`)
      if (!response.ok) {
        console.log('response status:', response.status)
        return
      }
      const json = await response.json()
      const photo = json[0]

      this.photos.push(photo)
      return photo

    } catch (error) {
      console.log('fetch photo by id error:', error)
    }
  }

  /* async для методов ниже на случай если вместо/вместе с local storage будет взаимодействие с сервером */
  async fetchFavoritePhotos() { 
    try {
      return JSON.parse(localStorage.getItem('favoritePhotos')) || []
    } catch (error) {
      console.log('fetch favorite photos error:', error)
    }
  }

  async addFavoritePhoto(photoId) {
    try {
      const photo = this.photos.find(ph => ph.id.toString() === photoId.toString())
      const favoritePhotos = JSON.parse(localStorage.getItem('favoritePhotos')) || []
      localStorage.removeItem('favoritePhotos')

      favoritePhotos.push(photo)

      localStorage.setItem('favoritePhotos', JSON.stringify(favoritePhotos))

    } catch (error) {
      console.log('add favorite photo error:', error)
    }
  }

  async removeFavoritePhoto(photoId) {
    try {
      const favoritePhotos = JSON.parse(localStorage.getItem('favoritePhotos')) || []
      if (!favoritePhotos.length) {
        return
      }
      localStorage.removeItem('favoritePhotos')

      const favoritePhotosWithoutDeletedPhoto = []
      favoritePhotos.forEach(ph => {
        if (ph.id.toString() !== photoId.toString()) {
          favoritePhotosWithoutDeletedPhoto.push(ph)
        }
      })
      
      localStorage.setItem('favoritePhotos', JSON.stringify(favoritePhotosWithoutDeletedPhoto))

    } catch (error) {
      console.log('remove favorite photo error:', error)
    }
  }


  /* getters */
  async getUsers() {
    if (this.users.length) {
      return this.users
    } else {
      return await this.fetchUsers()
    }
  }

  async getAlbumsByUserId(id) {
    if (this.albums.find(al => al.userId.toString() === id.toString())) {
      return this.albums.filter(al => {
        return al.userId.toString() === id.toString()
      })
    } else {
      return await this.fetchAlbumsByUserId(id)
    }
  }

  async getPhotosByAlbumId(id) {
    if (this.photos.find(al => al.albumId.toString() === id.toString())) {
      return this.photos.filter(ph => {
        return ph.albumId.toString() === id.toString()
      })
    } else {
      return await this.fetchPhotosByAlbumId(id)
    }
  }

  async getPhotoById(id) {
    if (this.photos.find(photo => photo.id.toString() === id.toString())) {
      return this.photos.find(photo => photo.id.toString() === id.toString())
    } else {
      return await this.fetchPhotoById(id)
    }
  }

  /* на случай если вместо local storage будет загрузка с сервера */
  async getFavoritePhotos() {
    return await this.fetchFavoritePhotos()
  }

}
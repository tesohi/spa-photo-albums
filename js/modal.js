export default {
  isExist: false,

  create(content) {
    if (this.isExist) {
      return
    }

    document.body.insertAdjacentHTML('beforeEnd', `
      <div class="modal">
        <div 
          class="modal__overlay"
          data-modal-close
        >
          <div class="modal__content">
            ${content}
          </div>
        </div>
      </div>
    `)

    this.isExist = true
  },
  destroy() {
    if (!this.isExist) {
      return
    }

    document.querySelector('.modal').remove()

    this.isExist = false
  }
}
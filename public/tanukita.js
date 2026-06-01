"use strict"
window.addEventListener("load", () => {
  window.scrollTo(0, document.body.scrollHeight)
})

document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
  new bootstrap.Tooltip(el)
})

function isPressedSubmitKey(ev) {
  if (ev.key !== "Enter") {
    return false
  }

  if (ev.ctrlKey) {
    return true
  }
  // MacOS Command key
  if (ev.metaKey) {
    return true
  }
}

const formEl = document.forms["msg-form"]
const texareaEl = formEl.elements["content"]
texareaEl.addEventListener("keydown", (ev) => {
  if (isPressedSubmitKey(ev)) {
    ev.preventDefault()
    formEl.submit()
  }
})

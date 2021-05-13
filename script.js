const itemName = document.getElementsByName("itemName")[0]
const itemContent = document.getElementsByName("itemContent")[0]
const list = document.getElementById("list")

let previousTouch = null
let elOnDragRef = null

if(!localStorage.getItem("myList")) {
    localStorage.setItem("myList", JSON.stringify([]))
}

// lorsque l'on appuye sur l'élément de grab
function grab(that) {
    const row = that.parentElement.parentElement

    elOnDragRef = {
        el: row,
        initialPos: Array.from(row.parentElement.children).indexOf(row)
    }

    row.classList.add("active")
    
    const dragAndDrop = document.getElementById("dragAndDrop")
    dragAndDrop.classList.add("active")
    document.body.style.overflow = "hidden"
}

// quand on relâche le touch
function touchDrop() {
    if(elOnDragRef) drop()
}

// quand on relâche le pointer, utiliser touchDrop avant pour le touch
function drop() {
    const newPosition = Array.from(elOnDragRef.el.parentElement.children).indexOf(elOnDragRef.el)
    const myList = localStorage.getItem("myList")
    const myList_value = JSON.parse(myList)
    
    const elOnDrag_storageInfos = myList_value.splice(elOnDragRef.initialPos, 1)
    myList_value.splice(newPosition, 0, elOnDrag_storageInfos[0])
    
    localStorage.setItem("myList", JSON.stringify(myList_value))
    
    elOnDragRef.el.classList.remove("active")
    elOnDragRef = null
    dragAndDrop.classList.remove("active")
    
    resetItemsKeyValue()

    document.body.style.overflow = "auto"
    if(previousTouch) previousTouch = null
}

// gère le déplacement sur l'élément à l'id de dragAndDrop qui fait overlay sur l'écran
function onDragAndDrop(e) {
    if(elOnDragRef) {
        if(e.buttons == 1 || e.targetTouches) {
            if(e.targetTouches) {
                const targetTouches = e.targetTouches[0]
                const clientX = targetTouches.clientX
                const clientY = targetTouches.clientY

                e.clientX = clientX
                e.clientY = clientY

                if(previousTouch) {
                    e.movementX = clientX - previousTouch.x
                    e.movementY = clientY - previousTouch.y
                }

                previousTouch = {
                    x: clientX,
                    y: clientY
                }
            }
        for(const item of document.getElementsByClassName("listRow")) {
            const clientRect = item.getBoundingClientRect()
            if((e.clientX > clientRect.x && e.clientX < clientRect.right
            && e.clientY > clientRect.y && e.clientY < clientRect.bottom)) {
                    if(e.movementY > 0) item.parentElement.insertBefore(elOnDragRef.el, item.nextElementSibling)
                    else item.parentElement.insertBefore(elOnDragRef.el, item)
                }
            }
        } else drop()
    }
}

// crée une nouvelle rangée et l'ajoute à la liste
function createListItemElement(key, name, content) {
    const newTr  = document.createElement("tr")
    newTr.className = "listRow"
    const listInner = `
            <td>
                <i onmousedown="grab(this)" ontouchstart="grab(this)">
                    <span>•</span>
                    <span>•</span>
                    <span>•</span>
                </i>
            </td>
            <td class="key"><i>${key + 1}</i></td>
            <td class="name">${name}</td>
            <td >${content}</td>
            <td class="trash" onclick="deleteItem(this)">🗑️</td>
    `
    newTr.innerHTML = listInner
    list.appendChild(newTr)
}

// ajoute l'item au localStorage
function addItemToList(name, content) {
    const myList = localStorage.getItem("myList")
    const myList_value = JSON.parse(myList)
    myList_value.push([name, content])
    localStorage.setItem("myList", JSON.stringify(myList_value))
    createListItemElement(myList_value.length - 1, name, content)
}

// réattribue la clée par rapport aux éléments restants
function resetItemsKeyValue() {
    const myList = localStorage.getItem("myList")
    const myList_value = JSON.parse(myList)

    const listChildren = list.children
    for(let i = 0; i < listChildren.length; i++) {
        listChildren[i].getElementsByClassName("key")[0].children[0].innerHTML = i + 1
    }
}

// fonction callback appelée lors du clique sur la poubelle
function deleteItem(that) {
    const thisTrParentElement = that.parentElement
    const listChildren = thisTrParentElement.parentElement.children

    const key = Array.from(listChildren).indexOf(thisTrParentElement)

    const myList = localStorage.getItem("myList")
    const myList_value = JSON.parse(myList)
    myList_value.splice(key, 1)

    localStorage.setItem("myList", JSON.stringify(myList_value))
    
    list.removeChild(listChildren[key])

    resetItemsKeyValue()
}

function clearForm() {
    itemName.value = ""
    itemContent.value = ""
}

// lors du submit du formulaire
function submitItem(e) {
    e.preventDefault()
    addItemToList(itemName.value, itemContent.value)
    clearForm()
}

// fonction lancée à chaque chargement de la page
function init() {
    const myList = localStorage.getItem("myList")
    if(myList != "") {
        const myList_entry = JSON.parse(myList)
        for(let i = 0; i < myList_entry.length; i++) {
            createListItemElement(i, myList_entry[i][0], myList_entry[i][1])
        }
    }
}

init()
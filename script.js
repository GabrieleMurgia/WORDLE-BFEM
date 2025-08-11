


//VAR
let dailyWord;
let attemps = 0;
let currentCellIndex = 0;

init();


//ELEMENTS
const wordle = document.querySelector(".wordle-container")
const word_container = document.querySelector(".word-container")
const result = document.querySelector(".result")
const refreshButton = document.querySelector(".refresh")


//EVENTS
wordle.addEventListener("click",handleWordle)
refreshButton.addEventListener("click",()=>{window.location.reload()})


//FUNCTIONS

/* wordle */
function handleWordle(e){
    handleRow()
}

function handleRow(){
    const rows = Array.from(wordle.childNodes).filter(node => node.nodeType === Node.ELEMENT_NODE)
    const row = rows[attemps];
    const cell = Array.from(row.childNodes).filter(node => node.nodeType === Node.ELEMENT_NODE)[currentCellIndex]
    cell.setAttribute("contenteditable", "true");

    cell.focus();
    if (!cell.dataset.listenerAdded) {
    cell.addEventListener("keydown", handleWordContainer);
    cell.dataset.listenerAdded = "true";
    }
}

function handleValidWord(cells){
  let target = dailyWord.toLowerCase().split(''); // array mutabile
  let userWord = cells.map((e,i) => ({
    cell: e,
    letter: e.textContent.toLowerCase(),
    position: i,
    isSamePosition: false,
    isIncluded: false
  }));

  // greens
  userWord.forEach(w => {
    if (target[w.position] === w.letter) {
      w.isSamePosition = true;
      target[w.position] = null; 
    }
  });

  // yellows
  userWord.forEach(w => {
    if (!w.isSamePosition) {
      const idx = target.indexOf(w.letter);
      if (idx !== -1) {
        w.isIncluded = true;
        target[idx] = null;
      }
    }
  });


  let greens = 0;
  userWord.forEach(w => {
    w.cell.removeEventListener("keydown", handleWordContainer);
    w.cell.setAttribute("contenteditable", false);
    if (w.isSamePosition) {
      w.cell.classList.add('is-same-pos');
      greens++;
    } else if (w.isIncluded) {
      w.cell.classList.add('is-included');
    }
  });

  if (greens === 5) {
    cells[0].parentElement.classList.add('correct-word');
    // disable all rows
    document.querySelectorAll(".word-container").forEach(c => {
      c.removeEventListener("keydown", handleWordContainer);
      c.setAttribute("contenteditable", false);
    });

    result.innerHTML = 'VICTORY, CONGRATULATIONS!'
  } else {
    cells[0].parentElement.classList.add('wrong-word');
    attemps++;

    if(attemps == 6){
      document.querySelectorAll(".word-container").forEach(c => {
      c.removeEventListener("keydown", handleWordContainer);
      c.setAttribute("contenteditable", false);
    });

    result.innerHTML = 'YOU FAILED, TRY AGAIN!'
    }
    
  }
}



/* word_container */
async function handleWordContainer(e){
    e.preventDefault();
    if(isNumber(e.key)){
        setTimeout(()=>{
            e.target.innerHTML = ''
        },1)
        return
    }
    let cCell = e.currentTarget
    let nextCell = cCell.nextElementSibling
    let prevCell = cCell.previousElementSibling

     if (isLetter(e.key) && cCell.innerHTML.length <= 1) {
        cCell.textContent = e.key.toUpperCase();
        if(cCell?.nextElementSibling){
        nextCell.setAttribute("contenteditable", "true");
        if(!nextCell.dataset.listenerAdded){
            nextCell.addEventListener("keydown",handleWordContainer)
            nextCell.dataset.listenerAdded = "true";
        }
        nextCell.focus()
        }
    }else if(e.key === "Backspace"){
        if (currentCellIndex > 0 && cCell.textContent === "") {
        }else{
            if(prevCell){
                prevCell.focus()
            }
        }
        cCell.textContent = "";
    }else if(e.key === "Delete"){
        cCell.textContent.textContent = "";
    }else if(e.key === "Enter"){
        let cells = Array.from(e.target.parentElement.childNodes).filter(i => !i.data)
        let rowWord = cells.map(i => i.innerHTML).join("")
        let check = await checkWord(rowWord)
        if(check.validWord){
            handleValidWord(cells)
        }
    }else{
        cCell.innerHTML = ''
    }
 
}



//UTILS
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function isNumber(num) {
  return /^[0-9]$/.test(num);
}



//APIS

async function init() {
  dailyWord = await getDailyWord();
  handleRow();
}


async function getDailyWord() {
    let res = await fetch('https://words.dev-apis.com/word-of-the-day');
    let data = await res.json();
    let dailyWord = data.word
    return dailyWord
}

async function checkWord(word) {
    const res = await fetch('https://words.dev-apis.com/validate-word', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      word: word.toLowerCase(),
    })
  });

  return data = await res.json(); // leggi la risposta (in JSON)
}
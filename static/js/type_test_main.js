const container = document.querySelector('.test-container');
const resultDiv = document.querySelector('.result');
const type = document.querySelector('.typing');
const testNameSpan = document.querySelector('.test-name');
const testAuthorSpan = document.querySelector('.added-by');
const accuracyCounterSpan = document.querySelector('.accuracy-counter-span');
let testId;
const speedCounterSpan = document.querySelector('.speed-counter-span');
type.value = '';

let text = `For those of you who are bored at work, feeling stuck in your cubicle and practicing your typing to make yourself look busy, you should know that your internet history is being tracked. Sincerely, your former boss.`

text = `For those of you who are bored at work, feeling stuck in your cubicle and practicing your typing to make yourself look busy, you should know that your internet history is being tracked. Sincerely, your former boss.`;

let arrtext;
let currentWord;
let currentChar;
let activeWord;
let wrongChar;
let wrongCharSpan;
let charTyped;
let rightCharTyped;

let timeNeeded;
let wpm;
let accuracy;

let isFirstChar;

let isCompleted = false;

const wpmSpan = document.querySelector('.wpm');
const accuracySpan = document.querySelector('.accuracy');

let keyPressed = {
    'Control': false,
    'Backspace': false,
}

let url = 'http://127.0.0.1:8000/api'

let csrfToken = getCookie('csrftoken');


// variables to show average of last 10
let authenticated = document.querySelector('.authenticated');
let speedQ;
let accuracyQ;
let averageSpeed;
let averageAccuracy;
// variables for keep track of average of last 10
//  if user is unauthentiacated
if(authenticated === null){
    speedQ = [];
    accuracyQ = []
    averageAccuracy = 0.00
    averageSpeed = 0.00
}else{
    fetch(`${url}/parse-last-10`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            "X-CSRFToken": csrfToken 
        }
    })
    .then(res => res.json()).then(data => { 
        console.log(data);
        speedQ = data.speed_list
        accuracyQ = data.accuracy_list
        averageAccuracy = accuracyQ.reduce(function(a, b){
            return a + b;
        }, 0);
        averageAccuracy /= accuracyQ.length;

        averageSpeed = speedQ.reduce(function(a, b){
            return a + b;
        }, 0);
        averageSpeed /= accuracyQ.length;

        averageAccuracy = averageAccuracy.toFixed(2);
        averageSpeed = averageSpeed.toFixed(2);
        document.querySelector('.avg-accuracy').innerText = averageAccuracy + ' %';
        document.querySelector('.avg-speed').innerText = averageSpeed + " WPM";
        console.log('value initialized');
    })

}


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function getTest(){
    container.innerHTML = `<div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading...</span>
                            </div>`
    fetch(`${url}/get-test`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            "X-CSRFToken": csrfToken 
        }
    })
    .then(res => res.json()).then(data => {
        text = data.text_field;
        testName = data.name;
        testAuthor = data.author;
        testId = data.test_id
        testNameSpan.innerText = testName;
        if(testAuthor){
            testAuthorSpan.innerText = ' - ' + testAuthor;
        }
        runApp();
        initializeVariable();
        resultDiv.classList.remove('show');
    })
}

getTest();


window.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
        type.style.display = 'block';
        type.focus();
        getTest();
    }
    if(e.key === 'Enter' && isCompleted == true){
        e.preventDefault();
        console.log('is complteted in enter');
        type.style.display = 'block';
        type.focus();
        getTest();
        isCompleted == false;
    }
})


// to create the test
function runApp(){
    console.log(type.value.length, 'type.value.length inside runapp');
    container.innerHTML = '';
    type.value = '';
    arrtext = text.split(' ');
    let charCount = 0;
    let theHtml = '';
    for(let i = 0; i < arrtext.length; i++){
        for(let j = 0; j < arrtext[i].length; j++){
            theHtml += `<span class="Char${charCount}">${arrtext[i][j]}</span>`;
            if(j === arrtext[i].length -1 && i < arrtext.length-1){
                theHtml += `<span class="Char${charCount+1}"> </span>`;
                charCount++;
            }
            charCount++;

        }
        container.innerHTML += ` <span class="Word${i}">${theHtml}</span>`;
        theHtml = '';
    }
    container.innerHTML += `<div>`
    console.log(container.innerHTML)
    // for(let i = 0; i < arrtext.length; i++){
    //     container.innerHTML += `<span class="Word${i}">${arrtext[i]} </span>`;
    // }

}


// initializing variables
function initializeVariable(){
    currentWord = 0;
    currentChar = 0;
    activeWord = document.querySelector(`.Word${currentWord}`);
    activeWord.classList.toggle('active-word');

    wrongChar = null;
    wrongCharSpan = null;
    charTyped = 0;
    rightCharTyped = 0;

    isFirstChar = true;
    console.log('value initialized');
}


container.addEventListener('click', () => {
    type.focus();
})


type.addEventListener('keydown', (e) => {
    //console.log(type.value.length, 'length', type.value)
    console.log(currentChar, text.length-1);


    // when e.key is Enter
    if(e.key === 'Enter'){
        e.preventDefault();
    }

    // when e.key is control or backspace
    if(e.key === 'Control'){
        keyPressed['Control'] = true;
    }else if(e.key === 'Backspace'){
        keyPressed['Backspace'] = true;
    }



    // when both control and backspace is pressed
    if(keyPressed['Backspace'] && keyPressed['Control']){
        console.log('delete whole word');
        if(currentChar === 0){
            return;
        }

        // if currentChar === 'Space'
        if(text[currentChar-1] === ' ' && !wrongChar){
            currentWord--;
            activeWord.classList.toggle('active-word');
            activeWord = document.querySelector(`.Word${currentWord}`);
            activeWord.classList.toggle('active-word');
            
            // updating currentChar
            currentChar = parseInt(activeWord.firstChild.classList[0].slice(-3));
            if(Number.isNaN(currentChar)){
                currentChar = parseInt(activeWord.firstChild.classList[0].slice(-2));
            }
            if(Number.isNaN(currentChar)){
                currentChar = parseInt(activeWord.firstChild.classList[0].slice(-1));
            }
        } else{
            if(wrongChar){
                wrongCharSpan.style.color = 'black';
                wrongChar = null;
                wrongCharSpan = null;
            }
    
            // removing wrong from activeWord if there is any
            activeWord.classList.remove('wrong');
    
            // updating currentChar
            currentChar = parseInt(activeWord.firstChild.classList[0].slice(-3));
            if(Number.isNaN(currentChar)){
                currentChar = parseInt(activeWord.firstChild.classList[0].slice(-2));
            }
            if(Number.isNaN(currentChar)){
                currentChar = parseInt(activeWord.firstChild.classList[0].slice(-1));
            }
            // currentChar++;
        }




        // let lastIndexOfSpace = type.value.lastIndexOf(' ');
        // if(lastIndexOfSpace === -1){
        //     type.value = '';
        // }else{
        //     type.value = type.value.substring(0, lastIndexOfSpace+2);
        // }

        // console.log(currentChar, lastIndexOfSpace, type.innerText);


        // updating input form
        type.value = '';
        for(let i = 0; i <= currentWord; i++){
            if(i !== currentWord){
                type.value += arrtext[i] + ' ';
            } else{
                type.value += arrtext[i];
            }
        }

    }


    
    // when not alphanumeric
    if(e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'CapsLock' && e.key !== 'Backspace' && e.key !== ' ' && e.key !== 'Alt' && e.key !== 'Enter'){

        // start time
        if(isFirstChar){
            timeNeeded = Date.now();
            isFirstChar = false;
        }

        // counting how many char is typed to calculate wpm
        charTyped++;

        if(e.key === text[currentChar] && !wrongChar){
            rightCharTyped++;
            console.log(`right char typed ${rightCharTyped}`);

            // calculating speed and accuracy instantly
            let currentUsedTime = Math.round(((Date.now() - timeNeeded)/1000/60)*100)/100;
            let currentWpm = Math.round(((rightCharTyped / 5) / currentUsedTime)*100)/100;
            speedCounterSpan.innerText = currentWpm.toFixed(2) + " ";
            accuracyCounterSpan.innerText = (Math.round(((rightCharTyped / charTyped) * 100) * 100)/100).toFixed(2);

        }else{
            //console.log('not ok', currentChar, text[currentChar]);
            if(wrongChar == null){
                wrongChar = currentChar;
                wrongCharSpan = document.querySelector(`.Char${wrongChar}`);
                // wrongCharSpan.style.color = '#ff00cc';
                wrongCharSpan.style.color = 'red';
                console.log('wrong char', wrongChar, text[wrongChar]);
                
            }
            activeWord.classList.add('wrong');
        }

        // currentChar = Math.min(currentChar+1, text.length-1);
        currentChar += 1;

    }

    console.log(e.key);

    // when key is space
    if(e.key === ' '){

        // don't let user typing unnecessary space
        if(type.value[type.value.length-1] === ' ' || type.value[type.value.length-1] === undefined || currentChar === 0){
            // type.value = type.value.substring(0, type.value.length-1);
            // console.log('entered the spce');
            e.preventDefault();
            return;
        }

        if(e.key === text[currentChar]){
            // console.log('ok', currentChar, text[currentChar]);
            rightCharTyped++;
            charTyped++;
        }else{
            if(!wrongChar){
                console.log('space wrong')
                wrongChar = currentChar;

                wrongCharSpan = document.querySelector(`.Char${wrongChar}`);
                // wrongCharSpan.style.color = '#ff00cc';
                wrongCharSpan.style.color = 'red';

                // console.log('wrong char', wrongChar, text[wrongChar]);
            }
            activeWord.classList.add('wrong');
        }
        // updating currentChar
        // currentChar = Math.min(currentChar+1, text.length-1);
        currentChar += 1;

        if(!wrongChar){
            // remove activeWord class
            activeWord.classList.toggle('active-word');
    
            //updating currentWord
            currentWord = Math.min(currentWord+1, arrtext.length-1);
            try{
                // add activeWord class to currentWord
                activeWord = document.querySelector(`.Word${currentWord}`);
                activeWord.classList.toggle('active-word');
            } catch{
    
            }
        }
    }

    // when key is backspace and not (control + backspace)
    if(e.key === 'Backspace' && !(keyPressed['Control'] && keyPressed['Backspace'])){
        e.preventDefault();
        if(type.value[type.value.length-1] === ' ' && !wrongChar){
            // remove activeWord class
            activeWord.classList.toggle('active-word');

            //updating currentWord
            activeWord.classList.remove('wrong');
            currentWord = Math.max(currentWord-1, 0);

            // add activeWord class to currentWord
            activeWord = document.querySelector(`.Word${currentWord}`);
            activeWord.classList.toggle('active-word');
        // console.log('enterd')
        }

        type.value = type.value.substring(0, type.value.length-1);
        currentChar = Math.max(currentChar-1, 0);
        if(currentChar === wrongChar){
            activeWord.classList.remove('wrong');
            console.log(' in wrong char', wrongChar);
            wrongChar = null;
            wrongCharSpan.style.color = 'black';
            wrongCharSpan = null;
        }
        console.log(currentChar);
    }



    // when text is done
    if(currentChar === text.length && !wrongChar && wrongChar !== 0){
        onComplete();
        console.log('well done');
        type.style.display = 'none';
        resultDiv.classList.toggle('show');

        // calculating time needed
        timeNeeded = Math.round(((Date.now() - timeNeeded)/1000/60)*100)/100;

        // calculating wpm
        wpm = Math.round(((rightCharTyped / 5) / timeNeeded)*100)/100;
        wpmSpan.innerText = wpm;

        // calculating accuracy
        accuracy = Math.round(((rightCharTyped / charTyped) * 100) * 100)/100;
        accuracySpan.innerText = accuracy;
        console.log(charTyped, text.length, 'fsd');
    }

    
})

// for removing Control and Backspace from keyPressed when they are not pressed
type.addEventListener('keyup', (e) => {
    if(e.key === 'Control'){
        keyPressed['Control'] = false;
    } else if(e.key === 'Backspace'){
        keyPressed['Backspace'] = false;
    }
})


function onComplete(){
    container.innerHTML = 'Press <kbd>Enter</kbd> to start new test <br><br> Press <kbd>Esc</kbd> to skip a test';
    isCompleted = true;
    let authenticated = document.querySelector('.authenticated');
    let postData = {
        'speed': parseFloat(speedCounterSpan.innerText),
        'accuracy': parseFloat(accuracyCounterSpan.innerText),
        'test_id': testId
    }
    if(authenticated !== null){
        fetch(`${url}/post-score`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                "X-CSRFToken": csrfToken 
            },
            body: JSON.stringify(postData)
        })
        .then(res => res.json()).then(data => {
            console.log(data);
        })
    }
    speedQ.push(postData.speed);
    accuracyQ.push(postData.accuracy);
    if(speedQ.length > 10){
        speedQ.shift();
    }
    if(accuracyQ.length > 10){
        accuracyQ.shift();
    }
    averageAccuracy = accuracyQ.reduce(function(a, b){
        return a + b;
    }, 0);
    averageAccuracy /= accuracyQ.length;

    averageSpeed = speedQ.reduce(function(a, b){
        return a + b;
    }, 0);
    averageSpeed /= accuracyQ.length;

    averageAccuracy = averageAccuracy.toFixed(2);
    averageSpeed = averageSpeed.toFixed(2);
    document.querySelector('.avg-accuracy').innerText = averageAccuracy + ' %';
    document.querySelector('.avg-speed').innerText = averageSpeed + " WPM";
    console.log('accuracy - ', accuracyQ, 'speed - ', speedQ,);
    
    return;
}
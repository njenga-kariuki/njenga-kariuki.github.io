console.log('hi');

//CONSTANTS TO DECLARE UP FRONT//
const getStartedButton = document.querySelector('#form-start')
const formSection = document.querySelector("div[id='questions']")

const prevBtn = document.getElementById("prevBtn")
const nextBtn = document.getElementById("nextBtn")
//END CONSTANTS

//test fetch
fetch ('http://localhost:3000/api/v1/caregivers')
.then(resp=> console.log(resp.statusText))

//BEGIN QUESTION INIT + HANDLING
function showQuestion(n) {
  let x = document.getElementsByClassName("question");
  x[n].style.display = "block";

  if (n === 0) {
    prevBtn.style.display = "none";
  } else {
    prevBtn.style.display = "inline";
  }
  if (n == (x.length - 1)) {
    nextBtn.innerHTML = "Submit Profile";
    nextBtn.style.backgroundColor = 'springgreen'
    nextBtn.setAttribute("data-id","submit-profile")
    postProfileSubmitMsg()
  } else {
    nextBtn.innerHTML = "Next";
  }
  fixStepIndicator(n)
}

function nextPrev(n){
  let x = document.getElementsByClassName("question");
  if (n === 1 && !validateForm()) return false;

  x[currentTab].style.display = "none";
  currentTab = currentTab + n;
  showQuestion(currentTab);
}

function validateForm(){
  let valid = true;
  let x = document.getElementsByClassName("question");
  let y = x[currentTab].getElementsByTagName("input");
  for (let i = 0; i < y.length; i++) {
    if (y[i].value == "") {
      y[i].className += " invalid";
      valid = false;
    }
  }
  if (valid) {
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid;
}

function fixStepIndicator(n){
  let x = document.getElementsByClassName("step");
  for (let i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  x[n].className += " active";
}

function formButtonPrevious(){
  let prevButton = document.querySelector("button[id='prevBtn']")
  prevButton.addEventListener('click',()=> nextPrev(-1))
}

function formButtonNext(){
  let nextButton = document.querySelector("button[id='nextBtn']")
  nextButton.addEventListener('click',()=> nextPrev(1))
}

//function that adds form to page on click of get started and hides the button
function formToggleOnClick(){
  formSection.style.display = 'none';
  getStartedButton.addEventListener('click',(e)=>{
  document.querySelector('.value-prop-section').classList.add('display-none')
  formSection.style.display = 'block'
  getStartedButton.style.display = 'none'
  })
}
//END QUESTION INIT + HANDLING


//BEGIN COMMON QUESTIONS HIDE/SHOW
function commonQuestionShowOnClick(){
  let questions = Array.from(document.querySelector(".common-questions").querySelectorAll("div[class='common-question']"))
  questions.forEach((question)=>{
    questionDetailShowHide(question)
  })
}

function questionDetailShowHide(question){
  let questionHeader = question.querySelector('h4')
  let questionDetails = question.querySelector('span')
  questionDetails.style.display = 'none'
  questionHeader.addEventListener('click',()=>{
  if (questionDetails.style.display === 'none'){
    questionDetails.style.display = 'block'
  }else {
    questionDetails.style.display = 'none'
    }
  })
}

function showQuestionsOnHover(){
  let questions = Array.from(document.querySelector(".common-questions").querySelectorAll("div[class='common-question']"))
  let questionDiv = document.querySelector(".common-questions")

  for(question of questions){
    question.classList.add('display-none')
  }

  questionDiv.addEventListener('mouseover',()=>{
    for(question of questions){
    question.classList.remove('display-none')
    question.classList.add('display-block')
    }
  })

  questionDiv.addEventListener('mouseout',()=>{
    for(question of questions){
    question.classList.remove('display-block')
    question.classList.add('display-none')
    }
  })
}
//END COMMON QUESTIONS HIDE/SHOW

///BEGIN VALUE PROP HIGHLIGHTING JS//
//function to try and cross out question and display value PROP >> needs refactoring for later
function replaceValuePropWithQuestion(){
    //hide all value prop sections
    let valuePropDivs = Array.from(document.querySelectorAll('.vp'))
    let int = 2000
    for (div of valuePropDivs){
      div.classList.add('hide-opacity')
    }

    //set problem question 1 to strikethrough in 2s
    let problem = document.querySelector('header h3')
    setTimeout(function(){
      problem.classList.add('strike')
    },2500)

    //set value prop 1 to fade in
    let valueProp = document.querySelector('.vp')
    valueProp.classList.add('hide-opacity')
    setTimeout(function(){
      changeValuePropOpacity(valueProp)
    },3500)

    //fade out problem #1, replace with problem #2, fade back in..strikethrough
    setTimeout(function(){
      problem.classList.add('slow-hide-opacity')
    },5000)

    setTimeout(function(){
      problem.classList.remove('strike')
      problem.classList.remove('slow-hide-opacity')
      problem.classList.add('show-opacity')
      problem.innerText = "How do I know the provider is doing what I asked?"
    },7000)

    setTimeout(function(){
      problem.classList.add('strike')
    },9000)

    //set value prop 2 to fade in
    setTimeout(function(){
      valueProp = document.querySelector(".vp[data-id='2']")
      valueProp.classList.add('hide-opacity')
      changeValuePropOpacity(valueProp)
    },10000)

    //fade out problem #2, replace with problem #3, fade back in..strikethrough
    setTimeout(function(){
      problem.classList.add('slow-hide-opacity')
    },11000)

    setTimeout(function(){
      problem.classList.remove('strike')
      problem.classList.remove('slow-hide-opacity')
      problem.classList.add('show-opacity')
      problem.innerText = "How do I keep family and friends up to date?"
    },12500)

    setTimeout(function(){
      problem.classList.add('strike')
    },14000)

    //set value prop 3 to fade in
    setTimeout(function(){
      valueProp = document.querySelector(".vp[data-id='3']")
      valueProp.classList.add('hide-opacity')
      changeValuePropOpacity(valueProp)
    },15000)

    //fade out problem #3, replace with problem #4, fade back in..strikethrough
    setTimeout(function(){
      problem.classList.add('slow-hide-opacity')
    },17000)

    setTimeout(function(){
      problem.classList.remove('strike')
      problem.classList.remove('slow-hide-opacity')
      problem.classList.add('show-opacity')
      problem.innerText = "What if I need to change the plan for one day?"
    },18500)

    setTimeout(function(){
      problem.classList.add('strike')
    },20000)

    //set value prop 4 to fade in
    setTimeout(function(){
      valueProp = document.querySelector(".vp[data-id='4']")
      valueProp.classList.add('hide-opacity')
      changeValuePropOpacity(valueProp)
    },21000)

    //fade out last question
    setTimeout(function(){
      problem.classList.add('slow-hide-opacity')
      problem.classList.add('display-none')
    },22000)

    setTimeout(function(){
    document.querySelector('header h4').classList.remove('hide-opacity')
    },23000)
}

//helper function to set timeout interval for loading vp
 function changeValuePropOpacity(div,int){
   setTimeout(function(){
   div.classList.remove('hide-opacity')
   div.classList.add('show-opacity')
  },int)
 }
///END VALUE PROP HIGHLIGHTING JS//

//BEGIN button fade in
function buttonFadeIn(){
  setTimeout(function(){
    getStartedButton.classList.remove('display-none')
  },24000)
}
//END button fade in

//BEGIN HOW IT WORKS SECTION
function howItWorkShowOnClick(){
  let stepsDiv = document.querySelector('.steps-div')
  let stepUL = document.querySelector('.how-it-works')
  stepUL.classList.add('display-none')

  stepsDiv.addEventListener('mouseover',()=>{
    stepUL.classList.remove('display-none')
  })
  stepsDiv.addEventListener('mouseout',()=>{
      stepUL.classList.add('display-none')
    })
}
//END HOW IT WORKS

//HIDE COMMON QUESTIONS/FAQs
function unHideSubSections(){
  setTimeout(function(){
    document.querySelector('.steps-div').classList.remove('hide-opacity')
    document.querySelector('.common-questions').classList.remove('hide-opacity')
  },25000)
}

//BEGIN submit button HANDLING
function postProfileSubmitMsg(){
  let submitProfileBtn = document.querySelector("[data-id='submit-profile']")

  submitProfileBtn.addEventListener('click',()=>{
    let header2Replace = document.querySelector('header h6')
    header2Replace.innerHTML = "<h4>Thanks! This is a fake form for now but will be real soon!</h4>"

    document.querySelector('.value-prop-section').classList.remove('display-none')
    formSection.style.display = 'none'
    getStartedButton.style.display = 'none'
  })
}

//RUNNERS
let currentTab = 0;
formToggleOnClick()
buttonFadeIn();
showQuestion(currentTab);
formButtonPrevious();
formButtonNext();
commonQuestionShowOnClick();
showQuestionsOnHover();
replaceValuePropWithQuestion();
howItWorkShowOnClick();
unHideSubSections();
//END - show hide questions

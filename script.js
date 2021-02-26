"use strict";

window.addEventListener("DOMContentLoaded", init);

// ..... GLOBALS & SET UP .....

const Student = {
  first: "",
  last: "",
  middle: "",
  nick: "",
  photo: "",
  gender: "",
  house: "",
  blood: "",
  prefect: false,
  inquisitor: false,
  expelled: false,
};

let allStudents = [];
let expelledList = [];

const settings = {
  filter: "all",
  sortBy: "first",
  sortDir: "asc",
};

// ..... START .....

function init() {
  console.log("ready");
  activateButtons();
}

function activateButtons() {
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", selectFilter));

  document
    .querySelectorAll("[data-action='sort']")
    .forEach((button) => button.addEventListener("click", selectSort));

    document
    .querySelector("[data-filter='expelled']").addEventListener("click", showExpelled);

  // adding active class to currently displayed filter button
  // reference: https://www.w3schools.com/howto/howto_js_active_element.asp

  let filtering = document.querySelector("#filtering");
  let buttons = filtering.getElementsByClassName("btn");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      let current = document.getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      this.className += " active";
    });
  }
  loadJSON();
}

function loadJSON() {
  fetch("https://petlatkea.dk/2021/hogwarts/students.json")
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare objects
      prepareObjects(jsonData);
    });

  console.log("fetch done");
}

function prepareObjects(jsonData) {
  jsonData.forEach((jsonObject) => {
    // create new object with cleaned data
    const student = Object.create(Student);
    const fullName = jsonObject.fullname.trim();

    // sort into columns
    const firstSpace = fullName.indexOf(" ");
    const lastSpace = fullName.lastIndexOf(" ");
    const firstQ = fullName.indexOf('"');
    const lastQ = fullName.lastIndexOf('"');
    const firstName = fullName.substring(0, firstSpace);
    const lastName = fullName.substring(lastSpace);
    const middleName = fullName.substring(firstSpace, lastSpace);
    const nickName = fullName.substring(firstQ, lastQ + 1);

    // FIRST NAME
    const firstNameCapFirst =
      firstName.charAt(0).toUpperCase() + firstName.substring(1).toLowerCase();

    // LAST NAME
    const trimedLast = lastName.trim();
    let lastNameCapFirst =
      trimedLast[0].toUpperCase() + trimedLast.substring(1).toLowerCase();
    if (lastNameCapFirst.includes("-")) {
      lastNameCapFirst = lastNameCapFirst.split("-");
      lastNameCapFirst[1] =
        lastNameCapFirst[1].charAt(0).toUpperCase() +
        lastNameCapFirst[1].substring(1).toLowerCase();
      lastNameCapFirst = lastNameCapFirst.join("-");
    }

    // MIDDLE NAME
    let middleNameCapFirst =
      middleName.charAt(1).toUpperCase() +
      middleName.substring(2).toLowerCase();
    if (middleNameCapFirst.includes('"')) {
      middleNameCapFirst = student.middle.trim();
    }

    // HOUSE
    const house = jsonObject.house.trim();
    const houseFirstCap =
      house[0].toUpperCase() + house.substring(1).toLowerCase();

    student.first = firstNameCapFirst;
    student.middle = middleNameCapFirst;
    student.nick = nickName;
    student.last = lastNameCapFirst;
    student.gender = jsonObject.gender;
    student.house = houseFirstCap;

    // store new object with cleaned data in the array
    allStudents.unshift(student);

    console.log(allStudents);
  });

  displayList(allStudents);
}

// ..... FILTERING .....

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`User selected ${filter} as a filter`);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {
  if (settings.filterBy === "gryffindor") {
    filteredList = allStudents.filter(displayGryffindor);
  } else if (settings.filterBy === "hufflepuff") {
    filteredList = allStudents.filter(displayHufflepuff);
  } else if (settings.filterBy === "ravenclaw") {
    filteredList = allStudents.filter(displayRavenclaw);
  } else if (settings.filterBy === "slytherin") {
    filteredList = allStudents.filter(displaySlytherin);
  }

  console.log(filteredList);
  return filteredList;
}

function displayGryffindor(student) {
  return student.house === "Gryffindor";
}

function displayHufflepuff(student) {
  return student.house === "Hufflepuff";
}

function displayRavenclaw(student) {
  return student.house === "Ravenclaw";
}

function displaySlytherin(student) {
  return student.house === "Slytherin";
}

// ..... SORTING .....

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  // find previous sortBy element and remove sortBy
  const prevElement = document.querySelector(
    `[data-sort='${settings.sortBy}']`
  );
  prevElement.classList.remove("sortby");

  // indicate active sort
  event.target.classList.add("sortby");

  //toggle the direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  console.log(`User selected ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  //let sortedList = allStudents;
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1 * direction;
  } else {
    settings.direction = 1 * direction;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(firstA, firstB) {
    if (firstA[settings.sortBy] < firstB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}

// ..... DISPLAY .....

function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  displayList(currentList); // displayList(sortedList);
}

function displayList(allStudents) {
  console.log(allStudents);

  //clear the list
  document.querySelector("#studentlist tbody").innerHTML = "";

  // build a new list
  allStudents.forEach(displayStudent);
}

function displayStudent(student) {
  // create clone
  const clone = document
    .querySelector("template#student")
    .content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=first]").textContent = student.first;
  clone.querySelector("[data-field=last]").textContent = student.last;
  clone.querySelector("[data-field=gender]").textContent = student.gender;
  clone.querySelector("[data-field=house]").textContent = student.house;

  // event listeners for table content
  clone
    .querySelector("[data-field=details]")
    .addEventListener("click", clickDetails);
  clone
    .querySelector("[data-field=prefect]")
    .addEventListener("click", clickPrefect);
  clone
    .querySelector("[data-field=inquisitor]")
    .addEventListener("click", clickInquisitor);
  clone
    .querySelector("[data-field=expelled]")
    .addEventListener("click", clickExpel);

  // set up counters
  document.querySelector("span.total").textContent = `${34}`;
  document.querySelector("span.gryffindor").textContent = `${allStudents.filter(displayGryffindor).length}`;
  document.querySelector("span.hufflepuff").textContent = `${allStudents.filter(displayHufflepuff).length}`;
  document.querySelector("span.ravenclaw").textContent = `${allStudents.filter(displayRavenclaw).length}`;
  document.querySelector("span.slytherin").textContent = `${allStudents.filter(displaySlytherin).length}`;
  document.querySelector("span.notexpelled").textContent = `${allStudents.length}`;
  document.querySelector("span.expelled").textContent = `${expelledList.length}`;
  // 1. details
  function clickDetails() {
    console.log("clickStudent");
    showDetails(student);
  }

  // 2. prefect
  if (student.prefect === true) {
    clone.querySelector("[data-field=prefect]").textContent = "★";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = "☆";
  }

  function clickPrefect() {
    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToMakePrefect(student);
    }
    buildList();
  }

  // 3. inquisitor
  if (student.inquisitor === true) {
    clone.querySelector("[data-field=inquisitor]").textContent = "⬤";
  } else {
    clone.querySelector("[data-field=inquisitor]").textContent = "◯";
  }

  function clickInquisitor() {
    if (student.inquisitor === true) {
      student.inquisitor = false;
    } else {
      tryToMakeInquisitor(student);
    }
    buildList();
  }

  // 4. expell
  function clickExpel() {
    if (student.expelled === true) {
      student.expelled = false;
    } else {
      tryToExpelStudent(student);
    }
    //buildList();
  }

  // append clone to list
  document.querySelector("#studentlist tbody").appendChild(clone);
}

// 1. DETAILS (continue)
function showDetails(student) {
  console.log(student);

  const modal = document.querySelector("#modal-background");

  modal.querySelector(".modal-profile").src =
    "./images/" +
    student.last.toLowerCase() +
    "_" +
    student.first.substring(0, 1).toLowerCase() +
    ".png";
  modal.querySelector(".modal-first").textContent = student.first;
  modal.querySelector(".modal-middle").textContent = student.middle;
  modal.querySelector(".modal-nick").textContent = student.nick;
  modal.querySelector(".modal-last").textContent = student.last;
  modal.querySelector(".modal-gender").textContent = student.gender;
  modal.querySelector(".modal-house").textContent = student.house;

  modal.querySelector(".dialogbtn").addEventListener("click", closeDetails);
  modal.classList.remove("hide");

  function closeDetails() {
    modal.classList.add("hide");
    modal
      .querySelector(".dialogbtn")
      .removeEventListener("click", closeDetails);
  }
}

// 2. PREFECT (continue)
function tryToMakePrefect(selectedStudent) {
  const prefects = allStudents.filter((student) => student.prefect);
  const numberOfPrefects = prefects.length;
  const other = prefects
    .filter((student) => student.gender === selectedStudent.gender)
    .shift();

  //if there is another of the same type
  if (other !== undefined) {
    removeOther(other);
  } else {
    makePrefect(selectedStudent);
  }

  function removeOther(other) {
    //ask user to ignore or remove the other
    document.querySelector("#remove-dialog").classList.remove("hide");
    document.querySelector(
      "#remove-dialog #remove"
    ).innerHTML = `Remove ${other.first}`;
    document
      .querySelector("#remove-dialog #close1")
      .addEventListener("click", closeDialog);
    document
      .querySelector("#remove-dialog #remove")
      .addEventListener("click", clickRemoveOther);

    //if ignore - do nothing
    function closeDialog() {
      document.querySelector("#remove-dialog").classList.add("hide");
    }
    //if remove other
    function clickRemoveOther() {
      removePrefect(other);
      makePrefect(selectedStudent);
      buildList();
      closeDialog();
    }
  }

  function removePrefect(prefectStudent) {
    prefectStudent.prefect = false;
  }

  function makePrefect(student) {
    console.log("This student is prefect now.");
    student.prefect = true;
  }
}
// 3. INQUISITOR (continue)
function tryToMakeInquisitor(selectedStudent) {
  if (selectedStudent.house === "slytherin") {
    makeInquisitor(selectedStudent);
  } else {
    showWarning();
  }

  function showWarning() {
    //ask user to ignore or remove the other
    document.querySelector("#inquisitor-dialog").classList.remove("hide");
    document
      .querySelector("#inquisitor-dialog .dialogbtn")
      .addEventListener("click", closeWarning);
  }

  function makeInquisitor(student) {
    console.log("This student is inquisitor now.");
    student.inquisitor = true;
  }

  function closeWarning() {
    document.querySelector("#inquisitor-dialog").classList.add("hide");
    document
      .querySelector("#inquisitor-dialog .dialogbtn")
      .removeEventListener("click", closeWarning);
  }

  makeInquisitor(selectedStudent);
  buildList();
  closeWarning();
}
// 4. EXPEL (continue)
function tryToExpelStudent(student) {
  let dialog = document.querySelector("#expell-dialog");

  dialog.classList.remove("hide");
  dialog.querySelector("#expell").addEventListener("click", clickExpelStudent);
  dialog.querySelector("#close2").addEventListener("click", closeExpellDialog);

  function clickExpelStudent() {

    dialog.classList.add("hide");
    dialog.querySelector("#expell").removeEventListener("click", clickExpelStudent);
    dialog.querySelector("#close2").removeEventListener("click", closeExpellDialog);

    student.expelled = true;
    expelledList.push(student);
    console.log(allStudents.filter((student) => student.expelled === false));
    allStudents = allStudents.filter((student) => student.expelled === false);
    
    displayList(allStudents);
    closeExpellDialog();
  }

  function closeExpellDialog() {
    dialog.classList.add("hide");
    dialog.querySelector("#expell").removeEventListener("click", clickExpelStudent);
    dialog.querySelector("#close2").removeEventListener("click", closeExpellDialog);
  }
}

function showExpelled() {
  console.log(expelledList);
  console.log(allStudents);
  displayList(expelledList);
}
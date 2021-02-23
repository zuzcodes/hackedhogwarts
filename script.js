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
};

const allStudents = [];

const settings = {
    filter: "all",
    sortBy: "first",
    sortDir: "asc"
};

// ..... START .....

function init() {
  console.log("ready");

  document.querySelectorAll("[data-action='filter']").forEach(button => button.addEventListener("click", selectFilter));
  document.querySelectorAll("[data-action='sort']").forEach(button => button.addEventListener("click", selectSort));

  loadJSON();
}

function loadJSON() {
  fetch("https://petlatkea.dk/2021/hogwarts/students.json")
  .then( response => response.json() )
  .then( jsonData => {
      // when loaded, prepare objects
      prepareObjects( jsonData );
  });

  console.log("fetch done");
}

function prepareObjects( jsonData ) {
  jsonData.forEach( jsonObject => {
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

    //toggle the direction
    if (sortDir === "asc") {
        event.target.dataset.sortDirection = "desc";
    } else {
        event.target.dataset.sortDirection = "asc";
    }
    console.log(`User selected ${sortBy} - ${sortDir}`)
    selectSort(sortBy, sortDir);
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
        direction = -1;
    } else {
        settings.direction = 1
    }

    sortedList = sortedList.sort(sortByProperty);

    function sortByProperty(firstA, firstB) {
        if (firstA[settings.sortBy] < firstB[settings.sortBy]) {
            return -1 * direction
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
  allStudents.forEach( displayStudent );
}

function displayStudent(student) {
    // create clone
    const clone = document.querySelector("template#student").content.cloneNode(true);

    // set clone data
    clone.querySelector("[data-field=first]").textContent = student.first;
    clone.querySelector("[data-field=last]").textContent = student.last;
    clone.querySelector("[data-field=gender]").textContent = student.gender;
    clone.querySelector("[data-field=house]").textContent = student.house;

    // append clone to list
    document.querySelector("#studentlist tbody").appendChild(clone);
}
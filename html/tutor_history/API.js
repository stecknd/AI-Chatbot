var URL = "../final.php/";
var originalDB = [];
var DB = [];
var levels = {};
var sortOrder = [];
var summaryHeaders = ["Date", "Time", "UserLevel", "UserPrompt", "Cost($)"];


// Get level information once when the page is loaded
window.onload = function () {
  sillySetDate();
  getLevel();
  addEventListeners();
};


function getLevelDetails(levelid) {
  const level = levels.find(level => level.levelid == levelid);
  if (level) {
    return { sortCode: level.sortCode, description: level.description, prompt: level.prompt };
  } else {
    return null;  // Return null if no level is found
  }
}

function getLevel() {

  a = $.ajax({
    url: URL + 'getLevel',
    method: "GET"
  }).done(function (data) {
    levels = data.result
    for (let i = 0; i < data.result.length; i++) {
      let $select = $('#userLevel');
      let option = $('<option>').val(data.result[i].levelid).text(data.result[i].description);
      $select.append(option);
    }
  }).fail(function (error) {
    console.log("error", error.statusText);
  });
}

function addEventListeners() {
  $('#getHistory').on('click', function () {
    getHistory();
  });
}

function sillySetDate() {
  let today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const todayDate = `${year}-${month}-${day}`;
  $("#start-date-picker").val(todayDate);
  $("#end-date-picker").val(todayDate);
  // console.log("Today's Date: " + todayDate);
}

function getHistory() {
  let totalCost = 0;
  const numRecords = $("#num-input").val();  // Use let/const for local variables
  const startDate = $("#start-date-picker").val();  // Use let/const for local variables
  const endDate = $("#end-date-picker").val();  // Use let/const for local variables

  $.ajax({
    url: URL + `getLog?startdate=${startDate}&enddate=${endDate}&numrecords=${numRecords}`,
    method: "GET",
  }).done(function (data) {


    //console.log(data)
    $("#output").empty()
    let totalCostText = `<h3>Total Cost: $<span id="totalCostText"></span></h3>`;
    $("#output").append(totalCostText);
    for (i = 0; i < parseInt(numRecords) && data.result != null && i < data.result.length; i++) {
      let inputData = JSON.parse(data.result[i].inputData)
      let outputData = JSON.parse(data.result[i].outputData.replace(/\\#/g, '#'))





      const utcDate = data.result[i].requestTime
      const estDate = new Date(utcDate.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const date = estDate.toDateString(); // Extracts the date part (e.g., "Sun Dec 08 2024")
      const time = estDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // Extracts the time part (e.g., "08:54:20")



      const cost_c = 0.000002 * outputData.result.message.usage.total_tokens
      totalCost += cost_c;
      let r_cost_c = cost_c.toFixed(6);
      let levelID = inputData.systemPrompt;
      originalDB[i] = {
        logID: data.result[i].logID,
        Date: date,
        Time: time,
        "Cost($)": r_cost_c,
        UserLevelSort: getLevelDetails(levelID).sortCode,
        UserLevel: getLevelDetails(levelID).description,
        LevelPrompt: getLevelDetails(levelID).prompt,
        UserPrompt: inputData.userPrompt,
        ChatGPTResponse: outputData.result.message.choices[0].message.content,
      };
    }
    DB = originalDB;
    //console.log("DB", DB);
    totalCost = totalCost.toFixed(6);
    $("#totalCostText").text(totalCost);
    makeTable();


  }).fail(function (error) {
    console.log("Error", error.statusText);
  })
}


function makeTable() {
  let table = $("<table></table>").addClass("table history-table table-striped table-bordered table-hover");


  // Create header row with dynamic icons
  let headerRow = $("<tr></tr>");
  summaryHeaders.forEach(function (header) {
    let flatLineSVG = '<img src="../assets/horizontal_rule_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg" class="svg-icon icon-flat-line" alt="sort-icon">';
    let headerContent = $(`<span class="header-content">${header}${flatLineSVG}</span>`);
    headerRow.append($("<th></th>").append(headerContent));

    // Center content in the header cell
    headerRow.find(".header-content").css({
      "cursor": "pointer",
      "background-color": "transparent",
      "display": "flex",
      "align-items": "center",
      "justify-content": "center",
      "gap": "5px"
    });

    headerRow.find("img.svg-icon").css({
      "user-select": "none",
      "background-color": "transparent",
      "display": "inline-block",
      "max-width": "50%",
      "max-height": "50%",
      "object-fit": "contain"
    });

    headerContent.click(function () {
      let icon = headerContent.find(".svg-icon");
      if (icon.hasClass('icon-flat-line')) {
        icon.removeClass('icon-flat-line').addClass('icon-arrow-down');
        icon.attr("src", "../assets/keyboard_arrow_down_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg");
        icon.css("transform", "rotate(0deg)");
        sortOrder.push({
          "sortItem": headerContent.text(),
          "sortDirection": "desc"
        })
      } else if (icon.hasClass('icon-arrow-down')) {
        icon.removeClass('icon-arrow-down').addClass('icon-arrow-up');
        icon.attr("src", "../assets/keyboard_arrow_down_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg");
        icon.css("transform", "rotate(180deg)");
        const result = sortOrder.find(el => el.sortItem === headerContent.text());
        if (result) {
          result.sortDirection = "asc";
        }
      } else {
        icon.removeClass('icon-arrow-up').addClass('icon-flat-line');
        icon.attr("src", "../assets/horizontal_rule_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg");
        sortOrder = sortOrder.filter(el => el.sortItem !== headerContent.text());
      }
      sortTable();
    });
  });

  table.append(headerRow);
  // Create data rows
  DB.forEach(function (record) {
    let row = $(`<tr id="logId-${record["logID"]}" class="clickable-row"></tr>`);
    summaryHeaders.forEach(function (header) {
      row.append(`<td>${record[header]}</td>`);
    });
    table.append(row);
  });




  let tableContainer = $('<div class="table-responsive"></div>').append(table);
  table.addClass('custom-table');
  $("#output").append(tableContainer);


  $('.clickable-row').on('click', function () {
    getLogDetails(this.id);
  });

}

function sortTable() {
  let sorterDB = [...originalDB];  // Create a shallow copy of originalDB

  // Perform sorting based on the order of the sortOrder array
  sorterDB.sort((a, b) => {
    // Loop through the sortOrder in the given order (primary to secondary)
    for (let el of sortOrder) {
      const asc = el.sortDirection === "asc";  // Ascending or descending
      let comparison = 0;  // Default comparison value

      // Apply the sorting based on the current sort item
      if (el.sortItem === "Date") {
        comparison = compareDates(a.Date, b.Date);
      } else if (el.sortItem === "Time") {
        comparison = compareTimes(a.Time, b.Time);
      } else if (el.sortItem === "UserLevel") {
        comparison = compareNumber(a.UserLevelSort, b.UserLevelSort);
      } else if (el.sortItem === "UserPrompt") {
        comparison = compareStrings(a.UserPrompt, b.UserPrompt);
      } else if (el.sortItem === "Cost($)") {
        comparison = compareNumber(a["Cost($)"], b["Cost($)"]);
      }

      // Reverse the comparison if it's descending
      if (!asc) {
        comparison = -comparison;
      }

      // If a difference is found, return the result immediately (priority based on sortOrder)
      if (comparison !== 0) {
        return comparison;
      }
    }

    return 0;  // If all criteria are equal, return 0 (no change)
  });

  // Rebuild the table with the sorted rows
  let table = $('table');  // Select the table
  table.find('tr').slice(1).remove();  // Remove all rows except the first (header row)

  // Append sorted rows to the table
  sorterDB.forEach(function (record) {
    let row = $(`<tr id="logId-${record["logID"]}" class="clickable-row"></tr>`);
    summaryHeaders.forEach(function (header) {
      row.append(`<td>${record[header]}</td>`);  // Append data for each column
    });
    table.append(row);  // Add the row to the table
  });

  $('.clickable-row').on('click', function () {
    getLogDetails(this.id);
  });

  DB = sorterDB;  // Update the DB with the sorted data
}

// Comparison functions for different fields

// Compare Dates (ascending/descending)
function compareDates(dateA, dateB) {
  const dA = new Date(dateA);
  const dB = new Date(dateB);
  return dA - dB;  // Will be positive if dA > dB
}

// Compare Times (ascending/descending)
function compareTimes(timeA, timeB) {
  const tA = convert12HourTo24Hour(timeA);
  const tB = convert12HourTo24Hour(timeB);
  return tA - tB;  // Will be positive if tA > tB
}

// Compare Strings (ascending/descending)
function compareStrings(a, b) {
  const strA = a.toLowerCase();
  const strB = b.toLowerCase();
  return strA.localeCompare(strB);  // Standard string comparison
}

// Compare Costs (ascending/descending)
function compareNumber(costA, costB) {
  const cA = parseFloat(costA);
  const cB = parseFloat(costB);
  return cA - cB;  // Will be positive if cA > cB
}

// Helper function to convert 12-hour format (AM/PM) to 24-hour format and then to seconds
function convert12HourTo24Hour(time) {
  const [timeString, period] = time.split(" ");
  const [hours, minutes, seconds] = timeString.split(":").map(Number);

  let hours24 = hours;
  if (period === "PM" && hours !== 12) {
    hours24 += 12; // Convert PM to 24-hour format
  }
  if (period === "AM" && hours === 12) {
    hours24 = 0; // Convert 12 AM to 00:00
  }

  // Return the total seconds in 24-hour format
  return timeToSeconds(hours24, minutes, seconds);
}

// Helper function to convert hours, minutes, seconds to total seconds
function timeToSeconds(hours, minutes, seconds) {
  return hours * 3600 + minutes * 60 + seconds;
}

function getLogDetails(ID) {
  let DBID = ID.substring(ID.indexOf("-") + 1);
  console.log(DBID);
  //console.log(DB);
  const result = DB.find(el => el.logID == DBID);
  console.log(result)


  const output = $("#output");
  output.children().hide();
  const selectOptions = $("#selectOptions");
  selectOptions.hide();
  const advancedQueries = $("#advancedQueries");
  advancedQueries.collapse('hide');
  const getHistory = $("#getHistory");
  getHistory.hide();


  const title = $("#title");
  title.text("Log Details");

  const container = $("#GPTContainer");

  let backButton = 
    `<div class="d-flex justify-content-center mt-4">
      <button class="btn btn-light btn-lg" id="backToTable">Go Back</button>
    </div>`;

  container.append(backButton);

  $('#backToTable').on('click', function () {
    backToTable();
  });
  
  displayDictionary(result);

}

function displayDictionary(dictionary) {
  const keysWanted = ["Date", "Time", "UserLevel", "LevelPrompt", "UserPrompt", "ChatGPTResponse", "Cost($)"];
  
  let container = $('<div></div>').addClass('container dictionary-container'); // Create a Bootstrap container for the dictionary
  
  // Loop through the wanted keys array
  keysWanted.forEach(key => {
    // Check if the key exists in the dictionary
    if (dictionary.hasOwnProperty(key)) {
      // Create a dictionary section container for each key
      let section = $('<div></div>').addClass('dictionary-section');
      
      // Create a section header for the key
      let sectionHeader = $('<h5></h5>').addClass('dictionary-key').text(key);
      
      // Create a value container for the dictionary value
      let valueElement;
      if(key === "ChatGPTResponse") {
        const converter = new showdown.Converter();
        const markdownString = dictionary[key];
        valueElement = converter.makeHtml(markdownString); // Convert markdown to HTML for ChatGPTResponse
      } else {
        valueElement = $('<p></p>').addClass('dictionary-value').text(dictionary[key]);
      }
      
      // Append header and value to the section
      section.append(sectionHeader);
      section.append(valueElement);
      
      // Dynamically assign a class based on the key
      section.addClass(key.toLowerCase().replace(/\s/g, '').replace('($)', '').replace(/[$()]/g, ''));
      
      // Add a specific class for left-aligning ChatGPTResponse text
      if (key === "ChatGPTResponse") {
        section.addClass('left-align');
      }
      
      // Append the section to the container
      container.append(section);
    }
  });

  // Append the container to the output section
  $("#output").append(container);
}

function backToTable() {
  $(".dictionary-container").remove();
  $('#backToTable').remove();


  const output = $("#output");
  output.children().show();
  const selectOptions = $("#selectOptions");
  selectOptions.show();
  const getHistory = $("#getHistory");
  getHistory.show();


  const title = $("#title");
  title.text("Log Details");
}
var URL = "../final.php/";
var levels = {};
var gptChatNumber = 0;
var humanChatNumber = 0;
var spinner;

// get level information once when page is loaded
window.onload = function onload() {
	getLevel();
	animateLetters();
}

function getLevel() {

	a = $.ajax({
		url: URL + '/getLevel',
		method: "GET"
	}).done(function (data) {
		// loop through entries, and add them to the selector in the html
		// desciptions and values will be stored in html and can be accessed later
		// (potential issue with users ctrl+shift+i to change system prompt?)
		for (let i = 0; i < data.result.length; i++) {
			let $select = $('#userLevel');
			let option = $('<option>').val(data.result[i].levelid).text(data.result[i].description);
			$select.append(option);
		}
	}).fail(function (error) {
		console.log("error", error.statusText);
	});
}

function addLog(inputData, outputData) {
	a = $.ajax({
		url: `https://172.17.13.168/final.php/addLog?inputdata=${inputData}&outputdata=${outputData}`,
		method: "GET"
	}).done(function (data) {
	}).fail(function (error) {
		console.log("error", error.statusText)
	})
}


function askQuestion() {
	showSpinner();
	let humanChat = `<div id="humanChat-${humanChatNumber}" class="human-chat-div"></div>`;
	$("#output").append(humanChat)
	$(`#humanChat-${humanChatNumber}`).html(`<p>${$("#userPrompt").val()}</p>`)
	humanChatNumber++;


	const userPrompt = encodeURIComponent($("#userPrompt").val()); // Ensure the prompt is properly encoded
	const systemPrompt = encodeURIComponent($('#userLevel').val()); // Encode the system level as well
	a = $.ajax({
		url: `https://ceclnx01.cec.miamioh.edu/~johnsok9/cse383/final/index.php/chatgpt?user_prompt=${userPrompt}&system_prompt=${systemPrompt}&uniqueid=duecasbs&auth=aegh2Ir4`,
		method: "GET"
	}).done(function (data) {
		hideSpinner();



		const converter = new showdown.Converter();
		const markdownString = data.result.message.choices[0].message.content;
		const htmlString = converter.makeHtml(markdownString);
		let gptChat = `<div id="gptChat-${gptChatNumber}" class="gpt-chat-div"></div>`;
		$("#output").append(gptChat)
		$(`#gptChat-${gptChatNumber}`).html(htmlString)
		const inputDataJSON = {
			"userPrompt" : userPrompt,
			"systemPrompt": $('#userLevel option:selected').val(),
		}
		const inputData = JSON.stringify(inputDataJSON)
		const outputData = encodeURIComponent(JSON.stringify(data));
		//console.log(outputData)
		addLog(inputData, outputData);
		gptChatNumber++;
		$("#userPrompt").val("")
	}).fail(function (error) {
		console.log("error", error.statusText)
	})
}








function animateLetters() {
	/*
    $(".wave-text").each(function () {
        const element = $(this);
        const originalText = element.text();
        
        // Wrap letters in spans only if not already done
        if (!element.data("wrapped")) {
            const wrappedText = originalText
                .split('')
                .map(letter => `<span class="letter">${letter}</span>`)
                .join('');
            element.html(wrappedText);
            element.data("wrapped", true); // Mark as wrapped to avoid re-wrapping
        }

        // Add hover event for animation
        element.on("mouseover", function () {
            anime({
                targets: `.wave-text .letter`,
                color: '#960E75',
                delay: anime.stagger(100), // Increase delay by 100ms for each element
                easing: 'easeOutQuad',
                duration: 800,
            });
        });
    });*/
}

$(document).ready(function () {
    // Attach a keydown event to the document
    $(document).on('keydown', function (event) {
        // Check if the key pressed is 'f' or 'F', and if the active element is not a text input or textarea
        if ((event.key === 'f' || event.key === 'F') && 
            !(document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            // Toggle the fullscreen class on #output
            $('#output').toggleClass('fullscreen');
        }
    });
});


        // Function to show the spinner
        function showSpinner() {
            const spinnerContainer = $("#spinnerContainer");
            spinnerContainer.css("display", "block"); // Show the spinner container

            const opts = {
				lines: 12, // The number of lines to draw
				length: 7, // The length of each line
				width: 5, // The line thickness
				radius: 10, // The radius of the inner circle
				scale: 1, // Scales overall size of the spinner
				corners: 1, // Roundness (0..1)
				color: '#F0E2FC', // Spinner color (light color to stand out on dark background)
				fadeColor: 'transparent', // Fading color
				speed: 1, // Rounds per second
				rotate: 0, // Rotation offset
				animation: 'spinner-line-fade-quick', // Animation type
				direction: 1, // Clockwise (1) or counterclockwise (-1)
				zIndex: 2e9, // The z-index
				className: 'spinner', // CSS class to assign to the spinner
				top: '50%', // Top position relative to parent
				left: '50%', // Left position relative to parent
				shadow: '0 0 3px rgba(240, 226, 252, 0.3)', // Shadow for a subtle glow effect
				position: 'absolute' // Element positioning
			};
			
			

            // Create and start the spinner
            spinner = new Spinner(opts).spin(spinnerContainer.get(0));
        }

        // Function to hide the spinner
        function hideSpinner() {
            const spinnerContainer = $("#spinnerContainer");
            spinnerContainer.css("display", "none"); // Hide the spinner container
            if (spinner) {
                spinner.stop(); // Stop the spinner if it's running
            }
        }
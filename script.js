document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('phoneSlider');
    const currentNumber = document.getElementById('currentNumber');
    const timer = document.getElementById('timer');
    const finishButton = document.getElementById('finishButton');
    const resetButton = document.getElementById('resetButton');
    const result = document.getElementById('result');
    const resultsDialog = document.getElementById('resultsDialog');
    const dialogContent = document.getElementById('dialogContent');
    const rankingsTable = document.getElementById('rankingsTable');
    const closeDialog = document.getElementById('closeDialog');
    
    let startTime;
    let timerInterval;
    let isGameRunning = true; // Game is ready to start immediately
    let sliderMoved = false;
    
    // Update display when slider moves
    slider.addEventListener('input', function() {
        currentNumber.textContent = slider.value;
        
        if (isGameRunning && !sliderMoved) {
            sliderMoved = true;
            startTimer();
        }
    });
    
    // Finish button functionality
    finishButton.addEventListener('click', function() {
        if (isGameRunning && sliderMoved) {
            stopTimer();
            isGameRunning = false;
            
            const phoneNumber = slider.value;
            const timeSpent = timer.textContent;
            
            // Only show results if they've actually moved the slider
            if (sliderMoved) {
                saveResult(phoneNumber, timeSpent);
                showResultsDialog(phoneNumber, timeSpent);
            } else {
                result.textContent = "You didn't slide to select your number!";
            }
        } else if (!sliderMoved) {
            result.textContent = "You need to slide to select your number first!";
        }
    });
    
    // Reset button functionality
    resetButton.addEventListener('click', function() {
        stopTimer();
        resetTimer();
        isGameRunning = true;
        sliderMoved = false;
        
        result.textContent = '';
        
        slider.value = 1000000000000;
        currentNumber.textContent = slider.value;
    });
    
    // Close dialog when X is clicked
    closeDialog.addEventListener('click', function() {
        resultsDialog.style.display = 'none';
    });
    
    // Close dialog when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === resultsDialog) {
            resultsDialog.style.display = 'none';
        }
    });
    
    // Timer functions
    function startTimer() {
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 10);
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
    }
    
    function resetTimer() {
        stopTimer();
        timer.textContent = '00:00:00';
    }
    
    function updateTimer() {
        const currentTime = new Date();
        const elapsedTime = new Date(currentTime - startTime);
        
        const minutes = String(elapsedTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(elapsedTime.getUTCSeconds()).padStart(2, '0');
        const milliseconds = String(Math.floor(elapsedTime.getUTCMilliseconds() / 10)).padStart(2, '0');
        
        timer.textContent = `${minutes}:${seconds}:${milliseconds}`;
    }
    
    // Mask the phone number for privacy
    function maskPhoneNumber(number) {
        number = String(number);
        
        if (number.length <= 4) {
            return number;
        }
        
        const firstTwo = number.substring(0, 2);
        const lastTwo = number.substring(number.length - 2);
        const middleStars = '*'.repeat(number.length - 4);
        
        return `${firstTwo}${middleStars}${lastTwo}`;
    }
    
    // Save the result to local storage
    function saveResult(phoneNumber, time) {
        if (phoneNumber.length < 7) {
            return; // Don't save numbers less than 7 digits
        }
        
        // Parse time to comparable format (milliseconds)
        const [minutes, seconds, milliseconds] = time.split(':').map(Number);
        const timeValue = minutes * 60000 + seconds * 1000 + milliseconds * 10;
        
        // Get existing rankings or initialize an empty array
        let rankings = JSON.parse(localStorage.getItem('phoneSliderRankings')) || [];
        
        // Check if this phone number already exists
        const existingIndex = rankings.findIndex(item => item.phoneNumber === phoneNumber);
        
        if (existingIndex !== -1) {
            // If existing time is better, don't update
            if (rankings[existingIndex].timeValue <= timeValue) {
                return;
            }
            // Otherwise update with better time
            rankings[existingIndex].time = time;
            rankings[existingIndex].timeValue = timeValue;
        } else {
            // Add new entry
            rankings.push({
                phoneNumber: phoneNumber,
                time: time,
                timeValue: timeValue
            });
        }
        
        // Sort by time (ascending)
        rankings.sort((a, b) => a.timeValue - b.timeValue);
        
        // Save back to local storage
        localStorage.setItem('phoneSliderRankings', JSON.stringify(rankings));
    }
    
    // Display the results dialog
    function showResultsDialog(phoneNumber, time) {
        // Create content for the dialog
        const maskedNumber = maskPhoneNumber(phoneNumber);
        dialogContent.innerHTML = `
            <p><strong>Your Phone Number:</strong> ${maskedNumber}</p>
            <p><strong>Your Time:</strong> ${time}</p>
        `;
        
        // Generate rankings table
        generateRankingsTable(phoneNumber);
        
        // Show the dialog
        resultsDialog.style.display = 'flex';
    }
    
    // Generate the rankings table
    function generateRankingsTable(currentPhoneNumber) {
        let rankings = JSON.parse(localStorage.getItem('phoneSliderRankings')) || [];
        
        // Only include numbers with 7 or more digits
        rankings = rankings.filter(item => String(item.phoneNumber).length >= 7);
        
        if (rankings.length === 0) {
            rankingsTable.innerHTML = '<p>No rankings yet!</p>';
            return;
        }
        
        // Create table
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Phone Number</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        rankings.forEach((item, index) => {
            const isCurrentUser = item.phoneNumber === currentPhoneNumber;
            const rowClass = isCurrentUser ? 'class="current-user"' : '';
            
            tableHTML += `
                <tr ${rowClass}>
                    <td>#${index + 1}</td>
                    <td>${maskPhoneNumber(item.phoneNumber)}</td>
                    <td>${item.time}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        rankingsTable.innerHTML = tableHTML;
    }
});
